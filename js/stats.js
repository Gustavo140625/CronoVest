/* ===================================================================
   stats.js
   Funções puras de cálculo, usadas pelo dashboard, perfil,
   estatísticas, calendário e metas. Nenhuma delas grava no
   localStorage — apenas leem e derivam números.
   =================================================================== */

function getAllSchedulesArray() {
  return Object.values(loadData().schedules);
}

function countTotalSchedules() {
  return getAllSchedulesArray().length;
}

/** Soma todas as matérias de todos os cronogramas e dias. */
function countTotalSubjects() {
  return getAllSchedulesArray().reduce((total, schedule) => {
    return total + WEEK_DAYS.reduce((sum, d) => sum + schedule.days[d.key].length, 0);
  }, 0);
}

function countCompletedSubjects() {
  return getAllSchedulesArray().reduce((total, schedule) => {
    return total + WEEK_DAYS.reduce(
      (sum, d) => sum + schedule.days[d.key].filter(s => s.done).length,
      0
    );
  }, 0);
}

function overallCompletionPercent() {
  const total = countTotalSubjects();
  if (total === 0) return 0;
  return Math.round((countCompletedSubjects() / total) * 100);
}

/** Quantas matérias foram concluídas hoje (segundo o completionLog). */
function getTodayCompletedCount() {
  return getCompletionLog()[todayKey()] || 0;
}

/** Dia da semana (Segunda..Domingo) com mais matérias concluídas no total —
 *  "dia mais produtivo" da rotina, olhando para os cronogramas atuais. */
function getMostProductiveWeekday() {
  let best = null;
  let bestCount = -1;
  WEEK_DAYS.forEach(d => {
    const count = getAllSchedulesArray().reduce(
      (sum, schedule) => sum + schedule.days[d.key].filter(s => s.done).length,
      0
    );
    if (count > bestCount) {
      bestCount = count;
      best = d.label;
    }
  });
  return bestCount > 0 ? best : '—';
}

/** Converte o completionLog em uma lista ordenada de datas com conclusões. */
function getStudiedDateKeys() {
  const log = getCompletionLog();
  return Object.keys(log)
    .filter(date => log[date] > 0)
    .sort();
}

function getStudiedDaysCount() {
  return getStudiedDateKeys().length;
}

/** Sequência atual: quantos dias consecutivos (terminando hoje ou ontem)
 *  o usuário concluiu pelo menos uma matéria. */
function getCurrentStreak() {
  const log = getCompletionLog();
  let streak = 0;
  const cursor = new Date();

  // Se hoje ainda não estudou, a sequência pode ter parado ontem.
  if (!log[todayKey()]) cursor.setDate(cursor.getDate() - 1);

while (true) {
  const key = todayKeyFrom(cursor);
    if (log[key] > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** Maior sequência de dias consecutivos já alcançada (histórico completo). */
function getBestStreak() {
  const dates = getStudiedDateKeys();
  if (dates.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    current = diffDays === 1 ? current + 1 : 1;
    best = Math.max(best, current);
  }
  return Math.max(best, getCurrentStreak());
}

function getLastUsedScheduleEntry() {
  return getRecentSchedules(1)[0] || null;
}

/** Calcula o progresso atual de uma meta, de acordo com seu tipo.
 *  - 'subjects': quantas matérias foram concluídas desde a criação da meta.
 *  - 'schedule': progresso geral (%) do cronograma vinculado à meta. */
function computeGoalProgress(goal) {
  if (goal.type === 'schedule') {
  const data = loadData();

  const finishedArchivedWeek = (data.weekHistory || []).some(week => {
    // Considera apenas o cronograma vinculado à meta.
    if (week.scheduleId !== goal.scheduleId) return false;

    // Não conta semanas encerradas antes da criação da meta.
    if (new Date(week.endedAt) < new Date(goal.createdAt)) {
      return false;
    }

    const subjects = WEEK_DAYS.flatMap(
      day => week.days[day.key] || []
    );

    return subjects.length > 0 &&
      subjects.every(subject => subject.done);
  });

  const progress = calculateScheduleProgress(goal.scheduleId);

  const finishedCurrentWeek =
    progress.total > 0 && progress.done === progress.total;

  const done = finishedArchivedWeek || finishedCurrentWeek;

  const percent = done
    ? 100
    : Math.min(99, progress.percent);

  return {
    current: percent,
    target: 100,
    percent,
    done,
  };
}

  // type === 'subjects'
  const current = Math.max(
  0,
  countHistoricalCompletedSubjects() - (goal.startCount || 0)
);
  const percent = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
  return { current, target: goal.target, percent, done: current >= goal.target };
}

/** Agrega tudo de uma vez — usado para avaliar conquistas e para
 *  popular a página de estatísticas com uma única chamada. */
function computeAllStats() {
  return {
    totalSchedules: countTotalSchedules(),
    totalSubjects: countTotalSubjects(),
    completedSubjects: countCompletedSubjects(),
    completionPercent: overallCompletionPercent(),
    todayCompleted: getTodayCompletedCount(),
    mostProductiveWeekday: getMostProductiveWeekday(),
    studiedDays: getStudiedDaysCount(),
    currentStreak: getCurrentStreak(),
    bestStreak: getBestStreak(),
    hasCustomSchedule: getAllSchedulesArray().some(s => s.type === 'custom'),
  };
}
/**
 * Conta as conclusões guardadas nas semanas encerradas.
 */
function countArchivedCompletedSubjects() {
  const data = loadData();

  return (data.weekHistory || []).reduce((total, week) => {
    const completed = WEEK_DAYS.reduce((sum, day) => {
      const subjects = week.days[day.key] || [];

      return sum + subjects.filter(subject => subject.done).length;
    }, 0);

    return total + completed;
  }, 0);
}

/**
 * Soma as conclusões das semanas encerradas
 * com as marcações atuais dos cronogramas.
 */
function countHistoricalCompletedSubjects() {
  return countArchivedCompletedSubjects() + countCompletedSubjects();
}