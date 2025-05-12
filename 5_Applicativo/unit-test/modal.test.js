import { TaskModal } from '../public/js/modules/modal';

global.fetch = jest.fn();

let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('TaskModal', () => {
  let modalDiv, form, assegnazioneGroup, colorPreview, modalHeader, closeBtn, addBtn;
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="taskModal">
        <div class="modal-header"><h2></h2></div>
        <div class="color-preview"></div>
      </div>
      <form id="taskForm">
        <input name="titolo" id="titolo" />
        <input name="descrizione" id="descrizione" />
        <input name="peso" id="peso" />
        <input name="priorita" id="priorita" />
        <input name="scadenza" id="scadenza" />
        <input name="colore" id="colore" />
        <select id="id_assegnato"></select>
        <input type="checkbox" id="assegnata_a_me" />
      </form>
      <div class="form-group"><input id="other-user-assignment" /></div>
      <button class="add-task"></button>
      <button class="close-modal"></button>
    `;
    modalDiv = document.getElementById('taskModal');
    form = document.getElementById('taskForm');
    form.titolo = form.elements['titolo'];
    form.descrizione = form.elements['descrizione'];
    form.peso = form.elements['peso'];
    form.priorita = form.elements['priorita'];
    form.scadenza = form.elements['scadenza'];
    form.colore = form.elements['colore'];
    assegnazioneGroup = document.querySelector('.form-group');
    colorPreview = document.querySelector('.color-preview');
    modalHeader = document.querySelector('.modal-header h2');
    closeBtn = document.querySelector('.close-modal');
    addBtn = document.querySelector('.add-task');
    jest.clearAllMocks();
  });

  it('resetForm resetta il form e lo stato', () => {
    const modal = new TaskModal('1');
    form.dataset.taskId = '123';
    modalHeader.textContent = 'Vecchio titolo';
    colorPreview.style.backgroundColor = '#000000';
    modal.resetForm();
    expect(form.dataset.taskId).toBeUndefined();
    expect(modalHeader.textContent).toBe('Nuova Task');
    expect(colorPreview.style.backgroundColor).toBe('rgb(255, 255, 255)');
  });

  it('close nasconde il modal e resetta il form', () => {
    const modal = new TaskModal('1');
    modalDiv.style.display = 'block';
    modal.close();
    expect(modalDiv.style.display).toBe('none');
  });

  it('populateUserSelect popola la select con i membri del team', () => {
    const modal = new TaskModal('1');
    modal.teamMembers = [
      { id: 1, nome: 'Mario', cognome: 'Rossi' },
      { id: 2, nome: 'Luca', cognome: 'Bianchi' }
    ];
    const select = document.createElement('select');
    modal.populateUserSelect(select, 2);
    expect(select.children.length).toBe(3); // 2 membri + 1 option default
    expect(select.children[2].selected).toBe(true);
  });

  it('loadTeamMembers restituisce i membri del team (mock fetch)', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ members: [{ id: 1, nome: 'Mario', cognome: 'Rossi' }] }) });
    const modal = new TaskModal('1');
    const members = await modal.loadTeamMembers();
    expect(members.length).toBe(1);
    expect(members[0].nome).toBe('Mario');
  });

  it('loadTeamMembers gestisce errori e restituisce array vuoto', async () => {
    fetch.mockRejectedValue(new Error('Errore')); // Simula errore fetch
    const modal = new TaskModal('1');
    const members = await modal.loadTeamMembers();
    expect(members).toEqual([]);
  });

  it('getProject restituisce i dati del progetto (mock fetch)', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ id: 1, nome: 'Progetto' }) });
    const modal = new TaskModal('1');
    const project = await modal.getProject(1);
    expect(project.nome).toBe('Progetto');
  });

  it('getProject lancia errore se fetch fallisce', async () => {
    fetch.mockResolvedValue({ ok: false });
    const modal = new TaskModal('1');
    await expect(modal.getProject(1)).rejects.toThrow('Errore nel recupero del progetto');
  });

  it('openForEdit (admin) popola il form e la select', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ members: [{ id: 1, nome: 'Mario', cognome: 'Rossi' }] }) });
    const modal = new TaskModal('1');
    const taskData = { id: 1, titolo: 'T', descrizione: 'D', peso: 2, priorita: 'alta', scadenza: '2024-12-31T00:00:00.000Z', colore: '#123456', userId: 1 };
    const currentUser = { ruolo: 'admin' };
    await modal.openForEdit(taskData, currentUser);
    expect(form.elements['titolo'].value).toBe('T');
    expect(form.elements['descrizione'].value).toBe('D');
    expect(form.elements['peso'].value).toBe('2');
    expect(form.elements['priorita'].value).toBe('alta');
    expect(form.elements['scadenza'].value).toBe('2024-12-31');
    expect(form.elements['colore'].value).toBe('#123456');
    expect(modalDiv.style.display).toBe('block');
  });

  it('openForEdit (user) seleziona assegnata_a_me se userId coincide', async () => {
    const modal = new TaskModal('1');
    const taskData = { id: 1, titolo: 'T', descrizione: 'D', peso: 2, priorita: 'alta', scadenza: '', colore: '', userId: 5 };
    const currentUser = { ruolo: 'user', id: 5 };
    const assegnataAMe = form.querySelector('#assegnata_a_me');
    assegnataAMe.checked = false;
    await modal.openForEdit(taskData, currentUser);
    expect(assegnataAMe.checked).toBe(true);
    expect(modalDiv.style.display).toBe('block');
  });
}); 