/* ===================================================================
   busca.js
   Busca global de matérias em todos os cronogramas. Clicar em um
   resultado abre o cronograma certo, já no dia certo.
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  if (!input) return; // não estamos em busca.html

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  runSearch(initialQuery);

  let debounceTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(input.value), 180);
  });
});

function runSearch(query) {
  const container = document.getElementById('search-results');
  const term = query.trim();

  if (term.length === 0) {
    container.innerHTML = `
      <div class="empty-block">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>Digite o nome de uma matéria para começar a busca.</p>
      </div>`;
    return;
  }

  const results = searchSubjects(term);

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-block">
        <i class="fa-solid fa-circle-question"></i>
        <p>Nenhuma matéria encontrada para "${escapeHtml(term)}".</p>
      </div>`;
    return;
  }

  container.innerHTML = results.map(result => `
    <div class="search-result-item" data-schedule="${result.scheduleId}" data-day="${result.dayKey}">
      <div class="search-result-main">
        <i class="fa-solid ${result.done ? 'fa-circle-check' : 'fa-book'}"></i>
        <div>
          <p class="search-result-title">${escapeHtml(result.subjectName)}</p>
          <p class="search-result-meta">${escapeHtml(result.scheduleName)} · ${result.dayLabel}</p>
        </div>
      </div>
      <i class="fa-solid fa-arrow-right" style="color:var(--text-muted);"></i>
    </div>
  `).join('');

  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const scheduleId = item.dataset.schedule;
      const schedule = getSchedule(scheduleId);
      if (!schedule) return;
      setScheduleLastDay(scheduleId, item.dataset.day);
      openSchedule(scheduleId);
      window.location.href = getScheduleRoute(schedule);
    });
  });
}