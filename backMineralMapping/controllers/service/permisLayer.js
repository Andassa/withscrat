/**
 * Couche cadastre configurable.
 * PERMIS_LAYER=permis_shp (défaut) | permis_625
 */
const ALLOWED = new Set(['permis_shp', 'permis_625']);

function getPermisLayer() {
    const layer = (process.env.PERMIS_LAYER || 'permis_shp').trim();
    if (!ALLOWED.has(layer)) {
        throw new Error(`PERMIS_LAYER invalide: ${layer}. Autorisé: permis_shp, permis_625`);
    }
    return layer;
}

function searchColumns(layer) {
    if (layer === 'permis_625') {
        return {
            search: 'CAST(titre AS TEXT)',
            selectList: `gid, titre, r_nom, r_prenom, substance, type, shape_area,
                         ST_AsGeoJSON(geom)::json AS jsongeom`,
            geomSelect: `gid, titre, r_nom, r_prenom, substance, type, shape_area,
                         ST_AsGeoJSON(geom) AS geom`,
        };
    }
    return {
        search: 'CAST(titres_no_ AS TEXT)',
        selectList: `*, ST_AsGeoJSON(geom)::json AS jsongeom`,
        geomSelect: `gid, fid, objectid, titre, shape_area, titres_no_, registre_1, registre_2, type_tit_1,
                     ST_AsGeoJSON(geom) AS geom`,
    };
}

module.exports = { getPermisLayer, searchColumns, ALLOWED };
