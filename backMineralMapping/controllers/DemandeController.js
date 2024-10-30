const express = require('express');
const router = express.Router();
const { createMultiPolygon } = require('./service/Carre');
const { getLitho } = require('./service/lithology');
const { get_nature, getResult, getResultfinal } = require('./service/roche');
const { getSubs_byId, get_All_Subs_by_id } = require('./service/substance');
const { intersect, lesProbabilité } = require('./service/indice');
const { get_sequence_historique,insert_Historique } = require('./service/historique');

const pool = require('../database.js'); // Importez la configuration de la base de données

router.get('/utilisateur/getDemandeur', (req, res) => {
    pool.query("select * from personne_societe", (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            if (results.rows?.length == 0) {
                const response = { erreur: 'pas de suggestion' };
                return res.json(response);
            }
            return res.json(results.rows);
        }
    });
});
router.get('/utilisateur/getTypePermis', (req, res) => {
    pool.query("select * from typepermis", (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            if (results.rows?.length == 0) {
                const response = { erreur: 'pas de suggestion' };
                return res.json(response);
            }
            return res.json(results.rows);
        }
    });
});
router.post('/utilisateur/getDonneDemande', async (req, res) => {
    const tableauDemande = req.body.donneesTableau;
    try {
        if (tableauDemande != null) {
            // const listeSubstances = tableauDemande['choixSubs'];
            // console.log(tableauDemande);
            const listeCarre = tableauDemande['listeCarre'];
            const multipoly = await createMultiPolygon(listeCarre);
            const lith = await getLitho(multipoly);
            const subs = await get_All_Subs_by_id(tableauDemande['choixSubs']);

            const donnees_historique = { demandeur: tableauDemande.nomPersonne, idUtilisateur: req.user.id, typepermis: tableauDemande.selectPermis, carres: multipoly }

            // resultats
            const probIndice = await lesProbabilité(multipoly, subs);
            // console.log(probIndice);
            const result = await getResultfinal(lith, subs);
            // tableauDemande.listeCarre.forEach(element => {
            //     console.log(element.coord)
            // });

            const resultFinal = probIndice.map(item1 => {
                // Trouver l'élément correspondant dans table2
                const match = result.find(item2 => item2.subs === item1.subs);

                // Combiner les objets correspondants
                if (match) {
                    return { ...item1, result: match.result };
                }

                // Si aucun élément correspondant n'est trouvé, retourner l'objet original
                return item1;
            });
            console.log(resultFinal);

            // await insert_Historique(donnees_historique, resultFinal);

            return res.json(resultFinal);
        } else {
            return res.json({ 'error': 'tableau vide' });
        }
    } catch (error) {
        return res.json({ "error": error });
    }
});

module.exports = router;