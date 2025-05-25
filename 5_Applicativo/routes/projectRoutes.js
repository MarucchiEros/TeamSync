/**
 * Router per la gestione dei progetti
 * Implementa le API REST per la gestione completa dei progetti
 * 
 * Funzionalità principali:
 * - CRUD completo dei progetti
 * - Assegnazione team ai progetti
 * - Gestione stati progetto
 * - Verifica permessi utente
 * - Logging delle operazioni
 * 
 * Struttura API:
 * - GET /api/projects - Lista progetti
 * - GET /api/projects/:id - Dettaglio progetto
 * - POST /api/projects - Creazione progetto
 * - PUT /api/projects/:id - Modifica progetto
 * - DELETE /api/projects/:id - Eliminazione progetto
 */

const express = require('express');
const router = express.Router();
const Progetto = require('../models/Project');
const { Team } = require('../models/Team');
const logger = require('../utils/logger');
const Utente = require('../models/Utente');
const { sendProjectAssignmentEmail } = require('../utils/emailService');
const { sequelize } = require('../config/database');
const { validateProjectData } = require('../utils/validator');
const TaskJson = require('../models/TaskJson');

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
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Non autorizzato' });
    }
};

/**
 * Middleware per verifica ruolo admin
 * Protegge le rotte che richiedono privilegi amministrativi
 * 
 * @middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 * @returns {Object} 403 se non admin
 */
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.ruolo === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Accesso negato' });
    }
};

/**
 * Recupera tutti i progetti dell'utente
 * Include i dettagli del team e dei membri
 * 
 * @route GET /api/projects
 * @access Private
 * @returns {Object} Lista progetti con team e membri
 * @throws {Error} 500 se errore nel recupero
 */
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const progetti = await Progetto.findAll({
            where: { creato_da: req.session.user.id },
            include: [{
                model: Team,
                include: [{
                    model: require('../models/Utente'),
                    attributes: ['id', 'nome', 'cognome']
                }]
            }]
        });

        res.json({
            success: true,
            progetti: progetti.map(p => p.get({ plain: true }))
        });
    } catch (error) {
        logger.error(`Errore nel recupero dei progetti: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero dei progetti'
        });
    }
});

/**
 * Recupera un singolo progetto
 * Verifica che l'utente sia il creatore o un membro del team
 * 
 * @route GET /api/projects/:id
 * @access Private
 * @param {string} id - ID del progetto
 * @returns {Object} Dettagli progetto con team e membri
 * @throws {Error} 404 se non trovato, 500 se errore
 */
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const progetto = await Progetto.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: Team,
                include: [{
                    model: require('../models/Utente'),
                    attributes: ['id', 'nome', 'cognome']
                }]
            }]
        });

        if (!progetto) {
            return res.status(404).json({
                success: false,
                message: 'Progetto non trovato'
            });
        }

        // Verifica che l'utente sia il creatore o un membro del team
        const isCreator = progetto.creato_da === req.session.user.id;
        const isTeamMember = progetto.Team && progetto.Team.Utentes.some(u => u.id === req.session.user.id);
        const isAdmin = req.session.user.ruolo === 'admin';

        if (!isCreator && !isTeamMember && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Non hai i permessi per accedere a questo progetto'
            });
        }

        res.json({
            success: true,
            progetto: progetto.get({ plain: true })
        });
    } catch (error) {
        logger.error(`Errore nel recupero del progetto: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero del progetto'
        });
    }
});

