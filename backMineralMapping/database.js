// database.js

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',//superutilisateur
    host: 'localhost', // ou l'adresse de votre serveur PostgreSQL
    database: 'mineral_mapping',
    password: 'Blackangel..',
    port: 5432, // Port par défaut de PostgreSQL
});

module.exports = pool;
