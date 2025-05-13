/**
 * Modulo per la gestione degli utenti
 * Implementa funzionalità CRUD per gli utenti del sistema
 * Gestisce l'interfaccia utente tramite modale e feedback
 * 
 * Funzionalità principali:
 * - Creazione nuovi utenti
 * - Modifica dati utente
 * - Eliminazione utenti
 * - Gestione ruoli
 * - Validazione dati
 */

export class UserManager {
    /**
     * Inizializza il gestore degli utenti
     * Configura riferimenti DOM e stato iniziale
     * 
     * @property {HTMLElement} userModal - Modal per creazione/modifica utenti
     * @property {HTMLFormElement} userForm - Form per i dati utente
     * @property {string|null} currentUserId - ID dell'utente in modifica
     * @property {boolean} formHasChanges - Flag modifiche non salvate
     */
    constructor() {
        // Riferimenti DOM principali
        this.userModal = document.getElementById('userModal');
        this.userForm = document.getElementById('userForm');
        this.newUserBtn = document.getElementById('new-user-btn');
        this.closeModalBtns = document.querySelectorAll('.close-modal');

        // Stato interno
        this.currentUserId = null;
        this.formHasChanges = false;

        this.init();
    }

    /**
     * Inizializza tutte le funzionalità del gestore utenti
     * Configura event listener e componenti UI
     */
    init() {
        this.initNewUserButton();
        this.initModalClose();
        this.initFormSubmit();
        this.initDeleteButtons();
        this.initEditButtons();
    }

    /**
     * Inizializza il pulsante per la creazione di un nuovo utente
     * Configura il form per l'inserimento di un nuovo utente
     */
    initNewUserButton() {
        if (this.newUserBtn) {
            this.newUserBtn.addEventListener('click', () => {
                // Reset stato e form
                this.currentUserId = null;
                this.userForm.reset();

                // Configurazione UI per nuovo utente
                document.querySelector('.modal-header h2').textContent = 'Nuovo Utente';
                const submitButton = this.userForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Crea Utente';

                // Mostra campo password per nuovi utenti
                const passwordField = document.getElementById('user-password');
                passwordField.parentElement.style.display = 'block';
                passwordField.required = true;
                this.userModal.style.display = 'block';
                this.formHasChanges = false;
            });
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
     * Gestisce la chiusura del modale
     * Verifica presenza modifiche non salvate
     */
    closeModal() {
        if (this.formHasChanges) {
            if (confirm('Ci sono modifiche non salvate. Vuoi davvero chiudere?')) {
                this.userModal.style.display = 'none';
                this.currentUserId = null;
                this.formHasChanges = false;
            }
        } else {
            this.userModal.style.display = 'none';
            this.currentUserId = null;
            this.formHasChanges = false;
        }
    }

    /**
     * Inizializza la gestione del form utente
     * Gestisce la validazione e l'invio dei dati
     */
    initFormSubmit() {
        if (this.userForm) {
            this.userForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = {
                    nome: document.getElementById('user-name').value,
                    cognome: document.getElementById('user-surname').value,
                    email: document.getElementById('user-email').value,
                    ruolo: document.getElementById('user-role').value
                };

                if (!this.currentUserId) {
                    formData.password = document.getElementById('user-password').value;
                    // Validazione password lato frontend
                    const password = formData.password;
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                    if (!passwordRegex.test(password)) {
                        showMessage('La password deve essere di almeno 8 caratteri, contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale.', false);
                        return;
                    }
                }

                try {
                    const url = this.currentUserId ? `/api/users/${this.currentUserId}` : '/api/users';
                    const method = this.currentUserId ? 'PUT' : 'POST';
                    
                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        this.closeModal();
                        localStorage.setItem('adminSuccessMessage', this.currentUserId ? 'Utente aggiornato con successo!' : 'Utente creato con successo!');
                        window.location.reload();
                    } else {
                        throw new Error(data.message || 'Errore nella gestione dell\'utente');
                    }
                } catch (error) {
                    showMessage('Errore nella gestione dell\'utente. Riprova più tardi.', false);
                }
            });
        }
    }

    /**
     * Inizializza i pulsanti di modifica per ogni utente
     * Gestisce il caricamento e la visualizzazione dei dati utente
     */
    initEditButtons() {
        document.querySelectorAll('.btn-icon[title="Modifica"]').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.currentTarget.dataset.id;
                button.disabled = true;

                try {
                    const response = await fetch(`/api/users/${userId}`);
                    const data = await response.json();

                    if (response.ok) {
                        this.currentUserId = userId;
                        document.getElementById('user-name').value = data.nome;
                        document.getElementById('user-surname').value = data.cognome;
                        document.getElementById('user-email').value = data.email;
                        document.getElementById('user-role').value = data.ruolo;

                        // Nascondi campo password e rimuovi required
                        const passwordField = document.getElementById('user-password');
                        passwordField.parentElement.style.display = 'none';
                        passwordField.required = false;

                        document.querySelector('.modal-header h2').textContent = 'Modifica Utente';
                        const submitButton = this.userForm.querySelector('button[type="submit"]');
                        submitButton.textContent = 'Salva Modifiche';

                        this.userModal.style.display = 'block';
                        this.formHasChanges = false;
                    } else {
                        throw new Error(data.message || 'Errore nel caricamento dei dati dell\'utente');
                    }
                } catch (error) {
                    showMessage('Errore nel caricamento dei dati dell\'utente. Riprova più tardi.', false);
                } finally {
                    button.disabled = false;
                }
            });
        });
    }

    /**
     * Inizializza i pulsanti di eliminazione per ogni utente
     * Gestisce la conferma e l'animazione di rimozione
     */
    initDeleteButtons() {
        document.querySelectorAll('.btn-icon[title="Elimina"]').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.currentTarget.dataset.id;
                const userRow = e.currentTarget.closest('.user-row');
                
                if (!userRow) {
                    return;
                }

                if (confirm('Sei sicuro di voler eliminare questo utente?')) {
                    try {
                        const response = await fetch(`/api/users/${userId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const data = await response.json();

                        if (response.ok) {
                            userRow.style.transition = 'opacity 0.5s ease-out';
                            userRow.style.opacity = '0';
                            localStorage.setItem('adminSuccessMessage', 'Utente eliminato con successo!');
                            setTimeout(() => {
                                if (userRow && userRow.parentNode) {
                                    userRow.parentNode.removeChild(userRow);
                                }
                                window.location.reload();
                            }, 500);
                        } else {
                            throw new Error(data.message || 'Errore nell\'eliminazione dell\'utente');
                        }
                    } catch (error) {
                        showMessage('Errore nell\'eliminazione dell\'utente. Riprova più tardi.', false);
                    }
                }
            });
        });
    }
} 