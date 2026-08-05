/* ===================================================================
   storage.js
   Camada única de acesso ao localStorage.
   =================================================================== */

const STORAGE_KEY = 'cronovest_data';

const WEEK_DAYS = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca',   label: 'Terça'   },
  { key: 'quarta',  label: 'Quarta'  },
  { key: 'quinta',  label: 'Quinta'  },
  { key: 'sexta',   label: 'Sexta'   },
  { key: 'sabado',  label: 'Sábado'  },
  { key: 'domingo', label: 'Domingo' },
];

function getEmptyData() {
  return {
    schedules: {},
    activeId: null,
    favorites: [],
    recentSchedules: [],
    profile: { name: '', objective: '', quote: '', avatar: null, createdAt: new Date().toISOString() },
    completionLog: {},
    achievements: [],
    goals: [],
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = getEmptyData();
      saveData(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    const empty = getEmptyData();
    return {
      ...empty,
      ...parsed,
      profile: { ...empty.profile, ...parsed.profile },
    };
  } catch (err) {
    console.error('CronoVest: dados corrompidos, reiniciando storage.', err);
    return getEmptyData();
  }
}

/* ---------- Metas ---------- */
function getGoals() {
  return loadData().goals;
}

function createGoal(goal) {
  const data = loadData();
  const newGoal = { id: generateId('goal'), createdAt: new Date().toISOString(), ...goal };
  data.goals.push(newGoal);
  saveData(data);
  return newGoal;
}

function deleteGoal(id) {
  const data = loadData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveData(data);
}



function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function buildEmptyDays() {
  const days = {};
  WEEK_DAYS.forEach(d => { days[d.key] = []; });
  return days;
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getSchedule(id) {
  const data = loadData();
  return data.schedules[id];
}

function ensureFixedSchedule(type, name, defaultsByDay) {
  const data = loadData();
  if (!data.schedules[type]) {
    const days = {};
    WEEK_DAYS.forEach(d => {
      const subjects = defaultsByDay[d.key] || [];
      days[d.key] = subjects.map(subjectName => ({
        id: generateId('subj'),
        name: subjectName,
        done: false,
      }));
    });
    data.schedules[type] = { id: type, name, type: 'fixed', days };
    saveData(data);
  }
  return data.schedules[type];
}

function createCustomSchedule(name) {
  const data = loadData();
  const id = generateId('custom');
  data.schedules[id] = { id, name: name.trim(), type: 'custom', days: buildEmptyDays() };
  saveData(data);
  return data.schedules[id];
}

function setActiveSchedule(id) {
  const data = loadData();
  data.activeId = id;
  saveData(data);
}

function getActiveScheduleId() {
  return loadData().activeId;
}

function addSubject(scheduleId, dayKey, subjectName) {
  const data = loadData();
  const schedule = data.schedules[scheduleId];
  if (!schedule) return;
  schedule.days[dayKey].push({ id: generateId('subj'), name: subjectName.trim(), done: false });
  saveData(data);
}

function editSubject(scheduleId, dayKey, subjectId, newName) {
  const data = loadData();
  const subject = data.schedules[scheduleId]?.days[dayKey].find(s => s.id === subjectId);
  if (!subject) return;
  subject.name = newName.trim();
  saveData(data);
}

function removeSubject(scheduleId, dayKey, subjectId) {
  const data = loadData();
  const schedule = data.schedules[scheduleId];
  if (!schedule) return;
  schedule.days[dayKey] = schedule.days[dayKey].filter(s => s.id !== subjectId);
  saveData(data);
}

/** Alterna o estado concluído/pendente e ajusta o log de conclusão do dia
 *  (usado por sequências/streaks e pela conquista "matéria concluída"). */
function toggleSubjectDone(scheduleId, dayKey, subjectId) {
  const data = loadData();
  const subject = data.schedules[scheduleId]?.days[dayKey].find(s => s.id === subjectId);
  if (!subject) return;

  subject.done = !subject.done;

  const key = todayKeyFrom(data);
  const delta = subject.done ? 1 : -1;
  const next = Math.max(0, (data.completionLog[key] || 0) + delta);
  if (next === 0) delete data.completionLog[key];
  else data.completionLog[key] = next;

  saveData(data);
}

function calculateDayProgress(scheduleId, dayKey) {
  const schedule = getSchedule(scheduleId);
  const subjects = schedule?.days[dayKey] || [];
  const total = subjects.length;
  const done = subjects.filter(s => s.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/** Progresso de um cronograma inteiro (todos os dias somados). */
function calculateScheduleProgress(scheduleId) {
  const schedule = getSchedule(scheduleId);
  if (!schedule) return { done: 0, total: 0, percent: 0 };
  let done = 0, total = 0;
  WEEK_DAYS.forEach(d => {
    const subjects = schedule.days[d.key] || [];
    total += subjects.length;
    done += subjects.filter(s => s.done).length;
  });
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function deleteSchedule(id) {
  const data = loadData();
  delete data.schedules[id];
  data.favorites = data.favorites.filter(x => x !== id);
  data.recentSchedules = data.recentSchedules.filter(x => x !== id);
  if (data.activeId === id) data.activeId = null;
  saveData(data);
}

/* ---------- Favoritos ---------- */
function isFavorite(id) {
  return loadData().favorites.includes(id);
}

function toggleFavorite(id) {
  const data = loadData();
  const idx = data.favorites.indexOf(id);
  const nowFav = idx === -1;
  if (nowFav) data.favorites.push(id);
  else data.favorites.splice(idx, 1);
  saveData(data);
  return nowFav;
}

/* ---------- Recentes ---------- */
function registerRecentSchedule(id) {
  const data = loadData();
  data.recentSchedules = [id, ...data.recentSchedules.filter(x => x !== id)].slice(0, 10);
  saveData(data);
}

function getRecentSchedules(limit = 5) {
  const data = loadData();
  return data.recentSchedules.map(id => data.schedules[id]).filter(Boolean).slice(0, limit);
}

/** Marca um cronograma como ativo/recente e devolve a rota certa
 *  (fixo -> cronograma.html, personalizado -> cronograma-personalizado.html). */
function openSchedule(id) {
  setActiveSchedule(id);
  registerRecentSchedule(id);
}

function getScheduleRoute(schedule) {
  return schedule.type === 'custom' ? 'cronograma-personalizado.html' : 'cronograma.html';
}

/* ---------- Perfil ---------- */
function getProfile() {
  return loadData().profile;
}

function updateProfile(partial) {
  const data = loadData();
  data.profile = { ...data.profile, ...partial };
  saveData(data);
  return data.profile;
}

/* ---------- Progresso / dados perigosos (Configurações) ---------- */
function clearAllProgress() {
  const data = loadData();
  Object.values(data.schedules).forEach(schedule => {
    WEEK_DAYS.forEach(d => {
      (schedule.days[d.key] || []).forEach(s => { s.done = false; });
    });
  });
  data.completionLog = {};
  saveData(data);
}

function restoreDefaultSchedules() {
  const data = loadData();
  delete data.schedules['enem'];
  delete data.schedules['fuvest'];
  saveData(data);
  ensureFixedSchedule('enem', 'Cronograma ENEM', ENEM_DEFAULTS);
  ensureFixedSchedule('fuvest', 'Cronograma FUVEST', FUVEST_DEFAULTS);
}

function eraseAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ---------- Busca ---------- */
function setScheduleLastDay(scheduleId, dayKey) {
  const data = loadData();
  if (data.schedules[scheduleId]) {
    data.schedules[scheduleId].lastDay = dayKey;
    saveData(data);
  }
}

function searchSubjects(term) {
  const lowerTerm = term.toLowerCase();
  const data = loadData();
  const results = [];
  Object.values(data.schedules).forEach(schedule => {
    WEEK_DAYS.forEach(d => {
      (schedule.days[d.key] || []).forEach(subject => {
        if (subject.name.toLowerCase().includes(lowerTerm)) {
          results.push({
            subjectName: subject.name,
            done: subject.done,
            scheduleId: schedule.id,
            scheduleName: schedule.name,
            dayKey: d.key,
            dayLabel: d.label,
          });
        }
      });
    });
  });
  return results;
}

/* ---------- Log de conclusão (streaks) ---------- */
function todayKey() {
  return todayKeyFrom(loadData());
}
function todayKeyFrom() {
  return new Date().toISOString().slice(0, 10);
}

function getCompletionLog() {
  return loadData().completionLog;
}

/* ---------- Conquistas ---------- */
function isAchievementUnlocked(id) {
  return loadData().achievements.some(a => a.id === id);
}

function unlockAchievement(id) {
  const data = loadData();
  if (!data.achievements.some(a => a.id === id)) {
    data.achievements.push({ id, unlockedAt: new Date().toISOString() });
    saveData(data);
  }
}

function getUnlockedAchievements() {
  return loadData().achievements;
}

/* ---------- Utilitário compartilhado ---------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}