/**
 * Router per la gestione delle task
 * Implementa le API REST per la gestione completa delle task nella board Kanban
 * 
 * Funzionalità principali:
 * - CRUD completo delle task
 * - Spostamento task tra colonne (drag & drop)
 * - Assegnazione task agli utenti
 * - Gestione stati e priorità
 * - Logging delle operazioni
 * 
 * Stati possibili:
 * - da_fare: Task da iniziare
 * - in_corso: Task in lavorazione
 * - in_revisione: Task in fase di review
 * - completati: Task terminate
 * 
 * Priorità:
 * - alta: Task urgenti
 * - media: Task importanti
 * - bassa: Task normali
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const logger = require('../utils/logger');

/**
 * Rotte CRUD per la gestione delle task
 * Implementano le operazioni base sulla risorsa task
 */

/**
 * Crea una nuova task nel progetto
 * 
 * @route POST /api/tasks
 * @access Private
 * @body {string} titolo - Titolo della task
 * @body {string} descrizione - Descrizione dettagliata
 * @body {string} projectId - ID del progetto associato
 * @body {string} [userId] - ID dell'utente assegnato (opzionale)
 * @body {string} priorita - Livello di priorità (alta, media, bassa)
 * @body {number} peso - Peso/complessità della task (1-5)
 * @body {string} [scadenza] - Data di scadenza (opzionale)
 * @body {string} [colore] - Colore per la visualizzazione
 * @returns {Object} Task creata con tutti i dettagli
 * @throws {Error} 400 se dati non validi, 500 se errore server
 */
router.post('/', taskController.createTask);

/**
 * Recupera tutte le task di un progetto
 * Include dettagli dell'utente assegnato e stato
 * 
 * @route GET /api/tasks/:projectId
 * @access Private
 * @param {string} projectId - ID del progetto
 * @returns {Array} Lista delle task con dettagli completi
 * @throws {Error} 404 se progetto non trovato, 500 se errore server
 */
router.get('/:projectId', taskController.getTasks);

/**
 * Aggiorna una task esistente
 * Gestisce modifiche a titolo, descrizione, assegnazione, priorità
 * 
 * @route PUT /api/tasks/:id
 * @access Private
 * @param {string} id - ID della task
 * @body {string} [titolo] - Nuovo titolo
 * @body {string} [descrizione] - Nuova descrizione
 * @body {string} [userId] - Nuovo utente assegnato
 * @body {string} [priorita] - Nuova priorità
 * @body {number} [peso] - Nuovo peso
 * @body {string} [scadenza] - Nuova scadenza
 * @body {string} [colore] - Nuovo colore
 * @returns {Object} Task aggiornata
 * @throws {Error} 404 se non trovata, 403 se non autorizzato
 */
router.put('/:id', taskController.updateTask);

/**
 * Elimina una task
 * Verifica autorizzazione dell'utente
 * 
 * @route DELETE /api/tasks/:id
 * @access Private
 * @param {string} id - ID della task
 * @returns {Object} Messaggio di conferma
 * @throws {Error} 404 se non trovata, 403 se non autorizzato
 */
router.delete('/:id', taskController.deleteTask);

/**
 * Rotte per operazioni specifiche
 * Gestiscono funzionalità aggiuntive oltre al CRUD base
 */

/**
 * Sposta una task tra le colonne della board
 * Gestisce il drag & drop e aggiorna lo stato
 * 
 * @route PUT /api/tasks/:id/move
 * @access Private
 * @param {string} id - ID della task
 * @body {string} stato - Nuovo stato della task
 * @returns {Object} Task aggiornata con nuovo stato
 * @throws {Error} 404 se non trovata, 400 se stato non valido
 * 
 * @example
 * // Sposta una task in "in_corso"
 * PUT /api/tasks/123/move
 * body: { stato: "in_corso" }
 */
router.put('/:id/move', taskController.moveTask);

module.exports = router; 