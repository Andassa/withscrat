//lithologie.js
//avoir les coordonnées des couches présentants des traces de la substance recherché
const kriging = require('../fonction/kriging.js');
const pool = require('../../database.js'); // Importez la configuration de la base de données

const getNbCoucheLitho = async(nomSubstances)=>{
    return new Promise((resolve, reject) => {
        const request = "select count(*) from (select l.code from lithology l , get_intersections('Nickel') as tracesSubs where ST_Intersects(ST_SetSRID(l.geom, 4326), ST_SetSRID(tracesSubs.traces,4326)) group by  l.code, l.lithologie, l.geom ) as requ;";
        pool.query(request, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                const nombre = resultat.rows[0]["count"];
                resolve(nombre);
            }
        });
    });
};
const getFrequence = async(nomSubstances)=>{
    return new Promise((resolve, reject) => {
        const request = "select code ,count(*) as nombre from (select l.code from lithology l , get_intersections('"+nomSubstances+"') as tracesSubs where ST_Intersects(ST_SetSRID(l.geom, 4326), ST_SetSRID(tracesSubs.traces,4326)) group by  l.code, l.lithologie, l.geom ) as requ group by code;";
        pool.query(request, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                const codefrequence = resultat.rows;
                resolve(codefrequence);
            }
        });
    });
};

///fonction pour avoir les code x y et pourcentage 
const getCoordonnées = async (codefrequence , nomSubs)=>{
    let requete = 'select code2,ST_X(points::geometry) as x,ST_Y(points::geometry) as y,case ';
    codefrequence.forEach(code => {
        requete = requete+ ' when code2 =\''+code["code"]+'\' then '+code["nombre"]+' ';
    });
    requete =requete+'else 0 end as pourcentage ';
    requete = requete +" from get_toutpoints('"+nomSubs+"') as get_tout";
    return new Promise((resolve, reject) => {
        pool.query(requete, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                const pourcentage = resultat.rows;
                resolve(pourcentage);
            }
        });
    });
};
const getResultKrigeage = async (newx,newy,donnees)=>{
    const nombre = donnees['nombre'];
    let x = [];
    let y = [];
    let pourcentages=[];
    donnees['requetepourcentage'].forEach(donnee=>{
        x.push(donnee['x']);
        y.push(donnee['y']);
        pourcentages.push((donnee['pourcentage'])*100/nombre);
    });
    const model = "exponential";
	const sigma2 = 0, alpha = 100;
	const variogram = kriging.train(pourcentages, x, y, model, sigma2, alpha);
    const xnew = newx;
    const ynew = newy;
    const pourcentage_predicted = kriging.predict(xnew, ynew, variogram);
    return pourcentage_predicted;
};
module.exports = {
    getCoordonnées,
    getFrequence,
    getNbCoucheLitho,
    getResultKrigeage
};
