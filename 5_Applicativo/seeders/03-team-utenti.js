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
      },
      // Nuove associazioni
      {
        TeamId: 7,
        UtenteId: 9, // Sara Neri
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 8,
        UtenteId: 10, // Luca Russo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 9,
        UtenteId: 11, // Martina Gallo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 10,
        UtenteId: 12, // Paolo Ferrari
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 7,
        UtenteId: 13, // Chiara Romano
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 8,
        UtenteId: 14, // Davide Conti
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 9,
        UtenteId: 2, // Enea Corti
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 10,
        UtenteId: 3, // Jacopo Faul
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 1,
        UtenteId: 15, // Alessandro Moretti
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 2,
        UtenteId: 16, // Francesca Villa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 3,
        UtenteId: 17, // Simone Greco
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 4,
        UtenteId: 18, // Elena Martini
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 5,
        UtenteId: 19, // Fabio Riva
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 6,
        UtenteId: 20, // Valentina Ferri
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 7,
        UtenteId: 21, // Stefano Barbieri
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 8,
        UtenteId: 22, // Giulia Lombardi
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 9,
        UtenteId: 23, // Matteo Gatti
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 10,
        UtenteId: 24, // Federica Testa
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('team_utente', null, {});
  }
}; 