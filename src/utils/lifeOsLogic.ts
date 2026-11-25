/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HabitRecord {
  id: string;
  title: string;
  category: 'mindset' | 'health' | 'commercial' | 'tech';
  completedDates: string[]; // YYYY-MM-DD
  targetDaysPerWeek: number;
  streak: number;
  color: string;
}

export interface TaskItem {
  id: string;
  title: string;
  project: 'virtual_tour' | 'retailvision' | 'personal' | 'growth';
  isTopPriority: boolean; // Top 3 Non-Negotiable
  completed: boolean;
  dueDate?: string;
  urgent: boolean;
  important: boolean;
  estimatedMinutes?: number;
}

export interface RejectionLog {
  id: string;
  date: string;
  businessName: string;
  location: string;
  outcomeNote: string;
  fearBefore: number; // 1-10
  feelingAfter: number; // 1-10
  lessonLearned: string;
}

/**
 * Calculates the current consecutive day streak for a habit.
 * Handles both today completed or yesterday completed (maintaining streak).
 */
export function calculateHabitStreak(completedDates: string[], todayStr: string): number {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const dateSet = new Set(completedDates);
  const today = new Date(todayStr);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  // Format helper YYYY-MM-DD
  const format = (d: Date) => d.toISOString().split('T')[0];
  
  // Check if today is completed
  const todayFormatted = format(today);
  const isTodayDone = dateSet.has(todayFormatted);
  
  if (!isTodayDone) {
    // Check if yesterday was completed; if not, streak is 0
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!dateSet.has(format(yesterday))) {
      return 0;
    }
    // Start counting from yesterday
    checkDate = yesterday;
  }
  
  while (dateSet.has(format(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
}

/**
 * Computes the Apple Activity Rings progress for Today.
 */
export function calculateDailyFocusProgress(
  habitsDone: number,
  totalHabits: number,
  tasksDone: number,
  totalTasks: number,
  rejectionsLogged: number,
  weeklyRejectionTarget: number = 10
): { habitsPct: number; tasksPct: number; couragePct: number; overallScore: number } {
  const habitsPct = totalHabits > 0 ? Math.min(100, Math.round((habitsDone / totalHabits) * 100)) : 0;
  const tasksPct = totalTasks > 0 ? Math.min(100, Math.round((tasksDone / totalTasks) * 100)) : 0;
  
  // Daily target is weekly target / 5 business days (approx 2 per day)
  const dailyRejectionTarget = Math.max(1, Math.round(weeklyRejectionTarget / 5));
  const couragePct = Math.min(100, Math.round((rejectionsLogged / dailyRejectionTarget) * 100));
  
  const overallScore = Math.round((habitsPct * 0.35) + (tasksPct * 0.45) + (couragePct * 0.20));
  
  return { habitsPct, tasksPct, couragePct, overallScore };
}

/**
 * Categorizes a task into the 4 Eisenhower Matrix quadrants.
 */
export function categorizeEisenhower(urgent: boolean, important: boolean): 'q1_do_now' | 'q2_schedule' | 'q3_delegate' | 'q4_eliminate' {
  if (urgent && important) return 'q1_do_now';
  if (!urgent && important) return 'q2_schedule';
  if (urgent && !important) return 'q3_delegate';
  return 'q4_eliminate';
}

/**
 * Calculates rejection quota progress (Target 10 'No's per week).
 */
export function calculateRejectionTargetProgress(noCount: number, weeklyGoal: number = 10) {
  const safeGoal = Math.max(1, weeklyGoal);
  const percentage = Math.min(100, Math.round((noCount / safeGoal) * 100));
  const remaining = Math.max(0, safeGoal - noCount);
  const isGoalReached = noCount >= safeGoal;
  
  let label = 'Inizia la sfida';
  if (noCount > 0 && noCount < 4) label = 'Ottimo inizio, il rifiuto è allenamento';
  else if (noCount >= 4 && noCount < 7) label = 'A metà strada: la paura si sta sgretolando';
  else if (noCount >= 7 && noCount < 10) label = 'Zona maestria: quasi raggiunta la quota';
  else if (isGoalReached) label = 'Quota Coraggio Raggiunta! Sei inarrestabile';

  return { percentage, remaining, isGoalReached, label };
}

/**
 * Generates an actionable daily insight dynamically based on Sam's current situation.
 */
export function generateDailyActionableInsight(context: {
  activeFrontsCount: number;
  tasksDueTodayCount: number;
  rejectionsThisWeek: number;
  uncomfortableActionDone: boolean;
  hoursUntilEvening: number;
}): { title: string; advice: string; tag: 'focus' | 'sales' | 'mindset' | 'balance' } {
  // Rule 1: Too many open fronts
  if (context.activeFrontsCount > 2) {
    return {
      title: 'Attenzione ai Fronti Aperti',
      advice: 'Hai più di 2 progetti attivi contemporaneamente. Congela i fronti secondari per mantenere la massima esecuzione.',
      tag: 'focus'
    };
  }

  // Rule 2: Rejection courage challenge
  if (context.rejectionsThisWeek > 0 && context.rejectionsThisWeek < 2 && !context.uncomfortableActionDone) {
    return {
      title: 'Esposizione al Rifiuto di Oggi',
      advice: 'Punta a compiere almeno un\'azione fuori dalla zona di comfort oggi. Ogni tentativo costruisce slancio.',
      tag: 'sales'
    };
  }

  // Rule 3: Anti-procrastination
  if (context.tasksDueTodayCount > 0 && !context.uncomfortableActionDone) {
    return {
      title: 'La Regola della Prima Azione',
      advice: 'Inizia dall\'attività più importante o impegnativa della giornata: bastano 15 minuti per sbloccare il ritmo.',
      tag: 'mindset'
    };
  }

  // Default virgin / balance insight
  return {
    title: 'Spazio Pulito & Focus',
    advice: 'Aggiungi le tue priorità, abitudini o obiettivi quando sei pronto per iniziare la giornata con chiarezza.',
    tag: 'balance'
  };
}