/**
 * Crea un nuovo progetto
 * Gestisce l'assegnazione opzionale del team e la validazione dei dati
 * 
 * @route POST /api/projects
 * @access Private
 * @body {string} nome - Nome del progetto
 * @body {string} descrizione - Descrizione del progetto
 * @body {string} team_id - ID del team (opzionale)
 * @body {Date} scadenza - Data di scadenza (opzionale)
 * @returns {Object} Progetto creato con dettagli
 * @throws {Error} 400 se team non valido, 500 se errore
 */
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { nome, descrizione, team_id, scadenza, stato } = req.body;
        // Validazione dati progetto
        const errors = validateProjectData({ nome, descrizione, team_id, scadenza, stato });
        if (errors) {
            return res.status(400).json({ success: false, message: Object.values(errors).join('. ') });
        }

        // Normalizzazione della data di scadenza
        let scadenzaDate = null;
        if (scadenza) {
            scadenzaDate = new Date(scadenza);
            if (isNaN(scadenzaDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato data di scadenza non valido'
                });
            }
        }

        // Verifica se il team esiste e l'utente ha i permessi
        let team = null;
        if (team_id) {
            team = await Team.findByPk(team_id, {
                include: [{
                    model: Utente,
                    attributes: ['id', 'nome', 'email']
                }]
            });

            if (!team) {
                return res.status(400).json({
                    success: false,
                    message: 'Team non trovato'
                });
            }

            // Verifica se l'utente è admin o membro del team
            const isTeamMember = team.Utentes.some(u => u.id === req.session.user.id);
            if (!isTeamMember && req.session.user.ruolo !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Non hai i permessi per assegnare questo team'
                });
            }
        }

        // Creazione del progetto con gestione delle transazioni
        const result = await sequelize.transaction(async (t) => {
            const progetto = await Progetto.create({
                nome: nome.trim(),
                descrizione: descrizione ? descrizione.trim() : null,
                creato_da: req.session.user.id,
                team_id,
                scadenza: scadenzaDate
            }, { transaction: t });

            // Se è stato assegnato un team, invia le notifiche
            if (team && team.Utentes) {
                const progettoData = {
                    nomeProgetto: nome.trim(),
                    nomeTeam: team.nome,
                    scadenza: scadenzaDate,
                    progettoId: progetto.id
                };

                // Invia email in parallelo
                await Promise.all(team.Utentes.map(utente => 
                    sendProjectAssignmentEmail(
                        utente.email,
                        utente.nome,
                        progettoData
                    ).catch(err => {
                        logger.error(`Errore nell'invio email a ${utente.email}:`, err);
                        // Non blocchiamo la transazione per errori di email
                    })
                ));
            }

            return progetto;
        });

        res.status(201).json({
            success: true,
            message: 'Progetto creato con successo',
            progetto: result
        });

    } catch (error) {
        logger.error('Errore durante la creazione del progetto:', error);
        
        // Gestione errori specifici
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dati non validi',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Errore durante la creazione del progetto'
        });
    }
});

/**
 * Aggiorna un progetto esistente
 * Gestisce permessi differenziati tra admin e utenti
 * 
 * Permessi:
 * - Admin: può modificare tutto, incluso lo stato
 * - Creatore: può modificare tutto tranne lo stato
 * - Altri: non possono modificare
 * 
 * Stati validi:
 * - attivo
 * - completato
 * 
 * @route PUT /api/projects/:id
 * @access Private
 * @param {string} id - ID del progetto
 * @body {string} nome - Nuovo nome
 * @body {string} descrizione - Nuova descrizione
 * @body {string} team_id - Nuovo team
 * @body {Date} scadenza - Nuova scadenza
 * @body {string} stato - Nuovo stato (solo admin)
 * @returns {Object} Progetto aggiornato
 * @throws {Error} 403 se non autorizzato, 404 se non trovato
 */
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { nome, descrizione, scadenza, team_id, stato } = req.body;
        // Validazione dati progetto
        const errors = validateProjectData({ nome, descrizione, team_id, scadenza, stato });
        if (errors) {
            return res.status(400).json({ success: false, message: Object.values(errors).join('. ') });
        }
        const progetto = await Progetto.findByPk(req.params.id);

        if (!progetto) {
            return res.status(404).json({
                success: false,
                message: 'Progetto non trovato'
            });
        }

        // Verifica se l'utente è il creatore del progetto o un admin
        const isCreator = progetto.creato_da === req.session.user.id;
        const isUserAdmin = req.session.user.ruolo === 'admin';

        if (!isCreator && !isUserAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Non hai i permessi per modificare questo progetto'
            });
        }

        // Prepara i dati per l'aggiornamento
        const updateData = {
            nome: nome || progetto.nome,
            descrizione: descrizione || progetto.descrizione,
            team_id: team_id || progetto.team_id
        };

        // Gestione della data di scadenza
        if (scadenza) {
            const scadenzaDate = new Date(scadenza);
            if (isNaN(scadenzaDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato data di scadenza non valido'
                });
            }
            updateData.scadenza = scadenzaDate;
        }

        // Solo l'admin può modificare lo stato
        if (isUserAdmin && stato) {
            if (!['attivo', 'completato'].includes(stato)) {
                return res.status(400).json({
                    success: false,
                    message: 'Stato non valido. Gli stati permessi sono: attivo, completato'
                });
            }
            updateData.stato = stato;
        }

        // Esegui l'aggiornamento in una transazione
        const result = await sequelize.transaction(async (t) => {
            // Aggiorna il progetto
            await progetto.update(updateData, { transaction: t });

            // Se viene cambiato il team, gestisci le notifiche
            if (team_id && team_id !== progetto.team_id) {
                const team = await Team.findByPk(team_id, {
                    include: [{
                        model: Utente,
                        attributes: ['id', 'nome', 'email']
                    }],
                    transaction: t
                });

                if (team && team.Utentes) {
                    const progettoData = {
                        nomeProgetto: updateData.nome,
                        nomeTeam: team.nome,
                        scadenza: updateData.scadenza,
                        progettoId: progetto.id
                    };

                    // Invia email in parallelo senza bloccare la transazione
                    team.Utentes.forEach(utente => {
                        sendProjectAssignmentEmail(
                            utente.email,
                            utente.nome,
                            progettoData
                        ).catch(err => {
                            logger.error(`Errore nell'invio email a ${utente.email}:`, err);
                        });
                    });
                }
            }

            // Recupera il progetto aggiornato con le relazioni
            return Progetto.findByPk(progetto.id, {
                include: [{
                    model: Team,
                    include: [{
                        model: Utente,
                        attributes: ['id', 'nome', 'cognome']
                    }]
                }],
                transaction: t
            });
        });

        return res.json({
            success: true,
            progetto: result
        });

    } catch (error) {
        logger.error('Errore durante l\'aggiornamento del progetto:', error);
        return res.status(500).json({
            success: false,
            message: 'Errore durante l\'aggiornamento del progetto',
            error: error.message
        });
    }
});

