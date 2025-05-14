/**
 * Modulo per la gestione dei filtri delle task nella board Kanban
 * Permette di filtrare le task per priorità e assegnazione tramite select UI
 *
 * Funzionalità principali:
 * - Filtro per priorità (alta, media, bassa)
 * - Filtro per assegnazione (a me, non assegnate)
 * - Evidenziazione delle card filtrate
 * - Gestione dinamica della visibilità delle task
 *
 * Esempio di utilizzo:
 * ```js
 * const filters = new TaskFilters(taskManager);
 * ```
 */
export class TaskFilters {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.currentPriorityFilter = '';
        this.currentAssignmentFilter = '';
        this.initFilters();
    }

    initFilters() {
        // Seleziona i filtri
        const priorityFilter = document.querySelector('select.filter-select:nth-child(1)');
        const assignmentFilter = document.querySelector('select.filter-select:nth-child(2)');

        // Aggiungi event listeners
        priorityFilter.addEventListener('change', (e) => {
            this.currentPriorityFilter = e.target.value;
            this.applyFilters();
        });

        assignmentFilter.addEventListener('change', (e) => {
            this.currentAssignmentFilter = e.target.value;
            this.applyFilters();
        });
    }

    applyFilters() {
        // Rimuovi tutte le evidenziazioni precedenti
        document.querySelectorAll('.task-card').forEach(card => {
            card.classList.remove('highlight-priority', 'highlight-assignment');
        });

        // Applica i nuovi filtri
        document.querySelectorAll('.task-card').forEach(card => {
            const taskPriority = card.dataset.priority;
            const taskAssignedTo = card.dataset.assignedTo;
            const currentUserId = this.taskManager.currentUser?.id.toString();

            // Gestione filtro priorità
            if (this.currentPriorityFilter && taskPriority === this.currentPriorityFilter) {
                card.classList.add('highlight-priority');
            }

            // Gestione filtro assegnazione
            let isAssignmentMatch = false;
            if (this.currentAssignmentFilter === 'me') {
                // Verifica se la task è assegnata all'utente corrente
                isAssignmentMatch = taskAssignedTo === currentUserId;
                if (isAssignmentMatch) {
                    card.classList.add('highlight-assignment');
                }
            } else if (this.currentAssignmentFilter === 'unassigned') {
                // Verifica se la task non è assegnata (taskAssignedTo è vuoto o null)
                isAssignmentMatch = !taskAssignedTo || taskAssignedTo === 'null' || taskAssignedTo === '';
                if (isAssignmentMatch) {
                    card.classList.add('highlight-assignment');
                }
            } else {
                // Se non c'è filtro di assegnazione, mostra tutte le task
                isAssignmentMatch = true;
            }

            // Gestisci la visibilità delle card in base ai filtri
            const shouldShowPriority = !this.currentPriorityFilter || taskPriority === this.currentPriorityFilter;
            card.style.display = (shouldShowPriority && isAssignmentMatch) ? 'block' : 'none';
        });
    }
} 