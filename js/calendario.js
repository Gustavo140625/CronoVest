/* ===================================================================
   calendario.js
   Renderiza um calendário mensal simples, destacando os dias em que
   o usuário concluiu pelo menos uma matéria (segundo o completionLog).
   =================================================================== */

const CALENDAR_WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CALENDAR_MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

let calendarViewDate = new Date(); // qualquer dia dentro do mês exibido

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('calendar-days-grid');
  if (!grid) return; // não estamos em calendario.html

  document.getElementById('calendar-weekdays-row').innerHTML = CALENDAR_WEEKDAY_LABELS
    .map(label => `<div class="calendar-weekday">${label}</div>`)
    .join('');

  document.getElementById('btn-prev-month').addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('btn-next-month').addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
});

function renderCalendar() {
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();

  document.getElementById('calendar-month-label').textContent =
    `${CALENDAR_MONTH_LABELS[month]} de ${year}`;

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const studiedDates = new Set(getStudiedDateKeys());
  const todayKeyValue = todayKey();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push('<div class="calendar-day is-empty"></div>');
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const classes = ['calendar-day'];
    if (studiedDates.has(dateKey)) classes.push('is-studied');
    if (dateKey === todayKeyValue) classes.push('is-today');
    cells.push(`<div class="${classes.join(' ')}" title="${dateKey}">${day}</div>`);
  }

  document.getElementById('calendar-days-grid').innerHTML = cells.join('');
}