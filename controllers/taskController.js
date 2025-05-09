/**
 * Controller per la gestione delle task
 * Gestisce le operazioni CRUD (Create, Read, Update, Delete) e lo spostamento delle task
 * 
 * Funzionalità principali:
 * - Creazione nuove task con validazioni
 * - Recupero task di un progetto
 * - Aggiornamento task esistenti
 * - Eliminazione task
 * - Spostamento task tra stati diversi
 * 
 * Stati possibili di una task:
 * - da_fare: Task da iniziare
 * - in_corso: Task in lavorazione
 * - in_revisione: Task in fase di revisione
 * - completati: Task completate
 */

const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const TaskJson = require('../models/TaskJson');
const Utente = require('../models/Utente');
const Team = require('../models/Team');
const { validateTaskData } = require('../utils/validator');

/**
 * Verifica se l'utente ha i permessi per gestire la task
 * @param {Object} user - Utente corrente
 * @param {Object} task - Task da verificare
 * @param {string} projectId - ID del progetto
 * @returns {boolean} True se l'utente ha i permessi
 */
const hasTaskPermission = async (user, task, projectId) => {
    // Admin hanno sempre accesso
    if (user.ruolo === 'admin') return true;

    // Se la task non è assegnata, qualsiasi membro del team può modificarla
    if (!task.userId) {
        const team = await Team.findOne({
            include: [{
                model: Utente,
                where: { id: user.id }
            }],
            include: [{
                model: Progetto,
                where: { id: projectId }
            }]
        });
        return !!team;
    }

    // L'utente può modificare la task se è assegnata a lui
    return task.userId === user.id;
};

/**
 * Crea una nuova task nel sistema
 * 
 * @param {Object} req - Request object contenente:
 *   - titolo: Titolo della task (obbligatorio)
 *   - descrizione: Descrizione dettagliata
 *   - peso: Peso/complessità della task (obbligatorio)
 *   - priorita: Priorità [bassa, media, alta] (obbligatorio)
 *   - scadenza: Data di scadenza
 *   - status: Stato della task
 *   - userId: ID dell'utente assegnato
 *   - projectId: ID del progetto (obbligatorio)
 *   - colore: Colore in formato esadecimale (#RRGGBB)
 * @param {Object} res - Response object
 * 
 * Validazioni:
 * - Campi obbligatori
 * - Formato priorità
 * - Formato status
 * - Formato colore esadecimale
 */
const createTask = async (req, res) => {
    try {
        const taskData = req.body;
        const user = req.session.user;

        // Validazione dei dati
        const errors = validateTaskData(taskData);
        if (errors) {
            return res.status(400).json({ 
                success: false, 
                message: 'Errori di validazione', 
                errors 
            });
        }

        // Se non è admin, può assegnare la task solo a se stesso
        if (user.ruolo !== 'admin' && taskData.userId) {
            // Converti userId in intero per il confronto
            const requestedUserId = parseInt(taskData.userId);
            if (requestedUserId !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Non hai i permessi per assegnare la task ad altri utenti'
                });
            }
        }

        // Generazione ID univoco basato su timestamp
        taskData.id = Date.now().toString();

        // Creazione della task nel database
        const newTask = await TaskJson.create(taskData);

        // Notifica via WebSocket della nuova task
        req.io.to(`project_${taskData.projectId}`).emit('taskCreated', newTask);

        res.status(201).json({
            success: true,
            message: 'Task creata con successo',
            data: newTask
        });

    } catch (error) {
        logger.error('Errore durante la creazione della task:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante la creazione della task'
        });
    }
};

/**
 * Recupera tutte le task associate a un progetto specifico
 * Include i dati dell'utente assegnato (nome e cognome)
 * 
 * @param {Object} req - Request object contenente:
 *   - projectId: ID del progetto nei parametri URL
 * @param {Object} res - Response object
 * 
 * Caratteristiche:
 * - Ordinamento: Dalla più recente alla più vecchia
 * - Include dati utente associato
 * - Filtraggio per progetto
 */
const getTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'ID progetto non fornito'
            });
        }

        const tasks = await TaskJson.findAll({
            where: { projectId },
            include: [{
                model: Utente,
                attributes: ['id', 'nome', 'cognome']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        logger.error('Errore durante il recupero delle task:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Errore durante il recupero delle task',
            error: error.message 
        });
    }
};

/**
 * Aggiorna una task esistente
 * 
 * @param {Object} req - Request object contenente:
 *   - id: ID della task da aggiornare
 *   - body: Dati da aggiornare
 * @param {Object} res - Response object
 */
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const taskData = req.body;
        const user = req.session.user;

        // Verifica esistenza task
        const task = await TaskJson.findByPk(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task non trovata'
            });
        }

        // Se non è admin, verifica che stia modificando una task non assegnata o assegnata a sé
        if (user.ruolo !== 'admin') {
            if (task.userId && task.userId !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Non hai i permessi per modificare questa task'
                });
            }

            // Per utenti normali, possono solo assegnare la task a se stessi o rimuovere l'assegnazione
            if (taskData.userId !== undefined && taskData.userId !== null && taskData.userId !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Non hai i permessi per assegnare la task ad altri utenti'
                });
            }
        }

        // Validazione dei dati di aggiornamento
        const errors = validateTaskData(taskData, true);
        if (errors) {
            return res.status(400).json({ 
                success: false, 
                message: 'Errori di validazione', 
                errors 
            });
        }

        // Aggiornamento task
        await task.update(taskData);

        // Recupera la task aggiornata con le relazioni
        const updatedTask = await TaskJson.findByPk(id, {
            include: [{
                model: Utente,
                attributes: ['id', 'nome', 'cognome']
            }]
        });

        // Notifica via WebSocket dell'aggiornamento
        req.io.to(`project_${task.projectId}`).emit('taskUpdated', updatedTask);

        res.json({
            success: true,
            message: 'Task aggiornata con successo',
            data: updatedTask
        });

    } catch (error) {
        logger.error('Errore durante l\'aggiornamento della task:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante l\'aggiornamento della task'
        });
    }
};

/**
 * Elimina una task dal sistema
 * 
 * @param {Object} req - Request object contenente:
 *   - id: ID della task da eliminare nei parametri URL
 * @param {Object} res - Response object
 * 
 * Validazioni:
 * - Verifica esistenza task
 * - Conferma eliminazione
 */
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await TaskJson.findByPk(taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task non trovata'
            });
        }

        const projectId = task.projectId;
        
        // Elimina la task
        await task.destroy();
        
        // Emetti l'evento di eliminazione a tutti i client nella room del progetto
        req.io.to(`project_${projectId}`).emit('taskDeleted', taskId);

        res.json({
            success: true,
            message: 'Task eliminata con successo'
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della task:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'eliminazione della task'
        });
    }
};

/**
 * Sposta una task in un nuovo stato
 * Funzione specializzata per il cambio di stato senza modificare altri dati
 * 
 * @param {Object} req - Request object contenente:
 *   - id: ID della task nei parametri URL
 *   - status: Nuovo stato nel body
 * @param {Object} res - Response object
 * 
 * Stati validi:
 * - da_fare
 * - in_corso
 * - in_revisione
 * - completati
 * 
 * Validazioni:
 * - Esistenza task
 * - Validità nuovo stato
 */
const moveTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validazione dello status
        const statusValidi = ['da_fare', 'in_corso', 'in_revisione', 'completati'];
        if (!status || !statusValidi.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Status non valido. Valori ammessi: da_fare, in_corso, in_revisione, completati' 
            });
        }

        // Verifica esistenza task
        const task = await TaskJson.findByPk(id);
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task non trovata' 
            });
        }

        // Aggiornamento stato
        await task.update({ status });

        // Emetti l'evento di aggiornamento a tutti i client nella room del progetto
        req.io.to(`project_${task.projectId}`).emit('taskUpdated', task);

        res.json({
            success: true,
            message: 'Task spostata con successo',
            task
        });
    } catch (error) {
        logger.error('Errore durante lo spostamento della task:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Errore durante lo spostamento della task',
            error: error.message 
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    moveTask
}; 