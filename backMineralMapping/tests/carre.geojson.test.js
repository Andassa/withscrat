const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createMultiPolygonGeoJSON } = require('../controllers/service/Carre');

describe('createMultiPolygonGeoJSON', () => {
    it('ferme l anneau et utilise lng/lat GeoJSON', () => {
        const carres = [{
            coord: [[[ -18.9, 47.5 ], [ -18.9, 47.51 ], [ -18.89, 47.51 ], [ -18.89, 47.5 ]]],
        }];
        const geo = createMultiPolygonGeoJSON(carres);
        assert.equal(geo.type, 'MultiPolygon');
        assert.equal(geo.coordinates.length, 1);
        const ring = geo.coordinates[0][0];
        assert.deepEqual(ring[0], [47.5, -18.9]);
        assert.deepEqual(ring[0], ring[ring.length - 1]);
    });

    it('ignore les carres incomplets', () => {
        const geo = createMultiPolygonGeoJSON([{ coord: [[[0, 0], [1, 1]]] }]);
        assert.equal(geo.coordinates.length, 0);
    });
});
