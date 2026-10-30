const express = require('express');
const router = express.Router();
const { get_historique, get_dashboard_stats } = require('./service/historique');

router.get('/admin/getHistoriques', async (req, res) => {
    try {
        const tout_historique = await get_historique();
        return res.json(tout_historique);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.get('/admin/dashboardStats', async (req, res) => {
    try {
        const stats = await get_dashboard_stats();
        return res.json(stats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

module.exports = router;
