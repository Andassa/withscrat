const pool = require('../../database.js');


async function getSubstances() {
    const result = await pool.query('SELECT * FROM substances;');
    return result.rows;
}

async function filterSubstances(type) {
    const result = await pool.query('SELECT * FROM substances WHERE type = $1;', [type]);
    return result.rows;
}

module.exports = {
    getSubstances,
    filterSubstances
};
