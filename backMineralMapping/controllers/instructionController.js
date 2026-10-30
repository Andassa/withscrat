const express = require('express');
const router = express.Router();
const {
    STATUTS,
    createDossier,
    listDossiers,
    getDossier,
    updateStatut,
    addCommentaire,
    addPiece,
    buildExportInstruction,
} = require('./service/instruction');
const { runFixtures, saveFeedback, listFeedback, feedbackStats } = require('./service/validationMetier');

function requireAuth(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).json({ erreur: 'Non authentifié' });
        return false;
    }
    return true;
}

function requireAdmin(req, res) {
    if (!requireAuth(req, res)) return false;
    if (Number(req.user.autorisation) !== 2) {
        res.status(403).json({ erreur: 'Admin requis' });
        return false;
    }
    return true;
}

router.get('/instruction/statuts', (req, res) => {
    if (!requireAuth(req, res)) return;
    return res.json({ statuts: STATUTS });
});

router.get('/instruction/dossiers', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const rows = await listDossiers({ statut: req.query.statut, limit: req.query.limit });
        return res.json({ dossiers: rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/instruction/dossiers', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const dossier = await createDossier({
            demandeur: req.body.demandeur,
            typepermis: req.body.typepermis,
            historiqueId: req.body.historiqueId,
            payload: req.body.payload,
            userId: req.user.id,
        });
        return res.json({ ok: true, dossier });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.get('/instruction/dossiers/:id', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const dossier = await getDossier(Number(req.params.id));
        if (!dossier) return res.status(404).json({ erreur: 'Dossier introuvable' });
        return res.json({ dossier });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.patch('/instruction/dossiers/:id/statut', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const dossier = await updateStatut(Number(req.params.id), req.body.statut, req.user.id);
        if (!dossier) return res.status(404).json({ erreur: 'Dossier introuvable' });
        return res.json({ ok: true, dossier });
    } catch (error) {
        return res.status(400).json({ erreur: String(error.message || error) });
    }
});

router.post('/instruction/dossiers/:id/commentaires', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const auteur = `${req.user.nom || ''} ${req.user.prenom || ''}`.trim() || req.user.username;
        const row = await addCommentaire(Number(req.params.id), { auteur, corps: req.body.corps });
        return res.json({ ok: true, commentaire: row });
    } catch (error) {
        return res.status(400).json({ erreur: String(error.message || error) });
    }
});

router.post('/instruction/dossiers/:id/pieces', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const piece = await addPiece(Number(req.params.id), {
            nom: req.body.nom,
            base64: req.body.base64,
            mime: req.body.mime,
            userId: req.user.id,
        });
        return res.json({ ok: true, piece });
    } catch (error) {
        return res.status(400).json({ erreur: String(error.message || error) });
    }
});

router.get('/instruction/dossiers/:id/export', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const dossier = await getDossier(Number(req.params.id));
        if (!dossier) return res.status(404).json({ erreur: 'Dossier introuvable' });
        return res.json(buildExportInstruction(dossier));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.get('/validation/fixtures', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        const report = await runFixtures();
        return res.json(report);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.post('/validation/feedback', async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const row = await saveFeedback({
            historiqueId: req.body.historiqueId,
            substance: req.body.substance,
            noteSysteme: req.body.noteSysteme,
            noteGeologue: req.body.noteGeologue,
            commentaire: req.body.commentaire,
            validateur: req.user.username || req.user.id,
        });
        return res.json({ ok: true, feedback: row });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

router.get('/validation/feedback', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        const [rows, stats] = await Promise.all([
            listFeedback({ limit: req.query.limit }),
            feedbackStats(),
        ]);
        return res.json({ feedback: rows, stats });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: String(error.message || error) });
    }
});

module.exports = router;
