/**
 * Modulo per la gestione dell'autenticazione lato client
 * Gestisce le operazioni relative all'autenticazione dell'utente
 * 
 * Funzionalità principali:
 * - Gestione del processo di logout
 * - Gestione eventi UI relativi all'autenticazione
 * - Comunicazione con il server per operazioni di auth
 * 
 * Utilizzo:
 * const authManager = new AuthManager();
 * // Il manager si occuperà automaticamente di inizializzare gli eventi
 */

export class AuthManager {
    /**
     * Costruttore della classe AuthManager
     * Inizializza il gestore dell'autenticazione
     * 
     * All'istanziazione:
     * - Configura gli event listener per il logout
     * - Prepara la gestione delle operazioni di auth
     */
    constructor() {
        this.initLogout();
    }

    /**
     * Inizializza la gestione del logout
     * Configura l'event listener sul pulsante di logout
     * 
     * Processo:
     * 1. Cerca il pulsante di logout nella pagina
     * 2. Se trovato, associa il gestore dell'evento click
     * 3. Usa bind per mantenere il contesto corretto
     */
    initLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    /**
     * Gestisce il processo di logout
     * Invia la richiesta al server e gestisce la risposta
     * 
     * Processo:
     * 1. Invia richiesta POST al server
     * 2. Attende la risposta
     * 3. Se successo, reindirizza alla pagina di login
     * 4. Se errore, mostra messaggio in console
     * 
     * @returns {Promise<void>}
     * 
     * Gestione errori:
     * - Errori di rete
     * - Risposte non valide dal server
     * - Problemi durante il reindirizzamento
     */
    async handleLogout() {
        try {
            // Invia richiesta di logout al server
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Elabora la risposta
            const data = await response.json();
            
            // Gestisce il risultato
            if (data.success) {
                // Reindirizza alla pagina di login
                window.location.href = '/login';
            } else {
                // Logga l'errore se il logout fallisce
                console.error('Errore durante il logout:', data.message);
            }
        } catch (error) {
            // Gestisce errori di rete o altri problemi
            console.error('Errore durante il logout:', error);
        }
    }
} 