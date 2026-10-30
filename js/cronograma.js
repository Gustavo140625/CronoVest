/* ===================================================================
   cronograma.js
   Usado por cronograma.html (ENEM/FUVEST) e cronograma-personalizado.html.
   As duas páginas compartilham exatamente o mesmo layout e o mesmo
   motor de renderização — a única diferença é o cronograma ativo,
   guardado no localStorage através de storage.js.
   =================================================================== */

let activeSchedule = null;   // objeto do cronograma atualmente aberto
let currentDayKey = null;    // dia da semana selecionado
let editMode = false;        // modo de edição do card de matérias

document.addEventListener('DOMContentLoaded', initSchedulePage);

function initSchedulePage() {
  const root = document.getElementById('schedule-root');
  if (!root) return; // esta página não é uma página de cronograma

  const id = getActiveScheduleId();
  const schedule = id ? getSchedule(id) : null;

  if (!schedule) {
    // Nenhum cronograma ativo válido: volta para a tela de escolha.
    window.location.href = 'escolha.html';
    return;
  }

  activeSchedule = schedule;
  currentDayKey = schedule.lastDay || WEEK_DAYS[0].key;

  registerRecentSchedule(schedule.id);

  document.getElementById('schedule-name').textContent = schedule.name;
  renderFavoriteButton();
  bindDeleteScheduleButton();
  bindNewWeekButton();


  renderDaySelector();
  renderDayContent();
  bindStaticEvents();
  evaluateAchievementsAndNotify();
}

/* ---------------------------------------------------------------
   Favorito do cronograma atual
   --------------------------------------------------------------- */
function renderFavoriteButton() {
  const btn = document.getElementById('btn-favorite-schedule');
  if (!btn) return;

  const updateIcon = () => {
    const fav = isFavorite(activeSchedule.id);
    btn.classList.toggle('is-active', fav);
    btn.title = fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
  };

  updateIcon();
  btn.addEventListener('click', () => {
    const nowFav = toggleFavorite(activeSchedule.id);
    updateIcon();
    notify(nowFav ? 'Cronograma adicionado aos favoritos.' : 'Cronograma removido dos favoritos.', 'info');
  });
}

/** Exclui o cronograma inteiro, sempre atrás de um modal de confirmação. */
function bindDeleteScheduleButton() {
  const btn = document.getElementById('btn-delete-schedule');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isFixed = activeSchedule.type !== 'custom';
    confirmAction({
      title: 'Excluir este cronograma?',
      message: isFixed
        ? `"${activeSchedule.name}" e todo o seu progresso serão excluídos. Esta ação não poderá ser desfeita (você pode recriá-lo do zero em Configurações).`
        : `"${activeSchedule.name}" será excluído permanentemente, junto com todas as suas matérias e progresso. Esta ação não poderá ser desfeita.`,
      confirmLabel: 'Excluir cronograma',
      onConfirm: () => {
        deleteSchedule(activeSchedule.id);
        notify('Cronograma excluído.', 'info');
        window.location.href = 'escolha.html';
      },
    });
  });
}

/* ---------------------------------------------------------------
   Seletor de dias (a "trilha" de pílulas no topo do cronograma)
   --------------------------------------------------------------- */
function renderDaySelector() {
  const track = document.getElementById('day-track');
  track.innerHTML = WEEK_DAYS.map(day => {
    const { percent, total } = calculateDayProgress(activeSchedule.id, day.key);
    const isActive = day.key === currentDayKey;
    const isComplete = percent === 100 && total > 0;
    return `
      <button
        class="day-pill ${isActive ? 'is-active' : ''} ${isComplete ? 'is-complete' : ''}"
        data-day="${day.key}"
        type="button"
      >
        <span class="day-pill-dot"></span>
        <span class="day-pill-label">${day.label}</span>
      </button>
    `;
  }).join('');

  track.querySelectorAll('.day-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDayKey = btn.dataset.day;
      activeSchedule.lastDay = currentDayKey;
      persistLastDay();
      editMode = false;
      renderDaySelector();
      renderDayContent();
    });
  });
}

function persistLastDay() {
  const data = loadData();
  if (data.schedules[activeSchedule.id]) {
    data.schedules[activeSchedule.id].lastDay = currentDayKey;
    saveData(data);
  }
}

/* ---------------------------------------------------------------
   Conteúdo do dia selecionado: lista de matérias + progresso
   --------------------------------------------------------------- */
function renderDayContent() {
  document.getElementById('current-day-label').textContent = dayLabel(currentDayKey);

  const card = document.getElementById('subjects-card');
  card.classList.toggle('edit-mode', editMode);

  const editBtn = document.getElementById('btn-toggle-edit');
  editBtn.innerHTML = editMode
    ? '<i class="fa-solid fa-check"></i><span>Concluir edição</span>'
    : '<i class="fa-solid fa-pen"></i><span>Editar</span>';

  renderSubjectList();
  renderAddSubjectForm();
  updateProgressBar();
}

function dayLabel(key) {
  return WEEK_DAYS.find(d => d.key === key)?.label || key;
}

function getCurrentSubjects() {
  return activeSchedule.days[currentDayKey] || [];
}

