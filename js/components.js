/* ===================================================================
   components.js
   Pedaços de interface reaproveitados em mais de uma página, como o
   "mini card" de cronograma usado em escolha.html e dashboard.html.
   Mantém a marcação e o comportamento sempre idênticos nos dois
   lugares, evitando duplicar HTML/lógica.
   =================================================================== */

/** Gera o HTML de um card compacto de cronograma, com estrela de favorito. */
function renderScheduleMiniCard(schedule) {
  const { percent } = calculateScheduleProgress(schedule.id);
  const fav = isFavorite(schedule.id);
  return `
    <article class="schedule-mini-card" data-id="${schedule.id}">
      <button class="btn-favorite ${fav ? 'is-active' : ''}" data-fav="${schedule.id}" type="button" title="Favoritar">
        <i class="fa-solid fa-star"></i>
      </button>
      <span class="schedule-tag">${schedule.type === 'custom' ? 'Personalizado' : 'Modelo pronto'}</span>
      <h3>${escapeHtml(schedule.name)}</h3>
      <div class="mini-progress-track">
        <div class="mini-progress-fill" style="width:${percent}%"></div>
      </div>
      <span class="mini-progress-label">${percent}% concluído</span>
    </article>
  `;
}

/** Abre um cronograma existente: define como ativo, registra como
 *  recente e leva para a página correta de acordo com o tipo. */
function goToSchedule(scheduleId) {
  const schedule = getSchedule(scheduleId);
  if (!schedule) return;
  openSchedule(scheduleId);
  window.location.href = getScheduleRoute(schedule);
}

/** Liga os eventos de clique (abrir) e de favoritar em um container
 *  que já contenha um ou mais .schedule-mini-card renderizados. */
function bindScheduleStripEvents(container) {
  container.querySelectorAll('.schedule-mini-card').forEach(card => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('[data-fav]')) return;
      goToSchedule(card.dataset.id);
    });
  });

  container.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const nowFav = toggleFavorite(btn.dataset.fav);
      btn.classList.toggle('is-active', nowFav);
      notify(nowFav ? 'Cronograma adicionado aos favoritos.' : 'Cronograma removido dos favoritos.', 'info');
    });
  });
}

/** Renderiza uma lista de cronogramas dentro de um container, com a
 *  mensagem de "vazio" apropriada quando não há nada para mostrar. */
function renderScheduleStrip(container, schedules, emptyMessage) {
  if (!container) return;

  if (schedules.length === 0) {
    container.innerHTML = `
      <div class="empty-strip">
        <i class="fa-solid fa-layer-group"></i>
        ${escapeHtml(emptyMessage)}
      </div>`;
    return;
  }

  container.innerHTML = schedules.map(renderScheduleMiniCard).join('');
  bindScheduleStripEvents(container);
}