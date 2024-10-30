const express = require('express');
const router = express.Router();
const pool = require('../database.js'); // Importez la configuration de la base de données

router.get('/admin/allUser', (req, res) => {
    // Vérifiez si l'utilisateur est authentifié
    var requete = "select u.id, u.nom , u.prenom , u.username , u.fonction , u.email ,r.\"label\" as autorisation ,u.etat ,u.service, u.idresp, u2.nom as nomresp , u2.prenom as prenomresp from utilisateurs u left join utilisateurs u2 on u.idresp = u2.id join roles r on u.autorisation =r.id "
    requete = requete + "where u.id!='" + req.user.id + "'";
    pool.query(requete, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            const utilisateurs = results.rows;
            return res.json(utilisateurs); // Renvoyer la réponse au client avec les données
        }
    });
});
router.post('/admin/bloquer', (req, res) => {
    const id = req.body.id;
    const requete = "update utilisateurs set etat =3 where id ='"+id+"'";
    console.log(requete);
    pool.query(requete, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            return res.json('ok'); // Renvoyer la réponse au client avec les données
        }
    });
})
router.post('/admin/debloquer', (req, res) => {
    const id = req.body.id;
    const requete = "update utilisateurs set etat =2 where id ='"+id+"'";
    console.log(requete);
    pool.query(requete, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            return res.json('ok'); // Renvoyer la réponse au client avec les données
        }
    });
})
router.post('/admin/valider', (req, res) => {
    const id = req.body.id;
    const requete = "update utilisateurs set etat = 2 where id ='"+id+"'";
    console.log(requete);
    pool.query(requete, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur de base de données');
        } else {
            return res.json('ok'); // Renvoyer la réponse au client avec les données
        }
    });
})

module.exports = router;