const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
    summarizeObservations,
    toFeatureCollection,
} = require('../controllers/service/terrain');

describe('summarizeObservations', () => {
    it('compte total, coords, photos et top substances', () => {
        const resume = summarizeObservations([
            { substance: 'Or', lon: 47.5, lat: -18.9, photo_path: 'a.jpg' },
            { substance: 'Or', lon: 47.6, lat: -18.8 },
            { substance: 'Nickel', lon: null, lat: null },
            { substance: 'Nickel', lon: 46, lat: -19, photo_path: 'b.jpg' },
        ]);
        assert.equal(resume.total, 4);
        assert.equal(resume.avecCoordonnees, 3);
        assert.equal(resume.avecPhoto, 2);
        assert.equal(resume.topSubstances[0].substance, 'Or');
        assert.equal(resume.topSubstances[0].n, 2);
    });
});

describe('toFeatureCollection', () => {
    it('ignore les points sans coordonnees valides', () => {
        const fc = toFeatureCollection([
            { id: 1, substance: 'Or', lon: 47.5, lat: -18.9 },
            { id: 2, substance: 'Ni', lon: 'x', lat: -18 },
            { id: 3, substance: 'Cu', lon: 1, lat: 2, note: 'ok' },
        ]);
        assert.equal(fc.type, 'FeatureCollection');
        assert.equal(fc.features.length, 2);
        assert.deepEqual(fc.features[0].geometry.coordinates, [47.5, -18.9]);
        assert.equal(fc.features[1].properties.substance, 'Cu');
    });
});
