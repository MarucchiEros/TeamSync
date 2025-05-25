/**
 * Seeder per la tabella 'team'.
 *
 * Inserisce team di esempio per popolare la base dati con gruppi di lavoro.
 * Utile per testare funzionalità legate ai team.
 *
 * @module SeederTeams
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Inserimento team di esempio
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
      },
      {
        nome: 'Team Ricerca e Sviluppo',
        descrizione: 'Team dedicato all\'innovazione e ricerca di nuove tecnologie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team Marketing',
        descrizione: 'Team dedicato alle strategie di marketing e comunicazione',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team Supporto',
        descrizione: 'Team dedicato al supporto clienti e assistenza',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Team Amministrazione',
        descrizione: 'Team dedicato alla gestione amministrativa e contabile',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // Rimozione di tutti i team inseriti dal seeder
    return queryInterface.bulkDelete('team', null, {});
  }
}; 