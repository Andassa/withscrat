const pool = require('../../database.js');

/**
 * Indice de présence (1–4), PAS une probabilité :
 * 1 = aucun type, puis +1 par famille touchée (point / line / zone).
 */
async function intersectTable(geojsonPayload, table, substance) {
    const allowed = new Set(['indice_point', 'indice_line', 'indice_zone']);
    if (!allowed.has(table)) {
        throw new Error(`Table indices non autorisée: ${table}`);
    }
    const result = await pool.query(
        `SELECT EXISTS (
            SELECT 1
            FROM ${table} il
            WHERE ST_Intersects(
                    ST_SetSRID(ST_MakeValid(il.geom), 4326),
                    ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON($1)), 4326)
                  )
              AND il.nom ILIKE $2
         ) AS ok`,
        [geojsonPayload, `%${substance}%`]
    );
    return result.rows[0]?.ok === true;
}

async function unePresence(geojsonPayload, substance) {
    const details = {
        point: await intersectTable(geojsonPayload, 'indice_point', substance),
        line: await intersectTable(geojsonPayload, 'indice_line', substance),
        zone: await intersectTable(geojsonPayload, 'indice_zone', substance),
    };
    let presenceIndice = 1;
    if (details.point) presenceIndice += 1;
    if (details.line) presenceIndice += 1;
    if (details.zone) presenceIndice += 1;
    return { presenceIndice, probIndice: presenceIndice, indicesDetails: details };
}

async function lesPresencesIndices(geojson, substances) {
    const payload = typeof geojson === 'string' ? geojson : JSON.stringify(geojson);
    const results = [];
    for (const row of substances) {
        const nom = row[0]?.nom || row.nom;
        const presence = await unePresence(payload, nom);
        results.push({ subs: nom, ...presence });
    }
    return results;
}

/** Compat anciens appels */
const lesProbabilité = lesPresencesIndices;

module.exports = {
    intersectTable,
    unePresence,
    lesPresencesIndices,
    lesProbabilité,
};
