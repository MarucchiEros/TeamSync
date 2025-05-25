const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const Utente = require('../models/Utente');
const { Team, TeamUtente } = require('../models/Team');
const bcrypt = require('bcrypt');
const { sendAccountDeletionEmail } = require('../utils/emailService');
const { validateUserData } = require('../utils/validator');

/**
 * Middleware di autenticazione
 * Verifica che l'utente sia loggato per accedere alle API
 *
 * @middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 * @returns {Object} 401 se non autenticato
 */
const checkAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Utente non autenticato' });
    }
    next();
};

/**
 * Recupera tutti gli utenti
 *
 * @route GET /api/users
 * @access Private
 * @returns {Array} Lista utenti senza password
 * @throws {Error} 500 se errore nel recupero
 */
router.get('/', checkAuth, async (req, res) => {
    try {
        const utenti = await Utente.findAll({
            attributes: { exclude: ['password_hash'] }
        });
        res.json(utenti);
    } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
});

/**
 * Recupera l'utente corrente
 *
 * @route GET /api/users/current
 * @access Private
 * @returns {Object} Utente corrente senza password
 * @throws {Error} 404 se non trovato, 500 se errore
 */
router.get('/current', checkAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const utente = await Utente.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json(utente);
    } catch (error) {
        console.error('Errore nel recupero dell\'utente corrente:', error);
        res.status(500).json({ message: 'Errore nel recupero dell\'utente corrente' });
    }
});

/**
 * Recupera un singolo utente tramite ID
 *
 * @route GET /api/users/:id
 * @access Private
 * @param {string} id - ID dell'utente
 * @returns {Object} Dettaglio utente senza password
 * @throws {Error} 404 se non trovato, 500 se errore
 */
router.get('/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const utente = await Utente.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json(utente);
    } catch (error) {
        console.error('Errore nel recupero dell\'utente:', error);
        res.status(500).json({ message: 'Errore nel recupero dell\'utente' });
    }
});

/**
 * Recupera tutti gli utenti di un team specifico
 *
 * @route GET /api/users/team/:teamId
 * @access Private
 * @param {string} teamId - ID del team
 * @returns {Array} Lista utenti del team
 * @throws {Error} 404 se team non trovato, 500 se errore
 */
router.get('/team/:teamId', checkAuth, async (req, res) => {
    try {
        const { teamId } = req.params;
        
        const team = await Team.findByPk(teamId, {
            include: [{
                model: Utente,
                attributes: { exclude: ['password_hash'] },
                through: { attributes: [] }
            }]
        });

        if (!team) {
            return res.status(404).json({ message: 'Team non trovato' });
        }

        res.json(team.Utentes);
    } catch (error) {
        console.error('Errore nel recupero degli utenti del team:', error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti del team' });
    }
});

/**
 * Crea un nuovo utente
 *
 * @route POST /api/users
 * @access Private
 * @body {string} nome - Nome dell'utente
 * @body {string} cognome - Cognome dell'utente
 * @body {string} email - Email dell'utente
 * @body {string} password - Password dell'utente
 * @body {string} ruolo - Ruolo dell'utente
 * @returns {Object} Utente creato senza password
 * @throws {Error} 400 se dati non validi o email già in uso, 500 se errore
 */
router.post('/', checkAuth, async (req, res) => {
    try {
        const { nome, cognome, email, password, ruolo } = req.body;

        // Validazione dati utente
        const errors = validateUserData({ nome, cognome, email, password, ruolo });
        if (errors) {
            return res.status(400).json({ message: Object.values(errors).join('. ') });
        }

        // Verifica se l'email è già in uso
        const existingUser = await Utente.findOne({ 
            where: { 
                email: email 
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email già in uso' });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea il nuovo utente
        const nuovoUtente = await Utente.create({
            nome,
            cognome,
            email,
            password_hash: hashedPassword,
            ruolo
        });

        // Rimuovi la password dalla risposta
        const utenteSenzaPassword = {
            id: nuovoUtente.id,
            nome: nuovoUtente.nome,
            cognome: nuovoUtente.cognome,
            email: nuovoUtente.email,
            ruolo: nuovoUtente.ruolo
        };

        res.status(201).json({
            message: 'Utente creato con successo',
            utente: utenteSenzaPassword
        });
    } catch (error) {
        console.error('Errore nella creazione dell\'utente:', error);
        res.status(500).json({ message: 'Errore nella creazione dell\'utente' });
    }
});

/**
 * Aggiorna un utente esistente
 *
 * @route PUT /api/users/:id
 * @access Private
 * @param {string} id - ID dell'utente
 * @body {string} [nome] - Nuovo nome
 * @body {string} [cognome] - Nuovo cognome
 * @body {string} [email] - Nuova email
 * @body {string} [password] - Nuova password
 * @body {string} [ruolo] - Nuovo ruolo
 * @returns {Object} Utente aggiornato senza password
 * @throws {Error} 404 se non trovato, 400 se email già in uso, 500 se errore
 */
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cognome, email, password, ruolo } = req.body;

        // BLOCCO: un admin non può cambiarsi da solo il ruolo
        if (
            req.session.user &&
            req.session.user.ruolo === 'admin' &&
            req.session.user.id === parseInt(id) &&
            ruolo !== 'admin'
        ) {
            return res.status(403).json({
                message: 'Un amministratore non può cambiare il proprio ruolo.'
            });
        }

        const utente = await Utente.findByPk(id);
        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Verifica se l'email è già in uso da un altro utente
        if (email !== utente.email) {
            const existingUser = await Utente.findOne({ 
                where: { 
                    email: email,
                    id: { [Sequelize.Op.ne]: id }
                }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email già in uso' });
            }
        }

        // Aggiorna i dati dell'utente
        utente.nome = nome;
        utente.cognome = cognome;
        utente.email = email;
        utente.ruolo = ruolo;

        // Aggiorna la password solo se fornita
        if (password) {
            utente.password_hash = await bcrypt.hash(password, 10);
        }

        await utente.save();

        // Rimuovi la password dalla risposta
        const utenteSenzaPassword = {
            id: utente.id,
            nome: utente.nome,
            cognome: utente.cognome,
            email: utente.email,
            ruolo: utente.ruolo
        };

        res.json({
            message: 'Utente aggiornato con successo',
            utente: utenteSenzaPassword
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'utente:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'utente' });
    }
});

// DELETE /api/users/:id - Elimina un utente
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Impedisce a un admin di eliminare se stesso
        if (req.session.user.ruolo === 'admin' && req.session.user.id === parseInt(id)) {
            return res.status(403).json({ 
                success: false,
                message: 'Un amministratore non può eliminare un altro amministratore' 
            });
        }

        const utente = await Utente.findByPk(id);
        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Salva i dati dell'utente prima di eliminarlo
        const userData = {
            email: utente.email,
            nome: utente.nome
        };

        // Elimina l'utente
        await utente.destroy();

        // Invia email di conferma cancellazione
        sendAccountDeletionEmail(userData.email, userData.nome);

        res.json({ message: 'Utente eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
        res.status(500).json({ message: 'Errore nell\'eliminazione dell\'utente' });
    }
});

module.exports = router; 