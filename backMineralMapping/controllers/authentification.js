const express = require('express');
const router = express.Router();
const passport = require('../usepassport.js');
const pool = require('../database.js');
const bcrypt = require('bcrypt');
const { serviceFonction } = require('./service/infoUser');

function publicUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        username: user.username,
        fonction: user.fonction,
        email: user.email,
        autorisation: user.autorisation,
        etat: user.etat,
        service: user.service,
    };
}

router.post('/register', async (req, res) => {
    const { nom, prenom, username, fonction, email, password, service } = req.body;
    if (!nom || !username || !password || !fonction) {
        return res.status(400).json({ erreur: 'Champs obligatoires manquants' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO utilisateurs
            (id, nom, prenom, username, fonction, email, motdepasse, autorisation, etat, service)
            VALUES (concat('user', nextval('s_user')::text), $1,$2,$3,$4,$5,$6,1,1,$7)`,
            [nom, prenom || null, username, fonction, email || null, hash, service || null]
        );
        return res.json({ ok: true, redirect: '/login' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erreur: 'Erreur lors de l\'inscription' });
    }
});

router.post('/updateProfile', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ erreur: 'Non authentifié' });
    }
    const { id, nom, prenom, username, fonction, email, password } = req.body;
    if (req.user.id !== id && Number(req.user.autorisation) !== 2) {
        return res.status(403).json({ erreur: 'Accès refusé' });
    }
    try {
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            await pool.query(
                `UPDATE utilisateurs
                 SET nom=$1, prenom=$2, username=$3, fonction=$4, email=$5, motdepasse=$6
                 WHERE id=$7`,
                [nom, prenom, username, fonction, email, hash, id]
            );
        } else {
            await pool.query(
                `UPDATE utilisateurs
                 SET nom=$1, prenom=$2, username=$3, fonction=$4, email=$5
                 WHERE id=$6`,
                [nom, prenom, username, fonction, email, id]
            );
        }
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erreur: 'Erreur lors de la mise à jour' });
    }
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        const role = Number(req.user.autorisation) === 2 ? 'admin' : 'user';
        return res.json({
            authentifie: true,
            role,
            redirect: role === 'admin' ? '/admin/dashboard' : '/map',
            user: publicUser(req.user),
        });
    }
    return res.json({ authentifie: false, message: 'Page de connexion' });
});

router.post('/sendDatalogin', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({
                erreur: { message: (info && info.message) || 'nom d\'utilisateur ou mot de passe incorrecte' },
            });
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr);

            if (Number(user.etat) === 1) {
                return res.status(403).json({ erreur: { message: 'en attente de validation' } });
            }
            if (Number(user.etat) === 3) {
                return res.status(403).json({ erreur: { message: 'le compte est bloqué' } });
            }

            const userAgent = req.headers['user-agent'] || '';
            const isFlutterApp = userAgent.includes('Flutter');
            const role = Number(user.autorisation) === 2 ? 'admin' : 'user';

            if (isFlutterApp) {
                return res.json({ redirect: '/home', role, user: publicUser(user) });
            }
            if (role === 'admin') {
                return res.json({ redirect: '/admin/dashboard', role: 'admin', user: publicUser(user) });
            }
            if (Number(user.autorisation) === 1) {
                return res.json({ redirect: '/map', role: 'user', user: publicUser(user) });
            }
            return res.status(403).json({ erreur: { message: 'accès non autorisé' } });
        });
    })(req, res, next);
});

router.get('/getSession', (req, res) => {
    if (req.user) {
        return res.json({ user: publicUser(req.user) });
    }
    return res.json({ erreur: 'veuillez vous connecter' });
});

router.get('/getServiceFonction', async (req, res) => {
    try {
        const serviceFonctions = await serviceFonction();
        return res.json(serviceFonctions);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erreur: 'Erreur de déconnexion' });
        }
        return res.json({ ok: true, redirect: '/login' });
    });
});

module.exports = router;