/**
 * Aggiorna lo stato di un progetto
 * Endpoint dedicato per l'aggiornamento dello stato
 * 
 * @route PUT /api/projects/:id/status
 * @access Private
 * @param {string} id - ID del progetto
 * @body {string} stato - Nuovo stato (attivo/completato)
 */
router.put('/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { stato } = req.body;
        const progetto = await Progetto.findByPk(req.params.id);

        if (!progetto) {
            return res.status(404).json({
                success: false,
                message: 'Progetto non trovato'
            });
        }

        // Verifica che lo stato sia valido
        if (!['attivo', 'completato'].includes(stato)) {
            return res.status(400).json({
                success: false,
                message: 'Stato non valido. Gli stati permessi sono: attivo, completato'
            });
        }

        await progetto.update({ stato });

        res.json({
            success: true,
            message: `Stato del progetto aggiornato a: ${stato}`,
            progetto
        });
    } catch (error) {
        logger.error(`Errore nell'aggiornamento dello stato del progetto: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiornamento dello stato del progetto'
        });
    }
});

/**
 * Elimina un progetto
 * Verifica che l'utente sia il creatore
 * 
 * @route DELETE /api/projects/:id
 * @access Private
 * @param {string} id - ID del progetto
 * @returns {Object} Messaggio di conferma
 * @throws {Error} 404 se non trovato, 500 se errore
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const where = { id: req.params.id };
        if (req.session.user.ruolo !== 'admin') {
            where.creato_da = req.session.user.id;
        }
        const progetto = await Progetto.findOne({ where });

        if (!progetto) {
            return res.status(404).json({
                success: false,
                message: 'Progetto non trovato'
            });
        }

        // Elimina tutte le task collegate a questo progetto
        await TaskJson.destroy({ where: { projectId: progetto.id } });
        // Ora elimina il progetto
        await progetto.destroy();

        res.status(200).json({
            success: true,
            message: 'Progetto eliminato con successo'
        });
    } catch (error) {
        logger.error(`Errore nell'eliminazione del progetto: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'eliminazione del progetto'
        });
    }
});

/**
 * GET /api/projects/:id/team-members
 * Recupera tutti i membri del team associato al progetto
 */
router.get('/:id/team-members', isAuthenticated, async (req, res) => {
    try {
        const projectId = req.params.id;

        // Recupera il progetto con il team associato
        const project = await Progetto.findByPk(projectId, {
            include: [{
                model: Team,
                include: [{
                    model: Utente,
                    attributes: ['id', 'nome', 'cognome', 'email'],
                    through: { attributes: [] } // Esclude gli attributi della tabella di join
                }]
            }]
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Progetto non trovato'
            });
        }

        if (!project.Team) {
            return res.status(404).json({
                success: false,
                message: 'Nessun team associato al progetto'
            });
        }

        // Estrai i membri del team
        const members = project.Team.Utentes;

        res.json({
            success: true,
            members
        });

    } catch (error) {
        logger.error('Errore nel recupero dei membri del team:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero dei membri del team'
        });
    }
});

module.exports = router; 