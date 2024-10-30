const pool = require('../../database.js'); // Si permisService.js est dans controllers/service


async function getAllPermis() {
    const result = await pool.query('SELECT * FROM permis_shp;');
    return result.rows;
}

async function getPermisByType(type) {
    const result = await pool.query('SELECT * FROM permis_shp WHERE type = $1;', [type]);
    return result.rows;
}

module.exports = {
    getAllPermis,
    getPermisByType
};
