/**
 * Modulo per la gestione del drag and drop delle task nella board Kanban
 * Implementa la funzionalità di trascinamento delle task tra le colonne
 * 
 * Funzionalità principali:
 * - Gestione eventi di drag and drop HTML5
 * - Feedback visivo durante il trascinamento
 * - Aggiornamento stato task dopo lo spostamento
 * 
 * Esempio di utilizzo:
 * ```js
 * const dragDrop = new DragDropManager(async (taskId, newState) => {
 *   // Logica di aggiornamento stato task
 *   await taskApi.moveTask(taskId, newState);
 * });
 * ```
 */

export class DragDropManager {
    /**
     * Costruttore della classe DragDropManager
     * Inizializza il gestore del drag and drop
     * 
     * @param {Function} onTaskMove - Callback chiamata quando una task viene spostata
     *                               Riceve taskId e newState come parametri
     * 
     * All'istanziazione:
     * - Memorizza la callback di aggiornamento
     * - Inizializza gli event listener per il drag and drop
     */
    constructor(onTaskMove) {
        this.onTaskMove = onTaskMove;
        this.initDragAndDrop();
    }

    /**
     * Inizializza il sistema di drag and drop
     * Configura gli event listener su tutte le colonne della board
     * 
     * Processo per ogni colonna:
     * 1. Trova la lista delle task
     * 2. Configura gestione dragover (hover)
     * 3. Configura gestione dragleave (uscita)
     * 4. Configura gestione drop (rilascio)
     * 
     * Eventi gestiti:
     * - dragover: Quando una task viene trascinata sopra una colonna
     * - dragleave: Quando una task esce dall'area della colonna
     * - drop: Quando una task viene rilasciata in una colonna
     */
    initDragAndDrop() {
        // Itera su tutte le colonne della board
        document.querySelectorAll('.kanban-column').forEach((column, index) => {
            // Ottiene la lista delle task nella colonna
            const taskList = column.querySelector('.task-list');
            
            /**
             * Gestisce l'evento dragover
             * Permette il drop e mostra feedback visivo
             * 
             * @param {DragEvent} e - Evento dragover
             */
            taskList.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessario per permettere il drop
                column.classList.add('drag-over'); // Feedback visivo
            });

            /**
             * Gestisce l'evento dragleave
             * Rimuove il feedback visivo quando la task esce dalla colonna
             */
            taskList.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            /**
             * Gestisce l'evento drop
             * Elabora il rilascio della task nella nuova colonna
             * 
             * Processo:
             * 1. Previene comportamento di default
             * 2. Rimuove feedback visivo
             * 3. Recupera ID task dai dati trasferiti
             * 4. Calcola nuovo stato basato sull'indice colonna
             * 5. Invoca callback di aggiornamento
             * 
             * @param {DragEvent} e - Evento drop
             */
            taskList.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');

                // Recupera l'ID della task dai dati trasferiti
                const taskId = e.dataTransfer.getData('text/plain');
                // Calcola il nuovo stato (indice + 1 perché gli stati partono da 1)
                const newState = index + 1;

                try {
                    // Invoca la callback per aggiornare lo stato
                    await this.onTaskMove(taskId, newState);
                } catch (error) {
                    console.error('Errore durante lo spostamento della task:', error);
                }
            });
        });
    }
} 