/**
 * Configurazione dei messaggi dell'applicazione
 * Questo modulo contiene tutti i messaggi di errore, validazione e feedback
 * utilizzati nell'applicazione, organizzati per categoria.
 * 
 * Struttura generale dei messaggi:
 * - message: Messaggio principale breve e conciso
 * - details: Array o oggetto con dettagli specifici
 * - example: Esempi pratici per aiutare l'utente
 */

const messages = {
    /**
     * Messaggi relativi alla validazione della password
     * Contiene regole di sicurezza e requisiti minimi
     */
    password: {
        invalid: {
            message: 'La password non soddisfa i requisiti di sicurezza',
            details: {
                length: 'La password deve essere di almeno 8 caratteri',
                uppercase: 'La password deve contenere almeno una lettera maiuscola',
                lowercase: 'La password deve contenere almeno una lettera minuscola',
                number: 'La password deve contenere almeno un numero',
                special: 'La password deve contenere almeno un carattere speciale'
            },
            example: 'Esempio: Test$123'
        }
    },

    /**
     * Messaggi relativi alla validazione dell'email
     * Include controlli sul formato e sulla duplicazione
     */
    email: {
        invalid: {
            message: 'L\'indirizzo email non è valido',
            details: [
                'L\'email deve contenere:',
                '• Un nome utente (prima della @)',
                '• Il simbolo @',
                '• Un dominio (es. gmail.com)'
            ],
            example: 'Esempi di email valide:\n' +
                    '• mario.rossi@gmail.com\n' +
                    '• nome.cognome@azienda.it\n' +
                    '• utente123@hotmail.com'
        },
        exists: {
            message: 'Questa email è già registrata',
            details: [
                'L\'indirizzo email che hai inserito è già presente nel nostro sistema.',
                'Se hai dimenticato la password, puoi utilizzare la funzione "Password dimenticata".'
            ],
            example: 'Puoi:\n' +
                    '• Effettuare il login se hai già un account\n' +
                    '• Utilizzare un altro indirizzo email\n' +
                    '• Richiedere il reset della password'
        }
    },

    /**
     * Messaggi relativi al processo di login
     * Gestisce errori di autenticazione e credenziali errate
     */
    login: {
        accountNotFound: {
            message: 'Account non trovato',
            details: [
                'Non esiste nessun account registrato con questa email.',
                'Verifica di aver inserito l\'indirizzo corretto.'
            ],
            example: 'Puoi:\n' +
                    '• Controllare se l\'email è scritta correttamente\n' +
                    '• Registrarti se non hai ancora un account\n' +
                    '• Utilizzare un altro indirizzo email se ne hai uno'
        },
        wrongPassword: {
            message: 'Password non corretta',
            details: [
                'La password inserita non corrisponde a quella del tuo account.',
                'Ricorda che la password è sensibile alle maiuscole e minuscole.'
            ],
            example: 'Puoi:\n' +
                    '• Verificare di aver inserito la password corretta\n' +
                    '• Controllare se il tasto Caps Lock è attivo\n' +
                    '• Utilizzare la funzione "Password dimenticata" se necessario'
        }
    },

    /**
     * Messaggi relativi alla gestione della sessione
     * Gestisce errori durante la creazione e distruzione della sessione
     */
    session: {
        error: {
            message: 'Errore durante la gestione della sessione',
            details: ['Si è verificato un errore durante la creazione della sessione'],
            example: 'Riprova più tardi o contatta l\'assistenza se il problema persiste'
        }
    },

    /**
     * Messaggi relativi al processo di logout
     * Gestisce errori durante la chiusura della sessione
     */
    logout: {
        error: {
            message: 'Errore durante il logout',
            details: ['Si è verificato un errore durante la distruzione della sessione'],
            example: 'Riprova più tardi o contatta l\'assistenza se il problema persiste'
        }
    },

    auth: {
        // Messaggi di successo
        registrationSuccess: 'Registrazione completata con successo',
        loginSuccess: 'Login effettuato con successo',
        logoutSuccess: 'Logout effettuato con successo',

        // Messaggi di errore
        registrationError: 'Si è verificato un errore durante la registrazione',
        loginError: 'Si è verificato un errore durante il login',
        logoutError: 'Si è verificato un errore durante il logout',
        invalidCredentials: 'Credenziali non valide',
        emailExists: 'Email già registrata',
        unauthorized: 'Non sei autorizzato ad accedere a questa risorsa',
        sessionExpired: 'Sessione scaduta, effettua nuovamente il login'
    },

    validation: {
        required: 'Campo obbligatorio',
        invalidFormat: 'Formato non valido',
        tooLong: 'Lunghezza massima superata',
        tooShort: 'Lunghezza minima non raggiunta',
        invalidDate: 'Data non valida',
        pastDate: 'La data non può essere nel passato',
        invalidStatus: 'Stato non valido',
        invalidPriority: 'Priorità non valida',
        invalidWeight: 'Il peso deve essere un numero tra 1 e 10',
        invalidColor: 'Colore non valido (formato: #RRGGBB)'
    },

    database: {
        connectionError: 'Errore di connessione al database',
        queryError: 'Errore durante l\'esecuzione della query'
    },

    server: {
        internalError: 'Errore interno del server',
        notFound: 'Risorsa non trovata',
        badRequest: 'Richiesta non valida'
    }
};

module.exports = messages; 