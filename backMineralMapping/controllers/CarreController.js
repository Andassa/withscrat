const express = require('express');
const router = express.Router();
const { createCarre, listeCarre } = require('./service/Carre');

router.post('/formeCarre', async (req, res) => {
    const tableauJSON = req.body.donnees;
    try {
        if (!tableauJSON?.centre?.length) {
            return res.json({ error: 'centres vides' });
        }
        const decoupe = tableauJSON.decoupe || tableauJSON.decoupes || [];
        const booleanCarre = await listeCarre(tableauJSON.centre, decoupe);
        return res.json(booleanCarre);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: String(error.message || error) });
    }
});

router.post('/formeUnCarre', async (req, res) => {
    const centre = req.body.centre;
    try {
        const unCarree = await createCarre(centre);
        return res.json(unCarree);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: String(error.message || error) });
    }
});

module.exports = router;
