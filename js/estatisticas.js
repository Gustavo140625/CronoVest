/* ===================================================================
   estatisticas.js
   Popula a página de estatísticas com tudo o que computeAllStats()
   calcula a partir do localStorage.
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('full-stats-grid');
  if (!grid) return; // não estamos em estatisticas.html

  const stats = computeAllStats();

  const cards = [
    { icon: 'fa-layer-group', value: stats.totalSchedules, label: 'Total de cronogramas' },
    { icon: 'fa-book-open', value: stats.totalSubjects, label: 'Total de matérias cadastradas' },
    { icon: 'fa-circle-check', value: stats.completedSubjects, label: 'Total de matérias concluídas' },
    { icon: 'fa-percent', value: `${stats.completionPercent}%`, label: 'Porcentagem geral de conclusão' },
    { icon: 'fa-calendar-day', value: stats.mostProductiveWeekday, label: 'Dia mais produtivo' },
    { icon: 'fa-calendar-check', value: stats.studiedDays, label: 'Quantidade de dias estudados' },
    { icon: 'fa-fire', value: `${stats.currentStreak} dias`, label: 'Sequência atual de estudos' },
    { icon: 'fa-trophy', value: `${stats.bestStreak} dias`, label: 'Melhor sequência já alcançada' },
  ];

  grid.innerHTML = cards.map(card => `
    <div class="stat-card">
      <div class="stat-card-icon"><i class="fa-solid ${card.icon}"></i></div>
      <span class="stat-card-value">${card.value}</span>
      <span class="stat-card-label">${card.label}</span>
    </div>
  `).join('');

  document.getElementById('overall-progress-fill').style.width = `${stats.completionPercent}%`;
  document.getElementById('overall-progress-label').textContent =
    stats.totalSubjects === 0
      ? 'Cadastre matérias nos seus cronogramas para ver o progresso aqui.'
      : `${stats.completedSubjects} de ${stats.totalSubjects} matérias concluídas — ${stats.completionPercent}%`;
});