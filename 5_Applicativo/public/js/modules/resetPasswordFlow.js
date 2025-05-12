// Modulo unico per verifica codice e reset password

document.addEventListener('DOMContentLoaded', function() {
    // --- Verifica codice ---
    const verifyForm = document.getElementById('verify-form');
    const verifyMessage = document.getElementById('verify-message');
    const resetCodeInput = document.getElementById('reset-code');

    function getUserIdFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    if (verifyForm) {
        verifyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const userId = getUserIdFromQuery();
            const code = resetCodeInput.value.trim();
            verifyMessage.textContent = '';
            verifyMessage.className = '';
            if (!userId) {
                verifyMessage.className = 'message error';
                verifyMessage.textContent = 'Errore interno: utente non trovato.';
                return;
            }
            try {
                const response = await fetch('/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, code })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    verifyMessage.className = 'message success';
                    verifyMessage.textContent = 'Codice corretto! Ora puoi impostare una nuova password.';
                    setTimeout(() => {
                        window.location.href = `/new-password?id=${userId}`;
                    }, 1000);
                } else {
                    verifyMessage.className = 'message error';
                    verifyMessage.textContent = data.message || 'Codice errato o scaduto.';
                }
            } catch (error) {
                verifyMessage.className = 'message error';
                verifyMessage.textContent = 'Errore di connessione al server.';
            }
        });
    }

    // --- Reset password ---
    const resetForm = document.getElementById('reset-password-form');
    const messageDiv = document.getElementById('reset-password-message');

    if (resetForm) {
        resetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const userId = getUserIdFromQuery();
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            messageDiv.textContent = '';
            messageDiv.className = '';
            if (!userId) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Sessione di reset non valida. Ripeti la procedura.';
                return;
            }
            if (password !== confirmPassword) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Le password non coincidono.';
                return;
            }
            if (password.length < 8) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'La password deve essere lunga almeno 8 caratteri.';
                return;
            }
            try {
                const response = await fetch('/new-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, password, confirmPassword })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = 'Password aggiornata con successo! Ora puoi accedere.';
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = data.message || 'Errore durante il reset della password.';
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Errore di connessione al server.';
            }
        });
    }
}); 