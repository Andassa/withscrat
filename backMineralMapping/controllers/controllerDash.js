const express = require('express');
const router = express.Router();
// const pool = require('../database.js'); // Importez la configuration de la base de données

router.get('/admin/dashboard', (req, res) => {
    res.send('admin');
});

module.exports = router;