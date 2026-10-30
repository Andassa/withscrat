const express = require('express');
const router = express.Router();
const { detailDecoupe } = require('./service/decoupe');
const pool = require('../database.js');

router.get('/utilisateur/getDecoupe', (req, res) => {
    pool.query(
        "SELECT DISTINCT indicatif, nom FROM decoupe_cent WHERE indicatif IS NOT NULL AND indicatif NOT ILIKE 'null'",
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erreur: 'Erreur de base de données' });
            }
            return res.json(results.rows);
        }
    );
});

router.post('/utilisateur/getDetailDecoupe', (req, res) => {
    const { indicatif, nom } = req.body;
    pool.query(
        'SELECT * FROM decoupe_cent WHERE indicatif = $1 AND nom = $2',
        [indicatif, nom],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erreur: 'Erreur de base de données' });
            }
            return res.json(results.rows);
        }
    );
});

router.post('/testTableau', async (req, res) => {
    const tableauJSON = req.body.tableau;
    try {
        if (tableauJSON && tableauJSON.length !== 0) {
            const detailD = await detailDecoupe(tableauJSON);
            return res.json(detailD);
        }
        return res.json({ error: 'tableau vide' });
    } catch (error) {
        return res.status(500).json({ error: String(error) });
    }
});

module.exports = router;
