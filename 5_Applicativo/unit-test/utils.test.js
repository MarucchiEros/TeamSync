import { getColorByPriority, getInitials, getUserName, updateTaskCounters } from '../public/js/modules/utils';

let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('getColorByPriority', () => {
  it('restituisce il colore corretto per priorità alta', () => {
    expect(getColorByPriority('alta')).toBe('red');
  });
  it('restituisce il colore corretto per priorità media', () => {
    expect(getColorByPriority('media')).toBe('yellow');
  });
  it('restituisce il colore corretto per priorità bassa', () => {
    expect(getColorByPriority('bassa')).toBe('green');
  });
  it('restituisce bianco per priorità sconosciuta', () => {
    expect(getColorByPriority('altissima')).toBe('white');
    expect(getColorByPriority('')).toBe('white');
    expect(getColorByPriority(undefined)).toBe('white');
  });
});

describe('getInitials', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  it('restituisce le iniziali corrette se utente trovato', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ nome: 'Mario', cognome: 'Rossi' }) });
    const initials = await getInitials('user123');
    expect(initials).toBe('MR');
  });
  it('restituisce XX se utente non trovato', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const initials = await getInitials('user404');
    expect(initials).toBe('XX');
  });
  it('restituisce XX se fetch lancia errore', async () => {
    global.fetch.mockRejectedValue(new Error('Errore')); 
    const initials = await getInitials('user500');
    expect(initials).toBe('XX');
  });
});

describe('getUserName', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  it('restituisce il nome completo se utente trovato', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ nome: 'Anna', cognome: 'Verdi' }) });
    const name = await getUserName('user456');
    expect(name).toBe('Anna Verdi');
  });
  it('restituisce "Utente" se utente non trovato', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const name = await getUserName('user404');
    expect(name).toBe('Utente');
  });
  it('restituisce "Utente" se fetch lancia errore', async () => {
    global.fetch.mockRejectedValue(new Error('Errore')); 
    const name = await getUserName('user500');
    expect(name).toBe('Utente');
  });
});

describe('updateTaskCounters', () => {
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