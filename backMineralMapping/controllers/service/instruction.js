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
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
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
    return result.rows[0];
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
    const result = await pool.query(
        `UPDATE dossiers_instruction
         SET statut = $2, updated_by = $3, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, statut, userId || null]
    );
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
    return result.rows[0];
}

function buildExportInstruction(dossier) {
    return {
        type: 'dossier_instruction',
        version: 3,
        genereAt: new Date().toISOString(),
        reference: dossier.reference,
        statut: dossier.statut,
        demandeur: dossier.demandeur,
        historiqueId: dossier.historique_id,
        payload: dossier.payload,
        commentaires: dossier.commentaires || [],
        pieces: (dossier.pieces || []).map((p) => ({ id: p.id, nom: p.nom, path: p.path })),
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
    buildExportInstruction,
    ensureSchema,
};
