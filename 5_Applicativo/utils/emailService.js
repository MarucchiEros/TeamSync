const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// Configura dotenv per leggere il file .env dalla cartella config
const envPath = path.join(__dirname, '../config/.env');
dotenv.config({ path: envPath });

// Crea il trasportatore con Nodemailer usando le credenziali delle variabili di ambiente
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true per 465, false per altri porti
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verifica la configurazione
transporter.verify(function(error) {
    if (error) {
        console.error('Errore nella configurazione del server SMTP:', error);
    }
});

// Funzione per inviare la conferma di registrazione
const sendConfirmationEmail = (userEmail, userName) => {
    const mailOptions = {
        from: `"TeamSync" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Benvenuto in TeamSync - Conferma Registrazione',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h1 style="color: #2c3e50;">TeamSync</h1>
                </div>
                <h2 style="color: #333; text-align: center;">Ciao ${userName},</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                    Grazie per esserti registrato su <strong>TeamSync</strong>! Il tuo account è stato creato con successo.
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                    Ora puoi accedere alla piattaforma e iniziare a gestire i tuoi task!
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/auth" 
                       style="background-color: #3498db; color: #fff; text-decoration: none; padding: 12px 25px; font-size: 16px; border-radius: 5px; display: inline-block;">
                        Accedi al tuo account
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #777; font-size: 12px; text-align: center;">
                    Se non hai effettuato questa registrazione, ignora questa email.
                </p>
                <p style="color: #777; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} TeamSync. Tutti i diritti riservati.
                </p>
            </div>
        `
    };

    // Invia la mail
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error("Errore nell'invio dell'email: ", err);
        }
    });
};

// Funzione per inviare la notifica di cancellazione account
const sendAccountDeletionEmail = (userEmail, userName) => {
    const mailOptions = {
        from: `"TeamSync" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Conferma Cancellazione Account - TeamSync',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h1 style="color: #2c3e50;">TeamSync</h1>
                </div>
                <h2 style="color: #333; text-align: center;">Ciao ${userName},</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                    Ti confermiamo che il tuo account su <strong>TeamSync</strong> è stato eliminato con successo.
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                    Tutti i tuoi dati personali sono stati rimossi dal sistema.
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                    Se ritieni che questa sia stata un'azione non autorizzata o hai domande, 
                    ti preghiamo di contattare l'amministratore del sistema.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #777; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} TeamSync. Tutti i diritti riservati.
                </p>
            </div>
        `
    };

    // Invia la mail
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error("Errore nell'invio dell'email di cancellazione: ", err);
        }
    });
};

/**
 * Invia una email di notifica quando un utente viene aggiunto a un progetto
 * @param {string} userEmail - Email dell'utente
 * @param {string} userName - Nome dell'utente
 * @param {Object} projectData - Dati del progetto
 * @param {string} projectData.nomeProgetto - Nome del progetto
 * @param {string} projectData.nomeTeam - Nome del team
 * @param {Date} projectData.scadenza - Data di scadenza
 * @param {string} projectData.progettoId - ID del progetto
 */
const sendProjectAssignmentEmail = async (userEmail, userName, projectData) => {
    const mailOptions = {
        from: `"TeamSync" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Sei stato aggiunto al progetto: ${projectData.nomeProgetto}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h1 style="color: #2c3e50;">TeamSync</h1>
                </div>
                <h2 style="color: #333; text-align: center;">Ciao ${userName}!</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5;">
                    Sei stato aggiunto a un nuovo progetto su <strong>TeamSync</strong>!
                </p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Dettagli del Progetto:</h3>
                    <p style="margin: 5px 0;"><strong>Nome Progetto:</strong> ${projectData.nomeProgetto}</p>
                    <p style="margin: 5px 0;"><strong>Team:</strong> ${projectData.nomeTeam}</p>
                    <p style="margin: 5px 0;"><strong>Scadenza:</strong> ${projectData.scadenza ? new Date(projectData.scadenza).toLocaleDateString('it-IT') : 'Non definita'}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard/${projectData.progettoId}" 
                       style="background-color: #3498db; color: #fff; text-decoration: none; padding: 12px 25px; font-size: 16px; border-radius: 5px; display: inline-block;">
                        Vai al Progetto
                    </a>
                </div>
                <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                    Puoi accedere al progetto cliccando sul pulsante sopra o visitando la tua dashboard.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #777; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} TeamSync. Tutti i diritti riservati.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error("Errore nell'invio dell'email di assegnazione progetto:", err);
        return false;
    }
};

// Funzione per inviare il codice di reset password
const sendResetCodeEmail = (userEmail, userName, code) => {
    const mailOptions = {
        from: `"TeamSync" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Codice per il reset della password - TeamSync',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h1 style="color: #2c3e50;">TeamSync</h1>
                </div>
                <h2 style="color: #333; text-align: center;">Ciao ${userName},</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                    Hai richiesto il reset della password. Inserisci questo codice per continuare:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">${code}</span>
                </div>
                <p style="color: #555; font-size: 15px; text-align: center;">Se non hai richiesto tu il reset, ignora questa email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #777; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} TeamSync. Tutti i diritti riservati.
                </p>
            </div>
        `
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error("Errore nell'invio dell'email di reset password: ", err);
        }
    });
};

module.exports = { 
    sendConfirmationEmail,
    sendAccountDeletionEmail,
    sendProjectAssignmentEmail,
    sendResetCodeEmail
};
