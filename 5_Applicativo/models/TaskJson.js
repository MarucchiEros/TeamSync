/**
 * Modello TaskJson per la gestione delle task nel sistema
 * Definisce la struttura dati, le relazioni e le validazioni per le task
 * 
 * Caratteristiche principali:
 * - Identificazione univoca delle task
 * - Associazione con progetti e utenti
 * - Gestione priorità e stati
 * - Tracciamento temporale
 * - Personalizzazione visiva
 * 
 * Relazioni:
 * - Appartiene a un Progetto (projectId)
 * - Assegnata a un Utente (userId)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); 

/**
 * Definizione del modello TaskJson utilizzando Sequelize
 * Ogni proprietà rappresenta una colonna nella tabella 'task_json'
 */
const TaskJson = sequelize.define('TaskJson', {
    /**
     * ID della task
     * Identificatore univoco basato su timestamp
     */
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },

    /**
     * ID del progetto associato
     * Chiave esterna verso la tabella 'progetto'
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Deve riferirsi a un progetto esistente
     */
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'progetto',
            key: 'id'
        }
    },

    /**
     * ID dell'utente assegnato
     * Chiave esterna verso la tabella 'utente'
     * 
     * Caratteristiche:
     * - Può essere null (task non assegnata)
     * - Riferimento a un utente esistente
     */
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'utente',
            key: 'id'
        }
    },

    /**
     * Titolo della task
     * Nome/descrizione breve della task
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Tipo stringa
     */
    titolo: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * Descrizione dettagliata
     * Spiegazione estesa della task
     * 
     * Caratteristiche:
     * - Campo opzionale
     * - Può contenere testo lungo
     */
    descrizione: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    /**
     * Peso/complessità della task
     * Indica la difficoltà o l'impegno richiesto
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Valore numerico tra 1 e 10
     * - 1: task più semplice
     * - 10: task più complessa
     */
    peso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10
        }
    },

    /**
     * Priorità della task
     * Livello di urgenza/importanza
     * 
     * Valori possibili:
     * - bassa: priorità minima
     * - media: priorità standard (default)
     * - alta: priorità massima
     */
    priorita: {
        type: DataTypes.ENUM('bassa', 'media', 'alta'),
        allowNull: false,
        defaultValue: 'media'
    },

    /**
     * Data di scadenza
     * Deadline per il completamento
     * 
     * Caratteristiche:
     * - Campo opzionale
     * - Formato DateTime
     */
    scadenza: {
        type: DataTypes.DATE,
        allowNull: true
    },

    /**
     * Colore della task
     * Utilizzato per la visualizzazione/categorizzazione
     * 
     * Caratteristiche:
     * - Campo opzionale
     * - Formato colore esadecimale (#RRGGBB)
     */
    colore: {
        type: DataTypes.STRING,
        allowNull: true
    },

    /**
     * Stato corrente della task
     * Indica la fase di avanzamento
     * 
     * Stati possibili:
     * - da_fare: task da iniziare (default)
     * - in_corso: task in lavorazione
     * - in_revisione: task in fase di verifica
     * - completati: task terminata
     */
    status: {
        type: DataTypes.ENUM('da_fare', 'in_corso', 'in_revisione', 'completati'),
        allowNull: false,
        defaultValue: 'da_fare'
    },

    /**
     * Data di creazione
     * Timestamp di quando la task è stata creata
     * 
     * Caratteristiche:
     * - Campo obbligatorio
     * - Si imposta automaticamente
     * - Formato DateTime
     */
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'task_json',    // Nome esplicito della tabella nel database
    timestamps: false          // Disabilita i campi automatici updatedAt
});

/**
 * Definizione delle relazioni del modello
 * Stabilisce le connessioni con altri modelli del sistema
 */
const Utente = require('./Utente');
const Progetto = require('./Project');

// Relazione con l'utente assegnato
TaskJson.belongsTo(Utente, { foreignKey: 'userId' });
// Relazione con il progetto di appartenenza
TaskJson.belongsTo(Progetto, { foreignKey: 'projectId' });

module.exports = TaskJson;
