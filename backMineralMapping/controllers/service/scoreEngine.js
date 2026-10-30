const pool = require('../../database.js');

const LABEL = {
    0: 'indeterminee',
    1: 'nulle',
    2: 'faible',
    3: 'moyenne',
    4: 'élevée',
};

async function inBase(libelleBd, mot) {
    if (!mot) return false;
    const r = await pool.query(
        `SELECT EXISTS (
            SELECT 1
            FROM prop_subs ps
            JOIN propriete p ON p.id = ps.idprop
            WHERE p.libelle = $1 AND ps.subs ILIKE $2
         ) AS ok`,
        [libelleBd, mot.trim()]
    );
    return r.rows[0]?.ok === true;
}

async function getNature(substance) {
    const r = await pool.query(
        `SELECT DISTINCT idprop FROM prop_subs WHERE subs ILIKE $1`,
        [substance]
    );
    const ids = r.rows.map((x) => x.idprop);
    if (ids.includes(1)) return 1;
    if (ids.includes(2)) return 2;
    if (ids.includes(3)) return 3;
    return 0;
}

function splitMots(value) {
    if (!value) return [];
    return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

async function scoreRoche(lithoRows, substance) {
    let best = 1;
    const matches = [];
    for (const row of lithoRows) {
        const mots2 = splitMots(row.mot2);
        const hit = mots2.some((m) => m.toLowerCase() === String(substance).toLowerCase());
        const note = hit ? 4 : 2;
        if (note > best) best = note;
        matches.push({
            lithology: row.lithology,
            mot1: row.mot1,
            mot2: row.mot2,
            note,
            reason: hit ? 'substance trouvée dans mot2' : 'pas de correspondance directe mot2',
        });
    }
    return { note: lithoRows.length ? best : 1, matches, bases: [] };
}

async function scoreMineraux(lithoRows) {
    let best = 1;
    const matches = [];
    const basesHit = new Set();
    for (const row of lithoRows) {
        const mots2 = splitMots(row.mot2);
        let local = 1;
        for (const mot of mots2) {
            if (await inBase('bd5', mot)) { local = Math.max(local, 4); basesHit.add('bd5'); }
            else local = Math.max(local, 2);
            if (await inBase('bd7', mot)) { local = Math.max(local, 4); basesHit.add('bd7'); }
            else local = Math.max(local, 2);
            if (await inBase('bd9', mot)) { local = Math.max(local, 4); basesHit.add('bd9'); }
            else local = Math.max(local, 3);
        }
        best = Math.max(best, local);
        matches.push({ lithology: row.lithology, mot1: row.mot1, mot2: row.mot2, note: local, reason: 'règles minéraux bd5/bd7/bd9' });
    }
    return { note: lithoRows.length ? best : 1, matches, bases: [...basesHit] };
}

async function scoreElementChimique(lithoRows, substance) {
    const chains = [];
    if (await inBase('bd10', substance)) {
        chains.push({ name: 'bd10', pair: ['bd11', 'bd12'], scores: { both: 4, mot2only: 3, mot1only: 3, none: 2 }, nullMot1: ['bd12', 4, 3] });
    }
    if (await inBase('bd1', substance)) {
        chains.push({ name: 'bd1', pair: ['bd4', 'bd5'], scores: { both: 4, mot2only: 2, mot1only: 3, none: 1 }, nullMot1: ['bd5', 4, 2] });
    }
    if (await inBase('bd2', substance)) {
        chains.push({ name: 'bd2', pair: ['bd6', 'bd7'], scores: { both: 4, mot2only: 1, mot1only: 3, none: 1 }, nullMot1: ['bd7', 4, 1] });
    }
    if (await inBase('bd3', substance)) {
        chains.push({ name: 'bd3', pair: ['bd8', 'bd9'], scores: { both: 4, mot2only: 3, mot1only: 3, none: 1 }, nullMot1: ['bd9', 4, 3] });
    }

    if (!chains.length) {
        return { note: 1, matches: [], bases: [], reason: 'substance absente des bases chimiques bd1/bd2/bd3/bd10' };
    }

    let best = 1;
    const matches = [];
    const basesHit = new Set(chains.map((c) => c.name));

    for (const chain of chains) {
        for (const row of lithoRows) {
            const mots1 = splitMots(row.mot1);
            const mots2 = splitMots(row.mot2);
            let local = 1;

            if (!row.mot1) {
                const [bd, yes, no] = chain.nullMot1;
                for (const mot of mots2) {
                    const ok = await inBase(bd, mot);
                    local = Math.max(local, ok ? yes : no);
                    if (ok) basesHit.add(bd);
                }
            } else {
                for (const m1 of mots1) {
                    const ok1 = await inBase(chain.pair[0], m1);
                    if (ok1) basesHit.add(chain.pair[0]);
                    for (const m2 of mots2) {
                        const ok2 = await inBase(chain.pair[1], m2);
                        if (ok2) basesHit.add(chain.pair[1]);
                        if (ok1 && ok2) local = Math.max(local, chain.scores.both);
                        else if (!ok1 && ok2) local = Math.max(local, chain.scores.mot2only);
                        else if (ok1 && !ok2) local = Math.max(local, chain.scores.mot1only);
                        else local = Math.max(local, chain.scores.none);
                    }
                }
            }

            best = Math.max(best, local);
            matches.push({
                lithology: row.lithology,
                mot1: row.mot1,
                mot2: row.mot2,
                note: local,
                reason: `chaîne ${chain.name}`,
            });
        }
    }

    return { note: lithoRows.length ? best : 1, matches, bases: [...basesHit] };
}

async function scoreSubstance(lithoRows, substance) {
    const nature = await getNature(substance);
    let scored;
    let path;

    if (nature === 3) {
        path = 'roche';
        scored = await scoreRoche(lithoRows, substance);
    } else if (nature === 2) {
        path = 'mineraux';
        scored = await scoreMineraux(lithoRows);
    } else if (nature === 1) {
        path = 'element_chimique';
        scored = await scoreElementChimique(lithoRows, substance);
    } else {
        path = 'indetermine';
        scored = {
            note: 1,
            matches: [],
            bases: [],
            reason: 'substance non classée dans prop_subs (idprop 1/2/3)',
        };
    }

    const note = Math.min(4, Math.max(1, Number(scored.note) || 1));
    return {
        substance,
        nature,
        path,
        note,
        label: LABEL[note],
        basesMatched: scored.bases || [],
        lithologies: scored.matches || [],
        reason: scored.reason || null,
    };
}

/**
 * @param {Array} lithoRows rows from geol
 * @param {Array} substances rows like [[{id,nom}]] from get_All_Subs_by_id
 * @param {Array} presenceRows from lesPresencesIndices
 */
async function evaluateDemande(lithoRows, substances, presenceRows) {
    const bySubs = new Map(presenceRows.map((p) => [p.subs, p]));
    const results = [];

    for (const row of substances) {
        const nom = row[0]?.nom || row.nom;
        const lithoScore = await scoreSubstance(lithoRows, nom);
        const presence = bySubs.get(nom) || { presenceIndice: 1, probIndice: 1, indicesDetails: {} };

        results.push({
            subs: nom,
            result: lithoScore.note,
            label: lithoScore.label,
            path: lithoScore.path,
            nature: lithoScore.nature,
            basesMatched: lithoScore.basesMatched,
            lithologies: lithoScore.lithologies.slice(0, 20),
            reason: lithoScore.reason,
            presenceIndice: presence.presenceIndice,
            probIndice: presence.probIndice, // compat
            indicesDetails: presence.indicesDetails,
        });
    }

    // ordre stable
    results.sort((a, b) => String(a.subs).localeCompare(String(b.subs)));
    return results;
}

module.exports = {
    LABEL,
    getNature,
    scoreSubstance,
    evaluateDemande,
};
