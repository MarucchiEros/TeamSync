/**
 * Router per la gestione delle pagine dell'applicazione
 * Definisce le rotte per le pagine pubbliche, protette e amministrative
 * 
 * Funzionalità principali:
 * - Gestione pagine pubbliche (login, registrazione)
 * - Pagine protette per utenti autenticati (home, dashboard)
 * - Pagine amministrative (gestione utenti, team, progetti)
 * - API per la gestione dei team
 * - Protezione delle rotte con middleware di autenticazione
 * 
 * Struttura delle rotte:
 * - Pubbliche: /, /login
 * - Protette: /home, /dashboard/:id, /team/:progettoId
 * - Admin: /admin, /api/teams/*
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const authController = require('../controllers/authController');
const Utente = require('../models/Utente');
const { Team, TeamUtente } = require('../models/Team');
const Progetto = require('../models/Project');
const TaskJson = require('../models/TaskJson');
const { Op } = require('sequelize');

/**
 * Middleware di autenticazione
 * Gestiscono l'accesso alle diverse aree dell'applicazione
 */

/**
 * Verifica se l'utente è autenticato
 * Protegge le rotte che richiedono autenticazione
 * 
 * @middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 * @redirects {string} /login - Se l'utente non è autenticato
 */
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

/**
 * Verifica se l'utente è amministratore
 * Protegge le rotte amministrative
 * 
 * @middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 * @redirects {string} /home - Se l'utente non è admin
 */
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.ruolo === 'admin') {
        next();
    } else {
        res.redirect('/home');
    }
};

/**
 * Verifica se l'utente NON è autenticato
 * Protegge le rotte pubbliche da accessi non necessari
 * 
 * @middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 * @redirects {string} /admin o /home - In base al ruolo se autenticato
 */
const isNotAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        next();
    } else {
        // Reindirizza in base al ruolo
        if (req.session.user.ruolo === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/home');
        }
    }
};

/**
 * Rotte pubbliche (non autenticate)
 * Gestiscono l'accesso iniziale all'applicazione
 */

/**
 * Pagina principale
 * Reindirizza gli utenti autenticati alla loro home
 * 
 * @route GET /
 * @access Public
 * @renders auth
 */
router.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.ruolo === 'admin') {
            return res.redirect('/admin');
        }
        return res.redirect('/home');
    }
    res.render('auth', { 
        activeTab: 'login',
        error: null 
    });
});

/**
 * Pagina di login
 * Mostra il form di accesso
 * 
 * @route GET /login
 * @access Public
 * @renders auth
 */
router.get('/login', (req, res) => {
    if (req.session.user) {
        if (req.session.user.ruolo === 'admin') {
            return res.redirect('/admin');
        }
        return res.redirect('/home');
    }
    res.render('auth', { 
        activeTab: 'login',
        error: null 
    });
});

/**
 * Home page utente
 * Mostra i progetti e le statistiche dell'utente
 * 
 * Funzionalità:
 * - Lista progetti dell'utente
 * - Statistiche task completate
 * - Progetti in scadenza
 * - Membri del team
 * 
 * @route GET /home
 * @access Private
 * @renders home
 */
