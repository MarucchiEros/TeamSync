document.addEventListener('DOMContentLoaded', function () {
    const calendarTableBody = document.querySelector('.calendar-table tbody');
    const calendarContainer = document.querySelector('.calendar-container');

    // Crea header di navigazione
    let navHeader = document.createElement('div');
    navHeader.className = 'calendar-nav';
    navHeader.innerHTML = `
        <button id="prevMonth" class="calendar-nav-btn">&lt;</button>
        <span id="monthYear"></span>
        <button id="nextMonth" class="calendar-nav-btn">&gt;</button>
    `;
    calendarContainer.insertBefore(navHeader, document.getElementById('calendar'));

    // Stili per la navigazione
    const style = document.createElement('style');
    style.innerHTML = `
        .calendar-nav { display: flex; justify-content: center; align-items: center; gap: 18px; margin-bottom: 10px; }
        .calendar-nav-btn { background: #5b21b6; color: #fff; border: none; border-radius: 6px; padding: 6px 16px; font-size: 1.2rem; cursor: pointer; transition: background 0.2s; }
        .calendar-nav-btn:hover { background: #7c3aed; }
        #monthYear { font-size: 1.2rem; font-weight: 600; color: #5b21b6; }
    `;
    document.head.appendChild(style);

    // Variabili di stato
    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Funzione per ottenere il nome del mese
    const monthNames = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    function sameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    function renderCalendar(month, year) {
        document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
        calendarTableBody.innerHTML = '';
        let firstDay = new Date(year, month, 1);
        let lastDay = new Date(year, month + 1, 0);
        let startDay = (firstDay.getDay() + 6) % 7; // Lunedì = 0
        let daysInMonth = lastDay.getDate();
        let date = 1;
        let now = new Date();
        for (let i = 0; i < 6; i++) {
            let row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                let cell = document.createElement('td');
                if (i === 0 && j < startDay) {
                    cell.innerHTML = '';
                } else if (date > daysInMonth) {
                    cell.innerHTML = '';
                } else {
                    cell.innerHTML = `<span class="day-number">${date}</span>`;
                    let cellDate = new Date(year, month, date);
                    // Evidenzia il giorno corrente
                    if (sameDay(cellDate, now)) {
                        cell.classList.add('today');
                    }
                    if (window.eventi && Array.isArray(window.eventi)) {
                        window.eventi.forEach(ev => {
                            if (ev.scadenza) {
                                let evDate = new Date(ev.scadenza);
                                if (sameDay(cellDate, evDate)) {
                                    let eventDiv = document.createElement('div');
                                    eventDiv.className = 'event ' + (ev.tipo === 'progetto' ? 'project-deadline' : 'task-deadline');
                                    let icon = ev.tipo === 'progetto' ? '📁' : '✅';
                                    eventDiv.innerHTML = `<span class='event-icon'>${icon}</span><span class='event-title'>${ev.nome}</span>`;
                                    eventDiv.addEventListener('click', function(e) {
                                        e.stopPropagation();
                                        if (ev.tipo === 'progetto' && ev.id) {
                                            window.location.href = '/dashboard/' + ev.id;
                                        } else if (ev.tipo === 'task') {
                                            console.log('Task click:', ev);
                                            if (ev.projectId) {
                                                window.location.href = '/dashboard/' + ev.projectId;
                                            } else {
                                                alert('projectId non trovato per questa task!');
                                            }
                                        }
                                    });
                                    cell.appendChild(eventDiv);
                                }
                            }
                        });
                    }
                    date++;
                }
                row.appendChild(cell);
            }
            calendarTableBody.appendChild(row);
            if (date > daysInMonth) break;
        }
    }

    document.getElementById('prevMonth').addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });
    document.getElementById('nextMonth').addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    renderCalendar(currentMonth, currentYear);
}); 