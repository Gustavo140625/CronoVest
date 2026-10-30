/* ===================================================================
   metas.js
   Criação e acompanhamento de metas de estudo. O progresso nunca é
   digitado manualmente — é sempre calculado a partir dos dados reais
   dos cronogramas (ver computeGoalProgress em stats.js).
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-add-goal');
  if (!form) return; // não estamos em metas.html

  populateScheduleSelect();
  setupGoalTypeToggle();
  setupGoalForm(form);
  renderGoalsList();
});

function populateScheduleSelect() {
  const select = document.getElementById('goal-schedule');
  const schedules = getAllSchedulesArray();

  select.innerHTML = schedules.length === 0
    ? '<option value="">Nenhum cronograma disponível</option>'
    : schedules.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}

function setupGoalTypeToggle() {
  const typeSelect = document.getElementById('goal-type');
  const targetField = document.getElementById('goal-target-field');
  const scheduleFields = document.getElementById('goal-schedule-fields');

  typeSelect.addEventListener('change', () => {
    const isSubjects = typeSelect.value === 'subjects';
    targetField.style.display = isSubjects ? '' : 'none';
    scheduleFields.style.display = isSubjects ? 'none' : 'grid';
  });
}

function setupGoalForm(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const description = document.getElementById('goal-description').value.trim();
    const type = document.getElementById('goal-type').value;
    if (!description) return;

    let goal;
    if (type === 'subjects') {
      const target = Number(document.getElementById('goal-target').value) || 1;
      goal = {
        description,
        type: 'subjects',
        target,
        startCount: countHistoricalCompletedSubjects(),
      };
    } else {
      const scheduleId = document.getElementById('goal-schedule').value;
      if (!scheduleId) {
        notify('Crie um cronograma antes de vincular uma meta a ele.', 'danger');
        return;
      }
      goal = {
        description,
        type: 'schedule',
        scheduleId,
        deadline: document.getElementById('goal-deadline').value || null,
      };
    }

    createGoal(goal);
    notify('Meta criada com sucesso.', 'success');
    form.reset();
    document.getElementById('goal-target-field').style.display = '';
    document.getElementById('goal-schedule-fields').style.display = 'none';
    renderGoalsList();
  });
}

function renderGoalsList() {
  const container = document.getElementById('goals-list');
  const goals = getGoals();

  if (goals.length === 0) {
    container.innerHTML = `
      <div class="empty-block">
        <i class="fa-solid fa-bullseye"></i>
        <p>Você ainda não criou nenhuma meta. Que tal começar com algo simples, como concluir 10 matérias nesta semana?</p>
      </div>`;
    return;
  }

  container.innerHTML = goals.map(goal => {
    const progress = computeGoalProgress(goal);
    const meta = goal.type === 'schedule'
      ? `Vinculada a "${escapeHtml(getSchedule(goal.scheduleId)?.name || 'cronograma removido')}"${goal.deadline ? ` · até ${new Date(`${goal.deadline}T00:00:00`).toLocaleDateString('pt-BR')}` : ''}`
      : `Meta de matérias concluídas`;

    return `
      <div class="goal-card" data-id="${goal.id}">
        <div class="goal-card-header">
          <div>
            <h4>${escapeHtml(goal.description)} ${progress.done ? '<i class="fa-solid fa-circle-check" style="color:var(--success); margin-left:6px;"></i>' : ''}</h4>
            <span>${meta}</span>
          </div>
          <button class="icon-btn btn-delete-goal" type="button" title="Excluir meta">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="goal-progress-row">
          <div class="progress-track">
            <div class="progress-fill" style="width:${progress.percent}%"></div>
          </div>
          <span style="font-size:0.82rem; color:var(--text-muted); white-space:nowrap;">
            ${goal.type === 'subjects' ? `${progress.current}/${progress.target}` : `${progress.percent}%`}
          </span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-delete-goal').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.goal-card');
      confirmAction({
        title: 'Excluir esta meta?',
        message: 'A meta será removida permanentemente. Esta ação não poderá ser desfeita.',
        confirmLabel: 'Excluir meta',
        onConfirm: () => {
          deleteGoal(card.dataset.id);
          notify('Meta removida.', 'info');
          renderGoalsList();
        },
      });
    });
  });
}