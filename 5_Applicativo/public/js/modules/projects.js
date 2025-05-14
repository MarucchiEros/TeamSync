/**
 * Modulo per la gestione dei progetti
 * Implementa le funzionalità CRUD (Create, Read, Update, Delete) per i progetti
 * Gestisce l'interfaccia utente attraverso un modale e aggiornamenti dinamici
 * 
 * Funzionalità principali:
 * - Creazione nuovo progetto
 * - Modifica progetto esistente
 * - Eliminazione progetto
 * - Ricerca e filtro progetti
 * - Gestione team e assegnazioni
 * - Validazione dati
 *
 * Esempio di utilizzo:
 * ```js
 * const projectManager = new ProjectManager();
 * projectManager.init();
 * ```
 */

export class ProjectManager {
    /**
     * Inizializza il gestore dei progetti
     * Configura tutti i riferimenti DOM e gli stati iniziali
     * 
     * @property {HTMLElement} projectModal - Il modale per creazione/modifica progetti
     * @property {HTMLFormElement} projectForm - Il form per i dati del progetto
     * @property {HTMLElement} newProjectBtn - Pulsante per nuovo progetto
     * @property {NodeList} closeModalBtns - Pulsanti di chiusura modale
     * @property {string|null} currentProjectId - ID del progetto in modifica
     * @property {boolean} formHasChanges - Flag per modifiche non salvate
     */
    constructor() {
        // Riferimenti DOM principali
        this.projectModal = document.getElementById('projectModal');
        this.projectForm = document.getElementById('projectForm');
        this.newProjectBtn = document.getElementById('new-project-btn');
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        
        // Campi del form
        this.projectNameInput = document.getElementById('project-name');
        this.projectDescriptionInput = document.getElementById('projectDescription');
        this.projectDeadlineInput = document.getElementById('projectDeadline');
        this.projectTeamInput = document.getElementById('project-team');
        
        // Elementi di filtro e ricerca
        this.searchInput = document.getElementById('search-projects');
        this.teamFilter = document.getElementById('teamFilter');
        this.statusFilter = document.getElementById('statusFilter');
        
        // Stato interno
        this.currentProjectId = null;
        this.formHasChanges = false;

        this.init();
    }

    /**
     * Inizializza tutte le funzionalità del gestore progetti
     * Configura gli event listener per ogni componente
     */
    init() {
        this.initNewProjectButton();
        this.initModalClose();
        this.initFormSubmit();
        this.initSearch();
        this.initFormChangeTracking();
        this.initDeleteButtons();
        this.initEditButtons();
        this.initViewButtons();
    }

