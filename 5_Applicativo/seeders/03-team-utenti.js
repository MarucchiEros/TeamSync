/**
 * Seeder per la tabella 'team_utente'.
 *
 * Inserisce associazioni tra utenti e team per simulare la composizione dei gruppi di lavoro.
 * Utile per testare funzionalità di appartenenza ai team.
 *
 * @module SeederTeamUtenti
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('team_utente', [
      // RIMOSSO EROS MARUCCHI DAI TEAM
      // Enea Corti in 3 team (1, 3, 5)
      {
        TeamId: 1,
        UtenteId: 2, // Enea Corti
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 3,
        UtenteId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 5,
        UtenteId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Jacopo Faul in 1 team (2)
      {
        TeamId: 2,
        UtenteId: 3, // Jacopo Faul
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Altri utenti distribuiti casualmente
      {
        TeamId: 1,
        UtenteId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 2,
        UtenteId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 3,
        UtenteId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 4,
        UtenteId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 5,
        UtenteId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 6,
        UtenteId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 1,
        UtenteId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 3,
        UtenteId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 5,
        UtenteId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 6,
        UtenteId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('team_utente', null, {});
  }
}; 