/**
 * Modulo per la validazione dei dati inseriti dagli utenti
 * Fornisce funzioni di validazione per tutti i tipi di input nel sistema
 */

// Costanti per i limiti
const LIMITS = {
    NOME_MAX_LENGTH: 100,
    COGNOME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 50,
    TITOLO_MAX_LENGTH: 200,
    DESCRIZIONE_MAX_LENGTH: 2000,
    TEAM_NOME_MAX_LENGTH: 100,
    TEAM_DESCRIZIONE_MAX_LENGTH: 1000
};

// Espressioni regolari per le validazioni
const REGEX = {
    EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    COLORE: /^#[0-9A-Fa-f]{6}$/,
    SOLO_LETTERE: /^[A-Za-zÀ-ÿ\s'-]+$/
};

/**
 * Valida i dati dell'utente per registrazione/aggiornamento
 * @param {Object} userData - Dati dell'utente da validare
 * @returns {Object} Oggetto con errori se presenti
 */
const validateUserData = (userData) => {
    const errors = {};

    // Validazione nome
    if (!userData.nome || !userData.nome.trim()) {
        errors.nome = 'Il nome è obbligatorio';
    } else if (userData.nome.length > LIMITS.NOME_MAX_LENGTH) {
        errors.nome = `Il nome non può superare i ${LIMITS.NOME_MAX_LENGTH} caratteri`;
    } else if (!REGEX.SOLO_LETTERE.test(userData.nome)) {
        errors.nome = 'Il nome può contenere solo lettere, spazi e trattini';
    }

    // Validazione cognome
    if (!userData.cognome || !userData.cognome.trim()) {
        errors.cognome = 'Il cognome è obbligatorio';
    } else if (userData.cognome.length > LIMITS.COGNOME_MAX_LENGTH) {
        errors.cognome = `Il cognome non può superare i ${LIMITS.COGNOME_MAX_LENGTH} caratteri`;
    } else if (!REGEX.SOLO_LETTERE.test(userData.cognome)) {
        errors.cognome = 'Il cognome può contenere solo lettere, spazi e trattini';
    }

    // Validazione email
    if (!userData.email || !userData.email.trim()) {
        errors.email = 'L\'email è obbligatoria';
    } else if (userData.email.length > LIMITS.EMAIL_MAX_LENGTH) {
        errors.email = `L'email non può superare i ${LIMITS.EMAIL_MAX_LENGTH} caratteri`;
    } else if (!REGEX.EMAIL.test(userData.email)) {
        errors.email = 'Email non valida';
    }

    // Validazione password (solo se presente)
    if (userData.password) {
        if (userData.password.length < LIMITS.PASSWORD_MIN_LENGTH) {
            errors.password = `La password deve essere di almeno ${LIMITS.PASSWORD_MIN_LENGTH} caratteri`;
        } else if (userData.password.length > LIMITS.PASSWORD_MAX_LENGTH) {
            errors.password = `La password non può superare i ${LIMITS.PASSWORD_MAX_LENGTH} caratteri`;
        } else if (!REGEX.PASSWORD.test(userData.password)) {
            errors.password = 'La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale';
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Valida i dati di una task
 * @param {Object} taskData - Dati della task da validare
 * @param {boolean} isUpdate - Indica se si tratta di un aggiornamento
 * @returns {Object} Oggetto con errori se presenti
 */
const validateTaskData = (taskData, isUpdate = false) => {
    const errors = {};

    // Se è un aggiornamento, valida solo i campi presenti
    if (isUpdate) {
        if (taskData.titolo !== undefined) {
            if (!taskData.titolo || !taskData.titolo.trim()) {
                errors.titolo = 'Il titolo è obbligatorio';
            } else if (taskData.titolo.length > LIMITS.TITOLO_MAX_LENGTH) {
                errors.titolo = `Il titolo non può superare i ${LIMITS.TITOLO_MAX_LENGTH} caratteri`;
            }
        }

        if (taskData.descrizione !== undefined && taskData.descrizione.length > LIMITS.DESCRIZIONE_MAX_LENGTH) {
            errors.descrizione = `La descrizione non può superare i ${LIMITS.DESCRIZIONE_MAX_LENGTH} caratteri`;
        }

        if (taskData.peso !== undefined) {
            if (isNaN(taskData.peso) || taskData.peso < 1 || taskData.peso > 10) {
                errors.peso = 'Il peso deve essere un numero tra 1 e 10';
            }
        }

        if (taskData.priorita !== undefined && !['bassa', 'media', 'alta'].includes(taskData.priorita)) {
            errors.priorita = 'Priorità non valida';
        }

        if (taskData.scadenza) {
            const scadenza = new Date(taskData.scadenza);
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0);

            if (isNaN(scadenza.getTime())) {
                errors.scadenza = 'Data di scadenza non valida';
            } else if (scadenza < oggi) {
                errors.scadenza = 'La data di scadenza non può essere nel passato';
            }
        }

        if (taskData.colore !== undefined && !REGEX.COLORE.test(taskData.colore)) {
            errors.colore = 'Formato colore non valido (deve essere #RRGGBB)';
        }

        if (taskData.status !== undefined && !['da_fare', 'in_corso', 'in_revisione', 'completati'].includes(taskData.status)) {
            errors.status = 'Status non valido';
        }
    } else {
        // Validazione per creazione nuova task
        if (!taskData.titolo || !taskData.titolo.trim()) {
            errors.titolo = 'Il titolo è obbligatorio';
        } else if (taskData.titolo.length > LIMITS.TITOLO_MAX_LENGTH) {
            errors.titolo = `Il titolo non può superare i ${LIMITS.TITOLO_MAX_LENGTH} caratteri`;
        }

        if (taskData.descrizione && taskData.descrizione.length > LIMITS.DESCRIZIONE_MAX_LENGTH) {
            errors.descrizione = `La descrizione non può superare i ${LIMITS.DESCRIZIONE_MAX_LENGTH} caratteri`;
        }

        if (!taskData.peso) {
            errors.peso = 'Il peso è obbligatorio';
        } else if (isNaN(taskData.peso) || taskData.peso < 1 || taskData.peso > 10) {
            errors.peso = 'Il peso deve essere un numero tra 1 e 10';
        }

        if (!taskData.priorita) {
            errors.priorita = 'La priorità è obbligatoria';
        } else if (!['bassa', 'media', 'alta'].includes(taskData.priorita)) {
            errors.priorita = 'Priorità non valida';
        }

        if (taskData.scadenza) {
            const scadenza = new Date(taskData.scadenza);
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0);

            if (isNaN(scadenza.getTime())) {
                errors.scadenza = 'Data di scadenza non valida';
            } else if (scadenza < oggi) {
                errors.scadenza = 'La data di scadenza non può essere nel passato';
            }
        }

        if (taskData.colore && !REGEX.COLORE.test(taskData.colore)) {
            errors.colore = 'Formato colore non valido (deve essere #RRGGBB)';
        }

        if (taskData.status && !['da_fare', 'in_corso', 'in_revisione', 'completati'].includes(taskData.status)) {
            errors.status = 'Status non valido';
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Valida i dati di un team
 * @param {Object} teamData - Dati del team da validare
 * @returns {Object} Oggetto con errori se presenti
 */
const validateTeamData = (teamData) => {
    const errors = {};

    // Validazione nome team
    if (!teamData.nome || !teamData.nome.trim()) {
        errors.nome = 'Il nome del team è obbligatorio';
    } else if (teamData.nome.length > LIMITS.TEAM_NOME_MAX_LENGTH) {
        errors.nome = `Il nome del team non può superare i ${LIMITS.TEAM_NOME_MAX_LENGTH} caratteri`;
    }

    // Validazione descrizione team (se presente)
    if (teamData.descrizione && teamData.descrizione.length > LIMITS.TEAM_DESCRIZIONE_MAX_LENGTH) {
        errors.descrizione = `La descrizione del team non può superare i ${LIMITS.TEAM_DESCRIZIONE_MAX_LENGTH} caratteri`;
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Valida i dati di un progetto
 * @param {Object} projectData - Dati del progetto da validare
 * @returns {Object} Oggetto con errori se presenti
 */
const validateProjectData = (projectData) => {
    const errors = {};

    // Validazione nome progetto
    if (!projectData.nome || !projectData.nome.trim()) {
        errors.nome = 'Il nome del progetto è obbligatorio';
    } else if (projectData.nome.length > LIMITS.TITOLO_MAX_LENGTH) {
        errors.nome = `Il nome del progetto non può superare i ${LIMITS.TITOLO_MAX_LENGTH} caratteri`;
    }

    // Validazione descrizione (se presente)
    if (projectData.descrizione && projectData.descrizione.length > LIMITS.DESCRIZIONE_MAX_LENGTH) {
        errors.descrizione = `La descrizione non può superare i ${LIMITS.DESCRIZIONE_MAX_LENGTH} caratteri`;
    }

    // Validazione scadenza
    if (projectData.scadenza) {
        const scadenza = new Date(projectData.scadenza);
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        if (isNaN(scadenza.getTime())) {
            errors.scadenza = 'Data di scadenza non valida';
        } else if (scadenza < oggi) {
            errors.scadenza = 'La data di scadenza non può essere nel passato';
        }
    }

    // Validazione stato
    if (projectData.stato && !['attivo', 'completato'].includes(projectData.stato)) {
        errors.stato = 'Stato non valido';
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
    validateUserData,
    validateTaskData,
    validateTeamData,
    validateProjectData,
    LIMITS,
    REGEX
}; 