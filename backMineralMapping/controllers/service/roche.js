const pool = require('../../database.js');

async function get_nature(subs) {
    var requete = "select idprop from prop_subs where subs Ilike '" + subs + "'";

    return new Promise((resolve, reject) => {
        pool.query(requete, (error, resultat) => {
            if (error) {
                reject('Erreur de la base de données');
            }
            else {
                resultat.rows.forEach(row => {
                    if (row.idprop === 1) {
                        resolve(1);
                    }
                    if (row.idprop === 2) {
                        resolve(2);
                    }
                    if (row.idprop === 3) {
                        resolve(3);
                    }
                });
                resolve(0);
            }
        })
    })
}

async function get_id_bd(bd) {
    var requete = "select id from propriete where libelle = '" + bd + "'";
    return new Promise((resolve, reject) => {
        pool.query(requete, (error, resultat) => {
            if (error) {
                reject('Erreur de la base de données');
            } else {
                resolve(resultat.rows);
            }
        })
    })
}
async function bd(bd, mot) {
    return new Promise((resolve, reject) => {
        get_id_bd(bd)
            .then(result => {
                var requete = "SELECT EXISTS (SELECT 1 FROM prop_subs WHERE subs ilike '" + mot + "' AND idprop = '" + result[0].id + "') AS result;";
                pool.query(requete, (error, resultat) => {
                    if (error) {
                        reject('Erreur de base de données');
                    } else {
                        resolve(resultat.rows[0]['result']);
                    }
                })
            })
    })

}
async function roche(mot2, subs) {
    var litho = mot2.split(', ');
    for (let i = 0; i < litho.length; i++) {
        if (litho[i] === subs) {
            return 4;
        }
    }
    return 2;
}
async function roche2(litho, subs) {
    return new Promise((resolve, reject) => {
        let promises = [];
        var resultat = 0;
        litho.forEach(lith => {
            promises.push(roche(lith['mot2']).then(result => {
                if (result > resultat) {
                    resultat = result;
                }
            }))
        });
        Promise.all(promises).then(() => {
            resolve(resultat);
        }).catch(error => reject(error));
    })
}
//
async function mineraux(mots, indice) {
    let result = [];
    try {
        if (mots['mot1'] === null) {
            const mots2 = mots['mot2'].split(', ');
            let resultparmot = [];
            for (let mot2 of mots2) {
                if (await bd('bd5', mot2) === true) {
                    resultparmot.push(4);
                } else {
                    resultparmot.push(2);
                }
                if (await bd('bd7', mot2) === true) {
                    resultparmot.push(4);
                } else {
                    resultparmot.push(2);
                }
                if (await bd('bd9', mot2) === true) {
                    resultparmot.push(4);
                } else {
                    resultparmot.push(3);
                }
            }
            result = resultparmot;
        } else {
            const mots1 = mots['mot1'].split(', ');
            const mots2 = mots['mot2'].split(', ');
            for (let mot1 of mots1) {
                if (await bd('bd4', mot1) === true) {
                    for (let mot2 of mots2) {
                        if (await bd('bd5', mot2) === true) {
                            result.push(4);
                        } else {
                            result.push(2);
                        }
                    }
                }
                if (await bd('bd6', mot1) === true) {
                    for (let mot2 of mots2) {
                        if (await bd('bd7', mot2) === true) {
                            result.push(4);
                        } else {
                            result.push(1);
                        }
                    }
                }
                if (await bd('bd8', mot1) === true) {
                    for (let mot2 of mots2) {
                        if (await bd('bd9', mot2) === true) {
                            result.push(4);
                        } else {
                            result.push(3);
                        }
                    }
                } else {
                    result.push(0);
                }
            }
        }
        const frequence = {};
        for (let element of result) {
            if (frequence[element]) {
                frequence[element]++;
            } else {
                frequence[element] = 1;
            }
        }

        let valeurLaPlusFrequent = result[0];
        let maxFrequence = frequence[valeurLaPlusFrequent];

        for (let element in frequence) {
            if (frequence[element] > maxFrequence) {
                valeurLaPlusFrequent = element;
                maxFrequence = frequence[element];
            }
        }

        // console.log(frequence);
        const colonnesEgalesAUn = {};


        for (const key in frequence) {
            if (Object.prototype.hasOwnProperty.call(frequence, key) && frequence[key] === maxFrequence) {
                colonnesEgalesAUn[key] = maxFrequence;
            }
        }
        const colonnesEntiers = Object.keys(colonnesEgalesAUn).map(key => parseInt(key));
        // console.log(colonnesEntiers);
        const max = Math.max(...colonnesEntiers);
        // console.log(max);


        return max;

    } catch (error) {
        throw error;
    }
}

