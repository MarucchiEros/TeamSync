const authController = require('../controllers/authController');
const Utente = require('../models/Utente');
const messages = require('../config/messages');

let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

jest.mock('../models/Utente');
jest.mock('../utils/validator', () => ({
  validateUserData: jest.fn()
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));
jest.mock('../utils/emailService', () => ({
  sendConfirmationEmail: jest.fn()
}));

describe('authController.register', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario@rossi.it',
        password: 'password123'
      },
      session: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    Utente.findOne.mockReset();
    Utente.create.mockReset();
  });

  it('registra un nuovo utente con dati validi', async () => {
    require('../utils/validator').validateUserData.mockReturnValue(null);
    Utente.findOne.mockResolvedValue(null);
    require('bcrypt').hash.mockResolvedValue('hashedPassword');
    Utente.create.mockResolvedValue({ id: 1, nome: 'Mario', cognome: 'Rossi', email: 'mario@rossi.it', ruolo: 'user' });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      user: expect.objectContaining({ email: 'mario@rossi.it' })
    }));
  });

  it('risponde con errore se la validazione fallisce', async () => {
    require('../utils/validator').validateUserData.mockReturnValue({ email: 'Email non valida' });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Errori di validazione',
      errors: { email: 'Email non valida' }
    }));
  });

  it('risponde con errore se l\'email è già registrata', async () => {
    require('../utils/validator').validateUserData.mockReturnValue(null);
    Utente.findOne.mockResolvedValue({ id: 2 });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: messages.auth.emailExists
    }));
  });
});

describe('authController.login', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'mario@rossi.it',
        password: 'password123'
      },
      session: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    Utente.findOne.mockReset();
  });

  it('fa il login con credenziali valide', async () => {
    require('../utils/validator').validateUserData.mockReturnValue(null);
    Utente.findOne.mockResolvedValue({
      id: 1,
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario@rossi.it',
      ruolo: 'user',
      password_hash: 'hashedPassword'
    });
    require('bcrypt').compare = jest.fn().mockResolvedValue(true);

    await authController.login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      user: expect.objectContaining({ email: 'mario@rossi.it' })
    }));
  });

  it('risponde con errore se la validazione fallisce', async () => {
    require('../utils/validator').validateUserData.mockReturnValue({ email: 'Email non valida' });

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Errori di validazione',
      errors: { email: 'Email non valida' }
    }));
  });

  it('risponde con errore se utente non trovato', async () => {
    require('../utils/validator').validateUserData.mockReturnValue(null);
    Utente.findOne.mockResolvedValue(null);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: messages.auth.invalidCredentials
    }));
  });

  it('risponde con errore se la password è errata', async () => {
    require('../utils/validator').validateUserData.mockReturnValue(null);
    Utente.findOne.mockResolvedValue({
      id: 1,
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario@rossi.it',
      ruolo: 'user',
      password_hash: 'hashedPassword'
    });
    require('bcrypt').compare = jest.fn().mockResolvedValue(false);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: messages.auth.invalidCredentials
    }));
  });

  it('risponde con errore 500 in caso di eccezione', async () => {
    require('../utils/validator').validateUserData.mockImplementation(() => { throw new Error('Errore'); });

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: messages.auth.loginError
    }));
  });
});

describe('authController.logout', () => {
  let req, res;

  beforeEach(() => {
    req = {
      session: {
        destroy: jest.fn()
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('fa il logout con successo', () => {
    req.session.destroy.mockImplementation(cb => cb(null));

    authController.logout(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: messages.auth.logoutSuccess,
      redirectUrl: '/auth'
    }));
  });

  it('risponde con errore se destroy fallisce', () => {
    req.session.destroy.mockImplementation(cb => cb(new Error('Errore')));

    authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: messages.auth.logoutError
    }));
  });

  it('risponde con errore 500 in caso di eccezione', () => {
    req.session.destroy = null; // Forza un errore

    authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: messages.auth.logoutError
    }));
  });
}); 