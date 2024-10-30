const express = require('express');
const router = express.Router();
const passport = require('../usepassport.js');
const pool = require('../database.js'); // Importez la configuration de la base de données
const bcrypt = require('bcrypt');
const { serviceFonction } = require('./service/infoUser');




router.post('/register', (req, res) => {
    // Récupérez les données du formulaire d'inscription
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    const username = req.body.username;
    const fonction = req.body.fonction;
    const email = req.body.email;
    const password = req.body.password;
    const service = req.body.service;

    // Hachez le mot de passe avant de le stocker en base de données
    bcrypt.hash(password, 10, (err, hash) => {
        // Stockez l'utilisateur dans la base de données PostgreSQL avec le mot de passe haché
        pool.query("INSERT INTO utilisateurs (id, nom, prenom, username, fonction , email, motdepasse, autorisation, etat, service) VALUES (concat(\'user\', nextval(\'s_user\')::text), $1,$2,$3,$4,$5,$6,'1','1',$7)", [nom, prenom, username, fonction, email, hash, service], (err) => {
            if (err) {
                console.error(err);
                res.send('Erreur lors de l\'inscription');
            } else {
                console.log('okay')
                res.send('/login');
            }
        });
    });
}
);
router.post('/updateProfile', (req, res) => {
    // Récupérez les données du formulaire d'inscription
    const id = req.body.id;
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    const username = req.body.username;
    const fonction = req.body.fonction;
    const email = req.body.email;
    const password = req.body.password;
    const formData = { id, nom, prenom, password }

    // Hachez le mot de passe avant de le stocker en base de données
    bcrypt.hash(password, 10, (err, hash) => {
        // Stockez l'utilisateur dans la base de données PostgreSQL avec le mot de passe haché
        pool.query("update utilisateurs set nom='" + nom + "', prenom='" + prenom + "', username='" + username + "', fonction='" + fonction + "' , email='" + email + "', motdepasse='" + hash + "' where id = '" + id + "'", (err) => {
            if (err) {
                console.error(err);
                res.send('Erreur lors de la mis à jour ');
            } else {
                res.redirect('/login');
            }
        });
    });
    passport.authenticate('local', (err, user, message, info) => {
        if (message) {
            req.flash('error', message);
            const responseData = { erreur: message };
            return res.json(responseData);
        }
        if (err) {
            return next(err);
        }
        if (!user) {
            const responseData = { erreur: 'nom d\'utilisateur ou mot de passe incorrecte' };
            return res.json(responseData);
        }
        // Authentification réussie
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            if (user.etat === 1) {
                const responseData = { message: 'en attente de validation' };
                return res.json({ erreur: responseData })
            }
            if (user.etat === 3) {
                const responseData = { message: 'le compte est bloqué' };
                return res.json({ erreur: responseData })
            }
            // Condition pour déterminer la redirection en fonction du rôle
            if (user.autorisation === 2) {
                // const responseData = { valide: '/admin/dashboard',user:user };
                // return res.json(responseData);
                res.redirect('/admin/dashboard');
            } else if (user.autorisation === 1) {
                // const responseData = { valide: '/utilisateur/map', user:user };
                // return res.json(responseData);
                res.redirect('/utilisateur/map');
            }
            else {
                res.send('accès non autorisé');
            }
        });
    })(req, res, next);
}
);

router.get('/login', (req, res) => {
    const errors = req.flash('error');
    // Vérifiez si l'utilisateur est déjà authentifié

    if (errors.length > 0) {
        console.log('Erreurs de connexion :', errors.length);
        res.json(errors);
    } else {
        if (req.isAuthenticated()) {
            res.redirect('/admin/dashboard');
        } else {
            console.log(errors.length);
            res.json('Page de connexion');
        }
    }
});
router.post('/sendDatalogin', (req, res, next) => {
    passport.authenticate('local', (err, user, message, info) => {
        if (message) {
            req.flash('error', message);
            return res.json({ erreur: message });
        }
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({ erreur: 'nom d\'utilisateur ou mot de passe incorrecte' });
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            if (user.etat === 1) {
                return res.json({ erreur: { message: 'en attente de validation' } });
            }
            if (user.etat === 3) {
                return res.json({ erreur: { message: 'le compte est bloqué' } });
            }

            const userAgent = req.headers['user-agent'];
            const isFlutterApp = userAgent && userAgent.includes('Flutter');

            if (isFlutterApp) {
                // Pour Flutter, retourner une redirection à HomeScreen
                return res.json({ redirect: '/home' });
            } else {
                // Pour le web, gérer les redirections en fonction de l'autorisation
                if (user.autorisation === 2) {
                    return res.redirect('/admin/dashboard');
                } else if (user.autorisation === 1) {
                    return res.redirect('/utilisateur/map');
                } else {
                    return res.send('accès non autorisé');
                }
            }
        });
    })(req, res, next);
});

router.get('/getSession', (req, res) => {
    if (req.user) {
        return res.json({ user: req.user });
    }
    else {
        return res.json({ erreur: 'veuillez vous connecter' });
    }
})

router.get('/getServiceFonction', async (req, res) => {
    try {
        const serviceFonctions = await serviceFonction();
        return res.json(serviceFonctions);
    } catch (error) {
        console.log(error);
    }
})

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // Gérer l'erreur ici, si nécessaire
            return next(err);
        }
        // Redirection après la déconnexion
        res.redirect('/login');
    });
});


module.exports = router;
