const pool = require('../../database.js');
const Decimal = require('decimal.js');

const createCarre = async (centre) => {
    const long = new Decimal('0.005953705322626733');
    const larg = new Decimal('0.005649108528689231');
    const listeCarre = [];

    for (const element of centre) {
        const lat = new Decimal(element.lat);
        const lng = new Decimal(element.lng);
        const a = [lat.minus(larg.dividedBy(2)), lng.plus(long.dividedBy(2))];
        const c = [lat.plus(larg.dividedBy(2)), lng.minus(long.dividedBy(2))];
        const b = [lat.plus(larg.dividedBy(2)), lng.plus(long.dividedBy(2))];
        const d = [lat.minus(larg.dividedBy(2)), lng.minus(long.dividedBy(2))];
        listeCarre.push([a, b, c, d]);
    }
    return listeCarre;
};

const verifCarreDecoupe = async (uncentre, decoupes) => {
    if (!decoupes || decoupes.length === 0) {
        return { ...uncentre, etat: 0 };
    }
    const indicatifs = decoupes.map((d) => d.indicatif);
    const result = await pool.query(
        `SELECT CASE
            WHEN EXISTS (
                SELECT 1
                FROM decoupe_cent d
                WHERE d.indicatif = ANY($1::text[])
                  AND ST_Contains(
                        ST_SetSRID(d.geom, 4326),
                        ST_SetSRID(ST_MakePoint($2::float8, $3::float8), 4326)
                      )
            ) THEN 0
            ELSE 1
         END AS dansdecoupe`,
        [indicatifs, Number(uncentre.lng), Number(uncentre.lat)]
    );
    return { ...uncentre, etat: result.rows[0].dansdecoupe };
};

const listeCarre = async (centres, decoupes) => {
    const out = [];
    for (const centre of centres) {
        const verified = await verifCarreDecoupe(centre, decoupes);
        const coord = await createCarre([verified]);
        out.push({ ...verified, coord });
    }
    return out;
};

/** Construit un GeoJSON MultiPolygon (EPSG:4326) à partir des carrés. */
function createMultiPolygonGeoJSON(listeCentre) {
    const polygons = [];
    for (const item of listeCentre) {
        const ringLatLng = item.coord?.[0];
        if (!ringLatLng || ringLatLng.length < 3) continue;
        const ring = ringLatLng.map(([lat, lng]) => [Number(lng), Number(lat)]);
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push([...first]);
        }
        polygons.push([ring]);
    }
    return { type: 'MultiPolygon', coordinates: polygons };
}

/** Valide la géométrie côté PostGIS ; retourne le GeoJSON. */
async function createMultiPolygon(listeCentre) {
    const geojson = createMultiPolygonGeoJSON(listeCentre);
    if (!geojson.coordinates.length) {
        throw new Error('Aucun carré valide pour construire le multipolygon');
    }
    const check = await pool.query(
        `SELECT ST_IsValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS ok,
                ST_AsText(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS wkt`,
        [JSON.stringify(geojson)]
    );
    if (!check.rows[0]?.ok) {
        throw new Error('Géométrie multipolygon invalide');
    }
    return geojson;
}

module.exports = {
    createCarre,
    verifCarreDecoupe,
    listeCarre,
    createMultiPolygon,
    createMultiPolygonGeoJSON,
};
