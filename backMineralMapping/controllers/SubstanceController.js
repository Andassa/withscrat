const express = require('express');
const router = express.Router();
const { getSubstances, filterSubstances } = require('./service/substanceService');

// Récupérer toutes les substances
router.get('/utilisateur/getSubstances', async (req, res) => {
    try {
        const substances = await getSubstances();
        res.json(substances);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des substances.' });
    }
});

// Filtrer les substances
router.get('/utilisateur/filterSubstances', async (req, res) => {
    const { type } = req.query;
    try {
        const filtered = await filterSubstances(type);
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la filtration des substances.' });
    }
});

module.exports = router;
