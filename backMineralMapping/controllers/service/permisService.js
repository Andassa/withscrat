const pool = require('../../database.js');
const { getPermisLayer } = require('./permisLayer');

async function getAllPermis(limit = 200) {
    const layer = getPermisLayer();
    const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 2000);
    const result = await pool.query(
        `SELECT * FROM ${layer} LIMIT $1`,
        [safeLimit]
    );
    return { layer, rows: result.rows };
}

async function getPermisByType(type) {
    const layer = getPermisLayer();
    const result = await pool.query(
        `SELECT * FROM ${layer} WHERE type = $1 LIMIT 500`,
        [type]
    );
    return { layer, rows: result.rows };
}

module.exports = {
    getAllPermis,
    getPermisByType,
};