    /**
     * Inizializza i pulsanti di eliminazione per ogni progetto
     * Gestisce la conferma dell'utente e l'animazione di rimozione
     * 
     * Processo:
     * 1. Richiede conferma all'utente
     * 2. Invia richiesta DELETE al server
     * 3. Rimuove la riga con animazione se successo
     * 4. Gestisce eventuali errori
     */
    initDeleteButtons() {
        document.querySelectorAll('.btn-icon[title="Elimina"]').forEach(button => {
            button.addEventListener('click', async (e) => {
                const projectId = e.currentTarget.dataset.id;
                const projectRow = e.currentTarget.closest('.project-row');
                
                if (!projectRow) {
                    return;
                }

                if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
                    try {
                        const response = await fetch(`/api/projects/${projectId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {
                            projectRow.style.transition = 'opacity 0.5s ease-out';
                            projectRow.style.opacity = '0';
                            localStorage.setItem('adminSuccessMessage', 'Progetto eliminato con successo!');
                            setTimeout(() => {
                                if (projectRow && projectRow.parentNode) {
                                    projectRow.parentNode.removeChild(projectRow);
                                }
                                window.location.reload();
                            }, 500);
                        } else {
                            throw new Error(data.message || 'Errore nell\'eliminazione del progetto');
                        }
                    } catch (error) {
                        this.showMessage('Errore nell\'eliminazione del progetto', false);
                    }
                }
            });
        });
    }

    /**
     * Inizializza i pulsanti di modifica per ogni progetto
     * Recupera i dati del progetto e popola il form modale
     * 
     * Processo:
     * 1. Recupera dati progetto dal server
     * 2. Popola il form con i dati
     * 3. Configura il modale per la modifica
     * 4. Gestisce errori di caricamento
     */
    initEditButtons() {
        document.querySelectorAll('.btn-icon[title="Modifica"]').forEach(button => {
            button.addEventListener('click', async (e) => {
                const projectId = e.currentTarget.dataset.id;
                try {
                    const response = await fetch(`/api/projects/${projectId}`);
                    const data = await response.json();

                    if (data.success) {
                        this.currentProjectId = projectId;
                        
                        document.getElementById('project-name').value = data.progetto.nome;
                        document.getElementById('project-description').value = data.progetto.descrizione;
                        document.getElementById('project-team').value = data.progetto.team_id || '';
                        document.getElementById('project-status').value = data.progetto.stato || 'attivo';
                        
                        if (data.progetto.scadenza) {
                            const date = new Date(data.progetto.scadenza);
                            document.getElementById('project-deadline').value = date.toISOString().split('T')[0];
                        } else {
                            document.getElementById('project-deadline').value = '';
                        }

                        document.querySelector('.modal-header h2').textContent = 'Modifica Progetto';
                        const submitButton = this.projectForm.querySelector('button[type="submit"]');
                        submitButton.textContent = 'Salva Modifiche';

                        this.projectModal.style.display = 'block';
                    }
                } catch (error) {
                    this.showMessage('Errore nel recupero dei dati del progetto', false);
                }
            });
        });
    }

    /**
     * Inizializza il pulsante per la creazione di un nuovo progetto
     * Resetta il form e configura il modale per un nuovo inserimento
     */
    initNewProjectButton() {
        if (this.newProjectBtn) {
            this.newProjectBtn.addEventListener('click', () => {
                this.currentProjectId = null;
                this.projectForm.reset();
                document.querySelector('.modal-header h2').textContent = 'Nuovo Progetto';
                this.projectModal.style.display = 'block';
                this.formHasChanges = false;
            });
        }
    }

    /**
     * Gestisce la chiusura del modale
     * Configura gli event listener per i pulsanti di chiusura
     */
    initModalClose() {
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
    }

    /**
     * Chiude il modale e resetta lo stato del form
     */
    closeModal() {
        this.projectModal.style.display = 'none';
        this.currentProjectId = null;
        this.projectForm.reset();
    }

    /**
     * Inizializza la gestione del form di progetto
     * Gestisce la validazione, l'invio dei dati e l'aggiornamento UI
     * 
     * Processo:
     * 1. Validazione dati form
     * 2. Preparazione dati per invio
     * 3. Invio richiesta al server (POST/PUT)
     * 4. Aggiornamento UI in caso di successo
     * 5. Gestione errori
     */
    initFormSubmit() {
        if (this.projectForm) {
            this.projectForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!this.validateForm()) {
                    return;
                }

                const formData = {
                    nome: document.getElementById('project-name').value.trim(),
                    descrizione: document.getElementById('project-description').value.trim(),
                    scadenza: document.getElementById('project-deadline').value,
                    team_id: document.getElementById('project-team').value || null,
                    stato: document.getElementById('project-status').value
                };

                // Validazione: la data di scadenza non può essere nel passato
                if (formData.scadenza) {
                    const dataScadenza = new Date(formData.scadenza);
                    const oggi = new Date();
                    oggi.setHours(0,0,0,0);
                    if (dataScadenza < oggi) {
                        this.showMessage('La data di scadenza non può essere nel passato.', false);
                        return;
                    }
                }

                try {
                    const url = this.currentProjectId ? `/api/projects/${this.currentProjectId}` : '/api/projects';
                    const method = this.currentProjectId ? 'PUT' : 'POST';

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Aggiorna la pagina e mantieni la tab progetti attiva
                        localStorage.setItem('adminSuccessMessage', this.currentProjectId ? 'Progetto aggiornato con successo!' : 'Progetto creato con successo!');
                        window.location.hash = '#projects';
                        window.location.reload();
                        return;
                    } else {
                        throw new Error(data.message || 'Errore nella gestione del progetto');
                    }
                } catch (error) {
                    this.showMessage('Errore nella gestione del progetto', false);
                }
            });
        }
    }

    /**
     * Inizializza la funzionalità di ricerca progetti
     * Filtra i progetti in tempo reale in base al testo inserito
     */
    initSearch() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const searchText = e.target.value.toLowerCase();
                const projectRows = document.querySelectorAll('.project-row');
                
                projectRows.forEach(row => {
                    const projectName = row.querySelector('.project-name').textContent.toLowerCase();
                    const projectTeam = row.querySelector('.project-team').textContent.toLowerCase();
                    const matchesSearch = projectName.includes(searchText) || projectTeam.includes(searchText);
                    row.style.display = matchesSearch ? '' : 'none';
                });
            });
        }
    }

    /**
     * Placeholder per il tracking delle modifiche al form
     * Attualmente rimosso ma mantenuto per future implementazioni
     */
    initFormChangeTracking() {
        // Rimosso il tracking delle modifiche
    }

    /**
     * Valida i dati del form prima dell'invio
     * Controlla lunghezza minima di nome e descrizione
     * 
     * @returns {boolean} True se la validazione passa, False altrimenti
     */
    validateForm() {
        const nome = document.getElementById('project-name').value.trim();
        
        if (nome.length < 1) {
            alert('Il nome del progetto deve essere di almeno 1 carattere');
            return false;
        }
        
        return true;
    }

    /**
     * Inizializza i pulsanti per visualizzare la dashboard di progetto
     * Reindirizza l'utente alla dashboard del progetto selezionato
     */
    initViewButtons() {
        document.querySelectorAll('.btn-icon[title="Visualizza Dashboard"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const projectId = e.currentTarget.dataset.id;
                if (projectId) {
                    window.location.href = `/dashboard/${projectId}`;
                }
            });
        });
    }

    /**
     * Aggiorna la riga di un progetto nella tabella dopo la modifica
     * Aggiorna nome, team, stato e data di scadenza
     * 
     * @param {string} projectId - ID del progetto da aggiornare
     * @param {Object} formData - Nuovi dati del progetto
     */
    updateProjectRow(projectId, formData) {
        const projectRow = document.querySelector(`.project-row[data-id="${projectId}"]`);
        if (projectRow) {
            // Aggiorna il nome del progetto
            projectRow.querySelector('.project-name').textContent = formData.nome;
            
            // Aggiorna il team
            const teamCell = projectRow.querySelector('.project-team');
            if (teamCell) {
                const teamSelect = document.getElementById('project-team');
                const selectedOption = teamSelect.options[teamSelect.selectedIndex];
                teamCell.textContent = selectedOption.text || 'Non assegnato';
            }

            // Aggiorna lo stato
            const statusBadge = projectRow.querySelector('.badge');
            if (statusBadge) {
                statusBadge.className = `badge badge-${formData.stato}`;
                statusBadge.textContent = formData.stato;
            }

            // Aggiorna la data di scadenza
            const scadenzaCell = projectRow.querySelector('td:nth-child(6)');
            if (scadenzaCell) {
                scadenzaCell.textContent = formData.scadenza ? 
                    new Date(formData.scadenza).toLocaleDateString('it-IT') : 
                    'Non definita';
            }
        }
    }

    /**
     * Mostra un messaggio di errore o successo all'utente
     * @param {string} message - Il messaggio da mostrare
     * @param {boolean} isSuccess - true per successo, false per errore
     */
    showMessage(message, isSuccess = false) {
        alert(message);
    }
} 