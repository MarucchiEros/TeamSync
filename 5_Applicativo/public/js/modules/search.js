/**
 * Classe per la gestione delle ricerche nell'applicazione
 * Implementa funzionalità di ricerca e filtro per utenti, team e progetti
 * Supporta ricerca in tempo reale e filtri combinati
 */
export class SearchManager {
    /**
     * Inizializza il gestore delle ricerche
     * Configura i listener per tutte le sezioni dell'applicazione
     */
    constructor() {
        this.init();
    }

    /**
     * Inizializza tutte le funzionalità di ricerca
     * Configura i listener per ogni sezione (utenti, team, progetti)
     */
    init() {
        this.initUsersSearch();
        this.initTeamsSearch();
        this.initProjectsSearch();
    }

    /**
     * Inizializza la ricerca nella sezione utenti
     * Implementa:
     * - Ricerca in tempo reale su nome e email
     * - Filtro per ruolo utente
     * - Combinazione di ricerca testuale e filtro ruolo
     */
    initUsersSearch() {
        const searchInput = document.getElementById('search-users');
        const userRows = document.querySelectorAll('.user-row');
        const filterRole = document.getElementById('filter-role');

        if (searchInput) {
            /**
             * Funzione di filtro per gli utenti
             * Applica sia il filtro testuale che il filtro per ruolo
             * Aggiorna la visibilità delle righe in base ai criteri
             */
            const filterUsers = () => {
                const searchTerm = searchInput.value.toLowerCase();
                const selectedRole = filterRole.value;

                userRows.forEach(row => {
                    // Estrae i dati dell'utente dalla riga
                    const userName = row.querySelector('.user-fullname').textContent.toLowerCase();
                    const userEmail = row.querySelector('.user-email').textContent.toLowerCase();
                    const userRole = row.dataset.role;

                    // Applica i criteri di filtro
                    const matchesSearch = userName.includes(searchTerm) || userEmail.includes(searchTerm);
                    const matchesRole = !selectedRole || userRole === selectedRole;

                    // Aggiorna la visibilità della riga
                    row.style.display = matchesSearch && matchesRole ? '' : 'none';
                });
            };

            // Configura gli event listener per ricerca e filtro
            searchInput.addEventListener('input', filterUsers);
            if (filterRole) {
                filterRole.addEventListener('change', filterUsers);
            }
        }
    }

    /**
     * Inizializza la ricerca nella sezione team
     * Implementa:
     * - Ricerca in tempo reale su nome team
     * - Ricerca nel testo della descrizione
     * - Visualizzazione a cards con effetto di filtering
     */
    initTeamsSearch() {
        const searchInput = document.getElementById('search-teams');
        const teamCards = document.querySelectorAll('.team-card');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();

                teamCards.forEach(card => {
                    // Estrae i dati del team dalla card
                    const teamName = card.querySelector('h3').textContent.toLowerCase();
                    const teamDescription = card.querySelector('.team-description').textContent.toLowerCase();
                    
                    // Verifica se il team corrisponde ai criteri di ricerca
                    const isVisible = teamName.includes(searchTerm) || teamDescription.includes(searchTerm);
                    
                    // Aggiorna la visibilità della card
                    card.style.display = isVisible ? '' : 'none';
                });
            });
        }
    }

    /**
     * Inizializza la ricerca nella sezione progetti
     * Implementa:
     * - Ricerca in tempo reale su nome progetto
     * - Filtro per stato del progetto
     * - Combinazione di ricerca testuale e filtro stato
     */
    initProjectsSearch() {
        const searchInput = document.getElementById('search-projects');
        const projectRows = document.querySelectorAll('.project-row');
        const filterStatus = document.getElementById('filter-status');

        if (searchInput) {
            /**
             * Funzione di filtro per i progetti
             * Applica sia il filtro testuale che il filtro per stato
             * Aggiorna la visibilità delle righe in base ai criteri
             */
            const filterProjects = () => {
                const searchTerm = searchInput.value.toLowerCase();
                const selectedStatus = filterStatus ? filterStatus.value : '';

                projectRows.forEach(row => {
                    // Estrae i dati del progetto dalla riga
                    const projectName = row.querySelector('.project-name').textContent.toLowerCase();
                    const projectStatus = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';

                    // Applica i criteri di filtro
                    const matchesSearch = projectName.includes(searchTerm);
                    const matchesStatus = !selectedStatus || projectStatus.includes(selectedStatus);

                    // Aggiorna la visibilità della riga
                    row.style.display = matchesSearch && matchesStatus ? '' : 'none';
                });
            };

            // Configura gli event listener per ricerca e filtro
            searchInput.addEventListener('input', filterProjects);
            if (filterStatus) {
                filterStatus.addEventListener('change', filterProjects);
            }
        }
    }
} 