const bcrypt = require('bcrypt');

/**
 * Seeder per la tabella 'utente'.
 *
 * Inserisce utenti di esempio con password hashata tramite bcrypt.
 * Utile per popolare la base dati con utenti di test.
 *
 * @module SeederUtenti
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Password di default per tutti gli utenti
    const password = 'Admin$00';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserimento utenti di esempio
    return queryInterface.bulkInsert('utente', [
      {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Enea',
        cognome: 'Corti',
        email: 'enea.corti@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Jacopo',
        cognome: 'Faul',
        email: 'jacopo.faul@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Laura',
        cognome: 'Bianchi',
        email: 'laura.bianchi@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Edoardo',
        cognome: 'Antonini',
        email: 'edoardo.antonini@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Alex',
        cognome: 'Volpe',
        email: 'alex.volpe@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Giuseppe',
        cognome: 'Verdi',
        email: 'giuseppe.verdi@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // Rimozione di tutti gli utenti inseriti dal seeder
    return queryInterface.bulkDelete('utente', null, {});
  }
}; 