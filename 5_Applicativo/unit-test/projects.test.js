import { ProjectManager } from '../public/js/modules/projects';

// Mock di fetch e alert
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

describe('ProjectManager', () => {
  let manager;
  let modal, form, newBtn, closeBtns, nameInput, descInput, deadlineInput, teamInput, statusInput, searchInput;

  beforeEach(() => {
    // Set up DOM
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
    jest.clearAllMocks();
  });

  it('apre il modale per nuovo progetto', () => {
    newBtn.click();
    expect(modal.style.display).toBe('block');
    expect(form.reset).toBeDefined();
  });

  it('chiude il modale e resetta il form', () => {
    manager.closeModal();
    expect(modal.style.display).toBe('none');
    expect(manager.currentProjectId).toBeNull();
  });

  it('valida il form: nome vuoto non valido', () => {
    nameInput.value = '';
    expect(manager.validateForm()).toBe(false);
    expect(global.alert).toHaveBeenCalled();
  });

  it('valida il form: nome valido', () => {
    nameInput.value = 'Progetto Test';
    expect(manager.validateForm()).toBe(true);
  });

  it('aggiorna la riga progetto nella tabella', () => {
    const formData = { nome: 'Nuovo Nome', stato: 'completato', scadenza: '2024-12-31' };
    manager.updateProjectRow('1', formData);
    expect(document.querySelector('.project-name').textContent).toBe('Nuovo Nome');
  });

  it('mostra un messaggio con showMessage', () => {
    manager.showMessage('Messaggio di test', true);
    expect(global.alert).toHaveBeenCalledWith('Messaggio di test');
  });

  it('filtra i progetti tramite ricerca', () => {
    searchInput.value = 'progetto a';
    const event = new Event('input');
    searchInput.dispatchEvent(event);
    expect(document.querySelector('.project-row').style.display).toBe('');
    searchInput.value = 'non esiste';
    searchInput.dispatchEvent(event);
    expect(document.querySelector('.project-row').style.display).toBe('none');
  });

  // Test per la submit del form (mock fetch)
  it('gestisce la submit del form con dati validi', async () => {
    nameInput.value = 'Progetto Test';
    descInput.value = 'Descrizione';
    deadlineInput.value = '';
    teamInput.value = '1';
    statusInput.value = 'attivo';
    global.fetch.mockResolvedValue({ json: async () => ({ success: true }) });
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    // Non possiamo testare il reload, ma nessun errore deve essere lanciato
  });
}); 