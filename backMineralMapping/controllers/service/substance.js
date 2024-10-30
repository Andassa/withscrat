const pool = require('../../database.js');

async function getSubs_byId(id) {
    const requete = "select * from substances where id='" + id + "'";
    return new Promise((resolve, reject) => {
        pool.query(requete, (error, resultat) => {
            if (error) {
                reject('Erreur de la base de données');
            }
            else {
                resolve(resultat.rows);
            }
        })
    })
}
async function get_All_Subs_by_id(listeId){
    return new Promise((resolve,reject)=>{
        try {
            let subs = [];
            let promises = [];
            listeId.forEach(id => {
                promises.push(
                    getSubs_byId(id)
                    .then(resulte=> subs.push(resulte))
                )
            });
            Promise.all(promises).then(()=>{
                resolve(subs);
            })
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    getSubs_byId,
    get_All_Subs_by_id
};