module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('progetto', [
      {
        nome: 'App E-commerce Mobile',
        descrizione: 'Sviluppo di un\'applicazione mobile per e-commerce con funzionalità avanzate',
        creato_da: 1,
        data_creazione: new Date(),
        team_id: 4, // Team Mobile
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        stato: 'attivo'
      },
      {
        nome: 'Piattaforma CRM',
        descrizione: 'Sistema di gestione delle relazioni con i clienti',
        creato_da: 2,
        data_creazione: new Date(),
        team_id: 2, // Team Backend
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        stato: 'attivo'
      },
      {
        nome: 'Restyling Portale Aziendale',
        descrizione: 'Rinnovamento completo del portale aziendale con nuovo design',
        creato_da: 1,
        data_creazione: new Date(),
        team_id: 6, // Team Design
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        stato: 'attivo'
      },
      {
        nome: 'Sistema di Monitoraggio',
        descrizione: 'Implementazione sistema di monitoraggio infrastruttura',
        creato_da: 3,
        data_creazione: new Date(),
        team_id: 3, // Team DevOps
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        stato: 'attivo'
      },
      {
        nome: 'Dashboard Analytics',
        descrizione: 'Dashboard per la visualizzazione dei dati analytics',
        creato_da: 1,
        data_creazione: new Date(),
        team_id: 1, // Team Frontend
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        stato: 'attivo'
      },
      {
        nome: 'API Gateway',
        descrizione: 'Implementazione di un API Gateway per i servizi aziendali',
        creato_da: 2,
        data_creazione: new Date(),
        team_id: 2, // Team Backend
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        stato: 'attivo'
      },
      {
        nome: 'App Gestione Magazzino',
        descrizione: 'Applicazione mobile per la gestione del magazzino',
        creato_da: 1,
        data_creazione: new Date(),
        team_id: 4, // Team Mobile
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        stato: 'attivo'
      },
      {
        nome: 'Testing Automatizzato',
        descrizione: 'Implementazione suite di test automatizzati',
        creato_da: 3,
        data_creazione: new Date(),
        team_id: 5, // Team QA
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        stato: 'attivo'
      },
      {
        nome: 'Sistema di Autenticazione',
        descrizione: 'Nuovo sistema di autenticazione e autorizzazione',
        creato_da: 2,
        data_creazione: new Date(),
        team_id: 2, // Team Backend
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        stato: 'attivo'
      },
      {
        nome: 'Design System',
        descrizione: 'Creazione di un design system unificato',
        creato_da: 1,
        data_creazione: new Date(),
        team_id: 6, // Team Design
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + 5)),
        stato: 'attivo'
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('progetto', null, {});
  }
}; 