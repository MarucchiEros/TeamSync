module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('team_utente', [
      // Eros Marucchi in tutti i team (1-6)
      {
        TeamId: 1,
        UtenteId: 1, // Eros Marucchi
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 2,
        UtenteId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 3,
        UtenteId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 4,
        UtenteId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 5,
        UtenteId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        TeamId: 6,
        UtenteId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
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