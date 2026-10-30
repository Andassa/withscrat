const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { runChecklist } = require('../controllers/service/checklist');

describe('runChecklist', () => {
    it('bloque si hors decoupe', () => {
        const r = runChecklist({
            nomPersonne: 'Test',
            selectPermis: 1,
            listeCarre: [{ etat: 1, lat: 0, lng: 0 }],
            choixSubs: [1],
        });
        assert.equal(r.ok, false);
        assert.ok(r.blockingFails.includes('hors_decoupe'));
    });

    it('valide un dossier complet', () => {
        const r = runChecklist({
            nomPersonne: 'Test',
            selectPermis: 1,
            listeCarre: [{ etat: 0, lat: 0, lng: 0 }],
            choixSubs: [1, 2],
        });
        assert.equal(r.ok, true);
    });
});
