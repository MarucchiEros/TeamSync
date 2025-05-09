/**
 * Modello Utente per la gestione degli utenti nel sistema
 * Definisce la struttura dati, le validazioni e le regole di business per gli utenti
 * 
 * Caratteristiche principali:
 * - Gestione dati personali (nome, cognome)
 * - Autenticazione (email, password)
 * - Gestione ruoli e permessi
 * - Validazioni automatiche
 * 
 * Relazioni possibili:
 * - Appartiene a più Team (through TeamUtente)
 * - Può essere assegnato a più Task
 * - Può creare Progetti
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Definizione del modello Utente utilizzando Sequelize
 * Rappresenta un utente registrato nel sistema
 */
const Utente = sequelize.define('Utente', {
    /**
     * ID dell'utente
     * Chiave primaria auto-incrementale per identificazione univoca
     * 
     * Caratteristiche:
     * - Generato automaticamente
     * - Tipo intero
     * - Non può essere null
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nome dell'utente
     * Nome anagrafico o visualizzato
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Massimo 100 caratteri
     * - Non può essere null
     * 
     * Utilizzo:
     * - Visualizzazione nel sistema
     * - Identificazione personale
     */
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    /**
     * Cognome dell'utente
     * Cognome anagrafico
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Massimo 100 caratteri
     * - Non può essere null
     * 
     * Utilizzo:
     * - Completamento dati anagrafici
     * - Visualizzazione completa
     */
    cognome: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    /**
     * Email dell'utente
     * Utilizzata per login e comunicazioni
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Deve essere unica nel sistema
     * - Massimo 100 caratteri
     * - Deve essere un email valida
     * 
     * Validazioni:
     * - Formato email corretto
     * - Unicità nel sistema
     */
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    /**
     * Hash della password
     * Memorizza la password criptata dell'utente
     * 
     * Caratteristiche:
     * - Lunghezza fissa 64 caratteri (SHA-256/bcrypt)
     * - Campo obbligatorio
     * - Non può essere null
     * 
     * Sicurezza:
     * - Mai memorizzare password in chiaro
     * - Utilizzare sempre funzioni di hashing
     */
    password_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false
    },

    /**
     * Ruolo dell'utente
     * Definisce i permessi nel sistema
     * 
     * Valori possibili:
     * - admin: Amministratore con tutti i permessi
     * - user: Utente standard con permessi limitati
     * 
     * Caratteristiche:
     * - Campo obbligatorio
     * - Default: 'user'
     * - Enum per valori predefiniti
     */
    ruolo: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user'
    }
}, {
    tableName: 'utente',       // Nome esplicito della tabella nel database
    timestamps: false          // Disabilita il tracciamento automatico delle date
});

module.exports = Utente; 