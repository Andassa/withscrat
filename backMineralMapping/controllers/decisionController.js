const express = require('express');
const router = express.Router();
const { runChecklist } = require('./service/checklist');
const { detectConflitsPermis } = require('./service/conflits');
const { createMultiPolygonGeoJSON } = require('./service/Carre');
const { getLitho } = require('./service/lithology');
const { suggestSubstancesFromLitho } = require('./service/suggestions');
const { runEvaluationPipeline, compareZones, buildDossier } = require('./service/evaluationPipeline');
const { saveObservation, listObservations } = require('./service/terrain');
const { get_dashboard_stats, get_historique } = require('./service/historique');

function requireAuth(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).json({ erreur: 'Non authentifié' });
        return false;
    }
    return true;
}

router.post('/decision/checklist', (req, res) => {
    if (!requireAuth(req, res)) return;
    const checklist = runChecklist(req.body.donneesTableau || req.body);
    return res.json(checklist);
});

router.post('/decision/conflits', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        let geojson = req.body.geojson;
        if (!geojson && req.body.listeCarre) {
            geojson = createMultiPolygonGeoJSON(req.body.listeCarre);
        }
        if (!geojson || !geojson.coordinates?.length) {
            return res.status(400).json({ erreur: 'geojson ou listeCarre valide requis' });
        }
        const result = await detectConflitsPermis(geojson, {
            limit: req.body.limit,
            layer: req.body.layer,
            blockingOverlapM2: req.body.blockingOverlapM2,
        });
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/decision/suggestions', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        let geojson = req.body.geojson;
        if (!geojson && req.body.listeCarre) {
            geojson = createMultiPolygonGeoJSON(req.body.listeCarre);
        }
        if (!geojson) {
            return res.status(400).json({ erreur: 'geojson ou listeCarre requis' });
        }
        const lith = await getLitho(geojson);
        const suggestions = await suggestSubstancesFromLitho(lith);
        return res.json({ lithologieCount: lith.length, ...suggestions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/decision/scenario', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const evaluation = await runEvaluationPipeline(req.body.donneesTableau, {
            userId: req.user.id,
            persistHistorique: false,
            includeConflits: req.body.includeConflits !== false,
        });
        return res.json(evaluation);
    } catch (error) {
        if (error.code === 'CHECKLIST') {
            return res.status(400).json({ error: 'Checklist invalide', checklist: error.checklist });
        }
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/decision/comparer', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const { zoneA, zoneB } = req.body;
        if (!zoneA || !zoneB) {
            return res.status(400).json({ erreur: 'zoneA et zoneB requis' });
        }
        const cmp = await compareZones(zoneA, zoneB);
        return res.json(cmp);
    } catch (error) {
        if (error.code === 'CHECKLIST') {
            return res.status(400).json({ error: 'Checklist invalide', checklist: error.checklist });
        }
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/decision/dossier', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const persist = req.body.persist !== false;
        const evaluation = await runEvaluationPipeline(req.body.donneesTableau, {
            userId: req.user.id,
            persistHistorique: persist,
            includeConflits: true,
        });
        const dossier = buildDossier(evaluation, {
            auteur: { id: req.user.id, username: req.user.username },
        });
        return res.json(dossier);
    } catch (error) {
        if (error.code === 'CHECKLIST') {
            return res.status(400).json({ error: 'Checklist invalide', checklist: error.checklist });
        }
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.get('/decision/dashboard', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        if (Number(req.user.autorisation) !== 2) {
            return res.status(403).json({ erreur: 'Admin requis' });
        }
        const [stats, historiques, terrain] = await Promise.all([
            get_dashboard_stats(),
            get_historique(),
            listObservations({ limit: 10 }),
        ]);
        return res.json({
            ...stats,
            derniersDossiers: (historiques || []).slice(0, 8),
            observationsTerrain: terrain,
            alertes: {
                message: 'Surveillez les chevauchements via /decision/conflits avant validation.',
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/terrain/sync', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const { substance, note, lon, lat, photoBase64, meta } = req.body;
        if (lon === undefined || lat === undefined) {
            return res.status(400).json({ erreur: 'lon et lat requis' });
        }
        const saved = await saveObservation({
            userId: req.user.id,
            substance,
            note,
            lon,
            lat,
            photoBase64,
            meta,
        });
        return res.json({ ok: true, observation: saved });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.get('/terrain/observations', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const rows = await listObservations({ limit: req.query.limit });
        return res.json({ observations: rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

module.exports = router;
