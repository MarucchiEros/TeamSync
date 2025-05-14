/**
 * Test principali per i Manager dell'area Admin dell'applicazione.
 * 
 * Ogni Manager (Auth, Team, Project, User, Search) gestisce una parte specifica dell'interfaccia amministrativa.
 * I test verificano che l'inizializzazione e il collegamento con il DOM siano corretti.
 * 
 * Viene utilizzato Jest come framework di testing.
 * 
 * @module AdminManagerTest
 */

import { AuthManager } from '../public/js/modules/auth';
import { TeamManager } from '../public/js/modules/teams';
import { ProjectManager } from '../public/js/modules/projects';
import { UserManager } from '../public/js/modules/users';
import { SearchManager } from '../public/js/modules/search';

/**
 * Setup comune eseguito prima di ogni test.
 * 
 * Simula una struttura DOM minima per permettere l'inizializzazione dei vari Manager
 * senza errori legati all'assenza di elementi.
 */
beforeEach(() => {
  document.body.innerHTML = `
    <button id="logout-btn"></button>
    <button id="new-team-btn"></button>
    <form id="teamForm"></form>
    <div id="teamModal"></div>
    <button id="new-project-btn"></button>
    <form id="projectForm"></form>
    <div id="projectModal"></div>
    <button id="new-user-btn"></button>
    <form id="userForm"></form>
    <div id="userModal"></div>
    <input id="search-projects" />
    <input id="search-teams" />
    <input id="search-users" />
    <input id="team-members-search" />
    <div class="tab-btn" data-tab="projects"></div>
    <div class="tab-pane" id="projects-tab"></div>
  `;
});

/**
 * Suite di test per la verifica dell'inizializzazione e funzionamento base dei Manager.
 */
describe('Admin Manager principali', () => {

  /**
   * Verifica che AuthManager imposti correttamente l'event listener per il logout.
   */
  it('AuthManager: inizializza e setta event listener logout', () => {
    const addEventListenerSpy = jest.spyOn(document.getElementById('logout-btn'), 'addEventListener');
    new AuthManager();
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });

  /**
   * Verifica che TeamManager inizializzi correttamente i riferimenti al DOM.
   */
  it('TeamManager: inizializza e setta riferimenti DOM', () => {
    const manager = new TeamManager();
    expect(manager.teamModal).toBeInstanceOf(HTMLElement);
    expect(manager.teamForm).toBeInstanceOf(HTMLFormElement);
    expect(manager.newTeamBtn).toBeInstanceOf(HTMLElement);
  });

  /**
   * Verifica che ProjectManager inizializzi correttamente i riferimenti al DOM.
   */
  it('ProjectManager: inizializza e setta riferimenti DOM', () => {
    const manager = new ProjectManager();
    expect(manager.projectModal).toBeInstanceOf(HTMLElement);
    expect(manager.projectForm).toBeInstanceOf(HTMLFormElement);
    expect(manager.newProjectBtn).toBeInstanceOf(HTMLElement);
  });

  /**
   * Verifica che UserManager inizializzi correttamente i riferimenti al DOM.
   */
  it('UserManager: inizializza e setta riferimenti DOM', () => {
    const manager = new UserManager();
    expect(manager.userModal).toBeInstanceOf(HTMLElement);
    expect(manager.userForm).toBeInstanceOf(HTMLFormElement);
    expect(manager.newUserBtn).toBeInstanceOf(HTMLElement);
  });

  /**
   * Verifica che SearchManager possa essere inizializzato senza lanci di eccezioni.
   */
  it('SearchManager: inizializza senza errori', () => {
    expect(() => new SearchManager()).not.toThrow();
  });

});
