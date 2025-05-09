/**
 * Middleware per la gestione centralizzata degli errori
 * Gestisce e formatta le risposte di errore in base all'ambiente
 * 
 * Funzionalità principali:
 * - Gestione errori operazionali e di programmazione
 * - Formattazione consistente delle risposte di errore
 * - Logging dettagliato degli errori
 * - Differenziazione tra ambiente di sviluppo e produzione
 * 
 * Formato risposta errore:
 * {
 *   success: false,
 *   message: "Messaggio principale dell'errore",
 *   details: ["Dettagli specifici dell'errore"],
 *   example: "Esempio di input/azione corretta",
 *   stack: "Stack trace (solo in development)"
 * }
 */

const AppError = require('./AppError');
const logger = require('./logger');

/**
 * Middleware globale per la gestione degli errori
 * Intercetta e formatta tutti gli errori dell'applicazione
 * 
 * Processo di gestione:
 * 1. Normalizzazione dell'errore (status code, timestamp, etc.)
 * 2. Logging dell'errore con contesto
 * 3. Formattazione della risposta in base all'ambiente
 * 4. Invio risposta al client
 * 
 * Comportamento per ambiente:
 * - Development: Mostra tutti i dettagli incluso stack trace
 * - Production: Nasconde dettagli sensibili per errori non operazionali
 * 
 * @middleware
 * @param {Error|AppError} err - Oggetto errore (standard o personalizzato)
 * @param {Object} req - Request object di Express
 * @param {Object} res - Response object di Express
 * @param {Function} next - Next middleware function
 * 
 * @example
 * // Errore operazionale (es. validazione)
 * app.use((err, req, res, next) => {
 *   // Risposta include dettagli completi
 *   // { success: false, message: "Email non valida", details: [...] }
 * });
 * 
 * @example
 * // Errore di programmazione in produzione
 * app.use((err, req, res, next) => {
 *   // Risposta generica sicura
 *   // { success: false, message: "Errore interno" }
 * });
 */
const errorHandler = (err, req, res, next) => {
    // Normalizza i campi dell'errore con valori di default
    err.statusCode = err.statusCode || 500;        // Default: Internal Server Error
    err.status = err.status || 'error';            // Default: error (vs fail per 4xx)
    err.timestamp = new Date().toISOString();      // Aggiunge timestamp per tracking
    err.path = req.path;                           // URL richiesta
    err.method = req.method;                       // Metodo HTTP

    // Log dettagliato dell'errore con contesto della richiesta
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (err.details) {
        logger.error('Dettagli errore:', err.details);
    }

    // Gestione speciale per ambiente di produzione
    // Nasconde dettagli sensibili per errori non operazionali
    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        return res.status(500).json({
            success: false,
            message: 'Si è verificato un errore interno',
            details: ['Si è verificato un errore imprevisto'],
            example: 'Riprova più tardi o contatta l\'assistenza se il problema persiste'
        });
    }

    // Risposta standard per errori operazionali o ambiente di sviluppo
    // Include tutti i dettagli disponibili per facilitare il debugging
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        details: err.details || ['Nessun dettaglio disponibile'],
        example: err.example || 'Nessun esempio disponibile',
        // Include stack trace solo in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler; 