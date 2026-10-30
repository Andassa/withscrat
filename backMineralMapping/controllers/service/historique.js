const pool = require('../../database.js');

async function get_sequence_historique() {
    const resultat = await pool.query("SELECT nextval('seq_historique') AS new_sequence_historique");
    return resultat.rows[0].new_sequence_historique;
}

async function insert_historique_detail(id, info) {
    await pool.query(
        `INSERT INTO historique (id, demandeur, typepermis, utilisateur, carres)
         VALUES ($1, $2, $3, $4, ST_SetSRID(ST_GeomFromGeoJSON($5), 4326))`,
        [
            String(id),
            info.demandeur,
            info.typepermis,
            info.idUtilisateur,
            JSON.stringify(info.carresGeoJSON),
        ]
    );
    return 'ok';
}

async function insert_historique_result(idhistorique, result) {
    await pool.query(
        `INSERT INTO historique_result (id_historique, substance, id_result, id_result_indice)
         VALUES ($1, $2, $3, $4)`,
        [
            String(idhistorique),
            result.subs,
            Number(result.result) || 1,
            Number(result.presenceIndice || result.probIndice) || 1,
        ]
    );
    return 'ok';
}

async function insert_Historique(info, result_prob) {
    const id_historique = await get_sequence_historique();
    await insert_historique_detail(id_historique, info);
    for (const resultat of result_prob) {
        await insert_historique_result(id_historique, resultat);
    }
    return { ok: true, id: id_historique };
}

async function get_historique() {
    const resultat = await pool.query(
        `SELECT h.id AS id, h.date AS date, h.typepermis AS typePermis, t.libelle,
                h.utilisateur, u.nom, u.prenom, h.demandeur AS demandeur,
                r.resultat AS prob, hr.id_historique,
                r1.resultat AS probIndice, hr.substance AS substance
         FROM historique h
         LEFT JOIN historique_result hr ON h.id = hr.id_historique
         JOIN resultat r ON r.id = hr.id_result
         JOIN resultat r1 ON r1.id = hr.id_result_indice
         JOIN typepermis t ON t.id = h.typepermis
         JOIN utilisateurs u ON u.id = h.utilisateur
         ORDER BY date DESC`
    );

    return Object.values(
        resultat.rows.reduce((acc, row) => {
            const {
                id, date, demandeur, typepermis, libelle,
                utilisateur, nom, prenom,
                id_historique, prob, probIndice, substance,
            } = row;

            if (!acc[id]) {
                acc[id] = {
                    id, date, demandeur, typepermis, libelle,
                    utilisateur, nom, prenom, results: [],
                };
            }
            if (id_historique) {
                acc[id].results.push({ id_historique, prob, probIndice, substance });
            }
            return acc;
        }, {})
    );
}

async function get_dashboard_stats() {
    const [evalToday, topSubs, byLabel] = await Promise.all([
        pool.query(
            `SELECT COUNT(*)::int AS n
             FROM historique
             WHERE date::date = CURRENT_DATE`
        ),
        pool.query(
            `SELECT substance, COUNT(*)::int AS n
             FROM historique_result
             GROUP BY substance
             ORDER BY n DESC
             LIMIT 5`
        ),
        pool.query(
            `SELECT r.resultat AS label, COUNT(*)::int AS n
             FROM historique_result hr
             JOIN resultat r ON r.id = hr.id_result
             GROUP BY r.resultat
             ORDER BY n DESC`
        ),
    ]);
    return {
        evaluationsAujourdhui: evalToday.rows[0]?.n || 0,
        topSubstances: topSubs.rows,
        repartitionNotes: byLabel.rows,
    };
}

module.exports = {
    insert_Historique,
    get_historique,
    get_dashboard_stats,
};
