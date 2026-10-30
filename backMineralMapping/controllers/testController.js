const express = require('express');
const router = express.Router();
const { runKrigeage } = require('./service/lithologie');

// legacy endpoint — conserve le contrat, délègue à runKrigeage corrigé
router.post('/getest', async (req, res) => {
    const substance = req.body.substance;
    const newx = req.body.newx;
    const newy = req.body.newy;
    try {
        const result = await runKrigeage(substance, newx, newy);
        // ancien contrat: renvoyait directement le nombre prédit
        if (result.predicted == null) {
            return res.json(null);
        }
        return res.json(result.predicted);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

module.exports = router;
