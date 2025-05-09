/**
 * Classe per la gestione delle notifiche toast
 * Implementa un sistema di notifiche temporanee che appaiono e scompaiono automaticamente
 * Supporta diversi tipi di notifiche: success, error, info, warning
 */
export class NotificationManager {
    /**
     * Inizializza il gestore delle notifiche
     * Crea il container delle notifiche se non esiste e configura gli event listener
     */
    constructor() {
        this.container = this.createContainer();
        this.init();
    }

    /**
     * Crea o recupera il container delle notifiche
     * @returns {HTMLElement} Il container delle notifiche
     */
    createContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Inizializza gli event listener per la gestione delle notifiche
     * Ascolta l'evento custom 'showNotification' per mostrare nuove notifiche
     */
    init() {
        document.addEventListener('showNotification', (e) => {
            this.show(e.detail.message, e.detail.type);
        });
    }

    /**
     * Mostra una nuova notifica toast
     * @param {string} message - Il messaggio da mostrare nella notifica
     * @param {string} type - Il tipo di notifica (success, error, info, warning)
     */
    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.container.appendChild(toast);

        // Forza un reflow per attivare l'animazione di fade-in
        toast.offsetHeight;
        toast.style.opacity = '1';

        // Rimuove automaticamente la notifica dopo 3 secondi con animazione di fade-out
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300); // Attende 300ms per completare l'animazione di fade-out
        }, 3000);
    }

    /**
     * Mostra una notifica di successo
     * @param {string} message - Il messaggio di successo
     */
    success(message) {
        this.show(message, 'success');
    }

    /**
     * Mostra una notifica di errore
     * @param {string} message - Il messaggio di errore
     */
    error(message) {
        this.show(message, 'error');
    }

    /**
     * Mostra una notifica informativa
     * @param {string} message - Il messaggio informativo
     */
    info(message) {
        this.show(message, 'info');
    }

    /**
     * Mostra una notifica di avvertimento
     * @param {string} message - Il messaggio di avvertimento
     */
    warning(message) {
        this.show(message, 'warning');
    }
} 