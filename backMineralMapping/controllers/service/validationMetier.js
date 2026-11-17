const pool = require('../../database.js');
const { LABEL } = require('./scoreEngine');
const { get_historique_by_id } = require('./historique');

const LABEL_TO_NOTE = {
    indeterminee: 0,
    nulle: 1,
    faible: 2,
    moyenne: 3,
    élevée: 4,
    elevee: 4,
};

function labelToNote(label) {
    if (label == null || label === '') return null;
    if (Number.isFinite(Number(label)) && String(label).trim() !== '') {
        const n = Number(label);
        return n >= 0 && n <= 4 ? n : null;
    }
    const key = String(label).trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(LABEL_TO_NOTE, key)) return LABEL_TO_NOTE[key];
    // accents / variantes
    if (key === 'élevée' || key === 'elevee') return 4;
    for (const [k, v] of Object.entries(LABEL_TO_NOTE)) {
        if (k.toLowerCase() === key) return v;
    }
    return null;
}

/**
 * Construit un brouillon de feedback à partir d'une entrée historique agrégée.
 * Pure : testable sans DB.
 */
function buildDraftFromHistorique(historique) {
    if (!historique || historique.id == null) {
        const err = new Error('Historique introuvable');
        err.code = 'HIST_NOT_FOUND';
        throw err;
    }
    const substances = (historique.results || []).map((r) => {
        const noteSysteme = labelToNote(r.prob ?? r.note ?? r.id_result);
        return {
            substance: r.substance || r.subs || null,
            noteSysteme,
            labelSysteme: noteSysteme != null ? (LABEL[noteSysteme] || String(r.prob || '')) : (r.prob || null),
            presenceIndice: r.probIndice || null,
        };
    }).filter((s) => s.substance);

    return {
        historiqueId: String(historique.id),
        demandeur: historique.demandeur || null,
        typepermis: historique.libelle || historique.typepermis || null,
        date: historique.date || null,
        utilisateur: [historique.nom, historique.prenom].filter(Boolean).join(' ') || null,
        substances,
    };
}

async function getDraftFromHistorique(historiqueId) {
    const hist = await get_historique_by_id(historiqueId);
    if (!hist) {
        const err = new Error('Historique introuvable');
        err.code = 'HIST_NOT_FOUND';
        throw err;
    }
    return buildDraftFromHistorique(hist);
}

/**
 * Jeux de cas de référence pour validation géologue (sans magie ML).
 * Les attendus sont documentaires : à confirmer / ajuster métier.
 */
const FIXTURES = [
    {
        id: 'FX-ROCHE-DIRECTE',
        description: 'Substance présente dans mot2 → note élevée attendue (path roche)',
        litho: [{ lithology: 'Test', mot1: null, mot2: 'Nickel' }],
        substance: 'Nickel',
        forcePath: 'roche',
        expectedMinNote: 4,
    },
    {
        id: 'FX-SANS-LITHO',
        description: 'Aucune lithologie → note nulle',
        litho: [],
        substance: 'ZZZ_INCONNUE',
        expectedNote: 1,
    },
    {
        id: 'FX-INDICE-FAMILLES',
        description: 'Présence indices 1–4 = familles touchées, pas une proba',
        presenceIndice: 3,
        expectedPresenceLabel: 'moyenne',
    },
];

