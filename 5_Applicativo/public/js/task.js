/**
 * Script principale per la gestione delle task nella board Kanban
 * Implementa la logica di gestione delle task con drag & drop e stati multipli
 * 
 * Funzionalità principali:
 * - Creazione e modifica delle task
 * - Drag & drop tra colonne
 * - Gestione stati (da fare, in corso, in revisione, completati)
 * - Assegnazione task agli utenti
 * - Gestione priorità e scadenze
 * - Interfaccia responsive con supporto mobile
 * 
 * Stati delle task:
 * - da_fare: Task da iniziare
 * - in_corso: Task in lavorazione
 * - in_revisione: Task in fase di review
 * - completati: Task terminate
 */

import { TaskModal } from './modules/modal.js';
import { TaskCard } from './modules/taskCard.js';
import { DragDropManager } from './modules/dragDrop.js';
import { TaskApi } from './modules/taskApi.js';
import { updateTaskCounters } from './modules/utils.js';
import { AuthManager } from './modules/auth.js';
import { TaskFilters } from './modules/filters.js';

/**
 * Classe principale per la gestione delle task
 * Gestisce l'interfaccia Kanban e tutte le operazioni sulle task
 * 
 * @class TaskManager
 * @param {string} projectId - ID del progetto corrente
 */
class TaskManager {
    /**
     * Inizializza il gestore delle task
     * Configura i componenti necessari e carica i dati iniziali
     * 
     * @constructor
     */
    constructor() {
        this.tasks = [];
        this.projectId = this.getProjectIdFromUrl();
        this.socket = io(); // Socket.IO è disponibile globalmente
        this.taskModal = new TaskModal(this.projectId); // Passa l'ID del progetto al TaskModal
        this.currentUser = null; // Aggiungiamo una proprietà per l'utente corrente
        this.userColors = {
            colors: [
                '#ef4444', // rosso
                '#3b82f6', // blu
                '#22c55e', // verde
                '#f97316', // arancione
                '#a855f7', // viola
                '#06b6d4', // ciano
                '#eab308', // giallo
                '#ec4899', // rosa
                '#14b8a6', // teal
                '#8b5cf6'  // indigo
            ],
            assignments: new Map()
        };
        this.initCurrentUser(); // Inizializziamo l'utente corrente
        this.initSocketEvents();
        this.initEventListeners();
        this.loadTasks();
        this.loadUsers();
        new DragDropManager(this.handleTaskMove.bind(this));
        new AuthManager(); // Inizializza il gestore dell'autenticazione
        this.taskFilters = new TaskFilters(this); // Inizializza i filtri
    }

    /**
     * Inizializza i dati dell'utente corrente
     */
    async initCurrentUser() {
        try {
            const response = await fetch('/api/users/current');
            if (!response.ok) throw new Error('Errore nel recupero dei dati utente');
            this.currentUser = await response.json();
        } catch (error) {
            this.showMessage('Errore nel recupero dei dati utente', false);
        }
    }

    /**
     * Inizializza tutti gli event listener necessari
     * Gestisce form, drag & drop, e interfaccia mobile
     * 
     * Eventi gestiti:
     * - Submit del form task
     * - Preview colore task
     * - Menu mobile
     * - Drag & drop tra colonne
     */
    initEventListeners() {
        // Gestione del form per nuove task
        const taskForm = document.getElementById('taskForm');

        // Gestione del submit del form
        if (taskForm) {
            taskForm.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Gestione dell'assegnazione
            const assegnataAMe = document.getElementById('assegnata_a_me');
            const otherUserAssignment = document.getElementById('other-user-assignment');
            
            // Nascondi completamente l'opzione di assegnazione ad altri utenti per gli utenti non admin
            if (this.currentUser?.ruolo !== 'admin' && otherUserAssignment) {
                otherUserAssignment.remove(); // Rimuove completamente l'elemento invece di nasconderlo
            }
            
            // Solo per gli admin, gestisci l'interazione tra checkbox e select
            if (this.currentUser?.ruolo === 'admin' && assegnataAMe && otherUserAssignment) {
                const selectUtente = document.getElementById('id_assegnato');
                
                assegnataAMe.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        selectUtente.value = '';
                        otherUserAssignment.style.display = 'none';
                    } else {
                        otherUserAssignment.style.display = 'block';
                    }
                });
                
