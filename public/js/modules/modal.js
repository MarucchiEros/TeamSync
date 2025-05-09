import { TaskApi } from './taskApi.js';

/**
 * Modulo per la gestione del modal delle task
 * Implementa l'interfaccia di creazione e modifica delle task
 * 
 * Funzionalità principali:
 * - Apertura/chiusura del modal
 * - Gestione form task (creazione/modifica)
 * - Gestione permessi utente
 * - Gestione assegnazioni
 * - Preview colori
 * 
 * Utilizzo:
 * const taskModal = new TaskModal();
 * taskModal.openForEdit(taskData, currentUser);
 */

export class TaskModal {
    /**
     * Costruttore della classe TaskModal
     * Inizializza il gestore del modal e recupera i riferimenti DOM
     * 
     * @param {string} projectId - ID del progetto corrente
     */
    constructor(projectId) {
        this.modal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        this.assegnazioneGroup = document.querySelector('.form-group:has(#assegnata_a_me)');
        this.addTaskButtons = document.querySelectorAll('.add-task');
        this.closeButtons = document.querySelectorAll('.close-modal');
        this.teamMembers = [];
        this.projectId = projectId;

        this.initEventListeners();
    }

    /**
     * Recupera l'ID del progetto dall'URL
     * @returns {string} ID del progetto
     */
    getProjectIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }

    /**
     * Carica gli utenti del team per il progetto corrente
     * @returns {Promise<Array>} Lista degli utenti del team
     */
    async loadTeamMembers() {
        try {
            const response = await fetch(`/api/projects/${this.projectId}/team-members`);
            if (!response.ok) {
                throw new Error('Errore nel caricamento dei membri del team');
            }
            const data = await response.json();
            this.teamMembers = data.members;
            return this.teamMembers;
        } catch (error) {
            return [];
        }
    }

    /**
     * Popola il select degli utenti con i membri del team
     * @param {HTMLSelectElement} select - Elemento select da popolare
     * @param {number} selectedUserId - ID dell'utente selezionato
     */
    populateUserSelect(select, selectedUserId) {
        select.innerHTML = '<option value="">Seleziona un utente</option>';
        this.teamMembers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.nome} ${user.cognome}`;
            option.selected = user.id === selectedUserId;
            select.appendChild(option);
        });
    }

    /**
     * Inizializza gli event listener del modal
     * Configura la gestione degli eventi di apertura e chiusura
     * 
     * Eventi gestiti:
     * - Click su pulsanti aggiungi task
     * - Click su pulsanti chiusura
     */
    initEventListeners() {
        // Gestione apertura modal da pulsanti "Aggiungi Task"
        this.addTaskButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.resetForm();
                this.modal.style.display = 'block';
            });
        });

        // Gestione chiusura modal solo tramite pulsante dedicato
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.close());
        });
    }

    /**
     * Resetta il form del modal allo stato iniziale
     * Prepara il modal per una nuova task
     * 
     * Operazioni:
     * - Reset campi form
     * - Rimozione ID task precedente
     * - Reset visibilità assegnazione
     * - Reset titolo modal
     * - Reset preview colore
     */
    resetForm() {
        this.taskForm.reset();
        delete this.taskForm.dataset.taskId;
        if (this.assegnazioneGroup) {
            this.assegnazioneGroup.style.display = 'block';
            const otherUserAssignment = document.getElementById('other-user-assignment');
            if (otherUserAssignment) {
                otherUserAssignment.style.display = 'block';
            }
        }
        const modalTitle = this.modal.querySelector('.modal-header h2');
        modalTitle.textContent = 'Nuova Task';
        document.querySelector('.color-preview').style.backgroundColor = '#FFFFFF';
    }

    /**
     * Apre il modal per modificare una task esistente
     * Configura il form in base ai permessi dell'utente
     * 
     * @param {Object} task - Dati della task da modificare
     * @param {Object} currentUser - Dati dell'utente corrente
     */
    async openForEdit(taskData, currentUser) {
        // Popola il form con i dati della task
        const form = this.taskForm;
        form.dataset.taskId = taskData.id;
        form.titolo.value = taskData.titolo;
        form.descrizione.value = taskData.descrizione;
        form.peso.value = taskData.peso;
        form.priorita.value = taskData.priorita;
        form.scadenza.value = taskData.scadenza ? taskData.scadenza.split('T')[0] : '';
        form.colore.value = taskData.colore || '#3B82F6';

        // Gestione dell'assegnazione in base al ruolo
        if (currentUser.ruolo === 'admin') {
        const selectUtente = form.querySelector('#id_assegnato');
            if (selectUtente) {
                // Carica gli utenti del team
                const response = await fetch(`/api/projects/${this.projectId}/team-members`);
                if (!response.ok) {
                    throw new Error('Errore nel caricamento dei membri del team');
                }
                const data = await response.json();
                this.teamMembers = data.members;
                
                // Popola la select con gli utenti del team
                this.populateUserSelect(selectUtente, taskData.userId);
            }
        } else {
            const assegnataAMe = form.querySelector('#assegnata_a_me');
            if (assegnataAMe) {
                // Se la task è assegnata all'utente corrente, seleziona il checkbox
                assegnataAMe.checked = taskData.userId === currentUser.id;
            }
        }

        this.modal.style.display = 'block';
    }

    /**
     * Chiude il modal e ripristina lo stato iniziale
     * 
     * Operazioni:
     * - Nasconde il modal
     * - Resetta il form
     * - Riabilita tutti i campi
     */
    close() {
        this.modal.style.display = 'none';
        this.resetForm();
        
        // Riabilita tutti i campi del form
        const formFields = this.taskForm.querySelectorAll('input, textarea, select');
        formFields.forEach(field => {
            field.disabled = false;
        });
    }

    /**
     * Recupera i dati del progetto
     * @param {number} projectId - ID del progetto
     * @returns {Promise<Object>} Dati del progetto
     */
    async getProject(projectId) {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
            throw new Error('Errore nel recupero del progetto');
        }
        return response.json();
    }
} 