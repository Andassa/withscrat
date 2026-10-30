const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { LABEL } = require('../controllers/service/scoreEngine');

describe('ScoreEngine LABEL', () => {
    it('expose les libelles 1-4', () => {
        assert.equal(LABEL[1], 'nulle');
        assert.equal(LABEL[2], 'faible');
        assert.equal(LABEL[3], 'moyenne');
        assert.equal(LABEL[4], 'élevée');
    });
});

describe('evaluateDemande shape (mock data)', () => {
    it('trie les substances et conserve presenceIndice', async () => {
        const { evaluateDemande } = require('../controllers/service/scoreEngine');
        // Substances hors bases -> path indetermine / note 1 sans planter
        const results = await evaluateDemande(
            [],
            [[{ id: 1, nom: 'ZZZ_TEST_INCONNUE' }], [{ id: 2, nom: 'AAA_TEST_INCONNUE' }]],
            [
                { subs: 'ZZZ_TEST_INCONNUE', presenceIndice: 2, probIndice: 2, indicesDetails: { point: true, line: false, zone: false } },
                { subs: 'AAA_TEST_INCONNUE', presenceIndice: 1, probIndice: 1, indicesDetails: {} },
            ]
        );
        assert.equal(results.length, 2);
        assert.equal(results[0].subs, 'AAA_TEST_INCONNUE');
        assert.equal(results[1].subs, 'ZZZ_TEST_INCONNUE');
        assert.equal(results[1].presenceIndice, 2);
        assert.equal(results[0].label, 'nulle');
        assert.ok(results[0].path);
    });
});
