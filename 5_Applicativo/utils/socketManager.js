/**
 * Gestione centralizzata dei socket
 * Questo modulo gestisce tutte le operazioni Socket.IO dell'applicazione
 */

class SocketManager {
    constructor(io) {
        this.io = io;
        this.activeUsers = new Map(); // Mappa per tenere traccia degli utenti attivi
        this.userLastActivity = new Map(); // Mappa per tracciare l'ultima attività degli utenti
        this.INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minuti in millisecondi
    }

    /**
     * Inizializza tutti gli handler dei socket
     */
    initialize() {
        this.io.on('connection', (socket) => {
            this.setupEventHandlers(socket);
            
            // Avvia il controllo di inattività
            this.startInactivityCheck(socket);
        });

        // Controlla utenti inattivi ogni minuto
        setInterval(() => this.checkInactiveUsers(), 60000);
    }

    /**
     * Configura tutti gli handler degli eventi per un socket
     * @param {Socket} socket - Il socket connesso
     */
    setupEventHandlers(socket) {
        // Gestione join project
        socket.on('joinProject', (data) => {
            const { projectId, userId, userName } = data;
            this.handleJoinProject(socket, projectId, userId, userName);
            this.updateUserActivity(userId);
        });

        // Gestione leave project
        socket.on('leaveProject', (data) => {
            const { projectId, userId } = data;
            this.handleLeaveProject(socket, projectId, userId);
            this.updateUserActivity(userId);
        });

        // Gestione aggiornamento task
        socket.on('taskUpdate', (data) => {
            this.handleTaskUpdate(socket, data);
            if (data.userId) {
                this.updateUserActivity(data.userId);
            }
        });

        // Gestione attività utente
        socket.on('userActivity', (userId) => {
            this.updateUserActivity(userId);
        });

        // Gestione stato di digitazione
        socket.on('typing', (data) => {
            const { projectId, userId, userName, isTyping } = data;
            this.handleTypingStatus(socket, projectId, userId, userName, isTyping);
        });

        // Gestione disconnessione
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
    }

    /**
     * Aggiorna l'ultima attività dell'utente
     */
    updateUserActivity(userId) {
        if (userId) {
            this.userLastActivity.set(userId, Date.now());
        }
    }

    /**
     * Controlla e gestisce gli utenti inattivi
     */
    checkInactiveUsers() {
        const now = Date.now();
        this.userLastActivity.forEach((lastActivity, userId) => {
            if (now - lastActivity > this.INACTIVE_TIMEOUT) {
                this.handleUserInactivity(userId);
            }
        });
    }

    /**
     * Gestisce l'inattività di un utente
     */
    handleUserInactivity(userId) {
        this.activeUsers.forEach((projectUsers, projectId) => {
            if (projectUsers.has(userId)) {
                const userData = projectUsers.get(userId);
                this.io.to(`project_${projectId}`).emit('userInactive', {
                    userId,
                    userName: userData.userName,
                    message: `${userData.userName} risulta inattivo`
                });
            }
        });
    }

    /**
     * Avvia il controllo di inattività per un socket
     */
    startInactivityCheck(socket) {
        socket.inactivityTimeout = setTimeout(() => {
            socket.emit('inactivityWarning', {
                message: 'Sei inattivo da un po\'. Vuoi continuare la sessione?'
            });
        }, this.INACTIVE_TIMEOUT - 60000); // Avvisa 1 minuto prima
    }

    /**
     * Gestisce lo stato di digitazione degli utenti
     */
    handleTypingStatus(socket, projectId, userId, userName, isTyping) {
        const roomName = `project_${projectId}`;
        socket.to(roomName).emit('userTyping', {
            userId,
            userName,
            isTyping,
            timestamp: Date.now()
        });
    }

    /**
     * Gestisce l'ingresso di un utente in un progetto
     */
    handleJoinProject(socket, projectId, userId, userName) {
        const roomName = `project_${projectId}`;
        socket.join(roomName);

        // Aggiungi utente alla mappa degli utenti attivi con timestamp
        if (!this.activeUsers.has(projectId)) {
            this.activeUsers.set(projectId, new Map());
        }
        this.activeUsers.get(projectId).set(userId, {
            socketId: socket.id,
            userName: userName,
            joinedAt: Date.now(),
            lastActivity: Date.now()
        });

        // Notifica altri utenti con timestamp
        socket.to(roomName).emit('userJoined', {
            userId,
            userName,
            message: `${userName} si è unito alla board`,
            timestamp: Date.now()
        });

        // Invia lista utenti attivi con i loro timestamp
        const activeUsers = Array.from(this.activeUsers.get(projectId).values())
            .map(user => ({
                ...user,
                isActive: Date.now() - user.lastActivity < this.INACTIVE_TIMEOUT
            }));
        this.io.to(roomName).emit('activeUsers', activeUsers);
    }

    /**
     * Gestisce l'uscita di un utente da un progetto
     */
    handleLeaveProject(socket, projectId, userId) {
        const roomName = `project_${projectId}`;
        socket.leave(roomName);

        // Rimuovi utente dalla mappa degli utenti attivi
        if (this.activeUsers.has(projectId)) {
            const projectUsers = this.activeUsers.get(projectId);
            const userData = projectUsers.get(userId);
            if (userData) {
                projectUsers.delete(userId);
                // Notifica altri utenti
                socket.to(roomName).emit('userLeft', {
                    userId,
                    userName: userData.userName,
                    message: `${userData.userName} ha lasciato la board`
                });
            }
        }
    }

    /**
     * Gestisce l'aggiornamento di una task
     */
    handleTaskUpdate(socket, data) {
        const { projectId, taskId, updates, action } = data;
        const roomName = `project_${projectId}`;

        // Emetti l'evento appropriato in base all'azione
        switch (action) {
            case 'create':
                socket.to(roomName).emit('taskCreated', data);
                break;
            case 'update':
                socket.to(roomName).emit('taskUpdated', data);
                break;
            case 'delete':
                socket.to(roomName).emit('taskDeleted', { taskId, projectId });
                break;
            case 'move':
                socket.to(roomName).emit('taskMoved', data);
                break;
        }
    }

    /**
     * Gestisce la disconnessione di un socket
     */
    handleDisconnect(socket) {
        // Rimuovi utente da tutte le room attive
        this.activeUsers.forEach((projectUsers, projectId) => {
            projectUsers.forEach((userData, userId) => {
                if (userData.socketId === socket.id) {
                    this.handleLeaveProject(socket, projectId, userId);
                }
            });
        });
    }

    /**
     * Emette un evento a tutti i client in una room
     */
    emitToRoom(roomName, eventName, data) {
        this.io.to(roomName).emit(eventName, data);
    }

    /**
     * Emette un evento a tutti i client tranne il mittente
     */
    emitToOthers(socket, roomName, eventName, data) {
        socket.to(roomName).emit(eventName, data);
    }
}

module.exports = SocketManager; 