router.get('/home', isAuthenticated, async (req, res) => {
    // Se l'utente è admin, reindirizza alla pagina admin
    if (req.session.user.ruolo === 'admin') {
        return res.redirect('/admin');
    }

    try {
        // Carica i progetti dell'utente (sia quelli creati che quelli a cui partecipa)
        const progetti = await Progetto.findAll({
            include: [{
                model: Team,
                include: [{
                    model: Utente,
                    attributes: ['id', 'nome', 'cognome'],
                    where: { id: req.session.user.id }
                }]
            }],
            where: {
                [Op.or]: [
                    { creato_da: req.session.user.id },
                    { '$Team.Utentes.id$': req.session.user.id }
                ]
            }
        });

        // Converti i risultati in oggetti JavaScript semplici
        const progettiPlain = progetti.map(progetto => progetto.get({ plain: true }));

        // Formatta i progetti per il template
        const progettiFormattati = progettiPlain.map(progetto => ({
            id: progetto.id,
            nome: progetto.nome,
            descrizione: progetto.descrizione,
            team: progetto.Team ? progetto.Team.nome : 'Non assegnato',
            membri: progetto.Team ? progetto.Team.Utentes.slice(0, 4).map(utente => ({
                nome: utente.nome,
                cognome: utente.cognome
            })) : [],
            membri_extra: progetto.Team && progetto.Team.Utentes.length > 4 ? progetto.Team.Utentes.length - 4 : 0,
            progresso: 0, // Da implementare con le task
            task_completate: 0,
            task_totali: 0,
            stato: progetto.stato,
            scadenza: progetto.scadenza ? new Date(progetto.scadenza).toLocaleDateString('it-IT') : 'Non definita'
        }));

        // Calcola le statistiche
        const task_completate = 0; // Da implementare con le task
        const progetti_in_scadenza = progettiFormattati.filter(p => {
            if (!p.scadenza || p.scadenza === 'Non definita') return false;
            const scadenza = new Date(p.scadenza);
            const oggi = new Date();
            const diffGiorni = Math.ceil((scadenza - oggi) / (1000 * 60 * 60 * 24));
            return diffGiorni <= 7 && diffGiorni >= 0;
        }).length;

        logger.info(`Rendering home page per l'utente: ${req.session.user.email}`);
        res.render('home', {
            user: req.session.user,
            progetti: progettiFormattati,
            task_completate,
            progetti_in_scadenza
        });
    } catch (error) {
        logger.error(`Errore nel rendering della home page: ${error.message}`);
        res.status(500).redirect('/login');
    }
});

/**
 * Dashboard amministrativa
 * Gestisce utenti, team e progetti
 * 
 * Funzionalità:
 * - Lista completa utenti
 * - Gestione team
 * - Overview progetti
 * - Statistiche sistema
 * 
 * @route GET /admin
 * @access Admin
 * @renders admin
 */
router.get('/admin', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.ruolo !== 'admin') {
        return res.redirect('/login');
    }

    try {
        // Carica tutti gli utenti
        const utenti = await Utente.findAll({
            attributes: ['id', 'nome', 'cognome', 'email', 'ruolo']
        });

        // Carica tutti i team con i loro membri
        const teams = await Team.findAll({
            include: [{
                model: Utente,
                attributes: ['id', 'nome', 'cognome'],
                through: {
                    attributes: []
                }
            }]
        });

        // Carica i progetti creati dall'admin
        const progetti = await Progetto.findAll({
            include: [
                {
                    model: Team,
                    include: [{
                        model: Utente,
                        attributes: ['id', 'nome', 'cognome']
                    }]
                }
            ]
        });

        // Converti i risultati in oggetti JavaScript semplici
        const utentiPlain = utenti.map(utente => utente.get({ plain: true }));
        const teamsPlain = teams.map(team => team.get({ plain: true }));
        const progettiPlain = progetti.map(progetto => progetto.get({ plain: true }));

        // Formatta i progetti per il template
        const progettiFormattati = progettiPlain.map(progetto => ({
            id: progetto.id,
            nome: progetto.nome,
            descrizione: progetto.descrizione,
            team: progetto.Team ? progetto.Team.nome : 'Non assegnato',
            membri: progetto.Team ? progetto.Team.Utentes.map(utente => ({
                nome: utente.nome,
                cognome: utente.cognome
            })) : [],
            progresso: 0, // Da implementare con le task
            task_completate: 0,
            task_totali: 0,
            stato: progetto.stato,
            scadenza: progetto.scadenza ? new Date(progetto.scadenza).toLocaleDateString('it-IT') : 'Non definita'
        }));

        res.render('admin', {
            user: req.session.user,
            utenti: utentiPlain,
            teams: teamsPlain,
            progetti: progettiFormattati
        });
    } catch (error) {
        logger.error(`Errore nel caricamento della pagina admin: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Errore nel caricamento della pagina admin',
            error: error.message 
        });
    }
});

/**
 * API Team
 * Endpoints per la gestione dei team
 */

/**
 * Crea un nuovo team
 * Gestisce la creazione e l'assegnazione dei membri
 * 
 * @route POST /api/teams
 * @access Admin
 * @body {string} nome - Nome del team
 * @body {string} descrizione - Descrizione del team
 * @body {Array} membri - Array di ID utenti da aggiungere al team
 */
router.post('/api/teams', isAdmin, async (req, res) => {
    try {
        const { nome, descrizione, membri } = req.body;

        // Crea il team
        const team = await Team.create({
            nome,
            descrizione
        });

        // Aggiungi i membri al team
        if (membri && membri.length > 0) {
            await Promise.all(membri.map(async (membro) => {
                await TeamUtente.create({
                    TeamId: team.id,
                    UtenteId: membro.id
                });
            }));
        }

        // Recupera il team con i membri
        const teamCompleto = await Team.findByPk(team.id, {
            include: [{
                model: Utente,
                attributes: ['id', 'nome', 'cognome', 'email'],
                through: {
                    attributes: []
                }
            }]
        });

        res.json({
            success: true,
            team: teamCompleto.get({ plain: true })
        });
    } catch (error) {
        logger.error(`Errore nella creazione del team: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Errore nella creazione del team'
        });
    }
});