                selectUtente.addEventListener('change', (e) => {
                    if (e.target.value) {
                        assegnataAMe.checked = false;
                    }
                });
            }
        }

        // Gestione del colore
        const colorInput = document.getElementById('colore');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                document.querySelector('.color-preview').style.backgroundColor = e.target.value;
            });
        }

        // Gestione del menu mobile
        document.querySelector('.mobile-menu-toggle').addEventListener('click', function () {
            document.querySelector('.sidebar').classList.toggle('active');
        });

        // Gestione del drag and drop
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                // Aggiungi effetto visivo alla colonna durante il drag over
                column.classList.add('drag-over');

                const draggingTask = document.querySelector('.dragging');
                if (draggingTask) {
                    const taskList = column.querySelector('.task-list');
                    const afterElement = this.getDragAfterElement(taskList, e.clientY);
                    
                    if (afterElement) {
                        taskList.insertBefore(draggingTask, afterElement);
                    } else {
                        taskList.appendChild(draggingTask);
                    }
                }
            });

            column.addEventListener('dragleave', (e) => {
                // Rimuovi effetto visivo quando il drag esce dalla colonna
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const taskCard = document.querySelector(`[data-id="${taskId}"]`);
                const assignedTo = taskCard.dataset.assignedTo;
                
                // Gli admin possono spostare qualsiasi task, gli utenti solo le proprie
                if (this.currentUser.ruolo !== 'admin' && assignedTo !== this.currentUser.id.toString()) {
                    this.showMessage('Non hai i permessi per spostare questa task', false);
                    this.renderTasks(); // Ripristina la posizione originale
                    return;
                }

                const newStatus = this.getStatusFromColumn(column);
                try {
                    await this.updateTaskStatus(taskId, newStatus);
                    this.showMessage('Task spostata con successo', true);
                } catch (error) {
                    this.showMessage('Errore nello spostamento della task', false);
                    this.renderTasks(); // Ripristina la posizione originale in caso di errore
                }
            });
        });
    }

    /**
     * Carica le task dal server per il progetto corrente
     * Gestisce errori di rete e rendering dei dati
     * 
     * @async
     * @throws {Error} Se il caricamento fallisce
     */
    async loadTasks() {
        try {
            const response = await fetch(`/api/tasks/${this.projectId}`);
            if (!response.ok) {
                throw new Error('Errore nel caricamento delle task');
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Errore nel caricamento delle task');
            }

            if (Array.isArray(result.data)) {
                this.tasks = result.data;
                this.renderTasks();
                
                await this.checkProjectCompletion();
            }
        } catch (error) {
            this.renderTasks();
        }
    }

    /**
     * Salva le modifiche delle task sul server
     * 
     * @async
     * @throws {Error} Se il salvataggio fallisce
     */
    async saveTasks() {
        try {
            const response = await fetch(`/api/tasks/${this.projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.tasks)
            });
            if (!response.ok) throw new Error('Errore nel salvataggio delle task');
        } catch (error) {
            this.showMessage('Errore nel salvataggio delle task', false);
        }
    }

    /**
     * Carica la lista degli utenti per l'assegnazione delle task
     * Popola il select con le opzioni degli utenti
     * 
     * @async
     * @throws {Error} Se il caricamento degli utenti fallisce
     */
    async loadUsers() {
        try {
            if (!this.currentUser || this.currentUser.ruolo !== 'admin') {
                const otherUserAssignment = document.getElementById('other-user-assignment');
                if (otherUserAssignment) {
                    otherUserAssignment.style.display = 'none';
                }
                return;
            }

            const response = await fetch(`/api/projects/${this.projectId}/team-members`);
            if (!response.ok) {
                throw new Error('Errore nel caricamento degli utenti del team');
            }
            const data = await response.json();
            const users = data.members;
            
            const select = document.getElementById('id_assegnato');
            if (!select) return;

            select.innerHTML = '<option value="">Seleziona un utente</option>';
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.nome} ${user.cognome}`;
                select.appendChild(option);
            });
        } catch (error) {
            this.showMessage('Errore nel caricamento degli utenti del team', false);
        }
    }

    /**
     * Gestisce il submit del form task
     * Supporta sia creazione che modifica delle task
     * 
     * @async
     * @param {Event} e - Evento submit del form
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const isEdit = !!form.dataset.taskId;
        const taskId = form.dataset.taskId;

        const taskData = {
            titolo: form.titolo.value,
            descrizione: form.descrizione.value,
            peso: parseInt(form.peso.value),
            priorita: form.priorita.value,
            scadenza: form.scadenza.value || null,
            colore: form.colore.value
        };

        // Gestione dell'assegnazione della task
        if (this.currentUser.ruolo === 'admin') {
            // Per admin, usa la select
            const selectUtente = form.querySelector('#id_assegnato');
            taskData.userId = selectUtente.value ? parseInt(selectUtente.value) : null;
        } else {
            // Per utenti normali, usa il checkbox
            const assegnataAMe = form.querySelector('#assegnata_a_me');
            taskData.userId = assegnataAMe && assegnataAMe.checked ? this.currentUser.id : null;
        }

        // Validazione scadenza
        if (taskData.scadenza) {
            const scadenza = new Date(taskData.scadenza);
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0);
            
            if (scadenza < oggi) {
                this.showMessage('La data di scadenza non può essere nel passato', false);
                return;
            }
        }

        try {
            if (isEdit) {
                await this.updateTask(taskId, taskData);
            } else {
                await this.addTask(taskData);
            }
            this.taskModal.close();
            await this.loadTasks();
        } catch (error) {
            this.showMessage('Errore nella gestione della task', false);
        }
    }

    /**
     * Gestisce lo spostamento di una task tra colonne
     * Aggiorna lo stato della task sul server
     * 
     * @async
     * @param {string} taskId - ID della task spostata
     * @param {string} newStatus - Nuovo stato della task
     * @throws {Error} Se lo spostamento fallisce
     */
    async handleTaskMove(taskId, newStatus) {
        try {
            const updatedTask = await this.updateTask(taskId, { status: newStatus });
            
            // Aggiorna la task localmente
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = updatedTask;
                this.renderTasks();
            }

            // Emetti l'evento di aggiornamento
            this.socket.emit('taskUpdated', updatedTask);
        } catch (error) {
            this.renderTasks();
            throw error;
        }
    }

    /**
     * Determina lo stato di una task in base alla colonna
     * 
     * @param {HTMLElement} column - Elemento colonna della board
     * @returns {string} Stato corrispondente alla colonna
     */
    getStatusFromColumn(column) {
        const columnIndex = Array.from(column.parentNode.children).indexOf(column);
        const statuses = ['da_fare', 'in_corso', 'in_revisione', 'completati'];
        return statuses[columnIndex];
    }

    /**
     * Gestisce l'inizio del drag di una task
     * Imposta i dati necessari per il drag & drop
     * 
     * @param {DragEvent} e - Evento dragstart
     */
    handleDragStart(e) {
        const taskCard = e.target;
        const taskId = taskCard.dataset.id;
        const assignedTo = taskCard.dataset.assignedTo;

        // Gli admin possono spostare qualsiasi task, gli utenti solo le proprie
        if (this.currentUser.ruolo !== 'admin' && assignedTo !== this.currentUser.id.toString()) {
            e.preventDefault();
            this.showMessage('Non hai i permessi per spostare questa task', false);
            return;
        }

        e.dataTransfer.setData('text/plain', taskId);
        taskCard.classList.add('dragging');

        // Evidenzia le colonne valide per il drop
        document.querySelectorAll('.kanban-column').forEach(column => {
            column.classList.add('droppable');
        });

        // Aggiungi classe per effetto di trascinamento
        taskCard.style.opacity = '0.6';
    }

    /**
     * Gestisce la fine del drag di una task
     * Rimuove gli stili di drag
     * 
     * @param {DragEvent} e - Evento dragend
     */
    handleDragEnd(e) {
        const taskCard = e.target;
        taskCard.classList.remove('dragging');
        taskCard.style.opacity = '1';

        // Rimuovi evidenziazione dalle colonne
        document.querySelectorAll('.kanban-column').forEach(column => {
            column.classList.remove('droppable');
            column.classList.remove('drag-over');
        });
    }

    /**
     * Aggiorna lo stato di una task sul server
     * 
     * @async
     * @param {string} taskId - ID della task
     * @param {string} newStatus - Nuovo stato
     * @throws {Error} Se l'aggiornamento fallisce
     */
    async updateTaskStatus(taskId, newStatus) {
        try {
            const response = await fetch(`/api/tasks/${taskId}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Errore nell\'aggiornamento dello stato della task');
            }

            await this.loadTasks();
            
            // Controlla lo stato del progetto dopo ogni spostamento di task
            await this.checkProjectCompletion();
        } catch (error) {
            this.showMessage('Errore nell\'aggiornamento dello stato della task: ' + error.message, false);
        }
    }

    /**
     * Elimina una task dal progetto
     * 
     * @async
     * @param {string} taskId - ID della task da eliminare
     */
    async deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        await this.saveTasks();
        this.renderTasks();
    }

    /**
     * Renderizza tutte le task nella board Kanban
     * Aggiorna i contatori e posiziona le task nelle colonne corrette
     * 
     * Processo:
     * 1. Identifica le colonne della board
     * 2. Aggiorna i contatori per ogni stato
     * 3. Pulisce le colonne esistenti
     * 4. Renderizza le task nelle colonne appropriate
     */
    renderTasks() {
        const columns = {
            'da_fare': document.querySelector('.kanban-column:nth-child(1) .task-list'),
            'in_corso': document.querySelector('.kanban-column:nth-child(2) .task-list'),
            'in_revisione': document.querySelector('.kanban-column:nth-child(3) .task-list'),
            'completati': document.querySelector('.kanban-column:nth-child(4) .task-list')
        };

        // Aggiorna i contatori
        Object.keys(columns).forEach(status => {
            const count = this.tasks.filter(t => t.status === status).length;
            document.querySelector(`.kanban-column:nth-child(${Object.keys(columns).indexOf(status) + 1}) .task-count`).textContent = count;
        });

        // Pulisci le colonne
        Object.values(columns).forEach(column => column.innerHTML = '');

        // Renderizza le task nelle rispettive colonne
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            columns[task.status].appendChild(taskElement);
        });
    }

    /**
     * Crea l'elemento HTML per una singola task
     * Include titolo, descrizione, priorità, peso e utente assegnato
     * 
     * Elementi visualizzati:
     * - Titolo e priorità
     * - Descrizione
     * - Peso
     * - Utente assegnato (avatar con iniziali)
     * - Data di scadenza (se presente)
     * 
     * @param {Object} task - Dati della task
     * @returns {HTMLElement} Elemento DOM della task
     */
    createTaskElement(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.draggable = true;
        taskCard.dataset.id = task.id;
        taskCard.dataset.priority = task.priorita;
        taskCard.dataset.assignedTo = task.userId ? task.userId.toString() : '';

        // Usa sempre il colore dell'utente per bordo e avatar
        const userColor = this.getUserColor(task.userId);
        taskCard.style.borderLeftColor = userColor;

        // Ottieni il nome dell'utente assegnato dalla relazione
        const nomeUtente = task.Utente ? `${task.Utente.nome} ${task.Utente.cognome}` : 'Non assegnato';
        const iniziali = task.Utente ? `${task.Utente.nome.charAt(0)}${task.Utente.cognome.charAt(0)}`.toUpperCase() : 'NA';

        taskCard.innerHTML = `
        <div class="task-header">
            <div class="task-title">${task.titolo}</div>
            <div><span style="font-weight:600; color:#888; font-size:0.97em; margin-right:4px;">Priorità:</span><span class="badge badge-${task.priorita}">${task.priorita}</span></div>
        </div>
        <div class="task-description">${task.descrizione || ''}</div>
        <div class="task-meta">
            <span class="badge weight-badge">Peso: ${task.peso}</span>
        </div>
        <div class="task-footer">
                <div class="task-owner">
                    <div class="owner-avatar" style="background-color: ${userColor}">${iniziali}</div>
                    <span>${nomeUtente}</span>
                </div>
                ${task.scadenza ? `<div class="task-deadline ${this.isDeadlineSoon(task.scadenza) ? 'deadline-soon' : ''}">${new Date(task.scadenza).toLocaleDateString('it-IT')}</div>` : ''}
        </div>
    `;

        // Aggiungi event listeners per il drag and drop
        taskCard.addEventListener('dragstart', this.handleDragStart.bind(this));
        taskCard.addEventListener('dragend', this.handleDragEnd.bind(this));

        // Event listener per il click sulla task
        taskCard.addEventListener('click', async () => {
            try {
                const modalData = {
                    id: task.id,
                    titolo: task.titolo,
                    descrizione: task.descrizione,
                    peso: task.peso,
                    priorita: task.priorita,
                    scadenza: task.scadenza,
                    colore: task.colore || '#3B82F6',
                    userId: task.userId
                };

                if (this.currentUser.ruolo === 'admin') {
                    await this.taskModal.openForEdit(modalData, this.currentUser);
                    return;
                }

                if (!task.userId || task.userId === this.currentUser.id) {
                    await this.taskModal.openForEdit(modalData, this.currentUser);
                } else {
                    this.showMessage('Non hai i permessi per modificare questa task', false);
                }
            } catch (error) {
                this.showMessage('Errore durante l\'apertura della task', false);
            }
        });

        return taskCard;
    }

    /**
     * Verifica se una scadenza è imminente
     * Considera imminente una scadenza entro 7 giorni
     * 
     * @param {string} deadline - Data di scadenza
     * @returns {boolean} true se la scadenza è entro 7 giorni
     */
    isDeadlineSoon(deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    }

    /**
     * Aggiorna lo stato di una task sul server
     * 
     * @async
     * @param {string} taskId - ID della task
     * @param {string} newStatus - Nuovo stato
     * @throws {Error} Se l'aggiornamento fallisce
     */
    async updateTask(taskId, updates) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Errore nell\'aggiornamento della task');
            }

            this.showMessage('Task aggiornata con successo', true);
            await this.loadTasks();
            this.taskModal.close();
            
            // Emetti l'evento di aggiornamento
            this.socket.emit('taskUpdated', result.data);
            
            return result.data;
        } catch (error) {
            this.showMessage(error.message || 'Errore nell\'aggiornamento della task', false);
            throw error;
        }
    }

    /**
     * Aggiunge una nuova task al progetto
     * 
     * @async
     * @param {Object} taskData - Dati della nuova task
     * @throws {Error} Se la creazione fallisce
     */
    async addTask(taskData) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...taskData,
                    projectId: this.projectId,
                    status: 'da_fare'
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Errore nella creazione della task');
            }

            this.showMessage('Task creata con successo', true);
            await this.loadTasks();
            this.taskModal.close();
            return result.data;
        } catch (error) {
            this.showMessage(error.message || 'Errore nella creazione della task', false);
            throw error;
        }
    }

    initSocketEvents() {
        this.socket.emit('joinProject', this.projectId);

        this.socket.on('taskUpdated', (updatedTask) => {
            const taskIndex = this.tasks.findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = updatedTask;
            } else {
                this.tasks.push(updatedTask);
            }
            this.renderTasks();
        });

        this.socket.on('taskCreated', (newTask) => {
            if (!this.tasks.some(t => t.id === newTask.id)) {
                this.tasks.push(newTask);
                this.renderTasks();
            }
        });

        this.socket.on('taskDeleted', (taskId) => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.renderTasks();
        });

        this.socket.on('connect', () => {
            this.loadTasks();
        });
    }

    async createTask(taskData) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...taskData, projectId: this.projectId })
            });

            if (!response.ok) {
                throw new Error('Errore nella creazione della task');
            }

            const newTask = await response.json();
            this.socket.emit('taskCreated', newTask);
            return newTask;
        } catch (error) {
            this.showMessage('Errore nella creazione della task', false);
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Errore nell\'eliminazione della task');
            }

            this.socket.emit('taskDeleted', taskId);
            return true;
        } catch (error) {
            this.showMessage('Errore nell\'eliminazione della task', false);
            throw error;
        }
    }

    getProjectIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }

    /**
     * Mostra un messaggio di feedback all'utente
     * @param {string} message - Il messaggio da mostrare
     * @param {boolean} isSuccess - true per successo, false per errore
     */
    showMessage(message, isSuccess = true) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${isSuccess ? 'success' : 'error'}`;
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.padding = '15px 25px';
        messageContainer.style.borderRadius = '5px';
        messageContainer.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
        messageContainer.style.color = 'white';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        messageContainer.style.animation = 'slideIn 0.5s ease-out';
        
        messageContainer.textContent = message;
        
        document.body.appendChild(messageContainer);
        
        setTimeout(() => {
            messageContainer.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(messageContainer);
            }, 500);
        }, 3000);
    }

    // Funzione di utilità per determinare la posizione di drop
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Assegna un colore fisso a un utente
     * @param {string} userId - ID dell'utente
     * @returns {string} Colore assegnato all'utente
     */
    getUserColor(userId) {
        if (!userId) return '#64748b'; // Colore default per task non assegnate

        if (!this.userColors.assignments.has(userId)) {
            // Assegna il prossimo colore disponibile
            const usedColors = Array.from(this.userColors.assignments.values());
            const availableColor = this.userColors.colors.find(color => !usedColors.includes(color)) 
                || this.userColors.colors[0]; // Se tutti i colori sono usati, riparti dal primo
            this.userColors.assignments.set(userId, availableColor);
        }

        return this.userColors.assignments.get(userId);
    }

    /**
     * Controlla se tutte le task sono completate e aggiorna lo stato del progetto
     */
    async checkProjectCompletion() {
        try {
            const hasAnyTask = this.tasks.length > 0;
            const allTasksCompleted = hasAnyTask && this.tasks.every(task => task.status === 'completati');
            
            if (!hasAnyTask) return;

            const response = await fetch(`/api/projects/${this.projectId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stato: allTasksCompleted ? 'completato' : 'attivo'
                })
            });

            if (!response.ok) {
                throw new Error('Errore nell\'aggiornamento dello stato del progetto');
            }

            const result = await response.json();
            
            if (result.success) {
                const statoProgettoElement = document.querySelector('.project-status');
                if (statoProgettoElement) {
                    statoProgettoElement.textContent = allTasksCompleted ? 'Completato' : 'Attivo';
                    statoProgettoElement.className = `project-status ${allTasksCompleted ? 'completed' : 'active'}`;
                }

                const event = new CustomEvent('projectStatusChanged', {
                    detail: {
                        projectId: this.projectId,
                        newStatus: allTasksCompleted ? 'completato' : 'attivo'
                    }
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            this.showMessage('Errore nell\'aggiornamento dello stato del progetto', false);
        }
    }
}

// Inizializzazione quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    // Ottieni l'ID del progetto dall'URL
    const projectId = window.location.pathname.split('/').pop();
    window.taskManager = new TaskManager(projectId);
});