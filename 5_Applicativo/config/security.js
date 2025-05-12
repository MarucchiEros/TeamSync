/**
 * Configurazioni di Sicurezza dell'Applicazione
 * Questo modulo gestisce tutte le impostazioni relative alla sicurezza
 * dell'applicazione, incluse sessioni, autenticazione, CORS, headers e rate limiting.
 */

module.exports = {
    /**
     * Configurazioni della Sessione
     * Gestisce come le sessioni utente vengono create e mantenute
     * 
     * @property {string} secret - Chiave segreta per firmare i cookie di sessione
     * @property {boolean} resave - Evita il salvataggio della sessione se non modificata
     * @property {boolean} saveUninitialized - Non salva sessioni non inizializzate
     * @property {Object} cookie - Configurazione dei cookie di sessione
     *   - secure: Attivo solo in produzione (HTTPS)
     *   - httpOnly: Previene accesso via JavaScript
     *   - maxAge: Durata del cookie (24 ore)
     *   - sameSite: Protezione contro attacchi CSRF
     */
    session: {
        secret: process.env.SESSION_SECRET || 'il-tuo-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 ore
            sameSite: 'strict'
        }
    },

    /**
     * Configurazioni dell'Autenticazione
     * Definisce i parametri di sicurezza per l'autenticazione degli utenti
     * 
     * @property {number} maxLoginAttempts - Numero massimo di tentativi di login
     * @property {number} lockTime - Durata del blocco dopo troppi tentativi (15 minuti)
     * @property {number} passwordMinLength - Lunghezza minima della password
     * @property {number} sessionDuration - Durata massima della sessione
     * @property {number} verificationTokenExpiry - Scadenza del token di verifica
     */
    auth: {
        maxLoginAttempts: 500,
        lockTime: 15 * 60 * 1000, // 15 minuti
        passwordMinLength: 8,
        sessionDuration: 24 * 60 * 60 * 1000, // 24 ore
        verificationTokenExpiry: 24 * 60 * 60 * 1000 // 24 ore
    },

    /**
     * Configurazioni CORS (Cross-Origin Resource Sharing)
     * Gestisce le politiche di accesso da domini esterni
     * 
     * @property {string} origin - Domini autorizzati (da variabile d'ambiente)
     * @property {boolean} credentials - Permette l'invio di credenziali (cookies)
     */
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    },

    /**
     * Configurazioni Helmet
     * Imposta gli header HTTP di sicurezza
     * 
     * Content Security Policy (CSP):
     * - defaultSrc: Risorse predefinite solo dal proprio dominio
     * - scriptSrc: JavaScript dal proprio dominio e inline
     * - styleSrc: CSS dal proprio dominio, inline e Google Fonts
     * - fontSrc: Font dal proprio dominio e Google Fonts
     * - imgSrc: Immagini dal proprio dominio, data URLs e HTTPS
     * - connectSrc: Connessioni WebSocket/AJAX solo dal proprio dominio
     */
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"]
            }
        }
    },

    /**
     * Configurazioni Rate Limiter
     * Protegge da attacchi DDoS e abusi delle API
     * 
     * @property {number} windowMs - Finestra temporale per il conteggio (1 minuto)
     * @property {number} max - Numero massimo di richieste nella finestra
     * @property {string} message - Messaggio di errore per limite superato
     * @property {boolean} standardHeaders - Abilita header standard di rate limit
     * @property {boolean} legacyHeaders - Disabilita header legacy
     */
    rateLimit: {
        windowMs: 60 * 1000,
        max: 1000,
        message: 'Troppe richieste, riprova più tardi.',
        standardHeaders: true, 
        legacyHeaders: false 
    }
}; 