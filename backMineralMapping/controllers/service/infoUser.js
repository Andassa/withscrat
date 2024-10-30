const pool = require('../../database.js'); // Importez la configuration de la base de données

const allFonctions = async () => {
    return new Promise((resolve, reject) => {
        pool.query("select distinct(fonction) as fonction from utilisateurs ", (error, results) => {
            if (error) {
                console.error(error);
                resolve('Erreur de base de données');
            } else {
                let fonction = [];
                const resultat = results.rows;
                resultat.forEach(element => {
                    fonction.push(element.fonction);
                });
                resolve(fonction);
                resolve(results.rows)

            }
        });
    });
};
const allServices = async () => {
    return new Promise((resolve, reject) => {
        var request = "select distinct(service) as service from utilisateurs";
        pool.query(request, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                let fonction = [];
                resultat.rows.forEach(element => {
                    fonction.push(element.service);
                });
                resolve(fonction);
            }
        });

    });
};
const serviceFonction = async () => {
    return new Promise(async (resolve, reject) => {
        const fonction = await allFonctions();
        const service = await allServices();

        const serviceFonctions = ({fonction : fonction , service : service});
        resolve(serviceFonctions);
    });
};

module.exports = {
    allServices,
    allFonctions,
    serviceFonction
};