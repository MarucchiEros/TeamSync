/**
 * Classe personalizzata per la gestione degli errori dell'applicazione
 * Estende la classe Error nativa di JavaScript per fornire funzionalità aggiuntive
 * 
 * Funzionalità principali:
 * - Gestione errori operazionali vs programmazione
 * - Supporto per codici di stato HTTP
 * - Gestione dettagli errore estesi
 * - Cattura stack trace per debugging
 * 
 * Utilizzo:
 * ```js
 * // Errore semplice
 * throw new AppError('Utente non trovato', 404);
 * 
 * // Errore con dettagli
 * throw new AppError({
 *   message: 'Validazione fallita',
 *   details: { campo: 'email', errore: 'formato non valido' },
 *   example: 'esempio@dominio.it'
 * }, 400);
 * ```
 * 
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
    /**
     * Costruttore della classe AppError
     * Inizializza un nuovo errore personalizzato con dettagli aggiuntivi
     * 
     * Gestisce due formati di input:
     * 1. Stringa semplice per messaggi base
     * 2. Oggetto per errori con dettagli estesi
     * 
     * Codici di stato:
     * - 4xx: Errori client (fail)
     * - 5xx: Errori server (error)
     * 
     * @constructor
     * @param {string|Object} error - Messaggio di errore o oggetto con dettagli
     * @param {string} [error.message] - Messaggio principale dell'errore
     * @param {Object} [error.details] - Dettagli aggiuntivi dell'errore
     * @param {string} [error.example] - Esempio di input corretto
     * @param {number} statusCode - Codice di stato HTTP
     * 
     * @example
     * // Errore di validazione con dettagli
     * new AppError({
     *   message: 'Dati non validi',
     *   details: { password: 'troppo corta' },
     *   example: 'Minimo 8 caratteri'
     * }, 400);
     * 
     * @example
     * // Errore di autenticazione semplice
     * new AppError('Token non valido', 401);
     */
    constructor(error, statusCode) {
        // Chiamata al costruttore della classe padre (Error)
        super(error.message || error);

        // Imposta il codice di stato HTTP
        this.statusCode = statusCode;

        // Determina il tipo di errore basato sul codice di stato
        // 4xx = errore client, 5xx = errore server
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Flag per identificare errori operazionali vs errori di programmazione
        this.isOperational = true;

        // Gestione dettagliata dell'errore se fornito come oggetto
        if (typeof error === 'object') {
            this.message = error.message;      // Messaggio principale
            this.details = error.details;      // Dettagli specifici
            this.example = error.example;      // Esempio di input corretto
        }

        // Cattura lo stack trace escludendo il costruttore
        // Utile per il debugging, mostra dove l'errore è stato generato
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Restituisce una rappresentazione JSON dell'errore
     * Utile per le risposte API
     * 
     * @returns {Object} Oggetto con i dettagli dell'errore
     */
    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            details: this.details,
            example: this.example,
            isOperational: this.isOperational
        };
    }
}

module.exports = AppError; 