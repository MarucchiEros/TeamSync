/**
 * Seeder per la tabella 'task_json'.
 *
 * Inserisce task di esempio per popolare la base dati con attività già assegnate ai progetti.
 * Utile per testare funzionalità di visualizzazione e gestione task.
 *
 * @module SeederTaskJson
 */
const { v4: uuidv4 } = require('uuid');

// --- DATI DA ALTRI SEEDER (copiati manualmente per coerenza) ---
// TeamUtenti: TeamId -> [UtenteId]
const teamUtenti = {
  1: [2, 4, 5],
  2: [3, 5],
  3: [2, 6, 7],
  4: [1, 7],
  5: [2, 6, 8],
  6: [4, 8]
};
// Progetti: id -> team_id
const progettoTeam = {
  1: 4,
  2: 2,
  3: 6,
  4: 3,
  5: 1,
  6: 2,
  7: 4,
  8: 5,
  9: 2,
  10: 6
};

// Funzione per scegliere un utente random tra i membri del team
function pickRandomUser(teamId) {
  const utenti = teamUtenti[teamId] || [];
  if (utenti.length === 0) return null;
  return utenti[Math.floor(Math.random() * utenti.length)];
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    // Task di esempio per i progetti (id da 1 a 10)
    const tasks = [
      // Progetto 1 (Team 4: utenti 1, 7, 18)
      {
        projectId: 1,
        titolo: 'Analisi UX mobile',
        descrizione: 'Analisi approfondita della user experience.',
        peso: 4,
        priorita: 'media',
        scadenza: addDays(now, 14),
        colore: '#FF5733',
        status: 'da_fare',
        userId: 1
      },
      {
        projectId: 1,
        titolo: 'Test accessibilità',
        descrizione: 'Verifica accessibilità su dispositivi mobili.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 19),
        colore: '#33C1FF',
        status: 'in_corso',
        userId: 7
      },
      {
        projectId: 1,
        titolo: 'Documentazione API',
        descrizione: 'Scrivere la documentazione delle API mobile.',
        peso: 3,
        priorita: 'alta',
        scadenza: addDays(now, 25),
        colore: '#FFC300',
        status: 'in_revisione',
        userId: 18
      },
      // Progetto 2 (Team 2: utenti 3, 5, 16)
      {
        projectId: 2,
        titolo: 'Setup ambiente sviluppo',
        descrizione: 'Configurare ambiente per CRM.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 10),
        colore: '#DAF7A6',
        status: 'da_fare',
        userId: 3
      },
      {
        projectId: 2,
        titolo: 'Test performance',
        descrizione: 'Testare performance del backend.',
        peso: 4,
        priorita: 'media',
        scadenza: addDays(now, 18),
        colore: '#C70039',
        status: 'in_corso',
        userId: 5
      },
      {
        projectId: 2,
        titolo: 'Bugfix autenticazione',
        descrizione: 'Correggere bug autenticazione utenti.',
        peso: 3,
        priorita: 'alta',
        scadenza: addDays(now, 22),
        colore: '#581845',
        status: 'in_revisione',
        userId: 16
      },
      // Progetto 3 (Team 6: utenti 4, 8, 11, 20)
      {
        projectId: 3,
        titolo: 'Ottimizzazione CSS',
        descrizione: 'Ottimizzare i fogli di stile del portale.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 8),
        colore: '#1ABC9C',
        status: 'da_fare',
        userId: 4
      },
      {
        projectId: 3,
        titolo: 'Test responsive',
        descrizione: 'Verifica layout responsive.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 15),
        colore: '#E67E22',
        status: 'in_corso',
        userId: 8
      },
      {
        projectId: 3,
        titolo: 'Aggiornamento icone',
        descrizione: 'Aggiornare le icone del portale.',
        peso: 2,
        priorita: 'alta',
        scadenza: addDays(now, 20),
        colore: '#F39C12',
        status: 'in_revisione',
        userId: 11
      },
      // Progetto 4 (Team 3: utenti 2, 6, 7, 17)
      {
        projectId: 4,
        titolo: 'Configurazione alert',
        descrizione: 'Configurare alert automatici.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 12),
        colore: '#8E44AD',
        status: 'da_fare',
        userId: 2
      },
      {
        projectId: 4,
        titolo: 'Test backup',
        descrizione: 'Testare i backup periodici.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 18),
        colore: '#FF33A1',
        status: 'in_corso',
        userId: 6
      },
      {
        projectId: 4,
        titolo: 'Documentazione procedure',
        descrizione: 'Scrivere le procedure di monitoraggio.',
        peso: 4,
        priorita: 'alta',
        scadenza: addDays(now, 25),
        colore: '#00B894',
        status: 'in_revisione',
        userId: 7
      },
      // Progetto 5 (Team 1: utenti 2, 4, 5, 15)
      {
        projectId: 5,
        titolo: 'Aggiornamento librerie',
        descrizione: 'Aggiornare le librerie della dashboard.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 10),
        colore: '#DAF7A6',
        status: 'da_fare',
        userId: 2
      },
      {
        projectId: 5,
        titolo: 'Test grafici',
        descrizione: 'Testare i nuovi grafici inseriti.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 15),
        colore: '#C70039',
        status: 'in_corso',
        userId: 4
      },
      {
        projectId: 5,
        titolo: 'Ottimizzazione query',
        descrizione: 'Ottimizzare le query della dashboard.',
        peso: 4,
        priorita: 'alta',
        scadenza: addDays(now, 22),
        colore: '#581845',
        status: 'in_revisione',
        userId: 5
      },
      // Progetto 6 (Team 2: utenti 3, 5, 16)
      {
        projectId: 6,
        titolo: 'Aggiornamento endpoints',
        descrizione: 'Aggiornare gli endpoint API Gateway.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 12),
        colore: '#FFC300',
        status: 'da_fare',
        userId: 3
      },
      {
        projectId: 6,
        titolo: 'Test sicurezza endpoints',
        descrizione: 'Testare la sicurezza degli endpoint.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 18),
        colore: '#E67E22',
        status: 'in_corso',
        userId: 5
      },
      {
        projectId: 6,
        titolo: 'Documentazione tecnica',
        descrizione: 'Scrivere la documentazione tecnica.',
        peso: 4,
        priorita: 'alta',
        scadenza: addDays(now, 25),
        colore: '#F39C12',
        status: 'in_revisione',
        userId: 16
      },
      // Progetto 7 (Team 4: utenti 1, 7, 18)
      {
        projectId: 7,
        titolo: 'Analisi processi magazzino',
        descrizione: 'Analisi dettagliata dei processi.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 10),
        colore: '#3B82F6',
        status: 'da_fare',
        userId: 1
      },
      {
        projectId: 7,
        titolo: 'Test dispositivi',
        descrizione: 'Testare l\'app su dispositivi diversi.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 15),
        colore: '#00B894',
        status: 'in_corso',
        userId: 7
      },
      {
        projectId: 7,
        titolo: 'Report magazzino',
        descrizione: 'Compilare report dettagliati.',
        peso: 4,
        priorita: 'alta',
        scadenza: addDays(now, 22),
        colore: '#E17055',
        status: 'in_revisione',
        userId: 18
      },
      // Progetto 8 (Team 5: utenti 2, 6, 8, 19)
      {
        projectId: 8,
        titolo: 'Test QA automatizzati',
        descrizione: 'Scrivere test automatici per QA.',
        peso: 5,
        priorita: 'alta',
        scadenza: addDays(now, 14),
        colore: '#2ECC71',
        status: 'da_fare',
        userId: 2
      },
      {
        projectId: 8,
        titolo: 'Bugfix QA',
        descrizione: 'Correggere bug rilevati dai test.',
        peso: 2,
        priorita: 'media',
        scadenza: addDays(now, 18),
        colore: '#E17055',
        status: 'in_corso',
        userId: 6
      },
      {
        projectId: 8,
        titolo: 'Documentazione test',
        descrizione: 'Scrivere la documentazione dei test.',
        peso: 3,
        priorita: 'bassa',
        scadenza: addDays(now, 25),
        colore: '#34495E',
        status: 'in_revisione',
        userId: 8
      },
      // Progetto 9 (Team 2: utenti 3, 5, 16)
      {
        projectId: 9,
        titolo: 'Implementazione SSO',
        descrizione: 'Implementare Single Sign-On.',
        peso: 4,
        priorita: 'alta',
        scadenza: addDays(now, 18),
        colore: '#DAF7A6',
        status: 'in_corso',
        userId: 3
      },
      {
        projectId: 9,
        titolo: 'Test sicurezza',
        descrizione: 'Testare la sicurezza del sistema.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 28),
        colore: '#C70039',
        status: 'completati',
        userId: 5
      },
      {
        projectId: 9,
        titolo: 'Aggiornamento policy',
        descrizione: 'Aggiornare le policy di sicurezza.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 22),
        colore: '#FFC300',
        status: 'in_revisione',
        userId: 16
      },
      // Progetto 10 (Team 6: utenti 4, 8, 11, 20)
      {
        projectId: 10,
        titolo: 'Refactoring codice',
        descrizione: 'Migliorare la qualità del codice.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 10),
        colore: '#DAF7A6',
        status: 'da_fare',
        userId: 4
      },
      {
        projectId: 10,
        titolo: 'Test manuale',
        descrizione: 'Testare manualmente le funzionalità.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 15),
        colore: '#C70039',
        status: 'in_corso',
        userId: 8
      },
      {
        projectId: 10,
        titolo: 'Aggiornamento manuale utente',
        descrizione: 'Aggiornare il manuale utente.',
        peso: 4,
        priorita: 'alta',
        scadenza: addDays(now, 22),
        colore: '#581845',
        status: 'in_revisione',
        userId: 11
      },
      // Progetto 11 (Team 7: utenti 9, 13, 21)
      {
        projectId: 11,
        titolo: 'Onboarding HR',
        descrizione: 'Definire il processo di onboarding per le nuove risorse.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 10),
        colore: '#F39C12',
        status: 'da_fare',
        userId: 9
      },
      // Progetto 12 (Team 8: utenti 10, 14, 16, 22)
      {
        projectId: 12,
        titolo: 'Pianificazione campagna',
        descrizione: 'Pianificare la nuova campagna social.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 12),
        colore: '#3B82F6',
        status: 'in_corso',
        userId: 10
      },
      // Progetto 13 (Team 9: utenti 11, 23)
      {
        projectId: 13,
        titolo: 'Setup help desk',
        descrizione: 'Configurare il sistema di ticketing.',
        peso: 4,
        priorita: 'alta',
        scadenza: addDays(now, 15),
        colore: '#00B894',
        status: 'in_revisione',
        userId: 11
      },
      // Progetto 14 (Team 10: utenti 12, 24)
      {
        projectId: 14,
        titolo: 'Automazione fatture',
        descrizione: 'Automatizzare il processo di fatturazione elettronica.',
        peso: 3,
        priorita: 'media',
        scadenza: addDays(now, 18),
        colore: '#E67E22',
        status: 'da_fare',
        userId: 12
      },
      // Progetto 15 (nessun team associato, task senza userId)
      {
        projectId: 15,
        titolo: 'Task generica progetto 15',
        descrizione: 'Attività di esempio per progetto senza team.',
        peso: 2,
        priorita: 'bassa',
        scadenza: addDays(now, 8),
        colore: '#DAF7A6',
        status: 'da_fare'
      }
    ];
    // Assegna userId solo se l'utente fa parte del team del progetto
    const tasksWithUser = tasks.map(task => {
      const teamId = progettoTeam[task.projectId];
      const userId = pickRandomUser(teamId);
      return {
        id: uuidv4(),
        ...task,
        userId: userId,
        createdAt: now
      };
    });
    return queryInterface.bulkInsert('task_json', tasksWithUser);
  },

  down: (queryInterface, Sequelize) => {
    // Rimozione di tutte le task inserite dal seeder
    return queryInterface.bulkDelete('task_json', null, {});
  }
}; 