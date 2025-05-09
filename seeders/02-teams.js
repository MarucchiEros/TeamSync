module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('team', [
      {
        nome: 'Team Sviluppo Frontend',
        descrizione: 'Team dedicato allo sviluppo frontend e UI/UX',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team Backend',
        descrizione: 'Team dedicato allo sviluppo backend e database',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team DevOps',
        descrizione: 'Team dedicato all\'infrastruttura e deployment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team Mobile',
        descrizione: 'Team dedicato allo sviluppo mobile',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team QA',
        descrizione: 'Team dedicato al quality assurance e testing',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team Design',
        descrizione: 'Team dedicato al design e alla user experience',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('team', null, {});
  }
}; 