const pool = require('../../database.js');

async function getSubs_byId(id) {
    const resultat = await pool.query('SELECT * FROM substances WHERE id = $1', [id]);
    return resultat.rows;
}

async function get_All_Subs_by_id(listeId) {
    const ids = (listeId || []).map((x) => Number(x)).filter((n) => !Number.isNaN(n));
    if (!ids.length) return [];
    const resultat = await pool.query(
        'SELECT * FROM substances WHERE id = ANY($1::int[]) ORDER BY nom',
        [ids]
    );
    // conserve forme [[row]] attendue par l'ancien code
    return resultat.rows.map((row) => [row]);
}

module.exports = {
    getSubs_byId,
    get_All_Subs_by_id,
};
