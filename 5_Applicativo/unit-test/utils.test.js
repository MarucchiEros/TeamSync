/**
 * Test per le utility di supporto dell'applicazione.
 *
 * Questa suite verifica il comportamento delle funzioni di utilità:
 * getColorByPriority, getInitials, getUserName e updateTaskCounters.
 * Vengono simulati diversi scenari, inclusi casi di errore e interazione con il DOM.
 *
 * Utilizza Jest come framework di testing e mocking delle funzioni globali e fetch.
 *
 * @module UtilsTest
 */
import { getColorByPriority, getInitials, getUserName, updateTaskCounters } from '../public/js/modules/utils';

let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

/**
 * Suite di test per getColorByPriority
 * Verifica la restituzione del colore corretto in base alla priorità.
 */
describe('getColorByPriority', () => {
  /**
   * Verifica il colore per priorità alta.
   */
  it('restituisce il colore corretto per priorità alta', () => {
    expect(getColorByPriority('alta')).toBe('red');
  });
  /**
   * Verifica il colore per priorità media.
   */
  it('restituisce il colore corretto per priorità media', () => {
    expect(getColorByPriority('media')).toBe('yellow');
  });
  /**
   * Verifica il colore per priorità bassa.
   */
  it('restituisce il colore corretto per priorità bassa', () => {
    expect(getColorByPriority('bassa')).toBe('green');
  });
  /**
   * Verifica il colore per priorità sconosciuta.
   */
  it('restituisce bianco per priorità sconosciuta', () => {
    expect(getColorByPriority('altissima')).toBe('white');
    expect(getColorByPriority('')).toBe('white');
    expect(getColorByPriority(undefined)).toBe('white');
  });
});

/**
 * Suite di test per getInitials
 * Verifica la generazione delle iniziali dell'utente in vari scenari.
 */
describe('getInitials', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  /**
   * Verifica le iniziali se l'utente viene trovato.
   */
  it('restituisce le iniziali corrette se utente trovato', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ nome: 'Mario', cognome: 'Rossi' }) });
    const initials = await getInitials('user123');
    expect(initials).toBe('MR');
  });
  /**
   * Verifica il caso in cui l'utente non viene trovato.
   */
  it('restituisce XX se utente non trovato', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const initials = await getInitials('user404');
    expect(initials).toBe('XX');
  });
  /**
   * Verifica il caso in cui fetch lancia errore.
   */
  it('restituisce XX se fetch lancia errore', async () => {
    global.fetch.mockRejectedValue(new Error('Errore')); 
    const initials = await getInitials('user500');
    expect(initials).toBe('XX');
  });
});

/**
 * Suite di test per getUserName
 * Verifica la generazione del nome completo dell'utente in vari scenari.
 */
describe('getUserName', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  /**
   * Verifica il nome completo se l'utente viene trovato.
   */
  it('restituisce il nome completo se utente trovato', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ nome: 'Anna', cognome: 'Verdi' }) });
    const name = await getUserName('user456');
    expect(name).toBe('Anna Verdi');
  });
  /**
   * Verifica il caso in cui l'utente non viene trovato.
   */
  it('restituisce "Utente" se utente non trovato', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const name = await getUserName('user404');
    expect(name).toBe('Utente');
  });
  /**
   * Verifica il caso in cui fetch lancia errore.
   */
  it('restituisce "Utente" se fetch lancia errore', async () => {
    global.fetch.mockRejectedValue(new Error('Errore')); 
    const name = await getUserName('user500');
    expect(name).toBe('Utente');
  });
});

/**
 * Suite di test per updateTaskCounters
 * Verifica l'aggiornamento dei contatori delle colonne Kanban.
 */
describe('updateTaskCounters', () => {
  /**
   * Verifica che i contatori delle colonne Kanban vengano aggiornati correttamente.
   */
  it('aggiorna i contatori delle colonne Kanban', () => {
    document.body.innerHTML = `
      <div class="kanban-column">
        <div class="task-list">
          <div class="task"></div>
          <div class="task"></div>
        </div>
        <span class="task-count"></span>
      </div>
      <div class="kanban-column">
        <div class="task-list">
          <div class="task"></div>
        </div>
        <span class="task-count"></span>
      </div>
    `;
    updateTaskCounters();
    const counts = Array.from(document.querySelectorAll('.task-count')).map(e => e.textContent);
    expect(counts).toEqual(['2', '1']);
  });
}); 