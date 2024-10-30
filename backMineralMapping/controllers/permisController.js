const express = require('express');
const router = express.Router();
const pool = require('../database.js'); // Importez la configuration de la base de données

router.post('/utilisateur/getPermis_byName', (req, res) => {
    // Vérifiez si l'utilisateur est authentifié
    const num = req.body.num;
    pool.query("SELECT *, ST_AsGeoJSON(geom)::json as jsongeom FROM permis_shp WHERE CAST(titres_no_ AS TEXT) LIKE '%"+num+"%'", (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            if(results.rows?.length==0){
                const response = {erreur :'pas de resultat'};
                return res.json(response);
            }
            const num_permis ={ result: results.rows};
            // Les rôles sont récupérés, maintenant construisons la réponse
            console.log('get permis');
             return res.json(num_permis); // Renvoyer la réponse au client avec les données
        }
    });
});

module.exports = router;