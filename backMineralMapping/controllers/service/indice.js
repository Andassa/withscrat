const pool = require('../../database.js'); // Importez la configuration de la base de données

// get intersection point where subs 
// select intersection point where point intersect perimètre where subs ilike 'subs'
// get intersection ligne 
// get intersection zone 

const intersect = async (requete, table, substance) => {
    return new Promise((resolve, reject) => {
        var intersect = "ST_Intersects(ST_SetSRID(ST_Buffer(ST_MakeValid(il.geom), 0), 4326), ST_SetSRID(ST_Buffer(ST_MakeValid(" + requete + "), 0), 4326))";

        var request = "select ";
        request = request + intersect + " FROM " + table + " il WHERE "; // indice_point / indice_zone / indice_line
        request = request + intersect;
        request = request + " and il.nom ilike '%" + substance + "%'";

        pool.query(request, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                if (resultat.rows.length === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });

    });
};

const uneProbabilité = async (requete, substance) => {
    return new Promise(async (resolve, reject) => {
        var indice = ['indice_point', 'indice_line', 'indice_zone'];
        var prob = 1;
        for (let index = 0; index < indice.length; index++) {
            if (await intersect(requete, indice[index], substance) === true) {
                prob = prob + 1;
            }
        }
        resolve(prob);
    });
};

const lesProbabilité = async (requete, substances) => {
    const promesses = substances.map(subs => ({
        subs: subs[0].nom,
        probIndice: uneProbabilité(requete, subs[0].nom)
    }));
    const res = await Promise.all(promesses.map(p => p.probIndice));
    return promesses.map((p, index) => ({ ...p, probIndice: res[index] }));
};



module.exports = {
    intersect,
    uneProbabilité,
    lesProbabilité
};