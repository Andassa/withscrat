const pool = require('../../database.js');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads/terrain');

async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS terrain_observations (
            id SERIAL PRIMARY KEY,
            utilisateur TEXT,
            substance TEXT,
            note TEXT,
            lon DOUBLE PRECISION,
            lat DOUBLE PRECISION,
            photo_path TEXT,
            synced_at TIMESTAMPTZ DEFAULT NOW(),
            meta JSONB DEFAULT '{}'::jsonb
        )
    `);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
}

async function saveObservation({ userId, substance, note, lon, lat, photoBase64, meta }) {
    await ensureSchema();
    let photoPath = null;
    if (photoBase64 && typeof photoBase64 === 'string') {
        const raw = photoBase64.replace(/^data:image\/\w+;base64,/, '');
        const buf = Buffer.from(raw, 'base64');
        if (buf.length > 3 * 1024 * 1024) {
            throw new Error('Photo trop volumineuse (max 3 Mo)');
        }
        const filename = `obs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
        photoPath = path.join(uploadDir, filename);
        fs.writeFileSync(photoPath, buf);
        photoPath = `uploads/terrain/${filename}`;
    }

    const result = await pool.query(
        `INSERT INTO terrain_observations (utilisateur, substance, note, lon, lat, photo_path, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         RETURNING id, synced_at`,
        [
            userId || null,
            substance || null,
            note || null,
            lon != null ? Number(lon) : null,
            lat != null ? Number(lat) : null,
            photoPath,
            JSON.stringify(meta || {}),
        ]
    );
    return result.rows[0];
}

async function listObservations({ limit = 50 } = {}) {
    await ensureSchema();
    const result = await pool.query(
        `SELECT id, utilisateur, substance, note, lon, lat, photo_path, synced_at, meta
         FROM terrain_observations
         ORDER BY synced_at DESC
         LIMIT $1`,
        [Math.min(Number(limit) || 50, 200)]
    );
    return result.rows;
}

module.exports = { saveObservation, listObservations, ensureSchema };
