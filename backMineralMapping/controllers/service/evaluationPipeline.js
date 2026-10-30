const { createMultiPolygon, createMultiPolygonGeoJSON } = require('./Carre');
const { getLitho } = require('./lithology');
const { get_All_Subs_by_id } = require('./substance');
const { lesPresencesIndices } = require('./indice');
const { evaluateDemande } = require('./scoreEngine');
const { detectConflitsPermis } = require('./conflits');
const { suggestSubstancesFromLitho } = require('./suggestions');
const { runChecklist } = require('./checklist');

/**
 * Pipeline d'évaluation réutilisable (score + conflits + suggestions).
 * @param {object} options.persistHistorique - si false, mode scénario
 */
async function runEvaluationPipeline(donneesTableau, { userId, persistHistorique = true, includeConflits = true } = {}) {
    const checklist = runChecklist(donneesTableau);
    if (!checklist.ok) {
        const err = new Error('Checklist invalide');
        err.code = 'CHECKLIST';
        err.checklist = checklist;
        throw err;
    }

    const listeCarre = donneesTableau.listeCarre;
    const geojson = createMultiPolygonGeoJSON(listeCarre);
    await createMultiPolygon(listeCarre);

    const lith = await getLitho(geojson);
    const subs = await get_All_Subs_by_id(donneesTableau.choixSubs);
    const presence = await lesPresencesIndices(geojson, subs);
    const results = await evaluateDemande(lith, subs, presence);

    let conflits = null;
    if (includeConflits) {
        try {
            conflits = await detectConflitsPermis(geojson);
        } catch (e) {
            conflits = { alerte: false, error: String(e.message || e), conflits: [], count: 0 };
        }
    }

    const suggestions = await suggestSubstancesFromLitho(lith);

    let historiqueId = null;
    if (persistHistorique && userId) {
        const { insert_Historique } = require('./historique');
        try {
            const saved = await insert_Historique(
                {
                    demandeur: donneesTableau.nomPersonne,
                    idUtilisateur: userId,
                    typepermis: donneesTableau.selectPermis,
                    carresGeoJSON: geojson,
                },
                results
            );
            historiqueId = saved.id;
        } catch (histErr) {
            console.error('Historique non enregistré:', histErr);
        }
    }

    return {
        results,
        checklist,
        conflits,
        suggestions,
        meta: {
            lithologieCount: lith.length,
            historiqueId,
            scenario: !persistHistorique,
            demandeur: donneesTableau.nomPersonne,
            typepermis: donneesTableau.selectPermis,
            nbCarres: listeCarre.length,
            nbSubstances: (donneesTableau.choixSubs || []).length,
        },
        zone: geojson,
    };
}

async function compareZones(zoneA, zoneB, { includeConflits = true } = {}) {
    const [a, b] = await Promise.all([
        runEvaluationPipeline(zoneA, { persistHistorique: false, includeConflits }),
        runEvaluationPipeline(zoneB, { persistHistorique: false, includeConflits }),
    ]);

    const bySubs = (rows) => Object.fromEntries((rows.results || []).map((r) => [r.subs, r]));
    const mapA = bySubs(a);
    const mapB = bySubs(b);
    const allSubs = [...new Set([...Object.keys(mapA), ...Object.keys(mapB)])].sort();

    const deltas = allSubs.map((subs) => {
        const ra = mapA[subs];
        const rb = mapB[subs];
        return {
            subs,
            noteA: ra?.result ?? null,
            noteB: rb?.result ?? null,
            deltaNote: ra && rb ? Number(rb.result) - Number(ra.result) : null,
            indicesA: ra?.presenceIndice ?? null,
            indicesB: rb?.presenceIndice ?? null,
            meilleur: !ra ? 'B' : !rb ? 'A' : ra.result === rb.result ? 'egal' : (rb.result > ra.result ? 'B' : 'A'),
        };
    });

    return {
        zoneA: { results: a.results, meta: a.meta, conflits: a.conflits },
        zoneB: { results: b.results, meta: b.meta, conflits: b.conflits },
        deltas,
        verdict: {
            conflitsA: a.conflits?.count || 0,
            conflitsB: b.conflits?.count || 0,
            substancesComparees: allSubs.length,
        },
    };
}

function buildDossier(evaluation, extras = {}) {
    return {
        type: 'dossier_evaluation',
        version: 2,
        genereAt: new Date().toISOString(),
        ...evaluation,
        ...extras,
    };
}

module.exports = {
    runEvaluationPipeline,
    compareZones,
    buildDossier,
};
