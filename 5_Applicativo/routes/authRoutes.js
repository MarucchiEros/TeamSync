/**
 * Router per la gestione dell'autenticazione
 * Definisce le rotte per login, registrazione e logout
 * 
 * Funzionalità principali:
 * - Login utente con email e password
 * - Registrazione nuovo utente
 * - Logout e distruzione sessione
 * - Protezione rotte per utenti non autenticati
 * 
 * Flusso di autenticazione:
 * 1. Utente accede alla pagina login/register
 * 2. Compila e invia il form
 * 3. Il server valida i dati
 * 4. Crea/verifica le credenziali
 * 5. Genera la sessione utente
 * 6. Reindirizza alla home
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const Utente = require('../models/Utente');

/**
 * Middleware per verificare se l'utente è già autenticato
 * Protegge le rotte di login e registrazione da accessi non necessari
 * 
 * Funzionamento:
 * 1. Verifica presenza della sessione utente
 * 2. Se presente, reindirizza alla home
 * 3. Se assente, permette l'accesso alla rotta
 * 
 * @param {Object} req - Request object di Express
 * @param {Object} res - Response object di Express
 * @param {Function} next - Funzione per passare al prossimo middleware
 * 
 * @example
 * // Protezione della rotta di login
 * router.get('/login', isNotAuthenticated, (req, res) => {
 *   // Renderizza la pagina di login
 * });
 */
const isNotAuthenticated = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        next();
    }
};

/**
 * Rotte GET per le pagine di autenticazione
 * Gestiscono la visualizzazione dei form di login e registrazione
 */

/**
 * Mostra la pagina di login
 * Renderizza il template auth con il tab di login attivo
 * 
 * @route GET /login
 * @protected isNotAuthenticated
 * @renders auth
 * @param {Object} activeTab - Tab attivo nel template
 * @param {Object} error - Eventuali errori da mostrare
 */
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('auth', { 
        activeTab: 'login',
        error: null 
    });
});

/**
 * Mostra la pagina di registrazione
 * Renderizza il template auth con il tab di registrazione attivo
 * 
 * @route GET /register
 * @protected isNotAuthenticated
 * @renders auth
 * @param {Object} activeTab - Tab attivo nel template
 * @param {Object} error - Eventuali errori da mostrare
 */
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('auth', { 
        activeTab: 'register',
        error: null 
    });
});

/**
 * Mostra la pagina per la richiesta reset password (inserimento email)
 * Renderizza il template emailForReset
 * 
 * @route GET /reset-password
 * @protected isNotAuthenticated
 * @renders emailForReset
 */
router.get('/reset-password', isNotAuthenticated, (req, res) => {
    res.render('emailForReset');
});

/**
 * Mostra la pagina per la verifica del codice di reset password
 * Accesso solo se l'utente ha un codice_password valido
 *
 * @route GET /verify-code
 * @protected isNotAuthenticated
 * @renders verifyCode
 */
router.get('/verify-code', isNotAuthenticated, async (req, res) => {
    const userId = req.query.id;
    if (!userId) return res.redirect('/reset-password');
    const user = await Utente.findByPk(userId);
    if (!user || !user.codice_password) {
        return res.redirect('/reset-password');
    }
    res.render('verifyCode');
});

/**
 * Mostra la pagina per la nuova password dopo verifica codice
 * Accesso solo se l'utente ha un codice_password valido
 *
 * @route GET /new-password
 * @protected isNotAuthenticated
 * @renders resetPassword
 */
router.get('/new-password', isNotAuthenticated, async (req, res) => {
    const userId = req.query.id;
    if (!userId) return res.redirect('/reset-password');
    const user = await Utente.findByPk(userId);
    if (!user || !user.codice_password) {
        return res.redirect('/reset-password');
    }
    res.render('resetPassword');
});

/**
 * Rotte POST per le azioni di autenticazione
 * Gestiscono le richieste di login, registrazione e logout
 */

/**
 * Gestisce la richiesta di login
 * Valida le credenziali e crea la sessione utente
 * 
 * @route POST /login
 * @body {string} email - Email dell'utente
 * @body {string} password - Password dell'utente
 * @response {redirect} /home - In caso di successo
 * @response {render} auth - In caso di errore
 */
router.post('/login', (req, res) => {
    authController.login(req, res);
});

/**
 * Gestisce la richiesta di registrazione
 * Crea un nuovo utente e la relativa sessione
 * 
 * @route POST /register
 * @body {string} nome - Nome dell'utente
 * @body {string} cognome - Cognome dell'utente
 * @body {string} email - Email dell'utente
 * @body {string} password - Password dell'utente
 * @response {redirect} /home - In caso di successo
 * @response {render} auth - In caso di errore
 */
router.post('/register', (req, res) => {
    authController.register(req, res);
});

/**
 * Gestisce la richiesta di logout
 * Distrugge la sessione utente e reindirizza al login
 * 
 * @route POST /logout
 * @response {redirect} /login - Dopo la distruzione della sessione
 */
router.post('/logout', (req, res) => {
    authController.logout(req, res);
});

/**
 * Gestisce la richiesta di invio codice reset password
 * @route POST /reset-password
 */
router.post('/reset-password', (req, res) => {
    authController.requestPasswordReset(req, res);
});

/**
 * Gestisce la verifica del codice di reset password
 * @route POST /verify-code
 */
router.post('/verify-code', (req, res) => {
    authController.verifyResetCode(req, res);
});

/**
 * Gestisce il reset della password dopo la verifica del codice
 * @route POST /new-password
 */
router.post('/new-password', (req, res) => {
    authController.resetPassword(req, res);
});

module.exports = router; 