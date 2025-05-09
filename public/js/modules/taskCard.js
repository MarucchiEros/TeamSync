/**
 * Modulo per la gestione delle card delle task
 * Implementa la visualizzazione e l'interazione con le singole task nella board
 * Gestisce il rendering, il drag & drop e gli eventi utente
 * 
 * Funzionalità principali:
 * - Creazione e rendering delle card
 * - Gestione drag & drop
 * - Gestione permessi di modifica
 * - Visualizzazione stato assegnazione
 */

import { getColorByPriority, getInitials, getUserName } from './utils.js';

export class TaskCard {
    /**
     * Inizializza una nuova card per una task
     * 
     * @param {Object} task - Dati della task da visualizzare
     * @param {Function} onEdit - Callback da invocare quando la task viene modificata
     */
    constructor(task, onEdit) {
        this.task = task;
        this.onEdit = onEdit;
    }

    /**
     * Crea l'elemento DOM della card
     * Configura stili, eventi e contenuto HTML
     * 
     * @async
     * @returns {HTMLElement} Elemento DOM della card
     */
    async create() {
        const card = document.createElement('div');
        // Configura classi CSS basate sulla priorità
        card.className = `task-card priority-${this.task.priorita} color-${getColorByPriority(this.task.priorita)}`;
        card.style.backgroundColor = this.task.colore;
        card.draggable = true;
        card.dataset.taskId = this.task.id;

        // Formatta la data di scadenza nel formato italiano
        const deadline = this.task.scadenza ? new Date(this.task.scadenza).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit'
        }) : '';

        // Genera il contenuto HTML della card
        card.innerHTML = await this.getCardHTML(deadline);

        // Configura eventi drag & drop
        card.addEventListener('dragstart', this.handleDragStart);
        card.addEventListener('dragend', this.handleDragEnd);

        // Gestisce il click sulla card con controllo permessi
        card.addEventListener('click', async (e) => {
            try {
                // Verifica l'utente corrente per i permessi
                const userResponse = await fetch('/api/users/current');
                if (!userResponse.ok) {
                    throw new Error('Errore nel recupero dei dati utente');
                }
                const currentUser = await userResponse.json();

                // Gli admin possono sempre modificare qualsiasi task
                if (currentUser.ruolo === 'admin') {
                    this.onEdit(this.task);
                    return;
                }

                // Per gli utenti normali, permette la modifica solo se:
                // - La task non è assegnata
                // - La task è assegnata all'utente corrente
                if (!this.task.userId || this.task.userId === currentUser.id) {
                    this.onEdit(this.task);
                } else {
                }
            } catch (error) {
                console.error('Errore:', error);
            }
        });

        return card;
    }

    /**
     * Genera il markup HTML della card
     * Include titolo, descrizione, meta-informazioni e footer
     * 
     * @async
     * @param {string} deadline - Data di scadenza formattata
     * @returns {string} HTML della card
     */
    async getCardHTML(deadline) {
        // Verifica se la task è assegnata all'utente corrente
        const isAssignedToMe = await this.isAssignedToMe();
        // Recupera le iniziali e il nome dell'assegnatario
        const initials = await getInitials(this.task.userId);
        const userName = await getUserName(this.task.userId);

        return `
            <div class="task-header">
                <div class="task-title">${this.task.titolo}</div>
                <div class="badge badge-${this.task.priorita}">${this.task.priorita}</div>
            </div>
            <div class="task-description">${this.task.descrizione || ''}</div>
            <div class="task-meta">
                <span class="badge weight-badge">Peso: ${this.task.peso}</span>
            </div>
            <div class="task-footer">
                ${this.task.userId ? `
                    <div class="task-owner ${isAssignedToMe ? 'assigned-to-me' : ''}">
                        <div class="owner-avatar">${initials}</div>
                        <span>${userName}</span>
                    </div>
                ` : '<div class="task-owner unassigned">Non assegnata</div>'}
                ${deadline ? `<div class="task-deadline">${deadline}</div>` : ''}
            </div>
        `;
    }

    /**
     * Verifica se la task è assegnata all'utente corrente
     * 
     * @async
     * @returns {Promise<boolean>} True se la task è assegnata all'utente corrente
     */
    async isAssignedToMe() {
        try {
            const userResponse = await fetch('/api/users/current');
            if (!userResponse.ok) {
                throw new Error('Errore nel recupero dei dati utente');
            }
            const currentUser = await userResponse.json();
            return this.task.userId === currentUser.id;
        } catch (error) {
            console.error('Errore nel controllo dell\'assegnazione:', error);
            return false;
        }
    }

    /**
     * Gestisce l'inizio del drag della card
     * Aggiunge classe CSS per lo stile durante il drag
     * Imposta i dati da trasferire
     * 
     * @param {DragEvent} e - Evento di drag start
     */
    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    }

    /**
     * Gestisce la fine del drag della card
     * Rimuove la classe CSS di drag
     * 
     * @param {DragEvent} e - Evento di drag end
     */
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
} 