const express = require('express');
const router = express.Router();
const pool = require('../database.js');
const { getPermisLayer, searchColumns, ALLOWED } = require('./service/permisLayer');

router.get('/utilisateur/permisLayer', (req, res) => {
    try {
        return res.json({
            layer: getPermisLayer(),
            allowed: [...ALLOWED],
            note: 'permis_shp = couche API historique ; permis_625 = cadastre dense (PERMIS_LAYER)',
        });
    } catch (error) {
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/utilisateur/getPermis_byName', (req, res) => {
    const num = req.body.num;
    if (!num) {
        return res.json({ erreur: 'pas de resultat' });
    }
    let layer;
    let cols;
    try {
        layer = getPermisLayer();
        cols = searchColumns(layer);
    } catch (error) {
        return res.status(500).json({ erreur: String(error.message || error) });
    }

    pool.query(
        `SELECT ${cols.selectList}
         FROM ${layer}
         WHERE ${cols.search} ILIKE $1
         LIMIT 50`,
        [`%${num}%`],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erreur: 'Erreur de base de données' });
            }
            if (!results.rows?.length) {
                return res.json({ erreur: 'pas de resultat', layer });
            }
            return res.json({ result: results.rows, layer });
        }
    );
});

module.exports = router;
