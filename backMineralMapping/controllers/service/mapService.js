const pool = require('../../database.js');
const { getPermisLayer, searchColumns } = require('./permisLayer');

async function getCoordinatesByPermis(id) {
    const layer = getPermisLayer();
    const result = await pool.query(
        `SELECT geom FROM ${layer} WHERE gid = $1`,
        [id]
    );
    if (result.rows.length > 0) {
        return result.rows[0].geom;
    }
    throw new Error('Aucune coordonnée trouvée pour ce permis.');
}

async function getPermisGeometries(limit = 500) {
    const layer = getPermisLayer();
    const cols = searchColumns(layer);
    const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 2000);
    const result = await pool.query(
        `SELECT ${cols.geomSelect}
         FROM ${layer}
         WHERE geom IS NOT NULL
         LIMIT $1`,
        [safeLimit]
    );
    return { layer, count: result.rows.length, features: result.rows };
}

module.exports = {
    getCoordinatesByPermis,
    getPermisGeometries,
};
