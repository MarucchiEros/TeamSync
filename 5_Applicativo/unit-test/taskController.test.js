/**
 * Test per il controller delle Task dell'applicazione.
 * 
 * Questa suite verifica il comportamento delle principali operazioni CRUD sulle task:
 * creazione, lettura, aggiornamento, eliminazione e spostamento di stato.
 * Vengono simulati diversi scenari, inclusi casi di errore e permessi utente.
 * 
 * Utilizza Jest come framework di testing e mocking dei moduli.
 *
 * @module TaskControllerTest
 */
const taskController = require('../controllers/taskController');
const TaskJson = require('../models/TaskJson');
const Utente = require('../models/Utente');

let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

jest.mock('../models/TaskJson', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
}));
jest.mock('../models/Utente');
jest.mock('../utils/validator', () => ({
  validateTaskData: jest.fn()
}));
jest.mock('../models/Team', () => ({
  Team: {},
  TeamUtente: {}
}));
jest.mock('../models/Project', () => ({}));

/**
 * Suite di test per taskController.createTask
 * Verifica la creazione di una task e la gestione degli errori e permessi.
 */
describe('taskController.createTask', () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {
        titolo: 'Task 1',
        peso: 2,
        priorita: 'media',
        projectId: '123',
        userId: 1
      },
      session: { user: { id: 1, ruolo: 'admin' } },
      io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    TaskJson.create.mockReset();
  });

  /**
   * Verifica la creazione di una task con dati validi.
   */
  it('crea una task con dati validi', async () => {
    require('../utils/validator').validateTaskData.mockReturnValue(null);
    TaskJson.create.mockResolvedValue({ id: '1', ...req.body });
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  /**
   * Verifica la risposta di errore se la validazione fallisce.
   */
  it('risponde con errore se la validazione fallisce', async () => {
    require('../utils/validator').validateTaskData.mockReturnValue({ titolo: 'Titolo obbligatorio' });
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica che un utente non admin non possa assegnare task ad altri.
   */
  it('risponde con errore se utente non admin assegna task ad altri', async () => {
    req.session.user.ruolo = 'user';
    req.body.userId = 2;
    require('../utils/validator').validateTaskData.mockReturnValue(null);
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica la gestione di errori interni (eccezioni).
   */
  it('risponde con errore 500 in caso di eccezione', async () => {
    require('../utils/validator').validateTaskData.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

/**
 * Suite di test per taskController.getTasks
 * Verifica il recupero delle task di un progetto e la gestione degli errori.
 */
describe('taskController.getTasks', () => {
  let req, res;
  beforeEach(() => {
    req = { params: { projectId: '123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    TaskJson.findAll.mockReset();
  });

  /**
   * Verifica che vengano restituite le task di un progetto.
   */
  it('restituisce le task di un progetto', async () => {
    TaskJson.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    await taskController.getTasks(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 2 }));
  });

  /**
   * Verifica la risposta di errore se manca il projectId.
   */
  it('risponde con errore se manca projectId', async () => {
    req.params = {};
    await taskController.getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica la gestione di errori interni (eccezioni).
   */
  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findAll.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

/**
 * Suite di test per taskController.updateTask
 * Verifica l'aggiornamento di una task e la gestione dei permessi e degli errori.
 */
describe('taskController.updateTask', () => {
  let req, res, taskMock;
  beforeEach(() => {
    req = {
      params: { id: '1' },
      body: { titolo: 'Nuovo titolo' },
      session: { user: { id: 1, ruolo: 'admin' } },
      io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    taskMock = { update: jest.fn(), projectId: '123' };
    TaskJson.findByPk = jest.fn();
  });

  /**
   * Verifica l'aggiornamento di una task esistente.
   */
  it('aggiorna una task esistente', async () => {
    TaskJson.findByPk.mockResolvedValueOnce(taskMock).mockResolvedValueOnce({ ...taskMock, id: '1' });
    require('../utils/validator').validateTaskData.mockReturnValue(null);
    await taskController.updateTask(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  /**
   * Verifica la risposta di errore se la task non esiste.
   */
  it('risponde con errore se la task non esiste', async () => {
    TaskJson.findByPk.mockResolvedValue(null);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica che un utente non admin non possa modificare task non proprie.
   */
  it('risponde con errore se utente non admin modifica task non sua', async () => {
    req.session.user.ruolo = 'user';
    taskMock.userId = 2;
    TaskJson.findByPk.mockResolvedValue(taskMock);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica la risposta di errore se la validazione fallisce.
   */
  it('risponde con errore se la validazione fallisce', async () => {
    TaskJson.findByPk.mockResolvedValue(taskMock);
    require('../utils/validator').validateTaskData.mockReturnValue({ titolo: 'Errore' });
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica la gestione di errori interni (eccezioni).
   */
  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findByPk.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

/**
 * Suite di test per taskController.deleteTask
 * Verifica l'eliminazione di una task e la gestione degli errori.
 */
describe('taskController.deleteTask', () => {
  let req, res, taskMock;
  beforeEach(() => {
    req = { params: { id: '1' }, io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    taskMock = { destroy: jest.fn(), projectId: '123' };
    TaskJson.findByPk = jest.fn();
  });

  /**
   * Verifica l'eliminazione di una task esistente.
   */
  it('elimina una task esistente', async () => {
    TaskJson.findByPk.mockResolvedValue(taskMock);
    await taskController.deleteTask(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  /**
   * Verifica la risposta di errore se la task non esiste.
   */
  it('risponde con errore se la task non esiste', async () => {
    TaskJson.findByPk.mockResolvedValue(null);
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica la gestione di errori interni (eccezioni).
   */
  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findByPk.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

/**
 * Suite di test per taskController.moveTask
 * Verifica lo spostamento di stato di una task e la gestione degli errori.
 */
describe('taskController.moveTask', () => {
  let req, res, taskMock;
  beforeEach(() => {
    req = { params: { id: '1' }, body: { status: 'in_corso' }, io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    taskMock = { update: jest.fn(), projectId: '123' };
    TaskJson.findByPk = jest.fn();
  });

  /**
   * Verifica lo spostamento di una task in uno stato valido.
   */
  it('sposta una task in uno stato valido', async () => {
    TaskJson.findByPk.mockResolvedValue(taskMock);
    await taskController.moveTask(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  /**
   * Verifica la risposta di errore se lo stato non è valido.
   */
  it('risponde con errore se status non valido', async () => {
    req.body.status = 'non_valido';
    await taskController.moveTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica la risposta di errore se la task non esiste.
   */
  it('risponde con errore se la task non esiste', async () => {
    req.body.status = 'in_corso';
    TaskJson.findByPk.mockResolvedValue(null);
    await taskController.moveTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  /**
   * Verifica la gestione di errori interni (eccezioni).
   */
  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findByPk.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.moveTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
}); 