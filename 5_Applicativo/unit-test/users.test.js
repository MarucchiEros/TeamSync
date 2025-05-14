/**
 * Test per la gestione degli utenti tramite UserManager.
 *
 * Questa suite verifica il comportamento delle principali funzionalità di UserManager:
 * apertura e chiusura del modale, creazione, modifica, eliminazione e gestione degli errori.
 * Vengono simulati diversi scenari di interazione con il DOM e con le API.
 *
 * Utilizza Jest come framework di testing e mocking delle funzioni globali e fetch.
 *
 * @module UserManagerTest
 */
import { UserManager } from '../public/js/modules/users';

global.fetch = jest.fn();
global.alert = jest.fn();
global.showMessage = jest.fn();

let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

/**
 * Suite di test per UserManager
 * Verifica la gestione del modale utente, la creazione, modifica, eliminazione e la gestione degli errori.
 */
describe('UserManager', () => {
  let manager, modal, form, newBtn, closeBtns, nameInput, surnameInput, emailInput, roleInput, passwordInput, submitBtn;
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="user-row" data-id="1">
        <button class="btn-icon" title="Elimina" data-id="1"></button>
        <button class="btn-icon" title="Modifica" data-id="1"></button>
      </div>
      <div id="userModal"><div class="modal-header"><h2></h2></div></div>
      <form id="userForm">
        <input id="user-name" />
        <input id="user-surname" />
        <input id="user-email" />
        <select id="user-role"><option value="user">user</option><option value="admin">admin</option></select>
        <input id="user-password" />
        <button type="submit">Invia</button>
      </form>
      <button id="new-user-btn"></button>
      <button class="close-modal"></button>
    `;
    modal = document.getElementById('userModal');
    form = document.getElementById('userForm');
    newBtn = document.getElementById('new-user-btn');
    closeBtns = document.querySelectorAll('.close-modal');
    nameInput = document.getElementById('user-name');
    surnameInput = document.getElementById('user-surname');
    emailInput = document.getElementById('user-email');
    roleInput = document.getElementById('user-role');
    passwordInput = document.getElementById('user-password');
    submitBtn = form.querySelector('button[type="submit"]');
    manager = new UserManager();
    jest.clearAllMocks();
  });

  /**
   * Verifica l'apertura del modale per la creazione di un nuovo utente.
   */
  it('apre il modale per nuovo utente', () => {
    newBtn.click();
    expect(modal.style.display).toBe('block');
    expect(form.reset).toBeDefined();
    expect(passwordInput.required).toBe(true);
    expect(passwordInput.parentElement.style.display).toBe('block');
  });

  /**
   * Verifica la chiusura del modale senza modifiche.
   */
  it('chiude il modale senza modifiche', () => {
    manager.formHasChanges = false;
    manager.closeModal();
    expect(modal.style.display).toBe('none');
    expect(manager.currentUserId).toBeNull();
  });

  /**
   * Verifica la chiusura del modale con modifiche e conferma.
   */
  it('chiude il modale con modifiche e conferma', () => {
    manager.formHasChanges = true;
    global.confirm = jest.fn(() => true);
    manager.closeModal();
    expect(modal.style.display).toBe('none');
    expect(manager.currentUserId).toBeNull();
  });

  /**
   * Gestisce la submit del form per la creazione di un nuovo utente.
   */
  it('gestisce la submit del form per nuovo utente', async () => {
    nameInput.value = 'Mario';
    surnameInput.value = 'Rossi';
    emailInput.value = 'mario@rossi.it';
    roleInput.value = 'user';
    passwordInput.value = 'password123';
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    await Promise.resolve();
  });

  /**
   * Gestisce la submit del form per la modifica di un utente esistente.
   */
  it('gestisce la submit del form per modifica utente', async () => {
    manager.currentUserId = '1';
    nameInput.value = 'Mario';
    surnameInput.value = 'Rossi';
    emailInput.value = 'mario@rossi.it';
    roleInput.value = 'admin';
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    await Promise.resolve();
  });

  /**
   * Gestisce errori durante la submit del form.
   */
  it('gestisce errore nella submit del form', async () => {
    global.fetch.mockRejectedValue(new Error('Errore'));
    nameInput.value = 'Mario';
    surnameInput.value = 'Rossi';
    emailInput.value = 'mario@rossi.it';
    roleInput.value = 'user';
    passwordInput.value = 'password123';
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    await Promise.resolve();
    expect(global.showMessage).toHaveBeenCalled();
  });

  /**
   * Gestisce la modifica di un utente tramite i pulsanti di modifica (initEditButtons).
   */
  it('gestisce la modifica di un utente (initEditButtons)', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ nome: 'Mario', cognome: 'Rossi', email: 'mario@rossi.it', ruolo: 'admin' }) });
    const editBtn = document.querySelector('.btn-icon[title="Modifica"]');
    await editBtn.click();
    await Promise.resolve();
    expect(nameInput.value).toBe('Mario');
    expect(surnameInput.value).toBe('Rossi');
    expect(emailInput.value).toBe('mario@rossi.it');
    expect(roleInput.value).toBe('admin');
    expect(modal.style.display).toBe('block');
  });

  /**
   * Gestisce la cancellazione di un utente tramite i pulsanti di eliminazione (initDeleteButtons).
   */
  it('gestisce la cancellazione di un utente (initDeleteButtons)', async () => {
    global.confirm = jest.fn(() => true);
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    const deleteBtn = document.querySelector('.btn-icon[title="Elimina"]');
    const userRow = document.querySelector('.user-row');
    await deleteBtn.click();
    await Promise.resolve();
    expect(userRow.style.opacity).toBe('0');
  });

  /**
   * Gestisce errori durante la cancellazione di un utente.
   */
  it('gestisce errore nella cancellazione utente', async () => {
    global.confirm = jest.fn(() => true);
    global.fetch.mockRejectedValue(new Error('Errore'));
    const deleteBtn = document.querySelector('.btn-icon[title="Elimina"]');
    await deleteBtn.click();
    await Promise.resolve();
    expect(global.showMessage).toHaveBeenCalled();
  });
}); 