function renderSubjectList() {
  const list = document.getElementById('subject-list');
  const subjects = getCurrentSubjects();

  if (subjects.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <i class="fa-solid fa-feather"></i>
        <p>Nenhuma matéria neste dia ainda.${editMode ? '' : ' Clique em "Editar" para adicionar.'}</p>
      </li>`;
    return;
  }

  list.innerHTML = subjects.map(subject => `
    <li class="subject-item ${subject.done ? 'is-done' : ''}" data-id="${subject.id}">
      <label class="subject-check">
        <input type="checkbox" class="checkbox-input" ${subject.done ? 'checked' : ''}>
        <span class="custom-checkbox"><i class="fa-solid fa-check"></i></span>
        <span class="subject-name">${escapeHtml(subject.name)}</span>
      </label>
      <div class="subject-actions">
        <button class="icon-btn btn-edit-subject" type="button" title="Renomear matéria">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="icon-btn btn-remove-subject" type="button" title="Remover matéria">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </li>
  `).join('');

  list.querySelectorAll('.subject-item').forEach(li => {
    const id = li.dataset.id;

    li.querySelector('.checkbox-input').addEventListener('change', () => {
      toggleSubjectDone(activeSchedule.id, currentDayKey, id);
      refreshScheduleFromStorage();
      renderDaySelector();
      li.classList.toggle('is-done');
      updateProgressBar();
      evaluateAchievementsAndNotify();
    });

    li.querySelector('.btn-remove-subject').addEventListener('click', () => {
      removeSubject(activeSchedule.id, currentDayKey, id);
      refreshScheduleFromStorage();
      renderSubjectList();
      renderDaySelector();
      updateProgressBar();
      notify('Matéria removida.', 'info');
    });

    li.querySelector('.btn-edit-subject').addEventListener('click', () => {
      startRenameSubject(li, id);
    });
  });
}

/** Transforma o nome de uma matéria em um campo editável inline. */
function startRenameSubject(li, subjectId) {
  const nameSpan = li.querySelector('.subject-name');
  const currentName = nameSpan.textContent;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'subject-rename-input';
  input.value = currentName;
  input.maxLength = 40;
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    const newName = input.value.trim();
    if (newName.length > 0 && newName !== currentName) {
      editSubject(activeSchedule.id, currentDayKey, subjectId, newName);
      refreshScheduleFromStorage();
      notify('Alterações salvas.', 'success');
    }
    renderSubjectList();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') renderSubjectList();
  });
  input.addEventListener('blur', commit);
}

function renderAddSubjectForm() {
  const container = document.getElementById('add-subject-container');
  if (!editMode) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <form id="form-add-subject" class="add-subject-form">
      <input
        type="text"
        id="input-add-subject"
        class="add-subject-input"
        placeholder="Nome da nova matéria"
        maxlength="40"
        autocomplete="off"
      >
      <button type="submit" class="btn-add-subject">
        <i class="fa-solid fa-plus"></i> Adicionar
      </button>
    </form>
  `;

  const form = document.getElementById('form-add-subject');
  const input = document.getElementById('input-add-subject');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (name.length === 0) return;
    addSubject(activeSchedule.id, currentDayKey, name);
    refreshScheduleFromStorage();
    renderSubjectList();
    renderDaySelector();
    updateProgressBar();
    renderAddSubjectForm();
    document.getElementById('input-add-subject').focus();
    notify('Matéria adicionada.', 'success');
    evaluateAchievementsAndNotify();
  });
}

function updateProgressBar() {
  const { done, total, percent } = calculateDayProgress(activeSchedule.id, currentDayKey);
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');

  fill.style.width = `${percent}%`;
  label.textContent = total === 0
    ? 'Adicione matérias para acompanhar seu progresso'
    : `${done} de ${total} concluídas — ${percent}%`;
}

/* ---------------------------------------------------------------
   Eventos estáticos da página (existem independente do dia)
   --------------------------------------------------------------- */
function bindStaticEvents() {
  document.getElementById('btn-toggle-edit').addEventListener('click', () => {
    editMode = !editMode;
    renderDayContent();
  });

  const backBtn = document.getElementById('btn-voltar');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'escolha.html';
    });
  }
}

/** Garante que activeSchedule reflita o que está realmente salvo. */
function refreshScheduleFromStorage() {
  activeSchedule = getSchedule(activeSchedule.id);
}

/* ---------- Botão de renovação semanal ---------- */

function bindNewWeekButton() {
  const backBtn = document.getElementById('btn-voltar');

  if (!backBtn || document.getElementById('btn-new-week')) return;

  const button = document.createElement('button');
  button.id = 'btn-new-week';
  button.type = 'button';
  button.className = 'btn-ghost';
  button.textContent = 'Iniciar nova semana';

  backBtn.before(button);

  button.addEventListener('click', () => {
    confirmAction({
      title: 'Iniciar uma nova semana?',
      message:
        'A semana atual será arquivada, inclusive se estiver incompleta. ' +
        'As matérias deste cronograma serão desmarcadas para você ' +
        'estudá-las novamente. Seu histórico será preservado.',
      confirmLabel: 'Iniciar nova semana',
      danger: false,

      onConfirm: () => {
        try {
          const started = startNewWeek(activeSchedule.id);

          if (!started) {
            notify(
              'Conclua pelo menos uma matéria antes de iniciar outra semana.',
              'info'
            );
            return;
          }

          refreshScheduleFromStorage();

          currentDayKey = 'segunda';
          editMode = false;

          renderDaySelector();
          renderDayContent();

          notify(
            `Semana ${activeSchedule.weekNumber} iniciada! Histórico preservado.`,
            'success'
          );
        } catch (error) {
          console.error('Erro ao iniciar nova semana:', error);

          notify(
            'Não foi possível salvar a nova semana. Tente novamente.',
            'danger'
          );
        }
      },
    });
  });
}