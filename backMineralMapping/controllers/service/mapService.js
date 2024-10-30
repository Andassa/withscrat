const pool = require('../../database.js');

async function getCoordinatesByPermis(id) {
    const query = 'SELECT geom FROM permis_shp WHERE gid = $1';
    const values = [id];

    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
        return result.rows[0].geom; // Retourne la géométrie du permis
    }
    throw new Error('Aucune coordonnée trouvée pour ce permis.');
}

// Nouvelle fonction pour récupérer les géométries
async function getPermisGeometries() {
    const query = 'SELECT gid, fid, objectid, titre, shape_area, titres_no_, registre_1, registre_2, type_tit_1, ST_AsGeoJSON(geom) AS geom FROM permis_shp;'; // Ajoutez les autres colonnes ici
    const result = await pool.query(query);
    return result.rows;
}

module.exports = {
    getCoordinatesByPermis,
    getPermisGeometries, // N'oublie pas d'exporter la nouvelle fonction
};
