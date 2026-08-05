/* ===================================================================
   achievements.js
   Definição das conquistas do CronoVest e a lógica que verifica,
   após cada ação relevante, se alguma nova conquista foi desbloqueada.
   =================================================================== */

const ACHIEVEMENTS = [
  {
    id: 'first_schedule',
    title: 'Primeiro cronograma criado',
    description: 'Você criou (ou abriu) seu primeiro cronograma no CronoVest.',
    icon: 'fa-flag-checkered',
    check: stats => stats.totalSchedules >= 1,
  },
  {
    id: 'first_custom_schedule',
    title: 'Primeiro cronograma personalizado',
    description: 'Você montou um cronograma totalmente seu, do zero.',
    icon: 'fa-wand-magic-sparkles',
    check: stats => stats.hasCustomSchedule,
  },
  {
    id: 'first_subject_done',
    title: 'Primeira matéria concluída',
    description: 'Você marcou a primeira matéria como concluída.',
    icon: 'fa-star',
    check: stats => stats.completedSubjects >= 1,
  },
  {
    id: 'streak_7',
    title: '7 dias consecutivos estudando',
    description: 'Uma semana inteira sem quebrar a sequência.',
    icon: 'fa-fire',
    check: stats => stats.bestStreak >= 7,
  },
  {
    id: 'subjects_100',
    title: '100 matérias concluídas',
    description: 'Cem matérias já marcadas como concluídas. Excelente ritmo!',
    icon: 'fa-trophy',
    check: stats => stats.completedSubjects >= 100,
  },
];

/** Roda todas as checagens e desbloqueia o que ainda não estava.
 *  Retorna a lista das conquistas recém desbloqueadas (para notificar). */
function evaluateAchievements() {
  const stats = computeAllStats();
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!isAchievementUnlocked(achievement.id) && achievement.check(stats)) {
      unlockAchievement(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
}

/** Roda a avaliação e já dispara um toast para cada conquista nova. */
function evaluateAchievementsAndNotify() {
  const newlyUnlocked = evaluateAchievements();
  newlyUnlocked.forEach(achievement => {
    notify(`Conquista desbloqueada: ${achievement.title}`, 'success', 4200);
  });
  return newlyUnlocked;
}

/** Retorna todas as conquistas com seu status atual (para a UI). */
function getAchievementsWithStatus() {
  const unlocked = getUnlockedAchievements();
  return ACHIEVEMENTS.map(achievement => {
    const record = unlocked.find(u => u.id === achievement.id);
    return { ...achievement, unlocked: Boolean(record), unlockedAt: record?.unlockedAt || null };
  });
}