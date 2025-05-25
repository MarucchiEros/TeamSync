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
        nome: 'Utente',
        cognome: 'User',
        email: 'utente.user@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Marco',
        cognome: 'Ferrari',
        email: 'marco.ferrari@example.com',
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
        nome: 'Antonio',
        cognome: 'Sbancatore',
        email: 'antonio.sbancatore@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Nicola',
        cognome: 'Bernasconi',
        email: 'nicola.bernasconi@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Giuseppe',
        cognome: 'Verdi',
        email: 'giuseppe.verdi@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Sara',
        cognome: 'Neri',
        email: 'sara.neri@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Luca',
        cognome: 'Russo',
        email: 'luca.russo@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Martina',
        cognome: 'Gallo',
        email: 'martina.gallo@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Paolo',
        cognome: 'Ferrari',
        email: 'paolo.ferrari@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Chiara',
        cognome: 'Romano',
        email: 'chiara.romano@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Davide',
        cognome: 'Conti',
        email: 'davide.conti@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Alessandro',
        cognome: 'Moretti',
        email: 'alessandro.moretti@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Francesca',
        cognome: 'Villa',
        email: 'francesca.villa@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Simone',
        cognome: 'Greco',
        email: 'simone.greco@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Elena',
        cognome: 'Martini',
        email: 'elena.martini@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Fabio',
        cognome: 'Riva',
        email: 'fabio.riva@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Valentina',
        cognome: 'Ferri',
        email: 'valentina.ferri@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Stefano',
        cognome: 'Barbieri',
        email: 'stefano.barbieri@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Giulia',
        cognome: 'Lombardi',
        email: 'giulia.lombardi@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Matteo',
        cognome: 'Gatti',
        email: 'matteo.gatti@example.com',
        password_hash: hashedPassword,
        ruolo: 'user'
      },
      {
        nome: 'Federica',
        cognome: 'Testa',
        email: 'federica.testa@example.com',
        password_hash: hashedPassword,
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // Rimozione di tutti gli utenti inseriti dal seeder
    return queryInterface.bulkDelete('utente', null, {});
  }
}; 