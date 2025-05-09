/**
 * Modello Progetto per la gestione dei progetti nel sistema
 * Definisce la struttura dati, le relazioni e le validazioni per i progetti
 * 
 * Caratteristiche principali:
 * - Identificazione univoca dei progetti
 * - Gestione informazioni base (nome, descrizione)
 * - Tracciamento temporale (creazione, scadenza)
 * - Associazione con team e utenti
 * - Gestione stati del progetto
 * 
 * Relazioni:
 * - Appartiene a un Team (team_id)
 * - Creato da un Utente (creato_da)
 * - Può contenere multiple Task
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Team } = require('./Team');
const logger = require('../utils/logger');

/**
 * Definizione del modello Progetto utilizzando Sequelize
 * Ogni proprietà rappresenta una colonna nella tabella 'progetto'
 */
const Progetto = sequelize.define('Progetto', {
    /**
     * ID del progetto
     * Chiave primaria auto-incrementale per identificazione univoca
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nome del progetto
     * Campo obbligatorio con validazione
     * 
     * Vincoli:
     * - Massimo 100 caratteri
     * - Non può essere null
     * - Non può essere stringa vuota
     */
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },

    /**
     * Descrizione del progetto
     * Campo opzionale per dettagli aggiuntivi
     * 
     * Caratteristiche:
     * - Può contenere testo lungo
     * - Può essere null
     * - Nessuna validazione specifica
     */
    descrizione: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    /**
     * ID dell'utente creatore
     * Riferimento all'utente che ha creato il progetto
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Deve essere un ID valido di un utente esistente
     */
    creato_da: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    /**
     * Data di creazione
     * Timestamp automatico alla creazione del progetto
     * 
     * Caratteristiche:
     * - Si imposta automaticamente all'inserimento
     * - Formato: DateTime
     */
    data_creazione: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    /**
     * ID del team assegnato
     * Riferimento al team che lavora sul progetto
     * 
     * Caratteristiche:
     * - Chiave esterna verso la tabella 'team'
     * - Può essere null (progetto non ancora assegnato)
     * - Vincolo di integrità referenziale
     */
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'team',
            key: 'id'
        }
    },

    /**
     * Data di scadenza
     * Deadline del progetto
     * 
     * Caratteristiche:
     * - Formato: DateTime
     * - Può essere null (progetti senza scadenza)
     * - Deve essere una data futura
     * - Viene validata prima del salvataggio
     */
    scadenza: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isFutureDate(value) {
                if (value && new Date(value) <= new Date()) {
                    throw new Error('La data di scadenza deve essere futura');
                }
            }
        },
        get() {
            // Assicura che la data venga sempre restituita nel formato corretto
            const rawValue = this.getDataValue('scadenza');
            return rawValue ? new Date(rawValue).toISOString() : null;
        },
        set(value) {
            // Normalizza il formato della data prima del salvataggio
            this.setDataValue('scadenza', value ? new Date(value) : null);
        }
    },

    /**
     * Stato del progetto
     * Indica lo stato corrente del progetto
     * 
     * Stati possibili:
     * - attivo: Progetto in corso
     * - completato: Progetto terminato
     * 
     * Caratteristiche:
     * - Enum per stati predefiniti
     * - Default: 'attivo'
     * - Campo obbligatorio
     */
    stato: {
        type: DataTypes.ENUM('attivo', 'completato'),
        allowNull: false,
        defaultValue: 'attivo'
    }
}, {
    // Configurazioni della tabella
    tableName: 'progetto',    // Nome esplicito della tabella nel database
    timestamps: false         // Disabilita i campi automatici createdAt e updatedAt
});

/**
 * Migrazione automatica per aggiornamento colonna stato
 * Assicura che la colonna stato abbia la corretta definizione ENUM
 * 
 * Eseguito all'avvio dell'applicazione:
 * 1. Modifica la colonna stato
 * 2. Imposta i valori ENUM corretti
 * 3. Imposta il valore di default
 * 4. Registra il risultato dell'operazione
 */
(async () => {
    try {
        await sequelize.query(`
            ALTER TABLE progetto 
            MODIFY COLUMN stato ENUM('attivo', 'completato') 
            NOT NULL DEFAULT 'attivo'
        `);
        logger.info('Colonna stato aggiornata nella tabella progetto');
    } catch (error) {
        logger.error('Errore durante l\'aggiornamento della colonna stato:', error);
    }
})();

// Hooks per la gestione delle date
Progetto.beforeCreate(async (progetto) => {
    if (progetto.scadenza) {
        const scadenza = new Date(progetto.scadenza);
        if (scadenza <= new Date()) {
            throw new Error('La data di scadenza deve essere futura');
        }
    }
});

Progetto.beforeUpdate(async (progetto) => {
    if (progetto.changed('scadenza') && progetto.scadenza) {
        const scadenza = new Date(progetto.scadenza);
        if (scadenza <= new Date()) {
            throw new Error('La data di scadenza deve essere futura');
        }
    }
});

module.exports = Progetto;
