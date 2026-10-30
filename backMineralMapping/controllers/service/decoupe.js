const pool = require('../../database.js');

const detailDecoupe = async (tableau) => {
    if (!tableau?.length) return [];
    const indicatifs = tableau.map((t) => t.indicatif);
    const noms = tableau.map((t) => t.nom);
    const result = await pool.query(
        `SELECT gid, perimeter, dec100new_, indicatif, nom, date_editi, ST_AsGeoJSON(geom) AS geom
         FROM decoupe_cent dc
         WHERE EXISTS (
            SELECT 1
            FROM UNNEST($1::text[], $2::text[]) AS q(indicatif, nom)
            WHERE q.indicatif = dc.indicatif AND q.nom = dc.nom
         )`,
        [indicatifs, noms]
    );
    return result.rows;
};

module.exports = {
    detailDecoupe,
};
