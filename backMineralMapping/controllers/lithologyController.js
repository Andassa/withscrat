const express = require('express');
const router = express.Router();
const pool = require('../database.js'); // Importez la configuration de la base de données
const {getTraces,getIntersect,getTotalDimensionTrace, getTableAEtudier } = require('./service/litho2');

router.post('/getLithology', async (req, res) => {
    const substance = req.body.substance;
    try {
        const traces = await getTraces(substance);
        if (traces.length > 0) {
            const totalDimensionTrace = await getTotalDimensionTrace();
            const tableAEtudier = await getIntersect();
            res.json(tableAEtudier);
        } else {
            res.json({resultat: "aucun resultat"});
        }
    } catch (error) {
        console.error(error);
    }
})


module.exports = router;