async function mineraux2(litho) {
    try {
        let result = [];
        let promises = litho.map(async (lith, index) => {
            const res = await mineraux(lith, index + 1);
            console.log('litho ' + index + ' : ' + res);
            result.push(res);
        });

        await Promise.all(promises);

        const frequence = {};
        for (let element of result) {
            if (frequence[element]) {
                frequence[element]++;
            } else {
                frequence[element] = 1;
            }
        }

        let valeurLaPlusFrequent = result[0];
        let maxFrequence = frequence[valeurLaPlusFrequent];

        for (let element in frequence) {
            if (frequence[element] > maxFrequence) {
                valeurLaPlusFrequent = element;
                maxFrequence = frequence[element];
            }
        }

        // console.log(valeurLaPlusFrequent);
        const colonnesEgalesAUn = {};


        for (const key in frequence) {
            if (Object.prototype.hasOwnProperty.call(frequence, key) && frequence[key] === maxFrequence) {
                colonnesEgalesAUn[key] = maxFrequence;
            }
        }
        const colonnesEntiers = Object.keys(colonnesEgalesAUn).map(key => parseInt(key));
        // console.log(colonnesEntiers);
        const max = Math.max(...colonnesEntiers);
        // console.log(max);


        return max;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function mot1_null(lith, base, prob) {
    return new Promise(async (resolve, reject) => {
        const mots2 = lith['mot2'].split(", ");
        var result = [];
        try {
            for (let mot2 of mots2) {
                if (await bd(base, mot2) === true) {
                    result.push(prob[0]);
                }
                else {
                    result.push(prob[1]);
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
        }
    })
}
async function mot1_not_null(litho, base, prob) {
    return new Promise(async (resolve, reject) => {
        const mots1 = litho['mot1'].split(', ');
        const mots2 = litho['mot2'].split(', ');
        let result = [];
        try {
            for (let mot1 of mots1) {
                if (await bd(base[0], mot1)) {
                    for (let mot2 of mots2) {
                        if (await bd(base[1], mot2)) {
                            result.push(prob[0])
                        }
                        else result.push(prob[1])
                    }
                } else {
                    for (let mot2 of mots2) {
                        if (await bd(base[1], mot2)) {
                            result.push(prob[2])
                        }
                        else result.push(prob[3])
                    }
                }
            }
            resolve(result);
        } catch (error) {
            reject(error)
        }
    })
}
// async function getFrequent() {
async function getFrequent(tableau) {
    // const tableau = [1,2,3,4,1,2,1,2,1,4,2,2];
    return new Promise(async (resolve, reject) => {
        try {
            /// forme de frequence : {2:1 , 3:2}
            /// 2 = prob ,1 = nombre de fréquence
            const frequence = {};
            for (let element of tableau) {
                if (frequence[element]) {
                    frequence[element]++;
                } else {
                    frequence[element] = 1;
                }
            }
            console.log(frequence);
            let valeurLaplusFrequente = tableau[0];
            let maxFrequence = frequence[valeurLaplusFrequente];
            for (let element in frequence) {
                if (frequence[element] > maxFrequence) {
                    valeurLaplusFrequente = element;
                    maxFrequence = frequence[element];
                }
            }
            const getMax = {};
            for (let key in frequence) {
                if (Object.prototype.hasOwnProperty.call(frequence, key) && frequence[key] === maxFrequence) {
                    getMax[key] = maxFrequence[key];
                }
            }
            const lesProb = Object.keys(getMax).map(key => parseInt(key));
            const max = Math.max(...lesProb);
            resolve(max);
        } catch (error) {
            reject(error)
        }
    })
}
// avoir la frequence de chaque litho dans un BD 
async function getFrequentLitho(tableau) {
    return new Promise(async (resolve, reject) => {
        try {
            // const tableau = [[1, 2, 3, 4], [1, 2, 2, 4], [2]];
            let getFreq1 = [];
            for (let i = 0; i < tableau.length; i++) {
                const freq = await getFrequent(tableau[i]);
                getFreq1.push(freq);
            }
            const resultat = await getFrequent(getFreq1);
            resolve(resultat)
        } catch (error) {
            reject(error);
        }
    })
}
async function getFrequentLithoBD(tableau) {
    return new Promise(async (resolve, reject) => {
        try {
            // const tableau = [
            //     [[2, 2], [1, 1, 1], [2]],//2
            //     [[1, 1], [1, 1, 1], [4]],//1
            //     [[1, 1], [3, 3, 1], [3]]//3
            // ];
            let getFreq1 = [];
            for (let i = 0; i < tableau.length; i++) {
                const freq = await getFrequentLitho(tableau[i]);
                getFreq1.push(freq);
            }
            const resultat = await getFrequent(getFreq1);
            resolve(resultat)
        } catch (error) {
            reject(error);
        }
    })
}

async function elementChimique(lithologie, subs) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = [];
            if (await bd('bd10', subs) === true) {
                let resultat = [];
                for (let litho of lithologie) {
                    if (litho['mot1'] === null) {
                        const res = await mot1_null(litho, 'bd12', [4, 3]);
                        resultat.push(res);
                    }
                    if (litho['mot1'] !== null) {
                        const res = await mot1_not_null(litho, ['bd11', 'bd12'], [4, 3, 3, 2]);
                        resultat.push(res);
                    }
                }
                console.log('bd10');
                console.log(resultat);
                result.push(resultat);
            }
            if (await bd('bd1', subs) === true) {
                let resultat = [];
                for (let litho of lithologie) {
                    if (litho['mot1'] === null) {
                        const res = await mot1_null(litho, 'bd5', [4, 2]);
                        resultat.push(res);
                    } if (litho['mot1'] !== null) {
                        const res = await mot1_not_null(litho, ['bd4', 'bd5'], [4, 2, 3, 1]);
                        resultat.push(res);
                    }
                }
                console.log('bd1');
                console.log(resultat);
                result.push(resultat);
            }
            if (await bd('bd2', subs) === true) {
                let resultat = [];
                for (let litho of lithologie) {
                    if (litho['mot1'] === null) {
                        const res = await mot1_null(litho, 'bd7', [4, 1]);
                        resultat.push(res);
                    } if (litho['mot1'] !== null) {
                        const res = await mot1_not_null(litho, ['bd6', 'bd7'], [4, 1, 3, 1]);
                        resultat.push(res);
                    }
                }
                console.log('bd2');
                console.log(resultat);
                result.push(resultat);
            }
            if (await bd('bd3', subs) === true) {
                let resultat = [];
                console.log('bd3');
                for (let litho of lithologie) {
                    if (litho['mot1'] === null) {
                        const res = await mot1_null(litho, 'bd9', [4, 3]);
                        resultat.push(res);
                    } if (litho['mot1'] !== null) {
                        const res = await mot1_not_null(litho, ['bd8', 'bd9'], [4, 3, 3, 1]);
                        resultat.push(res);
                    }
                }
                console.log(resultat);
                result.push(resultat);
            } else {
                const error = 'aucune base ne correspond à la substance'
                console.log(error);
            }
            console.log('result : ');
            console.log(result);
            
            const test = await getFrequentLithoBD(result);
            console.log(test);
            
            resolve(test);
        } catch (error) {
            reject(error)
        }
    })
}

