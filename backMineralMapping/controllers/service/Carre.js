//pour faire l'analyse de données par rapport au résultats des intersections
const pool = require('../../database.js'); // Importez la configuration de la base de données
const Decimal = require('decimal.js');


const createCarre = async (centre) => {
    return new Promise((resolve, reject) => {
        const long = new Decimal('0.005953705322626733');
        const larg = new Decimal('0.005649108528689231');

        const listeCarre = [];
        let a = [];
        let c = [];
        let b = [];
        let d = [];
        let carre = [];

        try {
            centre.forEach(element => {
                const lat = new Decimal(element['lat']);
                const lng = new Decimal(element['lng']);

                a = [lat.minus(larg.dividedBy(2)), lng.plus(long.dividedBy(2))];
                c = [lat.plus(larg.dividedBy(2)), lng.minus(long.dividedBy(2))];
                b = [lat.plus(larg.dividedBy(2)), lng.plus(long.dividedBy(2))];
                d = [lat.minus(larg.dividedBy(2)), lng.minus(long.dividedBy(2))];
                carre = [a, b, c, d];
                listeCarre.push(carre);
            });
        } catch (error) {
            console.log(error);
        }
        resolve(listeCarre);
    });
}
const verifCarreDecoupe = async (uncentre, decoupes) => {
    return new Promise((resolve, reject) => {
        let requete = "select case ";
        decoupes.forEach(decoupe => {
            requete = requete + "when ST_Contains( (select ST_SetSRID(geom, 4326) from decoupe_cent where indicatif ='" + decoupe['indicatif'] + "'),ST_GeomFromText('POINT(" + uncentre['lng'] + " " + uncentre['lat'] + ")', 4326)) then 0 ";
        });
        requete = requete + " else 1 end as dansdecoupe ;"
        try {
            pool.query(requete, (error, resultat) => {
                if (error) {
                    console.log(error);
                    reject('erreur base de données');
                } else {
                    const result = { ...uncentre, etat: resultat.rows[0].dansdecoupe };
                    resolve(result);
                }
            })
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
const listeCarre = async (centres, decoupes) => {
    return new Promise((resolve, reject) => {
        let listeCarreInOut = [];
        try {
            let promises = [];
            for (let i = 0; i < centres.length; i++) {
                promises.push(
                    verifCarreDecoupe(centres[i], decoupes)
                        .then(resulte => {
                            createCarre([resulte])
                                .then(resultat => {
                                    const res1 = { ...resulte, coord: resultat }
                                    listeCarreInOut.push(res1);
                                })
                        })
                );
            }
            Promise.all(promises)
                .then(() => {
                    resolve(listeCarreInOut);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });

        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
const createPolygon = async (coord) => {
    return new Promise((resolve, reject) => {
        try {
            var requete = "ST_GeomFromText('MULTIPOLYGON ((("
            for (let i = 0; i < coord.length; i++) {
                if (i === coord.length - 1) {
                    requete = requete + coord[i][1] + " " + coord[i][0] + "," + coord[0][1] + " " + coord[0][0];
                } else {
                    requete = requete + coord[i][1] + " " + coord[i][0] + ", ";
                }
            }
            requete += ")))',4326)";
            resolve(requete);
        } catch (error) {
            reject(error);
        }
    })
}
const createMultiPolygon = async (listeCentre) => {
    return new Promise((resolve, reject) => {
        try {
            var requete = "ST_Collect(ARRAY[";
            let promises = [];
            for (let i = 0; i < listeCentre.length; i++) {
                if (i === listeCentre.length - 1) {
                    promises.push(
                        createPolygon(listeCentre[i]['coord'][0])
                            .then(resulte =>
                                requete += resulte
                            )
                    )
                } else {
                    promises.push(
                        createPolygon(listeCentre[i]['coord'][0])
                            .then(resulte =>
                                requete += resulte + " ,"
                            )
                    )
                }
            }
            Promise.all(promises).then(() => {
                requete += "])";
                resolve(requete);
            }).catch(error => {
                console.log(error);
                reject(error);
            })
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}


module.exports = {
    createCarre,
    verifCarreDecoupe,
    listeCarre,
    createMultiPolygon,
    createPolygon
};