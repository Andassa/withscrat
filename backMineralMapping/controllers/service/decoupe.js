//pour faire l'analyse de données par rapport au résultats des intersections
const pool = require('../../database.js'); // Importez la configuration de la base de données


//dropper la table emporaire 
const detailDecoupe = async (tableau) => {
    return new Promise((resolve, reject) => {
        let request = "select gid , perimeter , dec100new_ , indicatif , nom, date_editi , ST_AsGeoJSON(geom) from decoupe_cent where ";
        for (let i = 0; i < tableau.length; i++) {
            if (i!= tableau.length-1) {
                request += "(indicatif like '"+tableau[i]['indicatif']+"' and nom like '"+tableau[i]['nom']+"') or ";
            }
            else{
                request += "(indicatif like '"+tableau[i]['indicatif']+"' and nom like '"+tableau[i]['nom']+"')";
            }
        }
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
    detailDecoupe
};