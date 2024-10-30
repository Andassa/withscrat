const pool = require('./database.js'); // Importez la configuration de la base de données
const bcrypt = require('bcrypt');


//configuration de passport (middleware pour authentication)
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    (username, password, done) => {
        // Recherchez l'utilisateur dans la base de données PostgreSQL
        pool.query("SELECT * FROM utilisateurs WHERE username = $1 ", [username], (err, result) => {
            if (err) {
                return done(err);
            }
            if (result.rows.length === 0) {
                return done(null, false, { message: 'Nom d\'utilisateur incorrect.' });
            }
            const user = result.rows[0];
            // Vérifiez le mot de passe
            bcrypt.compare(password, user.motdepasse, (err, isMatch) => {
                if (err) return done(err);
                if (isMatch) {
                    done(null, user);
                } else {
                    return done(null, false, { message: 'Mot de passe incorrect.' });
                }
            });
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Recherchez l'utilisateur dans la base de données PostgreSQL en utilisant l'ID stocké dans la session
    pool.query('SELECT * FROM utilisateurs WHERE id = $1', [id], (err, result) => {
        if (err) return done(err);
        const user = result.rows[0];
        done(null, user);
    });
});
module.exports = passport;
