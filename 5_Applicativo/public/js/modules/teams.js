/**
 * Classe per la gestione dei team
 * Implementa funzionalità CRUD per i team e gestione membri
 * Include gestione UI, validazione form e notifiche
 * 
 * Funzionalità principali:
 * - Creazione e modifica team
 * - Gestione membri del team
 * - Ricerca e filtro membri
 * - Validazione form
 * - Gestione stato UI e notifiche
 */

import { NotificationManager } from './notifications.js';

export class TeamManager {
    /**
     * Inizializza il gestore dei team
     * Configura riferimenti DOM, stato iniziale e gestori eventi
     * 
     * @property {HTMLElement} teamModal - Modal per creazione/modifica team
     * @property {HTMLFormElement} teamForm - Form per i dati del team
     * @property {string|null} currentTeamId - ID del team in modifica
     * @property {boolean} formHasChanges - Flag modifiche non salvate
     */
    constructor() {
        // Riferimenti DOM principali
        this.teamModal = document.getElementById('teamModal');
        this.newTeamBtn = document.getElementById('new-team-btn');
        this.teamForm = document.getElementById('teamForm');
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        this.searchTeamsInput = document.getElementById('search-teams');
        this.teamCards = document.querySelectorAll('.team-card');

        // Stato interno
        this.currentTeamId = null;
        this.formHasChanges = false;
        this.notifications = new NotificationManager();

        this.init();
    }

    /**
     * Inizializza tutte le funzionalità del gestore team
     * Configura event listener e inizializza componenti UI
     */
    init() {
        this.initNewTeamButton();
        this.initManageButtons();
        this.initModalClose();
        this.initFormSubmit();
        this.initFormChangeTracking();
        this.initTeamForm();
        this.initTeamMembersDisplay();
        this.restoreActiveTab();
    }

    /**
     * Valida i dati del form prima del submit
     * Controlla nome team e selezione membri
     * 
     * @returns {boolean} True se la validazione passa, False altrimenti
     */
    validateForm() {
        const nome = document.getElementById('team-name').value.trim();
        const selectedMembers = document.querySelectorAll('input[name="membri"]:checked');
        
        if (nome.length < 3) {
            return false;
        }
        
        if (selectedMembers.length === 0) {
            return false;
        }
        
        return true;
    }

    /**
     * Verifica se ci sono modifiche non salvate nel form
     * Confronta lo stato attuale con lo stato originale
     * 
     * @returns {boolean} True se ci sono modifiche non salvate
     */
    hasUnsavedChanges() {
        const nome = document.getElementById('team-name').value.trim();
        const descrizione = document.getElementById('team-description').value.trim();
        const selectedMembers = Array.from(document.querySelectorAll('input[name="membri"]:checked')).map(cb => ({
            id: cb.value,
            nome: document.querySelector(`.member-name[data-member-id="${cb.value}"]`).textContent,
            cognome: document.querySelector(`.member-surname[data-member-id="${cb.value}"]`).textContent,
            email: document.querySelector(`.member-email[data-member-id="${cb.value}"]`).textContent
        }));

        if (!this.currentTeamId) {
            return nome !== '' || descrizione !== '' || selectedMembers.length > 0;
        }

        const originalTeam = this.teamForm.dataset.originalData ? JSON.parse(this.teamForm.dataset.originalData) : null;
        if (!originalTeam) return false;

        return nome !== originalTeam.nome ||
               descrizione !== originalTeam.descrizione ||
               JSON.stringify(selectedMembers) !== JSON.stringify(originalTeam.membri);
    }

    /**
     * Salva lo stato originale del form per il tracking delle modifiche
     * 
     * @param {Object} team - Dati del team da salvare
     */
    saveOriginalFormState(team) {
        const originalData = {
            nome: team.nome,
            descrizione: team.descrizione || '',
            membri: team.Utentes.map(member => ({
                id: member.id,
                nome: member.nome,
                cognome: member.cognome,
                email: member.email
            }))
        };
        this.teamForm.dataset.originalData = JSON.stringify(originalData);
        this.formHasChanges = false;
    }

    /**
     * Inizializza il pulsante per la creazione di un nuovo team
     * Resetta il form e configura il modale
     */
    initNewTeamButton() {
        if (this.newTeamBtn) {
            this.newTeamBtn.addEventListener('click', () => {
                this.currentTeamId = null;
                this.teamForm.reset();
                this.teamForm.dataset.originalData = JSON.stringify({
                    nome: '',
                    descrizione: '',
                    membri: []
                });
                document.querySelector('.modal-header h2').textContent = 'Nuovo Team';
                this.teamModal.style.display = 'block';
                this.formHasChanges = false;
            });
        }
    }

