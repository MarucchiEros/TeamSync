/**
 * Script principale per la gestione dell'interfaccia amministrativa
 * Importa e inizializza i vari moduli
 */

import { AuthManager } from './modules/auth.js';
import { initUI } from './modules/ui.js';
import { TeamManager } from './modules/teams.js';
import { ProjectManager } from './modules/projects.js';
import { UserManager } from './modules/users.js';
import { SearchManager } from './modules/search.js';

// Inizializza i moduli quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza i vari moduli
    new AuthManager();
    initUI();

    // Inizializza la gestione dei team, progetti e utenti
    new TeamManager();
    new ProjectManager();
    new UserManager();
    new SearchManager();

    // Attiva la tab 'Progetti' se l'URL contiene #projects
    if (window.location.hash === '#projects') {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="projects"]').classList.add('active');
        document.getElementById('projects-tab').classList.add('active');
    }

    // Mostra messaggio di successo se presente in localStorage
    const successMsg = localStorage.getItem('adminSuccessMessage');
    if (successMsg) {
        showMessage(successMsg, true);
        localStorage.removeItem('adminSuccessMessage');
    }

    // Gestione apertura/chiusura sidebar mobile
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.querySelector('.mobile-menu-toggle');
    const closeBtn = document.getElementById('closeSidebar');
    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
});

function showMessage(message, isSuccess = true) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${isSuccess ? 'success' : 'error'}`;
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.right = '20px';
    messageContainer.style.padding = '15px 25px';
    messageContainer.style.borderRadius = '5px';
    messageContainer.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
    messageContainer.style.color = 'white';
    messageContainer.style.zIndex = '1000';
    messageContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    messageContainer.style.animation = 'slideIn 0.5s ease-out';
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);
    setTimeout(() => {
        messageContainer.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 500);
    }, 3000);
}
window.showMessage = showMessage;