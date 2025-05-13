const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const Utente = require('../models/Utente');
const { Team, TeamUtente } = require('../models/Team');
const bcrypt = require('bcrypt');
const { sendAccountDeletionEmail } = require('../utils/emailService');
const { validateUserData } = require('../utils/validator');

// Funzione per verificare l'autenticazione
const checkAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Utente non autenticato' });
    }
    next();
};

// GET /api/users - Ottieni tutti gli utenti
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

// GET /api/users/current - Ottieni l'utente corrente
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

// GET /api/users/:id - Ottieni un singolo utente
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

// GET /api/users/team/:teamId - Ottieni tutti gli utenti di un team specifico
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

// POST /api/users - Crea un nuovo utente
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

// PUT /api/users/:id - Aggiorna un utente esistente
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cognome, email, password, ruolo } = req.body;

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
                message: 'Un amministratore non può eliminare il proprio account' 
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