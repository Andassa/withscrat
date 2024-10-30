const express = require('express');
const router = express.Router();
const pool = require('../database.js'); // Importez la configuration de la base de données
const {getCoordonnées,getFrequence,getNbCoucheLitho,getResultKrigeage } = require('./service/lithologie');

router.post('/getest', async (req, res) => {
    const substance = req.body.substance;
    const newx = req.body.newx;
    const newy = req.body.newy;
    try {
        const nbCoucheLitho = await getNbCoucheLitho(substance);
        const codefrequence = await getFrequence(substance);
        const getCoordXY = await getCoordonnées(codefrequence,substance);
        const responseData = {
            nombre :nbCoucheLitho,
            requetepourcentage: getCoordXY,
        }
        const getResult = await getResultKrigeage(newx,newy,responseData);
        res.json(getResult);
        
    } catch (error) {
        console.error(error);
    }
})

module.exports = router;