const kriging = require('../fonction/kriging.js');
const pool = require('../../database.js');

async function getNbCoucheLitho(nomSubstances) {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM (
            SELECT l.code
            FROM lithology l, get_intersections($1) AS tracesSubs
            WHERE ST_Intersects(ST_SetSRID(l.geom, 4326), ST_SetSRID(tracesSubs.traces, 4326))
            GROUP BY l.code, l.lithologie, l.geom
         ) AS requ`,
        [nomSubstances]
    );
    return result.rows[0].count;
}

async function getFrequence(nomSubstances) {
    const result = await pool.query(
        `SELECT code, COUNT(*)::int AS nombre
         FROM (
            SELECT l.code
            FROM lithology l, get_intersections($1) AS tracesSubs
            WHERE ST_Intersects(ST_SetSRID(l.geom, 4326), ST_SetSRID(tracesSubs.traces, 4326))
            GROUP BY l.code, l.lithologie, l.geom
         ) AS requ
         GROUP BY code`,
        [nomSubstances]
    );
    return result.rows;
}

async function getCoordonnées(codefrequence, nomSubs) {
    if (!codefrequence?.length) return [];
    const codes = codefrequence.map((c) => c.code);
    const counts = codefrequence.map((c) => Number(c.nombre));
    const result = await pool.query(
        `SELECT code2,
                ST_X(points::geometry) AS x,
                ST_Y(points::geometry) AS y,
                COALESCE(
                  (SELECT counts.n
                   FROM unnest($2::text[], $3::int[]) AS counts(code, n)
                   WHERE counts.code = code2),
                  0
                ) AS pourcentage
         FROM get_toutpoints($1) AS get_tout`,
        [nomSubs, codes, counts]
    );
    return result.rows;
}

function getResultKrigeage(newx, newy, donnees) {
    const nombre = Number(donnees.nombre) || 1;
    const x = [];
    const y = [];
    const pourcentages = [];
    for (const donnee of donnees.requetepourcentage || []) {
        x.push(Number(donnee.x));
        y.push(Number(donnee.y));
        pourcentages.push((Number(donnee.pourcentage) * 100) / nombre);
    }
    if (x.length < 3) {
        return { predicted: null, variance: null, message: 'Moins de 3 points: krigeage impossible' };
    }
    const model = 'exponential';
    const sigma2 = 0;
    const alpha = 100;
    const variogram = kriging.train(pourcentages, x, y, model, sigma2, alpha);
    const predicted = kriging.predict(Number(newx), Number(newy), variogram);
    let variance = null;
    try {
        if (typeof kriging.variance === 'function') {
            variance = kriging.variance(Number(newx), Number(newy), variogram);
        }
    } catch (_) {
        variance = null;
    }
    return { predicted, variance, nPoints: x.length };
}

/**
 * Pipeline krigeage complet — hors score permis.
 */
async function runKrigeage(substance, newx, newy) {
    const nombre = await getNbCoucheLitho(substance);
    if (!nombre || Number(nombre) === 0) {
        return { predicted: null, variance: null, message: 'Pas assez de points pour le krigeage' };
    }
    const codefrequence = await getFrequence(substance);
    const requetepourcentage = await getCoordonnées(codefrequence, substance);
    return getResultKrigeage(newx, newy, { nombre, requetepourcentage });
}

module.exports = {
    getCoordonnées,
    getFrequence,
    getNbCoucheLitho,
    getResultKrigeage,
    runKrigeage,
};
