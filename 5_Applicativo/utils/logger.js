/**
 * @module logger
 * @description Modulo per la gestione centralizzata dei log dell'applicazione.
 * Implementa un sistema di logging avanzato utilizzando Winston come logger principale.
 * 
 * Caratteristiche principali:
 * - Rotazione automatica dei file di log basata sulla data
 * - Separazione dei log di errore dai log generali
 * - Formattazione personalizzata dei messaggi con timestamp in formato italiano
 * - Livelli di log multipli (error, warn, info, debug)
 * 
 * @requires winston - Libreria principale per il logging
 * @requires path - Gestione dei percorsi dei file
 */

const winston = require('winston');
const path = require('path');

/**
 * Genera una stringa rappresentante la data corrente nel formato YYYY-MM-DD
 * Utilizzata per la denominazione dei file di log
 * 
 * @function getDateString
 * @private
 * @returns {string} Data formattata (es. "2024-03-21")
 */
const getDateString = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
};

/**
 * Formato personalizzato per i messaggi di log
 * Struttura: [LIVELLO] [DATA ORA] Messaggio
 * 
 * @example
 * // Output esempio:
 * // [ERROR] [21/03/2024 15:30:45] Errore di connessione al database
 * 
 * @private
 */
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Mappatura dei livelli per una visualizzazione consistente
    const levelNames = {
        error: 'ERROR',  // Errori critici che richiedono attenzione immediata
        warn: 'WARN',    // Avvertimenti che non bloccano l'esecuzione
        info: 'INFO',    // Informazioni generali sul funzionamento
        debug: 'DEBUG'   // Dettagli utili per il debugging
    };

    return `[${levelNames[level] || level.toUpperCase()}] [${formattedDate}] ${message}`;
});

/**
 * Istanza principale del logger configurata con:
 * - Livello base: info (registra info, warn, error)
 * - Due transport separati:
 *   1. File per soli errori (error-YYYY-MM-DD.log)
 *   2. File per tutti i log (log-YYYYMMDD.log)
 * 
 * @example
 * // Utilizzo del logger
 * logger.error('Errore critico', { dettagli: 'Descrizione dettagliata' });
 * logger.info('Operazione completata con successo');
 * logger.warn('Attenzione: risorsa quasi esaurita');
 */
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
    ),
    transports: [
        // Transport dedicato agli errori
        new winston.transports.File({ 
            filename: path.join('logs', `error-${getDateString()}.log`), 
            level: 'error' 
        }),
        // Transport per tutti i livelli di log
        new winston.transports.File({ 
            filename: path.join('logs', `log-${getDateString().replace(/-/g, '')}.log`)
        })
    ]
});

module.exports = logger; 