/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProjectGoal,
  HabitItem,
  TaskItem,
  RejectionRecord,
  JournalEntry,
  FinancialProfile,
} from '../types';

// App 100% Vergine: nessun dato pre-impostato
export const INITIAL_PROJECTS: ProjectGoal[] = [];

export const INITIAL_HABITS: HabitItem[] = [];

export const INITIAL_TASKS: TaskItem[] = [];

export const INITIAL_REJECTIONS: RejectionRecord[] = [];

export const INITIAL_JOURNAL: JournalEntry[] = [];

export const INITIAL_FINANCIAL_PROFILE: FinancialProfile = {
  bankBalance: 0,
  lastUpdated: 'Non impostato',
  expenses: [],
  incomes: [],
  chinaTrip: {
    budgetLimit: 0,
    durationDays: '',
    period: '',
    status: 'congelato',
    notes: '',
  },
};
