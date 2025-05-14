/**
 * Controller per la gestione dell'autenticazione
 * Gestisce le operazioni di registrazione, login e logout degli utenti
 * Implementa validazioni di sicurezza e gestione delle sessioni
 * 
 * Funzionalità principali:
 * - Registrazione nuovo utente con validazioni
 * - Login con gestione sessione sicura
 * - Logout con pulizia sessione
 * - Validazione password e email
 * - Formattazione dati utente
 */

const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const securityConfig = require('../config/security');
const messages = require('../config/messages');
const Utente = require('../models/Utente');
const { validateUserData } = require('../utils/validator');
const { sendConfirmationEmail, sendResetCodeEmail } = require('../utils/emailService');

/**
 * Formatta nome e cognome con iniziale maiuscola
 * Esempio: "mario rossi" -> "Mario Rossi"
 * 
 * @param {string} name - Il nome o cognome da formattare
 * @returns {string} Nome/cognome formattato con iniziale maiuscola
 * 
 * Processo:
 * 1. Converte tutto in minuscolo
 * 2. Divide la stringa in parole
 * 3. Capitalizza la prima lettera di ogni parola
 * 4. Riunisce le parole
 */
const formatName = (name) => {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Registra un nuovo utente nel sistema
 * 
 * @param {Object} req - Request object contenente i dati dell'utente
 * @param {Object} res - Response object
 * 
 * Processo:
 * 1. Validazione dati in input
 * 2. Verifica email non già registrata
 * 3. Hash della password
 * 4. Creazione utente nel database
 * 5. Creazione sessione
 */
const register = async (req, res) => {
    try {
        // Controllo che la checkbox dei termini sia selezionata
        if (!req.body.terms) {
            return res.status(400).json({
                success: false,
                message: 'Devi accettare i termini e le condizioni per registrarti.'
            });
        }

        const userData = {
            nome: req.body.nome,
            cognome: req.body.cognome,
            email: req.body.email,
            password: req.body.password
        };

        // Validazione dei dati
        const errors = validateUserData(userData);
        if (errors) {
            return res.status(400).json({ 
                success: false, 
                message: 'Errori di validazione', 
                errors 
            });
        }

        // Verifica se l'email è già registrata
        const existingUser = await Utente.findOne({ where: { email: userData.email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: messages.auth.emailExists
            });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Formattazione nome e cognome
        userData.nome = formatName(userData.nome);
        userData.cognome = formatName(userData.cognome);

        // Creazione utente
        const user = await Utente.create({
            nome: userData.nome,
            cognome: userData.cognome,
            email: userData.email,
            password_hash: hashedPassword,
            ruolo: 'user'
        });

        // Invia email di conferma
        sendConfirmationEmail(user.email, user.nome);

        // Creazione sessione
        req.session.userId = user.id;
        req.session.userRole = user.ruolo;
        req.session.user = {
            id: user.id,
            nome: user.nome,
            cognome: user.cognome,
            email: user.email,
            ruolo: user.ruolo
        };

        // Reindirizzamento in base al ruolo
        const redirectUrl = user.ruolo === 'admin' ? '/admin' : '/dashboard';

        res.status(201).json({
            success: true,
            message: messages.auth.registrationSuccess,
            user: {
                id: user.id,
                nome: user.nome,
                cognome: user.cognome,
                email: user.email,
                ruolo: user.ruolo
            },
            redirectUrl
        });

    } catch (error) {
        logger.error('Errore durante la registrazione:', error);
        res.status(500).json({
            success: false,
            message: messages.auth.registrationError
        });
    }
};

/**
 * Effettua il login di un utente
 * 
 * @param {Object} req - Request object contenente email e password
 * @param {Object} res - Response object
 * 
 * Processo:
 * 1. Validazione dati in input
 * 2. Verifica esistenza utente
 * 3. Verifica password
 * 4. Creazione sessione
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validazione dei dati di login
        const errors = validateUserData({ email, password });
        if (errors) {
            const loginErrors = {};
            if (errors.email) loginErrors.email = errors.email;
            if (errors.password) loginErrors.password = errors.password;
            
            if (Object.keys(loginErrors).length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Errori di validazione', 
                    errors: loginErrors 
                });
            }
        }

        // Ricerca utente
        const user = await Utente.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: messages.auth.invalidCredentials
            });
        }

        // Verifica password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: messages.auth.invalidCredentials
            });
        }

        // Creazione sessione
        req.session.userId = user.id;
        req.session.userRole = user.ruolo;
        req.session.user = {
            id: user.id,
            nome: user.nome,
            cognome: user.cognome,
            email: user.email,
            ruolo: user.ruolo
        };

        // Determina l'URL di reindirizzamento in base al ruolo
        const redirectUrl = user.ruolo === 'admin' ? '/admin' : '/dashboard';

        res.json({
            success: true,
            message: messages.auth.loginSuccess,
            user: {
                id: user.id,
                nome: user.nome,
                cognome: user.cognome,
                email: user.email,
                ruolo: user.ruolo
            },
            redirectUrl
        });

    } catch (error) {
        logger.error('Errore durante il login:', error);
        res.status(500).json({
            success: false,
            message: messages.auth.loginError
        });
    }
};

/**
 * Effettua il logout dell'utente
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * 
 * Processo:
 * 1. Distruzione sessione
 * 2. Redirect alla pagina di login
 */
const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).render('auth', { activeTab: 'login', error: 'Errore durante il logout' });
            }
            res.redirect('/login');
        });
    } catch (error) {
        logger.error('Errore durante il logout:', error);
        res.status(500).render('auth', { activeTab: 'login', error: 'Errore durante il logout' });
    }
};

