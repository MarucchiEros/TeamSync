/**
 * @file index.js
 * @description File principale dell'applicazione Express
 * Questo file configura e avvia il server con tutte le sue funzionalità:
 * - Configurazione del template engine
 * - Implementazione delle misure di sicurezza
 * - Gestione delle sessioni e dei cookie
 * - Configurazione delle rotte API e pagine
 * - Gestione degli errori centralizzata
 * 
 * Architettura dell'applicazione:
 * - Template Engine: Handlebars (.hbs)
 * - Database: MongoDB (configurato in config/database.js)
 * - Logging: Sistema personalizzato (utils/logger.js)
 * - Sicurezza: Helmet, Rate Limiting, CORS
 */

// ===== IMPORTAZIONE DIPENDENZE =====
/**
 * Dipendenze principali per il server Express
 * @requires express - Framework web
 * @requires express-handlebars - Template engine
 * @requires path - Gestione percorsi
 * @requires express-rate-limit - Limitazione delle richieste
 * @requires express-session - Gestione sessioni
 * @requires helmet - Sicurezza HTTP
 * @requires cookie-parser - Parsing dei cookie
 * @requires cors - Cross-Origin Resource Sharing
 * @requires connect-timeout - Timeout delle richieste
 */
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const timeout = require('connect-timeout');
const { createServer } = require('http');
const { Server } = require('socket.io');
const SocketManager = require('./utils/socketManager');

// ===== IMPORTAZIONE MODULI PERSONALIZZATI =====
/**
 * Moduli sviluppati internamente
 * @requires ./utils/logger - Sistema di logging personalizzato
 * @requires ./utils/errorHandler - Gestione centralizzata degli errori
 * @requires ./config/security - Configurazioni di sicurezza
 * @requires ./config/database - Configurazione e inizializzazione DB
 */
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');
const securityConfig = require('./config/security');
const { initDatabase } = require('./config/database');

/**
 * Caricamento configurazioni da file .env
 * Variabili principali:
 * - PORT: Porta del server (default: 3000)
 * - HOST: Host del server (default: localhost)
 * - COOKIE_SECRET: Chiave per la firma dei cookie
 * - DATABASE_URL: URL di connessione al database
 */
require('dotenv').config({ path: path.join(__dirname, 'config', '.env') });

// ===== INIZIALIZZAZIONE APP =====
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const httpServer = createServer(app);

// Configurazione Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: "*", // In sviluppo accettiamo tutte le origini
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
    // Configurazioni aggiuntive Socket.IO
    pingTimeout: 60000, // Timeout del ping in millisecondi
    pingInterval: 25000, // Intervallo del ping in millisecondi
    transports: ['websocket', 'polling'], // Metodi di trasporto supportati
});

// Inizializza il gestore dei socket
const socketManager = new SocketManager(io);
socketManager.initialize();

/**
 * Configurazione Handlebars come template engine
 * - Estensione file: .hbs
 * - Layout: Disabilitato (gestito manualmente)
 * - Cartella partials: views/partials
 * - Helper personalizzati per la logica di template
 */
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: false,
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: function (v1, v2) { return v1 === v2; }  // Helper per confronti di uguaglianza
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

/**
 * ===== CONFIGURAZIONE SICUREZZA =====
 * Implementazione di multiple misure di sicurezza:
 * 1. Rate Limiting: Previene attacchi brute force
 * 2. Helmet: Headers HTTP di sicurezza
 * 3. CORS: Gestione delle richieste cross-origin
 * 4. Cookie Parser: Gestione sicura dei cookie
 * 5. Session: Gestione delle sessioni utente
 */
const limiter = rateLimit(securityConfig.rateLimit);

app.use(helmet({
    contentSecurityPolicy: false,  // Disabilitiamo temporaneamente CSP
    hsts: false  // Disabilitiamo HSTS per permettere connessioni HTTP
}));
app.use(cors(securityConfig.cors));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(securityConfig.session));
app.use(limiter);

/**
 * Configurazione timeout
 * Imposta un limite di 5 secondi per le richieste
 * Previene il blocco del server su richieste lente
 */
app.use(timeout('5s'));
app.use((req, res, next) => {
    if (!req.timedout) next();
});

/**
 * Configurazione file statici
 * Serve i file dalla cartella 'public'
 * Imposta gli header corretti per i file JavaScript
 */
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Middleware per rendere io e socketManager accessibili in tutte le route
app.use((req, res, next) => {
    req.io = io;
    req.socketManager = socketManager;
    next();
});

/**
 * ===== CONFIGURAZIONE ROTTE =====
 * Organizzazione modulare delle rotte per tipo:
 * - authRoutes: Autenticazione e autorizzazione
 * - pageRoutes: Rendering pagine principali
 * - taskRoutes: API gestione task
 * - projectRoutes: API gestione progetti
 * - userRoutes: API gestione utenti
 * - errorRoutes: Gestione errori 404 e altri
 */
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorRoutes = require('./routes/errorRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');

// Montaggio rotte con prefissi appropriati
app.use('/', authRoutes);           // Rotte di autenticazione
app.use('/api/tasks', taskRoutes);      // API RESTful per i task
app.use('/api/projects', projectRoutes); // API RESTful per i progetti
app.use('/api/users', userRoutes);      // API RESTful per gli utenti
app.use('/', pageRoutes);               // Rotte per le pagine web
app.use(errorRoutes);                   // Gestione 404 e altri errori

// Middleware globale per la gestione degli errori
app.use(errorHandler);

// Gestione eventi Socket.IO
io.on('connection', (socket) => {
    // Gestione join room per progetto specifico
    socket.on('joinProject', (projectId) => {
        socket.join(`project_${projectId}`);
        
        // Notifica altri utenti
        socket.to(`project_${projectId}`).emit('userJoined', {
            message: 'Nuovo utente connesso alla board'
        });
    });

    // Gestione leave room
    socket.on('leaveProject', (projectId) => {
        socket.leave(`project_${projectId}`);
        
        // Notifica altri utenti
        socket.to(`project_${projectId}`).emit('userLeft', {
            message: 'Utente disconnesso dalla board'
        });
    });

    // Gestione errori socket
    socket.on('error', (error) => {
        logger.error('Errore Socket.IO:', error);
    });

    // Gestione disconnessione
    socket.on('disconnect', (reason) => {
        logger.debug(`Client disconnesso. Motivo: ${reason}`);
    });
});

/**
 * Funzione asincrona per l'avvio del server
 * Sequenza di avvio:
 * 1. Inizializzazione connessione database
 * 2. Avvio server Express
 * 3. Logging dell'avvio completato
 * 
 * @async
 * @function startServer
 * @throws {Error} Se l'inizializzazione del database fallisce
 */
const startServer = async () => {
    try {
        await initDatabase();
        
        httpServer.listen(port, host, () => {
            logger.info(`Server avviato su http://${host}:${port}`);
            console.log(`Server avviato su http://${host}:${port}`);
        });
    } catch (error) {
        logger.error('Errore durante l\'avvio del server:', error);
        process.exit(1);
    }
};

// Avvio dell'applicazione
startServer(); 