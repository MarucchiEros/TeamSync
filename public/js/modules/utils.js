/**
 * Modulo per le funzioni di utilità
 * Fornisce funzioni helper utilizzate in tutta l'applicazione
 * Implementa sistema di cache per ottimizzare le richieste
 * 
 * Funzionalità principali:
 * - Gestione colori per priorità delle task
 * - Recupero e formattazione dati utente (nome completo, iniziali)
 * - Sistema di cache utenti per ottimizzare le prestazioni
 * - Contatori dinamici per board Kanban
 * 
 * Esempio di utilizzo:
 * ```js
 * // Recupero colore priorità
 * const colore = getColorByPriority('alta'); // returns 'red'
 * 
 * // Recupero dati utente
 * const iniziali = await getInitials('user123'); // returns 'MR'
 * const nomeCompleto = await getUserName('user123'); // returns 'Mario Rossi'
 * 
 * // Aggiornamento contatori Kanban
 * updateTaskCounters(); // Aggiorna tutti i contatori della board
 * ```
 */

/**
 * Cache per memorizzare i dati degli utenti
 * Evita richieste ripetute al server per gli stessi dati
 * La cache viene mantenuta in memoria durante la sessione
 * 
 * Struttura della cache:
 * {
 *   'userId1': { nome: 'Mario', cognome: 'Rossi', ... },
 *   'userId2': { nome: 'Anna', cognome: 'Verdi', ... }
 * }
 * 
 * @type {Object.<string, Object>}
 */
let usersCache = {};

/**
 * Determina il colore associato a una priorità
 * Utilizzato per la visualizzazione delle task nella board Kanban
 * I colori seguono uno schema intuitivo:
 * - Rosso per alta priorità (urgente)
 * - Giallo per media priorità (importante)
 * - Verde per bassa priorità (normale)
 * 
 * @param {string} priority - Livello di priorità ('alta', 'media', 'bassa')
 * @returns {string} Colore corrispondente alla priorità
 * @example
 * const coloreUrgente = getColorByPriority('alta'); // returns 'red'
 * const coloreNormale = getColorByPriority('bassa'); // returns 'green'
 */
export function getColorByPriority(priority) {
    const colors = {
        alta: 'red',
        media: 'yellow',
        bassa: 'green'
    };
    return colors[priority] || 'white';
}

/**
 * Recupera le iniziali di un utente dal suo ID
 * Utilizza il sistema di cache per ottimizzare le prestazioni
 * Le iniziali vengono generate prendendo la prima lettera del nome
 * e la prima lettera del cognome, convertite in maiuscolo
 * 
 * @async
 * @param {string} userId - ID dell'utente
 * @returns {Promise<string>} Iniziali dell'utente (es. 'MR' per 'Mario Rossi')
 * @throws {Error} Se il recupero dati dal server fallisce
 * @example
 * try {
 *   const iniziali = await getInitials('user123'); // returns 'MR'
 * } catch (error) {
 *   console.error('Impossibile recuperare le iniziali:', error);
 * }
 */
export async function getInitials(userId) {
    try {
        const user = await getUserFromCache(userId);
        if (user) {
            return (user.nome[0] + user.cognome[0]).toUpperCase();
        }
    } catch (error) {
        console.error('Errore nel recupero delle iniziali:', error);
    }
    return 'XX'; // Fallback in caso di errore
}

/**
 * Recupera il nome completo di un utente dal suo ID
 * Utilizza il sistema di cache per ottimizzare le prestazioni
 * 
 * @async
 * @param {string} userId - ID dell'utente
 * @returns {Promise<string>} Nome completo dell'utente (es. 'Mario Rossi')
 */
export async function getUserName(userId) {
    try {
        const user = await getUserFromCache(userId);
        if (user) {
            return `${user.nome} ${user.cognome}`;
        }
    } catch (error) {
        console.error('Errore nel recupero del nome utente:', error);
    }
    return 'Utente'; // Fallback in caso di errore
}

/**
 * Recupera i dati di un utente dalla cache o dal server
 * Implementa un sistema di caching per ridurre le chiamate API
 * 
 * Processo:
 * 1. Verifica presenza in cache
 * 2. Se non presente, recupera dal server
 * 3. Salva in cache per usi futuri
 * 
 * @async
 * @param {string} userId - ID dell'utente da recuperare
 * @returns {Promise<Object|null>} Dati dell'utente o null in caso di errore
 */
async function getUserFromCache(userId) {
    if (!userId) return null;
    
    // Verifica presenza in cache
    if (usersCache[userId]) {
        return usersCache[userId];
    }

    try {
        // Recupero dati dal server
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error('Errore nel recupero dell\'utente');
        }
        const user = await response.json();
        
        // Salvataggio in cache
        usersCache[userId] = user;
        return user;
    } catch (error) {
        console.error('Errore nel recupero dell\'utente:', error);
        return null;
    }
}

/**
 * Aggiorna i contatori delle task nella board Kanban
 * Calcola e visualizza il numero di task in ogni colonna
 * 
 * Processo di aggiornamento:
 * 1. Seleziona tutte le colonne della board
 * 2. Per ogni colonna conta le task presenti
 * 3. Aggiorna il contatore visuale
 * 
 * Quando chiamare questa funzione:
 * - Dopo l'aggiunta di una nuova task
 * - Dopo la rimozione di una task
 * - Dopo lo spostamento di una task tra colonne
 * - All'inizializzazione della board
 * - Dopo operazioni di filtro o ricerca
 * 
 * @example
 * // Dopo aver aggiunto una nuova task
 * taskList.appendChild(newTask);
 * updateTaskCounters();
 * 
 * // Dopo drag & drop
 * dropZone.appendChild(draggedTask);
 * updateTaskCounters();
 */
export function updateTaskCounters() {
    document.querySelectorAll('.kanban-column').forEach(column => {
        const count = column.querySelector('.task-list').children.length;
        column.querySelector('.task-count').textContent = count;
    });
} 