/**
 * Gestisce la richiesta di reset password
 * @route POST /reset-password
 * @body {string} email - Email dell'utente
 * @returns {json} success/fail
 */
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email obbligatoria' });
        }
        const user = await Utente.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utente non trovato' });
        }
        // Genera codice di 4 cifre
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        user.codice_password = code;
        await user.save();
        // Invia email con il codice
        await sendResetCodeEmail(user.email, user.nome, code);
        // Cancella automaticamente il codice dopo 5 minuti se non è stato già cambiato
        setTimeout(async () => {
            const freshUser = await Utente.findByPk(user.id);
            if (freshUser && freshUser.codice_password === code) {
                freshUser.codice_password = null;
                await freshUser.save();
            }
        }, 1 * 60 * 1000); // 5 minuti
        return res.json({ success: true, message: 'Codice inviato via email', userId: user.id });
    } catch (error) {
        logger.error('Errore richiesta reset password:', error);
        return res.status(500).json({ success: false, message: 'Errore server' });
    }
};

/**
 * Verifica il codice di reset password
 * @route POST /verify-code
 * @body {number} userId - ID dell'utente
 * @body {string} code - Codice inserito dall'utente
 * @returns {json} success/fail
 */
const verifyResetCode = async (req, res) => {
    try {
        const { userId, code } = req.body;
        if (!userId || !code) {
            return res.status(400).json({ success: false, message: 'ID utente e codice obbligatori' });
        }
        const user = await Utente.findByPk(userId);
        if (!user || !user.codice_password) {
            return res.status(404).json({ success: false, message: 'Utente o codice non trovato' });
        }
        if (user.codice_password !== code) {
            return res.status(401).json({ success: false, message: 'Codice errato' });
        }
        return res.json({ success: true, message: 'Codice corretto' });
    } catch (error) {
        logger.error('Errore verifica codice reset password:', error);
        return res.status(500).json({ success: false, message: 'Errore server' });
    }
};

/**
 * Aggiorna la password dell'utente dopo verifica codice
 * @route POST /new-password
 * @body {number} userId - ID dell'utente
 * @body {string} password - Nuova password
 * @body {string} confirmPassword - Conferma password
 * @returns {json} success/fail
 */
const resetPassword = async (req, res) => {
    try {
        const { userId, password, confirmPassword } = req.body;
        if (!userId || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Tutti i campi sono obbligatori' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Le password non coincidono' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'La password deve essere lunga almeno 8 caratteri' });
        }
        // Puoi aggiungere altri controlli di sicurezza qui (maiuscole, numeri, simboli...)
        const user = await Utente.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utente non trovato' });
        }
        // Aggiorna la password e azzera il codice_password
        user.password_hash = await bcrypt.hash(password, 10);
        // Dopo il reset, il codice_password viene cancellato per sicurezza
        user.codice_password = null;
        await user.save();
        return res.json({ success: true, message: 'Password aggiornata con successo' });
    } catch (error) {
        logger.error('Errore durante il reset password:', error);
        return res.status(500).json({ success: false, message: 'Errore server' });
    }
};

module.exports = {
    register,
    login,
    logout,
    requestPasswordReset,
    verifyResetCode,
    resetPassword
}; 