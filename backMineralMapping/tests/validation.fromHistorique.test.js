const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
    labelToNote,
    buildDraftFromHistorique,
} = require('../controllers/service/validationMetier');

describe('labelToNote', () => {
    it('mappe les libelles resultat vers notes 1-4', () => {
        assert.equal(labelToNote('nulle'), 1);
        assert.equal(labelToNote('faible'), 2);
        assert.equal(labelToNote('moyenne'), 3);
        assert.equal(labelToNote('élevée'), 4);
        assert.equal(labelToNote('elevee'), 4);
    });

    it('accepte une note numerique deja normalisee', () => {
        assert.equal(labelToNote(3), 3);
        assert.equal(labelToNote('2'), 2);
    });

    it('retourne null si inconnu', () => {
        assert.equal(labelToNote('???'), null);
        assert.equal(labelToNote(null), null);
    });
});

describe('buildDraftFromHistorique', () => {
    it('construit un brouillon lie a l historique', () => {
        const draft = buildDraftFromHistorique({
            id: 42,
            demandeur: 'PAM Madagascar',
            libelle: 'PR',
            date: '2026-01-01',
            nom: 'Randria',
            prenom: 'Fanilo',
            results: [
                { substance: 'Nickel', prob: 'élevée', probIndice: 'moyenne' },
                { substance: 'Or', prob: 'faible' },
            ],
        });
        assert.equal(draft.historiqueId, '42');
        assert.equal(draft.demandeur, 'PAM Madagascar');
        assert.equal(draft.substances.length, 2);
        assert.equal(draft.substances[0].noteSysteme, 4);
        assert.equal(draft.substances[1].substance, 'Or');
        assert.equal(draft.substances[1].noteSysteme, 2);
    });

    it('rejette un historique absent', () => {
        assert.throws(
            () => buildDraftFromHistorique(null),
            (err) => err.code === 'HIST_NOT_FOUND'
        );
    });
});
