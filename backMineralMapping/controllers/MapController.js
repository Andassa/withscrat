const express = require('express');
const router = express.Router();
const { getCoordinatesByPermis, getPermisGeometries } = require('./service/mapService');

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
        const limit = req.query.limit;
        const permis = await getPermisGeometries(limit);
        res.json(permis);
    } catch (error) {
        console.error('Erreur lors de la récupération des géométries de permis:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des géométries de permis.' });
    }
});

module.exports = router;