/**
 * Recupera i dettagli di un team
 * Include la lista dei membri
 * 
 * @route GET /api/teams/:id
 * @access Admin
 * @param {string} id - ID del team
 */
router.get('/api/teams/:id', isAdmin, async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.id, {
            include: [{
                model: Utente,
                attributes: ['id', 'nome', 'cognome', 'email'],
                through: {
                    attributes: []
                }
            }]
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team non trovato'
            });
        }

        res.json({
            success: true,
            team: team.get({ plain: true })
        });
    } catch (error) {
        logger.error(`Errore nel recupero del team: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero del team'
        });
    }
});

/**
 * Aggiorna un team esistente
 * Gestisce modifiche a nome, descrizione e membri
 * 
 * @route PUT /api/teams/:id
 * @access Admin
 * @param {string} id - ID del team
 * @body {string} nome - Nuovo nome del team
 * @body {string} descrizione - Nuova descrizione
 * @body {Array} membri - Nuova lista di membri
 */
router.put('/api/teams/:id', isAdmin, async (req, res) => {
    try {
        const { nome, descrizione, membri } = req.body;
        const team = await Team.findByPk(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team non trovato'
            });
        }

        await team.update({
            nome,
            descrizione
        });

        // Rimuovi tutti i membri esistenti
        await TeamUtente.destroy({
            where: { TeamId: team.id }
        });

        // Aggiungi i nuovi membri
        if (membri && membri.length > 0) {
            await Promise.all(membri.map(async (membro) => {
                await TeamUtente.create({
                    TeamId: team.id,
                    UtenteId: membro.id
                });
            }));
        }

        // Recupera il team aggiornato con i membri
        const teamAggiornato = await Team.findByPk(team.id, {
            include: [{
                model: Utente,
                attributes: ['id', 'nome', 'cognome', 'email'],
                through: {
                    attributes: []
                }
            }]
        });

        res.json({
            success: true,
            team: teamAggiornato.get({ plain: true })
        });
    } catch (error) {
        logger.error(`Errore nell'aggiornamento del team: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiornamento del team'
        });
    }
});

/**
 * Dashboard del progetto
 * Mostra i dettagli e le task di un progetto
 * 
 * Verifica:
 * - Esistenza del progetto
 * - Autorizzazione dell'utente
 * - Appartenenza al team
 * 
 * @route GET /dashboard/:id
 * @access Private
 * @param {string} id - ID del progetto
 * @renders dashboard
 */
