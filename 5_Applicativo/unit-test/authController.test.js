/**
 * Test per il controller di autenticazione (`authController`)
 * 
 * Comprende test per:
 * - Registrazione (`register`)
 * - Login (`login`)
 * - Logout (`logout`)
 * 
 * Vengono utilizzati mock per i moduli esterni (modello Utente, bcrypt, validator, emailService)
 * e viene soppressa temporaneamente la stampa degli errori sulla console.
 */

const authController = require('../controllers/authController');
const Utente = require('../models/Utente');
const messages = require('../config/messages');

// Soppressione temporanea degli errori di console per pulizia output test
let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// Mock dei moduli utilizzati da authController
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

/**
 * Test per la funzione di registrazione `authController.register`
 */
describe('authController.register', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario@rossi.it',
        password: 'password123',
        terms: true
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

  /**
   * Verifica la registrazione con dati validi
   */
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

  /**
   * Gestione errore di validazione input
   */
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

  /**
   * Verifica il controllo email duplicata
   */
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

/**
 * Test per la funzione di login `authController.login`
 */
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

  /**
   * Login con credenziali corrette
   */
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

  /**
   * Login fallito per errore di validazione
   */
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

  /**
   * Login fallito: utente non trovato
   */
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

  /**
   * Login fallito: password errata
   */
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

  /**
   * Gestione eccezione generica
   */
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

/**
 * Test per la funzione di logout `authController.logout`
 */
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
      json: jest.fn(),
      render: jest.fn(),
      redirect: jest.fn()
    };
  });

  /**
   * Logout corretto
   */
  it('fa il logout con successo', () => {
    req.session.destroy.mockImplementation(cb => cb(null));

    authController.logout(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  /**
   * Errore durante la distruzione della sessione
   */
  it('risponde con errore se destroy fallisce', () => {
    req.session.destroy.mockImplementation(cb => cb(new Error('Errore')));

    authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('auth', { activeTab: 'login', error: 'Errore durante il logout' });
  });

  /**
   * Eccezione generica nel logout
   */
  it('risponde con errore 500 in caso di eccezione', () => {
    req.session.destroy = null; // Forza un errore

    authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('auth', { activeTab: 'login', error: 'Errore durante il logout' });
  });
});
