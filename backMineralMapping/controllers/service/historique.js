//pour faire l'analyse de données par rapport au résultats des intersections
const pool = require('../../database.js'); // Importez la configuration de la base de données


//avoir la prochaine valeur de seq_historique ;
async function get_sequence_historique() {
    var requete = "select nextval('seq_historique') as new_sequence_historique";

    return new Promise((resolve, reject) => {
        try {
            pool.query(requete, (error, resultat) => {
                if (error) {
                    console.error('erreur lors de get sequence 2');
                    reject('erreur lors du get sequence 2');
                }
                else {
                    resolve(resultat.rows[0].new_sequence_historique);
                }
            })
        } catch (error) {
            reject('erreur lors de get sequence 1')
            console.error('erreur lors de get sequence 1');
        }
    })
}

//une fonction qui insere l'historique en générale 
async function insert_historique_detail(new_sequence_historique, info) {
    var requete = "insert into historique (id , demandeur, typepermis, utilisateur,carres) values ('" + new_sequence_historique + "','" + info.demandeur + "'," + info.typepermis + ",'" + info.idUtilisateur + "'," + info.carres + ")";
    console.log(requete);

    return new Promise((resolve, reject) => {
        try {
            pool.query(requete, (error, resultat) => {
                if (error) {
                    console.erreur('Erreur lors de l insertion dans l historique 2')
                    reject('Erreur de la base de données');
                }
                else {
                    resolve('ok');
                }
            })
        } catch (error) {
            console.erreur('Erreur lors de l insertion dans l historique 1')
            throw(error)
        }
    })
}

//une focntion qui insère les details des resultats de l'évaluation
async function insert_historique_result(idhistorique, result) {
    var requete = "insert into historique_result (id_historique, substance, id_result, id_result_indice) values ('" + idhistorique + "','" + result.subs + "'," + result.result + "," + result.probIndice + ")";

    return new Promise((resolve, reject) => {
        try {
            pool.query(requete, (error, resultat) => {
                if (error) {
                    console.erreur('Erreur lors de l insertion dans l historique_result 2')
                    reject('Erreur de la base de données');
                }
                else {
                    resolve('ok');
                }
            })
        } catch (error) {
            console.erreur('Erreur lors de l insertion dans l historique_result 1')
            throw error;
        }
    })
}

//une fonction qui fait qui combine les trois fonctions
async function insert_Historique(info, result_prob) {
    try {
        const id_historique = await get_sequence_historique();
        console.log(id_historique);

        // Insertion des détails
        await insert_historique_detail(id_historique, info);

        // Boucle correcte avec for...of
        for (const resultat of result_prob) {
            await insert_historique_result(id_historique, resultat);
        }

        return 'ok';
    } catch (error) {
        console.error('Erreur lors de l’insertion dans l’historique:', error);
        throw error; // Ou return un message d'erreur si nécessaire
    }

}

async function get_historique() {
    var requete = " select h.id as id, h.date as date, h.typepermis as typePermis ,t.libelle, h.utilisateur, u.nom ,u.prenom , h.demandeur as demandeur , r.resultat as prob, hr.id_historique , r1.resultat as probIndice, hr.substance as substance from historique h left join historique_result hr on h.id = hr.id_historique join resultat r on r.id = hr.id_result  join resultat r1 on r1.id = hr.id_result_indice join typepermis t on t.id = h.typepermis join utilisateurs u on u.id = h.utilisateur order by date desc;";
    // console.log(requete);

    return new Promise((resolve, reject) => {
        pool.query(requete, (error, resultat) => {
            if (error) {
                reject('Erreur de la base de données');
            }
            else {
                const historiques = Object.values(
                    resultat.rows.reduce((acc, row) => {
                        const {
                            id, date, demandeur, typepermis,libelle,
                            utilisateur, nom, prenom,
                            id_historique, prob, probIndice, substance
                        } = row;

                        // Vérifier si l'historique existe déjà dans l'accumulateur
                        if (!acc[id]) {
                            acc[id] = {
                                id,
                                date,
                                demandeur,
                                typepermis,
                                libelle,
                                utilisateur,
                                nom,
                                prenom,
                                results: [] // Initialisation du tableau des résultats
                            };
                        }

                        // Ajouter le résultat associé si `id_historique` est présent
                        if (id_historique) {
                            acc[id].results.push({ id_historique, prob, probIndice, substance });
                        }

                        return acc;
                    }, {})
                );
                console.log(historiques)
                resolve(historiques);
            }

        })
    })
}

module.exports = {
    insert_Historique,
    get_historique,
};