const pool = require('../../database.js'); // Importez la configuration de la base de données

const getDemandeur_permis = async () => {
    return new Promise((resolve, reject) => {
        pool.query("select demandeur from historique ", (error, results) => {
            if (error) {
                console.error(error);
                resolve('Erreur de base de données');
            } else {
                resolve(results.rows)
            }
        });
    });
};

module.exports = {
    getDemandeur_permis
};