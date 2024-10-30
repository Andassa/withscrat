//pour faire l'analyse de données par rapport au résultats des intersections
const pool = require('../../database.js'); // Importez la configuration de la base de données

const getLitho = async (requete) => {
    return new Promise((resolve, reject) => {
        var request = "select lithology, mot1 , mot2 FROM geol g WHERE ST_Intersects(ST_SetSRID(ST_Buffer(ST_MakeValid(g.geom), 0), 4326),ST_SetSRID(ST_Buffer(ST_MakeValid(";
        request = request + requete;
        request = request + "), 0), 4326)) ";
        pool.query(request, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                resolve(resultat.rows);
            }
        });
    });
};

module.exports = {
    getLitho
};