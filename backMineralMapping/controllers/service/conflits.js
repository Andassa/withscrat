const pool = require('../../database.js');
const { getPermisLayer, searchColumns } = require('./permisLayer');

/**
 * Détecte les permis existants qui intersectent la zone candidate.
 */
async function detectConflitsPermis(geojson, { limit = 50 } = {}) {
    const layer = getPermisLayer();
    const cols = searchColumns(layer);
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const payload = typeof geojson === 'string' ? geojson : JSON.stringify(geojson);

    let sql;
    if (layer === 'permis_625') {
        sql = `
            SELECT gid, titre, r_nom, r_prenom, substance, type, shape_area,
                   ST_AsGeoJSON(geom)::json AS geom,
                   ROUND(ST_Area(ST_Intersection(
                     ST_MakeValid(geom),
                     ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                   )::geography)::numeric, 2) AS overlap_m2
            FROM ${layer}
            WHERE geom IS NOT NULL
              AND ST_Intersects(
                    ST_MakeValid(geom),
                    ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                  )
            ORDER BY overlap_m2 DESC NULLS LAST
            LIMIT $2`;
    } else {
        sql = `
            SELECT gid, titre, titres_no_, registre_1, registre_2, type_tit_1, shape_area,
                   ST_AsGeoJSON(geom)::json AS geom,
                   ROUND(ST_Area(ST_Intersection(
                     ST_MakeValid(geom),
                     ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                   )::geography)::numeric, 2) AS overlap_m2
            FROM ${layer}
            WHERE geom IS NOT NULL
              AND ST_Intersects(
                    ST_MakeValid(geom),
                    ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                  )
            ORDER BY overlap_m2 DESC NULLS LAST
            LIMIT $2`;
    }

    const result = await pool.query(sql, [payload, safeLimit]);
    return {
        layer,
        count: result.rows.length,
        conflits: result.rows,
        alerte: result.rows.length > 0,
        message: result.rows.length
            ? `${result.rows.length} permis existant(s) en chevauchement (${layer})`
            : `Aucun chevauchement détecté sur ${layer}`,
    };
}

module.exports = { detectConflitsPermis };
