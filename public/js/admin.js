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
});