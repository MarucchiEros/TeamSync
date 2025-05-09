/**
 * Modulo per le chiamate API relative alle task
 * Gestisce tutte le interazioni con il backend per la gestione delle task
 * Implementa le operazioni CRUD e operazioni specifiche come lo spostamento di stato
 * 
 * Funzionalità principali:
 * - Caricamento task
 * - Creazione nuove task
 * - Aggiornamento task esistenti
 * - Spostamento task tra stati
 * - Caricamento utenti per assegnazioni
 */

export class TaskApi {
    /**
     * Carica tutte le task dal server
     * 
     * @async
     * @returns {Promise<Array>} Array contenente tutte le task
     * @throws {Error} Se il caricamento fallisce
     */
    static async loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Errore nel caricamento delle task');
        } catch (error) {
            console.error('Errore nel caricamento delle task:', error);
            throw error;
        }
    }

    /**
     * Crea una nuova task
     * 
     * @async
     * @param {Object} taskData - Dati della task da creare
     * @param {string} taskData.titolo - Titolo della task
     * @param {string} taskData.descrizione - Descrizione della task
     * @param {string} taskData.stato - Stato iniziale della task
     * @param {number} taskData.priorita - Livello di priorità
     * @param {string} [taskData.scadenza] - Data di scadenza (opzionale)
     * @returns {Promise<Object>} Dati della task creata
     * @throws {Error} Se la creazione fallisce
     */
    static async createTask(taskData) {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Errore nella creazione della task');
        }

        return response.json();
    }

    /**
     * Aggiorna una task esistente
     * 
     * @async
     * @param {string} taskId - ID della task da aggiornare
     * @param {Object} taskData - Nuovi dati della task
     * @param {string} [taskData.titolo] - Nuovo titolo
     * @param {string} [taskData.descrizione] - Nuova descrizione
     * @param {string} [taskData.stato] - Nuovo stato
     * @param {number} [taskData.priorita] - Nuova priorità
     * @param {string} [taskData.scadenza] - Nuova data di scadenza
     * @returns {Promise<Object>} Dati della task aggiornata
     * @throws {Error} Se l'aggiornamento fallisce
     */
    static async updateTask(taskId, taskData) {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Errore nell\'aggiornamento della task');
        }

        return response.json();
    }

    /**
     * Sposta una task in un nuovo stato
     * 
     * @param {string} taskId - ID della task da spostare
     * @param {string} newStatus - Nuovo stato della task
     * @returns {Promise<Object>} Task aggiornata
     * @throws {Error} Se lo spostamento fallisce
     */
    static async moveTask(taskId, newStatus) {
        try {
            const response = await fetch(`/api/tasks/${taskId}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Errore durante lo spostamento della task');
            }

            return data.task;
        } catch (error) {
            console.error('Errore durante lo spostamento della task:', error);
            throw error;
        }
    }

    /**
     * Carica la lista degli utenti di un team specifico
     * Utilizzato per popolare i menu di assegnazione task
     * 
     * @async
     * @param {number} teamId - ID del team
     * @returns {Promise<Array>} Array contenente gli utenti del team
     * @throws {Error} Se il caricamento fallisce
     */
    static async loadUsers(teamId) {
        const response = await fetch(`/api/users/team/${teamId}`);
        if (!response.ok) {
            throw new Error('Errore nel caricamento degli utenti');
        }
        return response.json();
    }
} 