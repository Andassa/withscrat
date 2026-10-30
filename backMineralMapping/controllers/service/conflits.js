const pool = require('../../database.js');
const { getPermisLayer, searchColumns, ALLOWED } = require('./permisLayer');

/**
 * @param {object} options.layer - override PERMIS_LAYER
 * @param {number} options.blockingOverlapM2 - seuil bloquant (défaut 100 m²)
 */
async function detectConflitsPermis(geojson, { limit = 50, layer: layerOverride, blockingOverlapM2 } = {}) {
    const layer = layerOverride && ALLOWED.has(layerOverride) ? layerOverride : getPermisLayer();
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const threshold = Number(blockingOverlapM2 ?? process.env.CONFLIT_BLOCKING_M2 ?? 100);
    const payload = typeof geojson === 'string' ? geojson : JSON.stringify(geojson);

    let sql;
    // Couches legacy souvent en SRID 0 : forcer 4326 des deux côtés.
    if (layer === 'permis_625') {
        sql = `
            SELECT gid, titre, r_nom, r_prenom, substance, type, shape_area,
                   ST_AsGeoJSON(ST_SetSRID(geom, 4326))::json AS geom,
                   ROUND(ST_Area(ST_Intersection(
                     ST_SetSRID(ST_MakeValid(geom), 4326),
                     ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                   )::geography)::numeric, 2) AS overlap_m2
            FROM ${layer}
            WHERE geom IS NOT NULL
              AND ST_Intersects(
                    ST_SetSRID(ST_MakeValid(geom), 4326),
                    ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                  )
            ORDER BY overlap_m2 DESC NULLS LAST
            LIMIT $2`;
    } else {
        sql = `
            SELECT gid, titre, titres_no_, registre_1, registre_2, type_tit_1, shape_area,
                   ST_AsGeoJSON(ST_SetSRID(geom, 4326))::json AS geom,
                   ROUND(ST_Area(ST_Intersection(
                     ST_SetSRID(ST_MakeValid(geom), 4326),
                     ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                   )::geography)::numeric, 2) AS overlap_m2
            FROM ${layer}
            WHERE geom IS NOT NULL
              AND ST_Intersects(
                    ST_SetSRID(ST_MakeValid(geom), 4326),
                    ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                  )
            ORDER BY overlap_m2 DESC NULLS LAST
            LIMIT $2`;
    }

    const result = await pool.query(sql, [payload, safeLimit]);
    const conflits = result.rows.map((row) => {
        const overlap = Number(row.overlap_m2) || 0;
        const severite = overlap >= threshold ? 'bloquant' : 'informatif';
        return { ...row, overlap_m2: overlap, severite };
    });
    const bloquants = conflits.filter((c) => c.severite === 'bloquant');

    return {
        layer,
        allowedLayers: [...ALLOWED],
        blockingOverlapM2: threshold,
        count: conflits.length,
        bloquantsCount: bloquants.length,
        conflits,
        alerte: conflits.length > 0,
        bloquant: bloquants.length > 0,
        message: conflits.length
            ? `${conflits.length} chevauchement(s) sur ${layer} dont ${bloquants.length} bloquant(s) (≥ ${threshold} m²)`
            : `Aucun chevauchement détecté sur ${layer}`,
    };
}

module.exports = { detectConflitsPermis };
