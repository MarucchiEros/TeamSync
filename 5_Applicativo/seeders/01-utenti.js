const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = 'Admin$00';
    const hashedPassword = await bcrypt.hash(password, 10);

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
    return queryInterface.bulkDelete('utente', null, {});
  }
}; 