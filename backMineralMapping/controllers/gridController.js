const express = require('express');
const router = express.Router();

router.get('/utilisateur/getGrille', (req, res) => {
    const numRows = 6;
    const numCols = 6;
    const squareSize = 0.01; // Taille d'un carré en degrés

    // Point initial
    const initialPoint = { lat: 45.395843238747105, lng: -16.67872213641585 };

    // Tableau pour stocker les carrés de la grille
    const grid = [];

    // Générer la grille de carrés
    for (let row = 0; row < numRows; row++) {
        const rowArray = [];
        for (let col = 0; col < numCols; col++) {
            const square = {
                lat: initialPoint.lat - (row * squareSize),
                lng: initialPoint.lng + (col * squareSize)
            };
            rowArray.push(square);
        }
        grid.push(rowArray);
    }
console.log('appel: getgrille');
    return res.json(grid);

});
module.exports = router;