require('dotenv').config();
const cors = require('cors');
const express = require('express');
const expressSession = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./usepassport.js');
const flash = require('express-flash');
const pool = require('./database.js');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

const authentification = require('./controllers/authentification');
const dashboard = require('./controllers/controllerDash');
const mapPage = require('./controllers/controllerMap');
const test = require('./controllers/testController');
const grid = require('./controllers/gridController');
const permis = require('./controllers/permisController');
const lithology = require('./controllers/lithologyController');
const decoupe = require('./controllers/DecoupeController');
const demande = require('./controllers/DemandeController');
const carre = require('./controllers/CarreController');
const utilisateur = require('./controllers/UtilisateurController');
const historique = require('./controllers/historiqueController');
const SubstanceController = require('./controllers/SubstanceController');
const MapController = require('./controllers/MapController');
const PermiController = require('./controllers/PermiController');
const analyse = require('./controllers/analyseController');
const decision = require('./controllers/decisionController');
const instruction = require('./controllers/instructionController');

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001,http://127.0.0.1:3001')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: corsOrigins,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
}));
app.options('*', cors({ origin: corsOrigins, credentials: true }));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_LOGIN || 30),
    standardHeaders: true,
    legacyHeaders: false,
    message: { erreur: 'Trop de tentatives de connexion, réessayez plus tard.' },
});
app.use('/sendDatalogin', loginLimiter);

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.RATE_LIMIT_API || 120),
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/utilisateur', apiLimiter);
app.use('/api', apiLimiter);

if (!process.env.SESSION_SECRET && isProd) {
    console.error('SESSION_SECRET obligatoire en production');
    process.exit(1);
}

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'mineral_mapping_dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: 1000 * 60 * 60 * 8,
    },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const checkAdminRole = (req, res, next) => {
    if (req.isAuthenticated() && Number(req.user.autorisation) === 2) {
        return next();
    }
    return res.status(403).json({ erreur: 'Accès refusé. Veuillez vous connecter en tant qu\'admin.' });
};

const checkUserRole = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ erreur: 'Accès refusé. Veuillez vous connecter.' });
};

app.get('/health', (req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.use('/admin', checkAdminRole);
app.use('/utilisateur', checkUserRole);
app.use('/', authentification);
app.use('/', dashboard);
app.use('/', mapPage);
app.use('/', test);
app.use('/', grid);
app.use('/', permis);
app.use('/', lithology);
app.use('/', decoupe);
app.use('/', demande);
app.use('/', carre);
app.use('/', utilisateur);
app.use('/', historique);
app.use('/api', PermiController);
app.use('/api', SubstanceController);
app.use('/api', MapController);
app.use('/api', analyse);
app.use('/api', decision);
app.use('/', decision);
app.use('/api', instruction);
app.use('/', instruction);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

process.on('SIGINT', () => {
    pool.end(() => {
        console.log('Connexion PostgreSQL fermée');
        process.exit(0);
    });
});

module.exports = app;
