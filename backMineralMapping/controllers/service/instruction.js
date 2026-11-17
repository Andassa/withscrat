const pool = require('../../database.js');
const fs = require('fs');
const path = require('path');

const STATUTS = ['brouillon', 'soumis', 'en_instruction', 'instruit', 'rejete', 'archive'];
const uploadDir = path.join(__dirname, '../../uploads/dossiers');

async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS dossiers_instruction (
            id SERIAL PRIMARY KEY,
            reference TEXT UNIQUE,
            demandeur TEXT,
            typepermis INT,
            statut TEXT NOT NULL DEFAULT 'brouillon',
            historique_id TEXT,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_by TEXT,
            updated_by TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS dossier_commentaires (
            id SERIAL PRIMARY KEY,
            dossier_id INT REFERENCES dossiers_instruction(id) ON DELETE CASCADE,
            auteur TEXT,
            corps TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS dossier_pieces (
            id SERIAL PRIMARY KEY,
            dossier_id INT REFERENCES dossiers_instruction(id) ON DELETE CASCADE,
            nom TEXT,
            path TEXT,
            mime TEXT,
            uploaded_by TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS dossier_events (
            id SERIAL PRIMARY KEY,
            dossier_id INT REFERENCES dossiers_instruction(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            label TEXT NOT NULL,
            detail JSONB NOT NULL DEFAULT '{}'::jsonb,
            actor TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
}

async function addEvent(dossierId, { type, label, detail, actor }) {
    await ensureSchema();
    const result = await pool.query(
        `INSERT INTO dossier_events (dossier_id, type, label, detail, actor)
         VALUES ($1, $2, $3, $4::jsonb, $5)
         RETURNING *`,
        [
            dossierId,
            type || 'info',
            label || type || 'Événement',
            JSON.stringify(detail || {}),
            actor || null,
        ]
    );
    return result.rows[0];
}

function makeReference() {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `DI-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

async function createDossier({ demandeur, typepermis, historiqueId, payload, userId }) {
    await ensureSchema();
    const reference = makeReference();
    const result = await pool.query(
        `INSERT INTO dossiers_instruction
         (reference, demandeur, typepermis, statut, historique_id, payload, created_by, updated_by)
         VALUES ($1,$2,$3,'brouillon',$4,$5::jsonb,$6,$6)
         RETURNING *`,
        [reference, demandeur || null, typepermis || null, historiqueId || null, JSON.stringify(payload || {}), userId || null]
    );
    const dossier = result.rows[0];
    await addEvent(dossier.id, {
        type: 'creation',
        label: 'Dossier créé',
        detail: {
            reference,
            historiqueId: historiqueId || null,
            demandeur: demandeur || null,
        },
        actor: userId || null,
    });
    if (historiqueId) {
        await addEvent(dossier.id, {
            type: 'evaluation',
            label: 'Évaluation ScoreEngine rattachée',
            detail: { historiqueId },
            actor: userId || null,
        });
    }
    return dossier;
}

async function listDossiers({ statut, limit = 50 } = {}) {
    await ensureSchema();
    const params = [];
    let where = '';
    if (statut) {
        params.push(statut);
        where = `WHERE statut = $${params.length}`;
    }
    params.push(Math.min(Number(limit) || 50, 200));
    const result = await pool.query(
        `SELECT id, reference, demandeur, typepermis, statut, historique_id, created_by, created_at, updated_at
         FROM dossiers_instruction
         ${where}
         ORDER BY updated_at DESC
         LIMIT $${params.length}`,
        params
    );
    return result.rows;
}

async function getDossier(id) {
    await ensureSchema();
    const dossier = await pool.query(`SELECT * FROM dossiers_instruction WHERE id = $1`, [id]);
    if (!dossier.rows[0]) return null;
    const [comments, pieces] = await Promise.all([
        pool.query(
            `SELECT id, auteur, corps, created_at FROM dossier_commentaires WHERE dossier_id = $1 ORDER BY created_at`,
            [id]
        ),
        pool.query(
            `SELECT id, nom, path, mime, uploaded_by, created_at FROM dossier_pieces WHERE dossier_id = $1 ORDER BY created_at`,
            [id]
        ),
    ]);
    return { ...dossier.rows[0], commentaires: comments.rows, pieces: pieces.rows };
}

async function updateStatut(id, statut, userId) {
    if (!STATUTS.includes(statut)) throw new Error(`Statut invalide: ${statut}`);
    await ensureSchema();
    const before = await pool.query(`SELECT statut FROM dossiers_instruction WHERE id = $1`, [id]);
    const prev = before.rows[0]?.statut;
    const result = await pool.query(
        `UPDATE dossiers_instruction
         SET statut = $2, updated_by = $3, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, statut, userId || null]
    );
    if (result.rows[0] && prev !== statut) {
        await addEvent(id, {
            type: 'statut',
            label: `Statut : ${prev || '?'} → ${statut}`,
            detail: { from: prev || null, to: statut },
            actor: userId || null,
        });
    }
    return result.rows[0];
}

async function addCommentaire(id, { auteur, corps }) {
    await ensureSchema();
    if (!corps || !String(corps).trim()) throw new Error('Commentaire vide');
    const result = await pool.query(
        `INSERT INTO dossier_commentaires (dossier_id, auteur, corps)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id, auteur || null, String(corps).trim()]
    );
    await pool.query(`UPDATE dossiers_instruction SET updated_at = NOW() WHERE id = $1`, [id]);
    await addEvent(id, {
        type: 'commentaire',
        label: 'Commentaire ajouté',
        detail: { commentaireId: result.rows[0].id, extrait: String(corps).trim().slice(0, 120) },
        actor: auteur || null,
    });
    return result.rows[0];
}

async function addPiece(id, { nom, base64, mime, userId }) {
    await ensureSchema();
    if (!base64) throw new Error('Fichier manquant');
    const raw = String(base64).replace(/^data:[^;]+;base64,/, '');
    const buf = Buffer.from(raw, 'base64');
    if (buf.length > 5 * 1024 * 1024) throw new Error('Pièce trop volumineuse (max 5 Mo)');
    const safeName = (nom || `piece_${Date.now()}`).replace(/[^\w.\-]+/g, '_');
    const filename = `d${id}_${Date.now()}_${safeName}`;
    const abs = path.join(uploadDir, filename);
    fs.writeFileSync(abs, buf);
    const rel = `uploads/dossiers/${filename}`;
    const result = await pool.query(
        `INSERT INTO dossier_pieces (dossier_id, nom, path, mime, uploaded_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, safeName, rel, mime || 'application/octet-stream', userId || null]
    );
    await pool.query(`UPDATE dossiers_instruction SET updated_at = NOW() WHERE id = $1`, [id]);
    await addEvent(id, {
        type: 'piece',
        label: `Pièce jointe : ${safeName}`,
        detail: { pieceId: result.rows[0].id, nom: safeName, mime: mime || null },
        actor: userId || null,
    });
    return result.rows[0];
}

/**
 * Fusion chronologique pure (testable) : events + validations liées à l'historique.
 */
function mergeTimelineItems({ events = [], validations = [] } = {}) {
    const items = [];
    for (const e of events) {
        items.push({
            id: `evt-${e.id ?? items.length}`,
            type: e.type || 'info',
            label: e.label || e.type || 'Événement',
            at: e.created_at || e.at || null,
            actor: e.actor || null,
            detail: e.detail || {},
            source: 'event',
        });
    }
    for (const v of validations) {
        items.push({
            id: `val-${v.id ?? items.length}`,
            type: 'validation',
            label: `Validation géologue · ${v.substance || '?'} (sys ${v.note_systeme}/géo ${v.note_geologue})`,
            at: v.created_at || v.at || null,
            actor: v.validateur || null,
            detail: {
                accord: v.accord,
                substance: v.substance,
                noteSysteme: v.note_systeme,
                noteGeologue: v.note_geologue,
                commentaire: v.commentaire || null,
            },
            source: 'validation',
        });
    }
    items.sort((a, b) => {
        const ta = a.at ? new Date(a.at).getTime() : 0;
        const tb = b.at ? new Date(b.at).getTime() : 0;
        return ta - tb;
    });
    return items;
}

async function getTimeline(dossierId) {
    await ensureSchema();
    const dossierRes = await pool.query(`SELECT * FROM dossiers_instruction WHERE id = $1`, [dossierId]);
    const dossier = dossierRes.rows[0];
    if (!dossier) return null;

    const eventsRes = await pool.query(
        `SELECT id, type, label, detail, actor, created_at
         FROM dossier_events WHERE dossier_id = $1 ORDER BY created_at`,
        [dossierId]
    );

    let validations = [];
    if (dossier.historique_id) {
        try {
            const valRes = await pool.query(
                `SELECT id, historique_id, substance, note_systeme, note_geologue, accord, commentaire, validateur, created_at
                 FROM validation_geologue
                 WHERE historique_id = $1
                 ORDER BY created_at`,
                [String(dossier.historique_id)]
            );
            validations = valRes.rows;
        } catch (_) {
            validations = [];
        }
    }

    const timeline = mergeTimelineItems({
        events: eventsRes.rows,
        validations,
    });

    return {
        dossierId: dossier.id,
        reference: dossier.reference,
        statut: dossier.statut,
        historiqueId: dossier.historique_id,
        timeline,
    };
}

function buildExportInstruction(dossier) {
    return {
        type: 'dossier_instruction',
        version: 4,
        genereAt: new Date().toISOString(),
        reference: dossier.reference,
        statut: dossier.statut,
        demandeur: dossier.demandeur,
        historiqueId: dossier.historique_id,
        payload: dossier.payload,
        commentaires: dossier.commentaires || [],
        pieces: (dossier.pieces || []).map((p) => ({ id: p.id, nom: p.nom, path: p.path })),
        timeline: dossier.timeline || [],
        workflow: STATUTS,
    };
}

module.exports = {
    STATUTS,
    createDossier,
    listDossiers,
    getDossier,
    updateStatut,
    addCommentaire,
    addPiece,
    addEvent,
    mergeTimelineItems,
    getTimeline,
    buildExportInstruction,
    ensureSchema,
};
