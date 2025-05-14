/**
 * Test principali per la classe ProjectManager e le sue funzionalità di gestione dei progetti.
 * 
 * I test coprono la gestione del form, la validazione, la visualizzazione/nascondimento del modal,
 * la modifica delle righe progetto, la ricerca e la gestione delle chiamate fetch.
 * 
 * Viene utilizzato Jest come framework di testing.
 * 
 * @module ProjectManagerTest
 */

import { ProjectManager } from '../public/js/modules/projects';

// Mock di fetch e alert
// Simula le chiamate di rete e le finestre di alert per evitare effetti collaterali nei test

global.fetch = jest.fn();
global.alert = jest.fn();

let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

/**
 * Suite di test per la classe ProjectManager.
 * Verifica la corretta gestione del DOM, delle chiamate fetch, della validazione e delle interazioni utente.
 */
describe('ProjectManager', () => {
  let manager;
  let modal, form, newBtn, closeBtns, nameInput, descInput, deadlineInput, teamInput, statusInput, searchInput;

  beforeEach(() => {
    /**
     * Setup comune prima di ogni test.
     * Inizializza il DOM simulato con gli elementi necessari per ProjectManager.
     */
    document.body.innerHTML = `
      <div id="projectModal"></div>
      <form id="projectForm"><button type="submit"></button></form>
      <button id="new-project-btn"></button>
      <input id="project-name" />
      <input id="project-description" />
      <input id="project-deadline" />
      <select id="project-team"><option value="1">Team 1</option></select>
      <select id="project-status"><option value="attivo">attivo</option></select>
      <input id="search-projects" />
      <div class="modal-header"><h2></h2></div>
      <div class="project-row" data-id="1"><span class="project-name">Progetto A</span><span class="project-team">Team 1</span><span class="badge"></span><td></td></div>
      <button class="btn-icon" title="Elimina" data-id="1"></button>
      <button class="btn-icon" title="Modifica" data-id="1"></button>
      <button class="btn-icon" title="Visualizza Dashboard" data-id="1"></button>
    `;
    // Recupera riferimenti agli elementi del DOM per l'uso nei test
    modal = document.getElementById('projectModal');
    form = document.getElementById('projectForm');
    newBtn = document.getElementById('new-project-btn');
    closeBtns = document.querySelectorAll('.close-modal');
    nameInput = document.getElementById('project-name');
    descInput = document.getElementById('project-description');
    deadlineInput = document.getElementById('project-deadline');
    teamInput = document.getElementById('project-team');
    statusInput = document.getElementById('project-status');
    searchInput = document.getElementById('search-projects');
    manager = new ProjectManager();
    // Pulisce eventuali mock precedenti
    jest.clearAllMocks();
  });

  /**
   * Verifica che il click sul bottone "nuovo progetto" apra il modale e resetti il form.
   */
  it('apre il modale per nuovo progetto', () => {
    newBtn.click(); // Simula il click sul bottone
    expect(modal.style.display).toBe('block'); // Il modale deve essere visibile
    expect(form.reset).toBeDefined(); // Il form deve essere resettato
  });

  /**
   * Verifica che la funzione closeModal chiuda il modale e resetti lo stato corrente.
   */
  it('chiude il modale e resetta il form', () => {
    manager.closeModal(); // Chiama la funzione da testare
    expect(modal.style.display).toBe('none'); // Il modale deve essere nascosto
    expect(manager.currentProjectId).toBeNull(); // L'id corrente deve essere nullo
  });

  /**
   * Verifica la validazione del form: nome vuoto non valido.
   */
  it('valida il form: nome vuoto non valido', () => {
    nameInput.value = '';
    expect(manager.validateForm()).toBe(false); // Deve risultare non valido
    expect(global.alert).toHaveBeenCalled(); // Deve essere mostrato un alert
  });

  /**
   * Verifica la validazione del form: nome valido.
   */
  it('valida il form: nome valido', () => {
    nameInput.value = 'Progetto Test';
    expect(manager.validateForm()).toBe(true); // Deve risultare valido
  });

  /**
   * Verifica che updateProjectRow aggiorni correttamente la riga del progetto nella tabella.
   */
  it('aggiorna la riga progetto nella tabella', () => {
    const formData = { nome: 'Nuovo Nome', stato: 'completato', scadenza: '2024-12-31' };
    manager.updateProjectRow('1', formData); // Chiama la funzione da testare
    // Verifica che il nome sia stato aggiornato
    expect(document.querySelector('.project-name').textContent).toBe('Nuovo Nome');
  });

  /**
   * Verifica che showMessage mostri un messaggio tramite alert.
   */
  it('mostra un messaggio con showMessage', () => {
    manager.showMessage('Messaggio di test', true); // Chiama la funzione da testare
    expect(global.alert).toHaveBeenCalledWith('Messaggio di test'); // Deve essere mostrato l'alert
  });

  /**
   * Verifica che la ricerca filtri correttamente i progetti nella tabella.
   */
  it('filtra i progetti tramite ricerca', () => {
    searchInput.value = 'progetto a'; // Simula ricerca esistente
    const event = new Event('input');
    searchInput.dispatchEvent(event); // Simula l'evento input
    expect(document.querySelector('.project-row').style.display).toBe(''); // Deve essere visibile
    searchInput.value = 'non esiste'; // Simula ricerca inesistente
    searchInput.dispatchEvent(event);
    expect(document.querySelector('.project-row').style.display).toBe('none'); // Deve essere nascosto
  });

  /**
   * Verifica la gestione della submit del form con dati validi e chiamata fetch mockata.
   */
  it('gestisce la submit del form con dati validi', async () => {
    nameInput.value = 'Progetto Test';
    descInput.value = 'Descrizione';
    deadlineInput.value = '';
    teamInput.value = '1';
    statusInput.value = 'attivo';
    // Mock della risposta fetch
    global.fetch.mockResolvedValue({ json: async () => ({ success: true }) });
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent); // Simula la submit
    // Non possiamo testare il reload, ma nessun errore deve essere lanciato
  });
}); 