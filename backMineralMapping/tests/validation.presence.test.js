const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { presenceLabel } = require('../controllers/service/validationMetier');

describe('presenceLabel', () => {
    it('mappe 1-4 en libelles metier', () => {
        assert.equal(presenceLabel(1), 'nulle');
        assert.equal(presenceLabel(2), 'moyenne');
        assert.equal(presenceLabel(3), 'moyenne');
        assert.equal(presenceLabel(4), 'élevée');
    });
});
