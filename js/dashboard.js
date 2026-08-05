/* ===================================================================
   dashboard.js
   Lógica da tela inicial (dashboard.html): resumo do dia, estatísticas
   rápidas, favoritos e cronogramas recentes.
   =================================================================== */

document.addEventListener('DOMContentLoaded', initDashboard);

function initDashboard() {
  const root = document.getElementById('dashboard-stats');
  if (!root) return; // não é a página do dashboard

  renderWelcomeMessage();
  renderDashboardStats();
  renderFavoritesSection();
  renderRecentSection();
  bindDashboardSearch();
}

/* ---------------------------------------------------------------
   Boas-vindas + resumo do dia
   --------------------------------------------------------------- */
function renderWelcomeMessage() {
  const profile = getProfile();
  const title = document.getElementById('welcome-title');
  const subtitle = title?.nextElementSibling;

  const firstName = (profile.name || '').trim().split(' ')[0];
  title.textContent = firstName ? `Bem-vindo de volta, ${firstName}!` : 'Bem-vindo!';

  const stats = computeAllStats();
  if (!subtitle) return;

  if (stats.totalSchedules === 0) {
    subtitle.textContent = 'Você ainda não tem nenhum cronograma. Que tal começar agora?';
    return;
  }

  subtitle.textContent = stats.todayCompleted > 0
    ? `Você já concluiu ${stats.todayCompleted} matéria(s) hoje. Continue assim!`
    : 'Você ainda não concluiu nenhuma matéria hoje. Vamos começar?';
}

/* ---------------------------------------------------------------
   Cards de estatística rápida
   --------------------------------------------------------------- */
function renderDashboardStats() {
  const container = document.getElementById('dashboard-stats');
  const stats = computeAllStats();

  if (stats.totalSchedules === 0) {
    container.innerHTML = `
      <div class="empty-block" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-layer-group"></i>
        <p>Nenhum cronograma criado ainda.</p>
        <a href="escolha.html" class="btn-primary" style="margin-top:16px; display:inline-flex;">
          <i class="fa-solid fa-arrow-right"></i> Escolher meu primeiro cronograma
        </a>
      </div>`;
    return;
  }

  const cards = [
    { icon: 'fa-fire', value: stats.currentStreak, label: 'Dias seguidos estudando', hero: stats.currentStreak > 0 },
    { icon: 'fa-chart-pie', value: `${stats.completionPercent}%`, label: 'Conclusão geral' },
    { icon: 'fa-calendar-check', value: stats.todayCompleted, label: 'Matérias concluídas hoje' },
    { icon: 'fa-star', value: stats.mostProductiveWeekday, label: 'Dia mais produtivo' },
  ];

  container.innerHTML = cards.map(card => `
    <div class="stat-card ${card.hero ? 'is-hero' : ''}">
      <div class="stat-card-icon"><i class="fa-solid ${card.icon}"></i></div>
      <div>
        <span class="stat-card-value">${escapeHtml(String(card.value))}</span>
        <span class="stat-card-label">${escapeHtml(card.label)}</span>
      </div>
    </div>
  `).join('');
}

/* ---------------------------------------------------------------
   Favoritos
   --------------------------------------------------------------- */
function renderFavoritesSection() {
  const container = document.getElementById('favorites-list');
  if (!container) return;

  const data = loadData();
  const favorites = data.favorites
    .map(id => data.schedules[id])
    .filter(Boolean);

  renderScheduleStrip(container, favorites, 'Você ainda não favoritou nenhum cronograma.');
}

/* ---------------------------------------------------------------
   Recentes ("continuar estudando")
   --------------------------------------------------------------- */
function renderRecentSection() {
  const container = document.getElementById('recent-list');
  if (!container) return;

  const recent = getRecentSchedules(6);
  renderScheduleStrip(container, recent, 'Você ainda não abriu nenhum cronograma.');
}

/* ---------------------------------------------------------------
   Busca rápida a partir do dashboard
   --------------------------------------------------------------- */
function bindDashboardSearch() {
  const input = document.getElementById('dashboard-search-input');
  if (!input) return;

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = input.value.trim();
    if (query.length === 0) return;
    window.location.href = `busca.html?q=${encodeURIComponent(query)}`;
  });
}