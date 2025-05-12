/**
 * Router per la gestione degli errori
 * Definisce i middleware per la gestione di errori 404, timeout e generici
 * 
 * Funzionalità principali:
 * - Gestione pagine non trovate (404)
 * - Gestione timeout delle richieste
 * - Gestione errori server (500)
 * - Logging degli errori
 * 
 * Flusso di gestione errori:
 * 1. La richiesta attraversa i router principali
 * 2. Se nessuna rotta corrisponde -> 404
 * 3. Se la richiesta va in timeout -> 408
 * 4. Se si verifica un errore non gestito -> 500
 * 5. Logging dell'errore
 * 6. Reindirizzamento alla home
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Middleware per la gestione degli errori 404 (Pagina non trovata)
 * Viene eseguito quando nessuna rotta precedente gestisce la richiesta
 * 
 * Processo:
 * 1. Registra l'errore nel log con l'URL richiesto
 * 2. Imposta lo status code 404
 * 3. Reindirizza l'utente alla home
 * 
 * @middleware
 * @param {Object} req - Request object di Express
 * @param {Object} res - Response object di Express
 * @param {Function} next - Funzione per passare al prossimo middleware
 * 
 * @example
 * // Richiesta a una rotta inesistente
 * GET /pagina-non-esistente
 * // Risultato: Log dell'errore e redirect a /
 */
router.use((req, res, next) => {
    logger.error(`404 - Pagina non trovata: ${req.originalUrl}`);
    res.status(404).redirect('/');
});

/**
 * Middleware per la gestione degli errori di timeout
 * Viene eseguito quando una richiesta supera il tempo massimo consentito
 * 
 * Processo:
 * 1. Verifica se la richiesta è andata in timeout
 * 2. Se sì, registra l'errore nel log
 * 3. Imposta lo status code 408 (Request Timeout)
 * 4. Reindirizza l'utente alla home
 * 
 * @middleware
 * @param {Object} req - Request object di Express
 * @param {Object} res - Response object di Express
 * @param {Function} next - Funzione per passare al prossimo middleware
 * 
 * @example
 * // Richiesta che impiega troppo tempo
 * // Configurazione timeout in app.js:
 * // app.use(timeout('5s')); // Timeout dopo 5 secondi
 */
router.use((req, res, next) => {
    if (req.timedout) {
        logger.error('Timeout della richiesta');
        return res.status(408).redirect('/');
    }
    next();
});

/**
 * Middleware per la gestione degli errori generici del server
 * Cattura e gestisce tutti gli errori non gestiti nell'applicazione
 * 
 * Processo:
 * 1. Riceve l'errore dal middleware precedente
 * 2. Registra l'errore completo nel log
 * 3. Imposta lo status code 500 (Internal Server Error)
 * 4. Reindirizza l'utente alla home
 * 
 * @middleware
 * @param {Error} err - Oggetto errore ricevuto
 * @param {Object} req - Request object di Express
 * @param {Object} res - Response object di Express
 * @param {Function} next - Funzione per passare al prossimo middleware
 * 
 * @example
 * // Errore non gestito in un controller
 * router.get('/esempio', (req, res) => {
 *   throw new Error('Errore non gestito');
 *   // Risultato: Log dell'errore e redirect a /
 * });
 */
router.use((err, req, res, next) => {
    logger.error('Errore nel server', { error: err });
    res.status(500).redirect('/');
});

module.exports = router; 