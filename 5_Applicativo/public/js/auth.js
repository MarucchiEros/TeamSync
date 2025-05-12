/**
 * Script per la gestione dell'autenticazione
 * Gestisce le funzionalità di login e registrazione degli utenti
 * 
 * Funzionalità principali:
 * - Login utente con email e password
 * - Registrazione nuovo utente
 * - Gestione UI delle tab login/registrazione
 * - Feedback visuale delle operazioni
 * - Gestione errori e messaggi
 * 
 * Flusso di autenticazione:
 * 1. L'utente inserisce le credenziali
 * 2. I dati vengono inviati al server in formato JSON
 * 3. Il server verifica le credenziali e risponde
 * 4. In caso di successo, l'utente viene reindirizzato
 * 5. In caso di errore, viene mostrato un messaggio
 */

// Elementi del DOM per la gestione dei form e delle tab
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabIndicator = document.querySelector('.tab-indicator');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const resetPasswordLink = document.getElementById('reset-password-link');
const resetForm = document.getElementById('reset-form');

/**
 * Mostra un messaggio di feedback all'utente
 * Il messaggio viene automaticamente rimosso dopo 3 secondi
 * 
 * Stili dei messaggi:
 * - Successo: sfondo verde
 * - Errore: sfondo rosso
 * 
 * @param {string} message - Il messaggio da mostrare all'utente
 * @param {boolean} isSuccess - true per successo, false per errore
 * @param {HTMLElement} form - Il form dove mostrare il messaggio
 * 
 * @example
 * // Mostra un messaggio di successo
 * showMessage('Login effettuato!', true, loginForm);
 * 
 * // Mostra un messaggio di errore
 * showMessage('Email non valida', false, loginForm);
 */
function showMessage(message, isSuccess, form) {
    // Rimuovi eventuali messaggi precedenti
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Crea il nuovo messaggio
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSuccess ? 'success' : 'error'}`;
    messageDiv.textContent = message;

    // Inserisci il messaggio dopo il form
    form.appendChild(messageDiv);

    // Rimuovi il messaggio dopo 3 secondi
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

/**
 * Mostra il form di registrazione
 * Gestisce l'animazione dell'indicatore e lo stato delle tab
 * 
 * Effetti:
 * 1. Attiva la tab di registrazione
 * 2. Disattiva la tab di login
 * 3. Mostra il form di registrazione
 * 4. Sposta l'indicatore visuale
 */
function showRegisterForm() {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    tabIndicator.style.transform = 'translateX(100%)';
}

/**
 * Mostra il form di login
 * Gestisce l'animazione dell'indicatore e lo stato delle tab
 * 
 * Effetti:
 * 1. Attiva la tab di login
 * 2. Disattiva la tab di registrazione
 * 3. Mostra il form di login
 * 4. Sposta l'indicatore visuale
 */
function showLoginForm() {
    registerTab.classList.remove('active');
    loginTab.classList.add('active');
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
    tabIndicator.style.transform = 'translateX(0)';
}

/**
 * Gestione del form di login
 * Invia i dati al server e gestisce la risposta
 * 
 * Processo:
 * 1. Previene il submit standard del form
 * 2. Raccoglie i dati di input
 * 3. Invia una richiesta POST al server
 * 4. Gestisce la risposta e gli errori
 * 5. Reindirizza l'utente in base al ruolo
 * 
 * Gestione errori:
 * - Errori di rete
 * - Credenziali non valide
 * - Errori del server
 * 
 * Reindirizzamento:
 * - Admin -> /admin
 * - Utenti normali -> /home
 */
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('Login effettuato con successo!', true, loginForm);
                setTimeout(() => {
                    if (data.user && data.user.ruolo === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/home';
                    }
                }, 1000);
            } else {
                showMessage(data.message || 'Errore durante il login', false, loginForm);
            }
        } catch (error) {
            console.error('Errore durante il login:', error);
            showMessage('Errore di connessione al server', false, loginForm);
        }
    });
}

/**
 * Gestione del form di registrazione
 * Invia i dati al server e gestisce la risposta
 * 
 * Processo:
 * 1. Previene il submit standard del form
 * 2. Raccoglie i dati di input (nome, cognome, email, password)
 * 3. Invia una richiesta POST al server
 * 4. Gestisce la risposta e gli errori
 * 5. In caso di successo:
 *    - Mostra messaggio di conferma
 *    - Resetta il form
 *    - Reindirizza al login
 * 
 * Dati inviati:
 * {
 *   nome: string,
 *   cognome: string,
 *   email: string,
 *   password: string
 * }
 * 
 * Gestione errori:
 * - Email già registrata
 * - Dati non validi
 * - Errori di rete
 * - Errori del server
 */
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            nome: document.getElementById('nome').value,
            cognome: document.getElementById('cognome').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value
        };
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('Registrazione completata con successo!', true, registerForm);
                registerForm.reset();
                setTimeout(showLoginForm, 2000);
            } else {
                showMessage(data.message || 'Errore durante la registrazione', false, registerForm);
            }
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            showMessage('Errore di connessione al server', false, registerForm);
        }
    });
}

// Event listeners per la gestione delle tab
// Gestiscono la navigazione tra i form di login e registrazione
if (loginTab && registerTab && loginForm && registerForm && tabIndicator) {
    loginTab.addEventListener('click', showLoginForm);
    registerTab.addEventListener('click', showRegisterForm);
}
if (showRegister) {
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
}
if (showLogin) {
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
}

if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/reset-password';
    });
}

if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Submit intercettato');
        const email = document.getElementById('reset-email').value;
        localStorage.setItem('resetEmail', email);
        const messageDiv = document.getElementById('reset-message');
        if (messageDiv) messageDiv.textContent = '';
        try {
            const response = await fetch('/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                if (messageDiv) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = 'Codice inviato! Controlla la tua email.';
                }
                setTimeout(() => {
                    window.location.href = `/verify-code?id=${data.userId}`;
                }, 1200);
            } else {
                if (messageDiv) {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = data.message || 'Errore durante l\'invio del codice.';
                }
            }
        } catch (error) {
            if (messageDiv) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Errore di connessione al server.';
            }
        }
    });
}


