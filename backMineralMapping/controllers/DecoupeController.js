const express = require('express');
const router = express.Router();
const {detailDecoupe} = require('./service/decoupe');

const pool = require('../database.js'); // Importez la configuration de la base de données

router.get('/utilisateur/getDecoupe', (req, res) => {
    // Vérifiez si l'utilisateur est authentifié
    pool.query("select distinct (indicatif) , nom from decoupe_cent dc where indicatif not like 'null' ;", (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            const decoupes = results.rows;

            return res.json(decoupes); // Renvoyer la réponse au client avec les données
        }
    });
});
router.post('/utilisateur/getDetailDecoupe', (req, res) => {
    const indicatif = req.body.indicatif;
    const nom = req.body.nom;

    const requete = "select * from decoupe_cent where indicatif like '" + indicatif + "' and nom like '" + nom + "' ;";
    // Vérifiez si l'utilisateur est authentifié
    pool.query("select * from decoupe_cent where indicatif like '" + indicatif + "' and nom like '" + nom + "' ;", (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            const decoupes = results.rows;
            return res.json(decoupes); // Renvoyer la réponse au client avec les données
        }
    });
});

router.post('/testTableau', async (req, res) => {
    const tableauJSON = req.body.tableau;
    try {
        if (tableauJSON.length!=0) {
            const detailD = await detailDecoupe(tableauJSON);

            return res.json(detailD);
        }
    } catch (error) {
        return res.json({"error": error});
    }
});

module.exports = router;