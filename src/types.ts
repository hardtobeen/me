/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppTab = 'today' | 'money' | 'habits' | 'goals' | 'courage' | 'journal' | 'settings';

export type ProjectId = string;

export interface ProjectGoal {
  id: ProjectId;
  title: string;
  shortDesc: string;
  category: 'cash_now' | 'scale_asset' | 'mindset' | 'reward' | 'custom';
  targetAmount?: string;
  deadline?: string;
  progressPercent: number;
  status: 'active' | 'frozen' | 'scheduled';
  accentColor: string; // Apple hex color
  milestones: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface HabitItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'mindset' | 'commercial' | 'tech' | 'health';
  targetDaysPerWeek: number;
  completedDates: string[]; // YYYY-MM-DD
  color: string;
  streak: number;
}

export interface TaskItem {
  id: string;
  title: string;
  projectId: ProjectId;
  isTopPriority: boolean; // Top 3 Non-Negotiables
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  urgent: boolean;
  important: boolean;
  estimatedMinutes?: number;
  createdAt: string;
}

export interface RejectionRecord {
  id: string;
  date: string;
  businessName: string;
  location: string;
  outcomeNote: string;
  fearBefore: number; // 1-10
  feelingAfter: number; // 1-10
  lessonLearned: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'struggling';
  facingDiscomfort: boolean;
  avoidedDistractions: boolean; // No social/xbox before work
  dailyWin: string;
  reflection: string;
}

// ==========================================
// SEZIONE SOLDI / MONEY & CASHFLOW TRACKER
// ==========================================

export type ExpenseCategory =
  | 'fiscale'
  | 'salute'
  | 'viaggio'
  | 'logistica'
  | 'alloggio'
  | 'vita_quotidiana'
  | 'altro';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  dateLabel: string; // e.g. "Entro il 30 Nov", "Dopodomani", "Tra 7 giorni"
  dueDate?: string; // YYYY-MM-DD
  category: ExpenseCategory;
  paid: boolean;
  paidDate?: string;
  notes?: string;
}

export interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  dateLabel: string; // e.g. "Novembre 2026"
  expectedDate?: string;
  received: boolean;
  receivedDate?: string;
  notes?: string;
}

export interface ChinaTripBudget {
  budgetLimit: number; // e.g. 1100 €
  durationDays: string; // '11–14 giorni'
  period: string; // 'Dicembre 2026'
  status: 'congelato' | 'in_valutazione';
  notes: string;
}

export interface FinancialProfile {
  bankBalance: number; // Saldo attuale sul conto
  lastUpdated: string;
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  chinaTrip: ChinaTripBudget;
}
