//pour faire l'analyse de données par rapport au résultats des intersections
const pool = require('../../database.js'); // Importez la configuration de la base de données

//dropper la table emporaire 
const dropTempTable = async () => {
    return new Promise((resolve, reject) => {
        const request = "DROP TABLE IF EXISTS intersect_couche_trace;";
        pool.query(request, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                resolve('dropped');
            }
        });
    });
};
//inserer les données dans la table temporaire
const insertTraces = async (substance) => {
    return new Promise((resolve, reject) => {
        dropTempTable(substance)
            .then(result => {
                const request = "SELECT (coalesce(t_zone.geom, t_line.geom, t_point.geom)) as traces INTO intersect_couche_trace FROM (SELECT geom FROM indice_zone iz WHERE nom LIKE '%" + substance + "%') t_zone FULL JOIN ( SELECT geom FROM indice_line il  WHERE nom LIKE '%" + substance + "%') t_line ON t_zone.geom = t_line.geom FULL JOIN (SELECT geom FROM indice_point ip  WHERE nom LIKE '%" + substance + "%') t_point ON t_line.geom = t_point.geom;";
                pool.query(request, (error, resultat) => {
                    if (error) {
                        console.error(error);
                        reject('Erreur de base de données');
                    } else {
                        resolve("insert");
                    }
                });
            })
            .catch(error => {
                reject(error);
            });


    });
};
// select les données de la table temporaire 
const getTraces = async (substance) => {
    return new Promise((resolve, reject) => {
        insertTraces(substance)
            .then(result => {
                const request = "select * from intersect_couche_trace;";
                pool.query(request, (error, resultat) => {
                    if (error) {
                        console.error(error);
                        reject('Erreur de base de données');
                    } else {
                        const traces = resultat.rows;
                        resolve(traces);
                    }
                });
            })
            .catch(error => {
                reject(error);
            });
    });
};
// select les données de la table temporaire 
const updateNotValide = async () => {
    return new Promise((resolve, reject) => {
        const request = "UPDATE intersect_couche_trace SET traces  = ST_MakeValid(traces) WHERE NOT ST_IsValid(traces);";
        pool.query(request, (error, resultat) => {
            if (error) {
                console.error(error);
                reject('Erreur de base de données');
            } else {
                resolve('updated successfully');
            }
        });
    });
};

const getIntersect = async () => {
    return new Promise((resolve, reject) => {
        updateNotValide()
            .then(result => {
                const request = "SELECT les_intersects.code ,les_intersects.ensemble ,les_intersects.lithologie ,les_intersects.ere ,les_intersects.periode ,les_intersects.epoque ,les_intersects.etage ,les_intersects.fossile ,les_intersects.mineralogi ,les_intersects.chimisme  ,SUM(CASE WHEN ST_GeometryType(intersections) = 'ST_Polygon' or ST_GeometryType(intersections) = 'ST_MultiPolygon' THEN ST_Area(intersections) ELSE 0 END) AS surface_polygones, SUM(case WHEN ST_GeometryType(intersections) = 'ST_LineString' or ST_GeometryType(intersections) = 'ST_MultiLineString' THEN ST_Length(intersections) ELSE 0 END) AS longueur_lignes,COUNT(CASE WHEN ST_GeometryType(intersections) = 'ST_Point' THEN 1 END) AS nombre_points FROM (SELECT l.code ,l.ensemble ,l.lithologie ,l.ere ,l.periode ,l.epoque ,l.etage ,l.fossile ,l.mineralogi ,l.chimisme  ,l.geom, ST_Intersection(ST_SetSRID(l.geom, 4326), ST_SetSRID(traces, 4326)) as intersections FROM lithology l ,intersect_couche_trace WHERE ST_Intersects(ST_SetSRID(l.geom, 4326), ST_SetSRID(traces, 4326)) group by l.code ,l.ensemble ,l.lithologie ,l.ere ,l.periode ,l.epoque ,l.etage ,l.fossile ,l.mineralogi ,l.chimisme,l.geom , ST_Intersection(ST_SetSRID(l.geom, 4326), ST_SetSRID(traces, 4326)))as les_intersects group by les_intersects.code ,les_intersects.ensemble ,les_intersects.lithologie ,les_intersects.ere ,les_intersects.periode ,les_intersects.epoque ,les_intersects.etage ,les_intersects.fossile ,les_intersects.mineralogi ,les_intersects.chimisme;";
                pool.query(request, (error, resultat) => {
                    if (error) {
                        console.error(error);
                        reject('Erreur de base de données');
                    } else {
                        const traces = resultat.rows;
                        resolve(traces);
                    }
                });
            })
            .catch(error => {
                reject(error);
            });
    });
};
const getTotalDimensionTrace = async () => {
    return new Promise((resolve, reject) => {
        updateNotValide()
            .then(result => {
                const request = "select sum(surface_polygones) as total_surface,sum(longueur_lignes) as total_longueur , sum(nombre_points)as total_nombre from(select SUM(CASE WHEN ST_GeometryType(intersections) = 'ST_Polygon' or ST_GeometryType(intersections) = 'ST_MultiPolygon' THEN ST_Area(intersections) ELSE 0 END) AS surface_polygones, SUM(case WHEN ST_GeometryType(intersections) = 'ST_LineString' or ST_GeometryType(intersections) = 'ST_MultiLineString' THEN ST_Length(intersections) ELSE 0 END) AS longueur_lignes, COUNT(CASE WHEN ST_GeometryType(intersections) = 'ST_Point' THEN 1 END) AS nombre_points FROM (SELECT l.code ,l.ensemble ,l.lithologie ,l.ere ,l.periode ,l.epoque ,l.etage ,l.fossile ,l.mineralogi ,l.chimisme  ,l.geom, ST_Intersection(ST_SetSRID(l.geom, 4326), ST_SetSRID(traces, 4326)) as intersections FROM lithology l ,intersect_couche_trace WHERE ST_Intersects(ST_SetSRID(l.geom, 4326), ST_SetSRID(traces, 4326)) group by l.code ,l.ensemble ,l.lithologie ,l.ere ,l.periode ,l.epoque ,l.etage ,l.fossile ,l.mineralogi ,l.chimisme,l.geom , ST_Intersection(ST_SetSRID(l.geom, 4326), ST_SetSRID(traces, 4326)))as les_intersects) as les_totals;";
                pool.query(request, (error, resultat) => {
                    if (error) {
                        console.error(error);
                        reject('Erreur de base de données');
                    } else {
                        const traces = resultat.rows;
                        resolve(traces);
                    }
                });
            })
            .catch(error => {
                reject(error);
            });
    });
};

const getTableAEtudier = async (totalDimension)=>{
    return new Promise((resolve, reject) =>{
        getIntersect()
        .then(result => {
            for(let i=0; i<result.length; i++){
                result[i]['surface_polygones'] = result[i]['surface_polygones']*100/totalDimension[0]['total_surface'];
                result[i]['longueur_lignes'] = result[i]['longueur_lignes']*100/totalDimension[0]['total_longueur'];
                result[i]['nombre_points'] = result[i]['nombre_points']*100/totalDimension[0]['total_nombre'];
            }
            resolve(result);
        })
        .catch(error=>reject(error));
    })
}

module.exports = {
    getTraces,
    getIntersect,
    getTotalDimensionTrace,
    getTableAEtudier
};