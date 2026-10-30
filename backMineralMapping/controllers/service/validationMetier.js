const pool = require('../../database.js');
const { LABEL } = require('./scoreEngine');

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
    const ns = Number(noteSysteme);
    const ng = Number(noteGeologue);
    const accord = Number.isFinite(ns) && Number.isFinite(ng) ? ns === ng : null;
    const result = await pool.query(
        `INSERT INTO validation_geologue
         (historique_id, substance, note_systeme, note_geologue, accord, commentaire, validateur)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [historiqueId || null, substance || null, ns || null, ng || null, accord, commentaire || null, validateur || null]
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
};
