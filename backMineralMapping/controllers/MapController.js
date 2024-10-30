const express = require('express');
const router = express.Router();
const pool = require('../database.js');
const { getCoordinatesByPermis, getPermisGeometries } = require('./service/mapService');


// Récupérer les coordonnées GPS d'un permis
router.get('/utilisateur/getCoordinates/:id', async (req, res) => {
    try {
        const coordinates = await getCoordinatesByPermis(req.params.id);
        res.json(coordinates);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des coordonnées.' });
    }
});


router.get('/utilisateur/getPermisGeometries', async (req, res) => {
    try {
        console.log('Appel de la fonction getPermisGeometries');
        const permis = await getPermisGeometries();
        console.log('Données reçues:', permis);
        res.json(permis);
    } catch (error) {
        console.error('Erreur lors de la récupération des géométries de permis:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des géométries de permis.' });
    }
});

module.exports = router;