    /**
     * Inizializza i pulsanti di gestione per ogni team
     * Gestisce il caricamento e la visualizzazione dei dati del team
     */
    initManageButtons() {
        document.querySelectorAll('.team-card .btn-secondary').forEach(btn => {
            btn.addEventListener('click', async () => {
                const teamCard = btn.closest('.team-card');
                this.currentTeamId = teamCard.dataset.teamId;
                
                try {
                    const response = await fetch(`/api/teams/${this.currentTeamId}`);
                    const data = await response.json();
                    
                    if (data.success) {
                        const team = data.team;
                        
                        this.teamForm.reset();
                        document.getElementById('team-name').value = team.nome;
                        document.getElementById('team-description').value = team.descrizione || '';
                        
                        document.querySelectorAll('input[name="membri"]').forEach(checkbox => {
                            checkbox.checked = false;
                        });
                        
                        if (team.Utentes && Array.isArray(team.Utentes)) {
                            team.Utentes.forEach(member => {
                                const checkbox = document.getElementById(`member-${member.id}`);
                                if (checkbox) {
                                    checkbox.checked = true;
                                }
                            });
                        }
                        
                        this.saveOriginalFormState(team);
                        
                        document.querySelector('.modal-header h2').textContent = 'Modifica Team';
                        const submitButton = this.teamForm.querySelector('button[type="submit"]');
                        submitButton.textContent = 'Salva Modifiche';
                        
                        this.teamModal.style.display = 'block';
                        this.formHasChanges = false;
                    }
                } catch (error) {
                    this.notifications.error('Errore nel recupero dei dati del team');
                }
            });
        });
    }

    /**
     * Gestisce la chiusura del modale
     * Verifica presenza modifiche non salvate
     */
    closeModal() {
        if (this.formHasChanges) {
            if (confirm('Ci sono modifiche non salvate. Vuoi davvero chiudere?')) {
                this.teamModal.style.display = 'none';
                this.currentTeamId = null;
                this.formHasChanges = false;
            }
        } else {
            this.teamModal.style.display = 'none';
            this.currentTeamId = null;
            this.formHasChanges = false;
        }
    }

    /**
     * Inizializza gli eventi di chiusura del modale
     * Gestisce click su pulsante chiusura
     */
    initModalClose() {
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
    }

    /**
     * Inizializza la gestione del form
     * Gestisce validazione, invio dati e feedback utente
     */
    initFormSubmit() {
        if (this.teamForm) {
            this.teamForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!this.validateForm()) {
                    return;
                }

                const formData = {
                    nome: document.getElementById('team-name').value.trim(),
                    descrizione: document.getElementById('team-description').value.trim(),
                    membri: Array.from(document.querySelectorAll('input[name="membri"]:checked')).map(checkbox => ({
                        id: parseInt(checkbox.value)
                    }))
                };

                try {
                    const url = this.currentTeamId ? `/api/teams/${this.currentTeamId}` : '/api/teams';
                    const method = this.currentTeamId ? 'PUT' : 'POST';
                    
                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (data.success) {
                        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
                        localStorage.setItem('activeAdminTab', activeTab);
                        const message = this.currentTeamId ? 'Team aggiornato con successo!' : 'Team creato con successo!';
                        localStorage.setItem('adminSuccessMessage', message);
                        this.teamModal.style.display = 'none';
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        this.notifications.error(data.message || 'Errore nella gestione del team');
                    }
                } catch (error) {
                    this.notifications.error('Errore nella gestione del team');
                }
            });
        }
    }

    /**
     * Inizializza il tracking delle modifiche al form
     * Aggiorna il flag formHasChanges quando il form viene modificato
     */
    initFormChangeTracking() {
        this.teamForm.addEventListener('change', () => {
            this.formHasChanges = this.hasUnsavedChanges();
        });

        this.teamForm.addEventListener('input', () => {
            this.formHasChanges = this.hasUnsavedChanges();
        });
    }

    /**
     * Inizializza la gestione del form team
     * Implementa la ricerca dei membri e la gestione del form
     */
    initTeamForm() {
        const form = document.getElementById('teamForm');
        const searchInput = document.getElementById('team-members-search');
        const memberOptions = document.querySelectorAll('.member-option');
        const noResults = document.querySelector('.no-results');

        // Funzione di filtro membri
        const filterMembers = (searchTerm) => {
            let hasResults = false;
            searchTerm = searchTerm.toLowerCase();

            memberOptions.forEach(option => {
                const name = option.querySelector('span').textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    option.classList.remove('hidden');
                    hasResults = true;
                } else {
                    option.classList.add('hidden');
                }
            });

            noResults.classList.toggle('visible', !hasResults);
        };

        // Configura ricerca membri
        searchInput.addEventListener('input', (e) => {
            filterMembers(e.target.value);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
        });
    }

    /**
     * Inizializza la visualizzazione dei membri nei team
     * Gestisce la visualizzazione degli avatar e il contatore
     */
    initTeamMembersDisplay() {
        document.querySelectorAll('.team-card').forEach(card => {
            const membersContainer = card.querySelector('.team-members');
            const memberAvatars = membersContainer.querySelectorAll('.owner-avatar');
            const memberCount = membersContainer.querySelector('.member-count');
            
            if (memberAvatars.length > 4) {
                // Limita visualizzazione avatar
                memberAvatars.forEach((avatar, index) => {
                    if (index >= 4) {
                        avatar.style.display = 'none';
                    }
                });
                
                // Mostra contatore membri rimanenti
                memberCount.textContent = `+${memberAvatars.length - 4}`;
                memberCount.style.display = 'flex';
            }
        });
    }

    /**
     * Ripristina il tab attivo dopo il reload della pagina
     * Gestisce la persistenza della navigazione
     */
    restoreActiveTab() {
        const activeTab = localStorage.getItem('activeAdminTab');
        if (activeTab) {
            localStorage.removeItem('activeAdminTab');
            
            const tabButton = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
            if (tabButton) {
                // Reset stato tabs
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                
                // Attiva tab corretto
                tabButton.classList.add('active');
                document.getElementById(`${activeTab}-tab`).classList.add('active');
            }
        }
    }
} 