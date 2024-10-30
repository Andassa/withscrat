const pool = require('../database.js');

async function getHistorique() {
    const result = await pool.query('SELECT * FROM historique;');
    return result.rows;
}

module.exports = {
    getHistorique
};
