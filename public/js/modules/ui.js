/**
 * Modulo per la gestione dell'interfaccia utente
 * Implementa funzionalità di navigazione e interazione UI
 * 
 * Funzionalità principali:
 * - Menu mobile responsive
 * - Sistema di tab per la navigazione
 * - Gestione stati attivi/inattivi
 * - Inizializzazione automatica UI
 */

/**
 * Inizializza tutti i componenti dell'interfaccia utente
 * Configura menu mobile e sistema di tab
 * 
 * Componenti gestiti:
 * - Toggle menu mobile
 * - Sidebar responsive
 * - Sistema di navigazione a tab
 * - Stati attivi dei componenti
 */
export function initUI() {
    // Inizializzazione menu mobile
    initMobileMenu();
    // Inizializzazione sistema tab
    initTabSystem();
}

/**
 * Inizializza il menu mobile e la sidebar
 * Gestisce il toggle della sidebar su dispositivi mobili
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

/**
 * Inizializza il sistema di navigazione a tab
 * Gestisce la visualizzazione e lo switch tra diverse sezioni
 */
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    /**
     * Cambia la tab attiva e aggiorna la UI
     * 
     * @param {string} tabId - ID della tab da attivare
     */
    function switchTab(tabId) {
        // Reset stato attivo di tutti i componenti
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Attiva il pulsante selezionato
        const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Mostra il contenuto della tab selezionata
        const selectedPane = document.getElementById(`${tabId}-tab`);
        if (selectedPane) {
            selectedPane.classList.add('active');
        }
    }

    // Configura event listener per ogni pulsante tab
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Attiva la prima tab all'inizializzazione
    const firstTab = tabButtons[0];
    if (firstTab) {
        const firstTabId = firstTab.getAttribute('data-tab');
        switchTab(firstTabId);
    }
} 