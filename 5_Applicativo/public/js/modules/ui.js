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

/**
 * Abilita il toggle visibilità password su un input e un bottone/elemento icona
 * @param {HTMLInputElement} input - L'input della password
 * @param {HTMLElement} toggleBtn - L'elemento da cliccare (icona occhio)
 * @param {HTMLElement} eyeIcon - L'icona SVG da cambiare
 */
export function togglePasswordVisibility(input, toggleBtn, eyeIcon) {
    if (!input || !toggleBtn || !eyeIcon) return;
    toggleBtn.addEventListener('click', function() {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        // Cambia icona
        if(type === 'text') {
            eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368m3.087-2.933A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.421 5.294M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />';
        } else {
            eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
        }
    });
}

/**
 * Inizializza il toggle visibilità password per il form di reset password
 */
export function initResetPasswordToggles() {
    togglePasswordVisibility(
        document.getElementById('new-password'),
        document.getElementById('togglePasswordNew'),
        document.getElementById('eyeIconNew')
    );
    togglePasswordVisibility(
        document.getElementById('confirm-password'),
        document.getElementById('togglePasswordConfirm'),
        document.getElementById('eyeIconConfirm')
    );
}

/**
 * Abilita l'ordinamento per tutte le tabelle HTML passate come selettore o elemento
 * @param {string|NodeList|HTMLElement[]} selector - Selettore CSS, NodeList o array di tabelle
 */
export function enableTableSort(selector = '.data-table') {
    let tables = [];
    if (typeof selector === 'string') {
        tables = document.querySelectorAll(selector);
    } else if (selector instanceof NodeList || Array.isArray(selector)) {
        tables = selector;
    } else if (selector instanceof HTMLElement) {
        tables = [selector];
    }
    tables.forEach(table => {
        const ths = table.querySelectorAll('thead th');
        ths.forEach((th, colIdx) => {
            th.style.cursor = 'pointer';
            th.addEventListener('click', function() {
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                const isAsc = th.classList.contains('sort-asc');
                // Rimuovi classi sort da tutti gli header
                ths.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
                th.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
                // Ordina le righe
                rows.sort((a, b) => {
                    let aText = a.children[colIdx]?.innerText.trim() || '';
                    let bText = b.children[colIdx]?.innerText.trim() || '';
                    // Prova a convertire in numero
                    const aNum = parseFloat(aText.replace(',', '.'));
                    const bNum = parseFloat(bText.replace(',', '.'));
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        aText = aNum;
                        bText = bNum;
                    }
                    if (aText < bText) return isAsc ? 1 : -1;
                    if (aText > bText) return isAsc ? -1 : 1;
                    return 0;
                });
                // Aggiorna il DOM
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    });
} 