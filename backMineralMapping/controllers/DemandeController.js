const express = require('express');
const router = express.Router();
const { runEvaluationPipeline, buildDossier } = require('./service/evaluationPipeline');
const pool = require('../database.js');

router.get('/utilisateur/getDemandeur', (req, res) => {
    pool.query('SELECT * FROM personne_societe ORDER BY registre_1', (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erreur: 'Erreur de base de données' });
        }
        if (!results.rows?.length) {
            return res.json({ erreur: 'pas de suggestion' });
        }
        return res.json(results.rows);
    });
});

router.get('/utilisateur/getTypePermis', (req, res) => {
    pool.query('SELECT * FROM typepermis ORDER BY id', (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erreur: 'Erreur de base de données' });
        }
        if (!results.rows?.length) {
            return res.json({ erreur: 'pas de suggestion' });
        }
        return res.json(results.rows);
    });
});

router.post('/utilisateur/getDonneDemande', async (req, res) => {
    const tableauDemande = req.body.donneesTableau;
    try {
        if (!tableauDemande) {
            return res.status(400).json({ error: 'tableau vide' });
        }

        const evaluation = await runEvaluationPipeline(tableauDemande, {
            userId: req.user.id,
            persistHistorique: true,
            includeConflits: true,
        });

        return res.json({
            results: evaluation.results,
            meta: evaluation.meta,
            checklist: evaluation.checklist,
            conflits: evaluation.conflits,
            suggestions: evaluation.suggestions,
            dossier: buildDossier(evaluation),
        });
    } catch (error) {
        if (error.code === 'CHECKLIST') {
            return res.status(400).json({
                error: error.checklist.blockingFails.includes('hors_decoupe')
                    ? 'des carrés hors découpe'
                    : 'Checklist invalide',
                checklist: error.checklist,
            });
        }
        console.error(error);
        return res.status(500).json({ error: String(error.message || error) });
    }
});

module.exports = router;
