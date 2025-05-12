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

  it('crea una task con dati validi', async () => {
    require('../utils/validator').validateTaskData.mockReturnValue(null);
    TaskJson.create.mockResolvedValue({ id: '1', ...req.body });
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('risponde con errore se la validazione fallisce', async () => {
    require('../utils/validator').validateTaskData.mockReturnValue({ titolo: 'Titolo obbligatorio' });
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore se utente non admin assegna task ad altri', async () => {
    req.session.user.ruolo = 'user';
    req.body.userId = 2;
    require('../utils/validator').validateTaskData.mockReturnValue(null);
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore 500 in caso di eccezione', async () => {
    require('../utils/validator').validateTaskData.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

describe('taskController.getTasks', () => {
  let req, res;
  beforeEach(() => {
    req = { params: { projectId: '123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    TaskJson.findAll.mockReset();
  });

  it('restituisce le task di un progetto', async () => {
    TaskJson.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    await taskController.getTasks(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 2 }));
  });

  it('risponde con errore se manca projectId', async () => {
    req.params = {};
    await taskController.getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findAll.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

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

  it('aggiorna una task esistente', async () => {
    TaskJson.findByPk.mockResolvedValueOnce(taskMock).mockResolvedValueOnce({ ...taskMock, id: '1' });
    require('../utils/validator').validateTaskData.mockReturnValue(null);
    await taskController.updateTask(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('risponde con errore se la task non esiste', async () => {
    TaskJson.findByPk.mockResolvedValue(null);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore se utente non admin modifica task non sua', async () => {
    req.session.user.ruolo = 'user';
    taskMock.userId = 2;
    TaskJson.findByPk.mockResolvedValue(taskMock);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore se la validazione fallisce', async () => {
    TaskJson.findByPk.mockResolvedValue(taskMock);
    require('../utils/validator').validateTaskData.mockReturnValue({ titolo: 'Errore' });
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findByPk.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

describe('taskController.deleteTask', () => {
  let req, res, taskMock;
  beforeEach(() => {
    req = { params: { id: '1' }, io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    taskMock = { destroy: jest.fn(), projectId: '123' };
    TaskJson.findByPk = jest.fn();
  });

  it('elimina una task esistente', async () => {
    TaskJson.findByPk.mockResolvedValue(taskMock);
    await taskController.deleteTask(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('risponde con errore se la task non esiste', async () => {
    TaskJson.findByPk.mockResolvedValue(null);
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findByPk.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

describe('taskController.moveTask', () => {
  let req, res, taskMock;
  beforeEach(() => {
    req = { params: { id: '1' }, body: { status: 'in_corso' }, io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    taskMock = { update: jest.fn(), projectId: '123' };
    TaskJson.findByPk = jest.fn();
  });

  it('sposta una task in uno stato valido', async () => {
    TaskJson.findByPk.mockResolvedValue(taskMock);
    await taskController.moveTask(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('risponde con errore se status non valido', async () => {
    req.body.status = 'non_valido';
    await taskController.moveTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore se la task non esiste', async () => {
    req.body.status = 'in_corso';
    TaskJson.findByPk.mockResolvedValue(null);
    await taskController.moveTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('risponde con errore 500 in caso di eccezione', async () => {
    TaskJson.findByPk.mockImplementation(() => { throw new Error('Errore'); });
    await taskController.moveTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
}); 