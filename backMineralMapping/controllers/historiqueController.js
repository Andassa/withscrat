const express = require('express');
const router = express.Router();
const pool = require('../database.js'); 
const { get_historique } = require('./service/historique');

router.get('/admin/getHistoriques', async (req, res) => {
    var tout_historique = await get_historique();
    res.json(tout_historique);
});


module.exports = router;