router.get('/dashboard/:id', isAuthenticated, async (req, res) => {
    try {
        const progetto = await Progetto.findByPk(req.params.id, {
            include: [{
                model: Team,
                include: [{
                    model: Utente,
                    attributes: ['id', 'nome', 'cognome']
                }]
            }]
        });

        if (!progetto) {
            return res.status(404).redirect('/home');
        }

        // Verifica che l'utente sia autorizzato a vedere il progetto
        const isCreator = progetto.creato_da === req.session.user.id;
        const isTeamMember = progetto.Team && progetto.Team.Utentes.some(u => u.id === req.session.user.id);

        if (!isCreator && !isTeamMember) {
            return res.status(403).redirect('/home');
        }

        res.render('dashboard', {
            user: req.session.user,
            progetto: progetto.get({ plain: true }),
            progettoId: progetto.id,
            activePage: 'dashboard'
        });
    } catch (error) {
        logger.error(`Errore nel caricamento della dashboard: ${error.message}`);
        res.status(500).redirect('/home');
    }
});

/**
 * Visualizzazione membri del team
 * Mostra i dettagli dei membri di un team specifico
 * 
 * Verifica:
 * - Esistenza del progetto
 * - Autorizzazione dell'utente
 * - Esistenza del team
 * 
 * @route GET /team/:progettoId
 * @access Private
 * @param {string} progettoId - ID del progetto
 * @renders teamMember
 */
router.get('/team/:progettoId', isAuthenticated, async (req, res) => {
    try {
        // Recupera il progetto specifico con il suo team
        const progetto = await Progetto.findOne({
            where: {
                id: req.params.progettoId
            },
            include: [{
                model: Team,
                include: [{
                    model: Utente,
                    attributes: ['id', 'nome', 'cognome', 'email', 'ruolo']
                }]
            }]
        });

        if (!progetto) {
            return res.render('teamMember', {
                user: req.session.user,
                utenti: [],
                message: 'Progetto non trovato',
                activePage: 'team'
            });
        }

        // Verifica che l'utente sia autorizzato a vedere il team
        const isCreator = progetto.creato_da === req.session.user.id;
        const isTeamMember = progetto.Team && progetto.Team.Utentes.some(u => u.id === req.session.user.id);
        const isAdmin = req.session.user.ruolo === 'admin';

        if (!isCreator && !isTeamMember && !isAdmin) {
            return res.render('teamMember', {
                user: req.session.user,
                utenti: [],
                message: 'Non hai accesso a questo team',
                activePage: 'team'
            });
        }

        // Se il progetto non ha un team
        if (!progetto.Team) {
            return res.render('teamMember', {
                user: req.session.user,
                utenti: [],
                message: 'Questo progetto non ha un team assegnato',
                activePage: 'team'
            });
        }

        // Formatta i dati degli utenti
        const utentiFormattati = progetto.Team.Utentes.map(utente => ({
            id: utente.id,
            nome: utente.nome,
            cognome: utente.cognome,
            email: utente.email,
            ruolo: utente.ruolo
        }));

        res.render('teamMember', {
            user: req.session.user,
            utenti: utentiFormattati,
            nomeTeam: progetto.Team.nome,
            progettoId: progetto.id,
            activePage: 'team'
        });
    } catch (error) {
        logger.error(`Errore nel recupero dei membri del team: ${error.message}`);
        res.status(500).render('error', {
            message: 'Errore nel recupero dei membri del team'
        });
    }
});

/**
 * Gestione 404 personalizzata
 * Reindirizza gli utenti in base al loro stato di autenticazione
 * 
 * @middleware
 * @redirects {string} /login - Per utenti non autenticati
 * @redirects {string} /admin - Per amministratori
 * @redirects {string} /home - Per utenti normali
 */
router.use((req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    // Se l'utente è autenticato, reindirizza in base al ruolo
        if (req.session.user.ruolo === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/home');
    }
});

module.exports = router; 