const pool = require('../../database.js');

/**
 * Intersection lithologie (geol) avec une zone GeoJSON.
 */
async function getLitho(geojson) {
    const payload = typeof geojson === 'string' ? geojson : JSON.stringify(geojson);
    const result = await pool.query(
        `SELECT lithology, mot1, mot2
         FROM geol g
         WHERE ST_Intersects(
            ST_SetSRID(ST_MakeValid(g.geom), 4326),
            ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
         )`,
        [payload]
    );
    return result.rows;
}

module.exports = { getLitho };
