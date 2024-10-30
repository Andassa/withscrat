const express = require('express');
const router = express.Router();
const pool = require('../database.js'); // Importez la configuration de la base de données

router.get('/utilisateur/map', (req, res) => {
    // Vérifiez si l'utilisateur est authentifié
    pool.query('SELECT * FROM substances ORDER BY nom ASC;', (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            const substances = results.rows;
            // Les rôles sont récupérés, maintenant construisons la réponse
            const utilisateur = req.user ? req.user.nom : null;
            const responseData = {
                substances: substances,
                user: utilisateur
            };
             return res.json(responseData); // Renvoyer la réponse au client avec les données
        }
    });
});
router.get('/getroles',(req,res)=>{
    pool.query('SELECT * FROM lessubstances', (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            const substances = results.rows;
            // Les rôles sont récupérés, maintenant construisons la réponse
            const utilisateur = req.user ? req.user.nom : null;
            const responseData = {
                substances: substances,
                user: utilisateur
            };
            res.json(responseData); // Renvoyer la réponse au client avec les données
        }
    });
})

module.exports = router;