const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { mergeTimelineItems } = require('../controllers/service/instruction');

describe('mergeTimelineItems', () => {
    it('fusionne events et validations en ordre chronologique', () => {
        const timeline = mergeTimelineItems({
            events: [
                {
                    id: 1,
                    type: 'creation',
                    label: 'Dossier créé',
                    created_at: '2026-01-02T10:00:00.000Z',
                    actor: 'u1',
                    detail: {},
                },
                {
                    id: 2,
                    type: 'statut',
                    label: 'Statut : brouillon → soumis',
                    created_at: '2026-01-03T10:00:00.000Z',
                    actor: 'u1',
                    detail: { from: 'brouillon', to: 'soumis' },
                },
            ],
            validations: [
                {
                    id: 9,
                    substance: 'Nickel',
                    note_systeme: 4,
                    note_geologue: 3,
                    accord: false,
                    validateur: 'geo',
                    created_at: '2026-01-02T12:00:00.000Z',
                },
            ],
        });

        assert.equal(timeline.length, 3);
        assert.equal(timeline[0].type, 'creation');
        assert.equal(timeline[1].type, 'validation');
        assert.equal(timeline[1].detail.substance, 'Nickel');
        assert.equal(timeline[2].type, 'statut');
    });

    it('gere une liste vide', () => {
        assert.deepEqual(mergeTimelineItems({}), []);
    });
});
