/**
 * Modello Team per la gestione dei team nel sistema
 * Definisce la struttura dati e le relazioni per i team di lavoro
 * 
 * Caratteristiche principali:
 * - Gestione gruppi di lavoro
 * - Relazione many-to-many con utenti
 * - Tracciamento temporale delle modifiche
 * - Identificazione univoca dei team
 * 
 * Relazioni:
 * - Può contenere più utenti (through TeamUtente)
 * - Ogni utente può appartenere a più team
 * - Associato a progetti specifici
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Utente = require('./Utente');

/**
 * Definizione del modello Team utilizzando Sequelize
 * Rappresenta un gruppo di lavoro nel sistema
 */
const Team = sequelize.define('Team', {
    /**
     * ID del team
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
     * Nome del team
     * Identificativo testuale del gruppo di lavoro
     * 
     * Vincoli:
     * - Campo obbligatorio
     * - Massimo 100 caratteri
     * - Deve essere unico nel sistema
     * - Non può essere null
     */
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },

    /**
     * Descrizione del team
     * Informazioni aggiuntive sul gruppo di lavoro
     * 
     * Caratteristiche:
     * - Campo opzionale
     * - Può contenere testo lungo
     * - Può essere null
     */
    descrizione: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'team',         // Nome esplicito della tabella nel database
    timestamps: true           // Abilita il tracciamento automatico delle date (createdAt, updatedAt)
});

/**
 * Modello di associazione TeamUtente
 * Gestisce la relazione many-to-many tra Team e Utenti
 * 
 * Caratteristiche:
 * - Tabella di join automatica
 * - Tracciamento temporale delle associazioni
 * - Permette associazioni multiple
 */
const TeamUtente = sequelize.define('TeamUtente', {
    // Non necessita di campi aggiuntivi oltre alle chiavi esterne
    // che vengono create automaticamente da Sequelize
}, {
    tableName: 'team_utente', // Nome della tabella di join
    timestamps: true          // Traccia quando un utente viene aggiunto/rimosso dal team
});

/**
 * Definizione delle relazioni many-to-many
 * Configura le associazioni bidirezionali tra Team e Utenti
 * 
 * Relazioni stabilite:
 * - Un team può avere più utenti
 * - Un utente può appartenere a più team
 * - TeamUtente funge da tabella di join
 */
Team.belongsToMany(Utente, { through: TeamUtente });
Utente.belongsToMany(Team, { through: TeamUtente });

module.exports = { Team, TeamUtente }; 