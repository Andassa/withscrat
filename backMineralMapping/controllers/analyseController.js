const express = require('express');
const router = express.Router();
const { runKrigeage } = require('./service/lithologie');

router.post('/analyse/krigeage', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ erreur: 'Non authentifié' });
    }
    const { substance, newx, newy, x, y } = req.body;
    const lon = newx ?? x;
    const lat = newy ?? y;
    if (!substance || lon === undefined || lat === undefined) {
        return res.status(400).json({ erreur: 'substance, newx/newy requis' });
    }
    try {
        const result = await runKrigeage(substance, lon, lat);
        return res.json({
            type: 'krigeage',
            horsScorePermis: true,
            substance,
            point: { x: Number(lon), y: Number(lat) },
            ...result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: 'Erreur krigeage', detail: String(error.message || error) });
    }
});

module.exports = router;
