const express = require('express');
const router = express.Router();
const pool = require('../database.js');

// Couche API actuelle: permis_shp. La table permis_625 (cadastre dense) est
// disponible en base pour une couche future si le métier l'exige.

router.post('/utilisateur/getPermis_byName', (req, res) => {
    const num = req.body.num;
    if (!num) {
        return res.json({ erreur: 'pas de resultat' });
    }
    pool.query(
        `SELECT *, ST_AsGeoJSON(geom)::json AS jsongeom
         FROM permis_shp
         WHERE CAST(titres_no_ AS TEXT) ILIKE $1`,
        [`%${num}%`],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erreur: 'Erreur de base de données' });
            }
            if (!results.rows?.length) {
                return res.json({ erreur: 'pas de resultat' });
            }
            return res.json({ result: results.rows });
        }
    );
});

module.exports = router;
