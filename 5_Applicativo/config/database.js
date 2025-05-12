/**
 * Configurazione e inizializzazione del database
 * Questo modulo gestisce la connessione al database MySQL e l'inizializzazione
 * delle tabelle necessarie per l'applicazione.
 * 
 * Il file si occupa di:
 * - Configurare la connessione al database MySQL
 * - Creare il database se non esiste
 * - Inizializzare i modelli e le loro relazioni
 * - Creare un utente amministratore di default
 * - Eseguire i seeders per popolare il database con dati iniziali
 */

const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
require('dotenv').config();

/**
 * Configurazione del database
 * Utilizza variabili d'ambiente se disponibili, altrimenti usa valori di default
 * - DB_NAME: Nome del database (default: 'teamsync')
 * - DB_USER: Username per l'accesso (default: 'root')
 * - DB_PASSWORD: Password per l'accesso (default: '')
 * - DB_HOST: Host del database (default: 'localhost')
 */
const dbConfig = {
    database: process.env.DB_NAME || 'teamsync',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost'
};

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 secondi

/**
 * Funzione createDatabaseIfNotExists
 * Si occupa di creare il database se non esiste già.
 * 
 * Processo:
 * 1. Crea una connessione MySQL senza specificare il database
 * 2. Esegue la query per creare il database se non esiste
 * 3. Chiude la connessione
 * 
 * @throws {Error} Se si verificano errori durante la creazione del database
 */
async function createDatabaseIfNotExists() {
    let connection;
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            connection = await mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password
            });

            await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
            logger.info(`Database ${dbConfig.database} verificato/creato con successo.`);
            return;
        } catch (error) {
            retries++;
            logger.error(`Tentativo ${retries}/${MAX_RETRIES} fallito:`, error);
            
            if (retries === MAX_RETRIES) {
                throw new Error(`Impossibile creare/verificare il database dopo ${MAX_RETRIES} tentativi`);
            }
            
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
}

/**
 * Funzione runSeeders
 * Esegue tutti i file seeder presenti nella cartella /seeders in ordine alfabetico.
 * I seeder sono utilizzati per popolare il database con dati iniziali.
 * 
 * Processo:
 * 1. Legge tutti i file dalla cartella seeders
 * 2. Li ordina alfabeticamente
 * 3. Esegue ogni seeder in sequenza
 * 
 * @throws {Error} Se si verificano errori durante l'esecuzione dei seeder
 */
async function runSeeders() {
    try {
        const { Sequelize } = require('sequelize');
        const path = require('path');
        const fs = require('fs').promises;

        const seedersPath = path.join(__dirname, '..', 'seeders');
        const seederFiles = await fs.readdir(seedersPath);

        // Ordina i file per nome per assicurare l'ordine corretto di esecuzione
        const sortedSeederFiles = seederFiles.sort();

        for (const file of sortedSeederFiles) {
            if (file.endsWith('.js')) {
                const seeder = require(path.join(seedersPath, file));
                await seeder.up(sequelize.getQueryInterface(), Sequelize);
                logger.info(`Seeder ${file} eseguito con successo.`);
            }
        }

        logger.info('Tutti i seeders sono stati eseguiti con successo.');
    } catch (error) {
        logger.error('Errore durante l\'esecuzione dei seeders:', error);
        throw error;
    }
}

/**
 * Funzione createDefaultAdmin
 * Crea un utente amministratore di default se non esiste già.
 * 
 * Dettagli dell'admin di default:
 * - Email: admin@mail.com
 * - Password: Admin$00 (viene hashata con bcrypt)
 * - Ruolo: admin
 * 
 * @param {Object} Utente - Il modello Sequelize per la tabella utenti
 * @throws {Error} Se si verificano errori durante la creazione dell'admin
 */