async function ensureSchema() {
    await pool.query(`CREATE SEQUENCE IF NOT EXISTS validation_geologue_id_seq`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS validation_geologue (
            id INTEGER PRIMARY KEY DEFAULT nextval('validation_geologue_id_seq'),
            historique_id TEXT,
            substance TEXT,
            note_systeme INT,
            note_geologue INT,
            accord BOOLEAN,
            commentaire TEXT,
            validateur TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

function presenceLabel(n) {
    const v = Number(n);
    if (v === 1) return 'nulle';
    if (v === 2 || v === 3) return 'moyenne';
    if (v === 4) return 'élevée';
    return 'indeterminee';
}

async function runFixtures() {
    const { scoreSubstance } = require('./scoreEngine');
    const results = [];

    for (const fx of FIXTURES) {
        if (fx.presenceIndice != null) {
            const label = presenceLabel(fx.presenceIndice);
            results.push({
                id: fx.id,
                description: fx.description,
                ok: label === fx.expectedPresenceLabel,
                detail: { got: label, expected: fx.expectedPresenceLabel },
            });
            continue;
        }

        // scoreSubstance frappe la DB pour nature — on tolère l'échec réseau en reportant
        try {
            const scored = await scoreSubstance(fx.litho || [], fx.substance);
            let ok = true;
            if (fx.expectedNote != null) ok = Number(scored.note) === Number(fx.expectedNote);
            if (fx.expectedMinNote != null) ok = Number(scored.note) >= Number(fx.expectedMinNote);
            results.push({
                id: fx.id,
                description: fx.description,
                ok,
                detail: {
                    note: scored.note,
                    label: scored.label || LABEL[scored.note],
                    path: scored.path,
                    expectedNote: fx.expectedNote,
                    expectedMinNote: fx.expectedMinNote,
                },
            });
        } catch (e) {
            results.push({
                id: fx.id,
                description: fx.description,
                ok: false,
                detail: { error: String(e.message || e) },
            });
        }
    }

    return {
        total: results.length,
        passed: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        results,
    };
}

async function saveFeedback({ historiqueId, substance, noteSysteme, noteGeologue, commentaire, validateur }) {
    await ensureSchema();
    if (!historiqueId) {
        const err = new Error('historiqueId requis');
        err.code = 'HIST_REQUIRED';
        throw err;
    }
    if (!substance || !String(substance).trim()) {
        const err = new Error('substance requise');
        err.code = 'SUBSTANCE_REQUIRED';
        throw err;
    }

    let ns = noteSysteme != null && noteSysteme !== '' ? Number(noteSysteme) : NaN;
    if (!Number.isFinite(ns)) {
        const draft = await getDraftFromHistorique(historiqueId);
        const match = draft.substances.find(
            (s) => String(s.substance).toLowerCase() === String(substance).trim().toLowerCase()
        );
        if (!match || match.noteSysteme == null) {
            const err = new Error('Note système introuvable pour cette substance dans l\'historique');
            err.code = 'NOTE_NOT_FOUND';
            throw err;
        }
        ns = match.noteSysteme;
    }

    const ng = Number(noteGeologue);
    if (!Number.isFinite(ng) || ng < 1 || ng > 4) {
        const err = new Error('noteGeologue doit être un entier 1-4');
        err.code = 'NOTE_GEO_INVALID';
        throw err;
    }

    const accord = Number.isFinite(ns) && Number.isFinite(ng) ? ns === ng : null;
    const result = await pool.query(
        `INSERT INTO validation_geologue
         (historique_id, substance, note_systeme, note_geologue, accord, commentaire, validateur)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [String(historiqueId), String(substance).trim(), ns, ng, accord, commentaire || null, validateur || null]
    );
    return result.rows[0];
}

async function listFeedback({ limit = 50 } = {}) {
    await ensureSchema();
    const result = await pool.query(
        `SELECT * FROM validation_geologue ORDER BY created_at DESC LIMIT $1`,
        [Math.min(Number(limit) || 50, 200)]
    );
    return result.rows;
}

async function feedbackStats() {
    await ensureSchema();
    const result = await pool.query(
        `SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE accord IS TRUE)::int AS accords,
            COUNT(*) FILTER (WHERE accord IS FALSE)::int AS desaccords
         FROM validation_geologue`
    );
    const row = result.rows[0] || { total: 0, accords: 0, desaccords: 0 };
    const taux = row.total ? Math.round((100 * row.accords) / row.total) : null;
    return { ...row, tauxAccordPct: taux };
}

module.exports = {
    FIXTURES,
    runFixtures,
    saveFeedback,
    listFeedback,
    feedbackStats,
    presenceLabel,
    labelToNote,
    buildDraftFromHistorique,
    getDraftFromHistorique,
};