async function getResult(litho, subs) {
    return new Promise((resolve, reject) => {
        var resultat = 0;
        try {
            let promises = [];
            promises.push(
                get_nature(subs)
                    .then(resulte => {
                        if (resulte === 3) {
                            return roche2(litho, subs)
                                .then(result => {
                                    // console.log('3')
                                    resultat = result;
                                })
                        }
                        if (resulte === 2) {
                            return mineraux2(litho)
                                .then(result => {
                                    // console.log('la solution finale ' + result)
                                    resultat = result
                                })
                        }
                        if (resulte === 1) {
                            return elementChimique(litho, subs)
                                .then(result => {
                                    // console.log(result);
                                    // console.log('1')
                                    resultat = result;
                                })
                        }
                    })
            );
            Promise.all(promises)
                .then(() => {
                    resolve({ 'result': resultat, 'subs': subs });
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
async function getResultfinal(litho, subs) {
    return new Promise((resolve, reject) => {
        let res = [];
        try {
            let promises = [];
            subs.forEach(sub => {
                promises.push(
                    getResult(litho, sub[0]['nom'])
                        .then(resulte => {
                            res.push(resulte);
                        })
                );
            });
            Promise.all(promises)
                .then(() => {
                    resolve(res);
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

module.exports = {
    get_nature,
    getResult,
    getResultfinal
};