async function createDefaultAdmin(Utente) {
    try {
        // Admin classico
        const adminExists = await Utente.findOne({
            where: { email: 'admin@example.com' }
        });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin$00', 10);

            await Utente.create({
                nome: 'Admin',
                cognome: 'System',
                email: 'admin@example.com',
                password_hash: hashedPassword,
                ruolo: 'admin'
            });

            logger.info('Utente admin di default creato con successo.');
        } else {
            logger.info('Utente admin di default già esistente.');
        }

        // Admin Eros Marucchi
        const erosExists = await Utente.findOne({
            where: { email: 'eros.marucchi@samtrevano.ch' }
        });

        if (!erosExists) {
            const hashedPassword = await bcrypt.hash('Admin$00', 10);

            await Utente.create({
                nome: 'Eros',
                cognome: 'Marucchi',
                email: 'eros.marucchi@samtrevano.ch',
                password_hash: hashedPassword,
                ruolo: 'admin'
            });

            logger.info('Utente admin Eros Marucchi creato con successo.');
        } else {
            logger.info('Utente admin Eros Marucchi già esistente.');
        }
    } catch (error) {
        logger.error('Errore durante la creazione degli utenti admin:', error);
        throw error;
    }
}

/**
 * Configurazione dell'istanza Sequelize
 * Inizializza la connessione al database con le seguenti impostazioni:
 * - Pool di connessioni configurato per ottimizzare le prestazioni
 * - Logging delle query tramite il logger personalizzato
 * - Dialetto MySQL
 */
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        max: 3,
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeConnectionTimedOutError/
        ]
    }
});

/**
 * Funzione initDatabase
 * Funzione principale che orchestrata l'intera inizializzazione del database.
 * 
 * Sequenza di operazioni:
 * 1. Verifica se è la prima esecuzione
 * 2. Crea il database se non esiste
 * 3. Verifica la connessione
 * 4. Importa e configura i modelli
 * 5. Stabilisce le relazioni tra i modelli
 * 6. Sincronizza i modelli con il database
 * 7. Crea l'utente admin di default
 * 8. Esegue i seeder se è la prima esecuzione
 * 
 * @returns {Promise<Sequelize>} L'istanza di Sequelize configurata
 * @throws {Error} Se si verificano errori durante l'inizializzazione
 */
async function initDatabase() {
    try {
        const isFirstRun = !await isDatabaseInitialized();
        
        await createDatabaseIfNotExists();
        await sequelize.authenticate();
        logger.info('Connessione al database stabilita con successo.');

        // Importazione dei modelli
        const Utente = require('../models/Utente');
        const { Team, TeamUtente } = require('../models/Team');
        const Progetto = require('../models/Project');
        const TaskJson = require('../models/TaskJson');
        logger.info('Modelli importati con successo.');

        // Associazione con il Team
        Team.hasMany(Progetto, { foreignKey: 'team_id' });
        Progetto.belongsTo(Team, { foreignKey: 'team_id' });

        // Associazione con TaskJson
        Utente.hasMany(TaskJson, { foreignKey: 'userId' });
        Progetto.hasMany(TaskJson, { foreignKey: 'projectId' });

        // Sincronizzazione dei modelli con il database
        await Utente.sync();
        await Team.sync();
        await TeamUtente.sync();
        await Progetto.sync();
        await TaskJson.sync();
        logger.info('Tutti i modelli sincronizzati con successo.');

        // Crea sempre l'utente admin di default
        await createDefaultAdmin(Utente);

        // Se è la prima esecuzione, esegui i seeders
        if (isFirstRun) {
            await runSeeders();
            logger.info('Database popolato con i dati iniziali.');
        }

        return sequelize;
    } catch (error) {
        logger.error('Errore durante l\'inizializzazione del database:', error);
        throw error;
    }
}

/**
 * Funzione isDatabaseInitialized
 * Verifica se il database è già stato inizializzato controllando
 * l'esistenza di tabelle nel database specificato.
 * 
 * @returns {Promise<boolean>} true se il database contiene tabelle, false altrimenti
 */
async function isDatabaseInitialized() {
    try {
        const [results] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = '${dbConfig.database}'
        `);
        return results[0].count > 0;
    } catch (error) {
        return false;
    }
}

module.exports = {
    sequelize,
    initDatabase
}; 