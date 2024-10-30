const express = require('express');
const router = express.Router();
const { getPermisByType, getAllPermis } = require('./service/permisService');

// Récupérer tous les permis
router.get('/utilisateur/getAllPermis', async (req, res) => {
    try {
        const permis = await getAllPermis();
        res.json(permis);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des permis.' });
    }
});

// Récupérer des permis par type
router.get('/utilisateur/getPermisByType/:type', async (req, res) => {
    try {
        const permis = await getPermisByType(req.params.type);
        res.json(permis);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des permis par type.' });
    }
});

module.exports = router;
