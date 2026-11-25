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
import { ReminderSetting } from './notifications';

export interface AppFullState {
  projects: ProjectGoal[];
  habits: HabitItem[];
  tasks: TaskItem[];
  rejections: RejectionRecord[];
  journalEntries: JournalEntry[];
  reminders: ReminderSetting[];
  financialProfile: FinancialProfile;
  lastSavedAt: string;
  version: string;
}

export interface StorageStatus {
  isPersistent: boolean;
  persistenceSupported: boolean;
  indexedDBAvailable: boolean;
  quotaUsedBytes: number;
  quotaTotalBytes: number;
  lastSavedAt: string;
}

const DB_NAME = 'LockedInPermanentVault';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const STATE_KEY = 'master_record';

// LocalStorage Keys for rapid sync cache
export const LS_KEYS = {
  PROJECTS: 'lockedin_projects',
  HABITS: 'lockedin_habits',
  TASKS: 'lockedin_tasks',
  REJECTIONS: 'lockedin_rejections',
  JOURNAL: 'lockedin_journal',
  REMINDERS: 'lockedin_reminders',
  FINANCE: 'lockedin_finance',
  LAST_SAVED: 'lockedin_last_saved',
  VIRGIN_SLATE: 'lockedin_v5_virgin_zero',
};

/**
 * Open or upgrade the native IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB non supportato da questo browser'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Save data into IndexedDB (Durable persistence resistant to OS reboots and 7-day browser purge)
 */
export async function saveToIndexedDB(state: AppFullState): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(state, STATE_KEY);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject((e.target as IDBRequest).error);

      tx.oncomplete = () => {
        db.close();
      };
      tx.onabort = () => {
        db.close();
      };
      tx.onerror = () => {
        db.close();
      };
    });
  } catch (err) {
    console.warn('[LockedIn Vault] Errore salvataggio IndexedDB:', err);
  }
}

/**
 * Load data from IndexedDB
 */
export async function loadFromIndexedDB(): Promise<AppFullState | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(STATE_KEY);

      request.onsuccess = () => {
        const result = request.result as AppFullState | undefined;
        resolve(result || null);
      };

      request.onerror = (e) => reject((e.target as IDBRequest).error);

      tx.oncomplete = () => {
        db.close();
      };
      tx.onabort = () => {
        db.close();
      };
      tx.onerror = () => {
        db.close();
      };
    });
  } catch (err) {
    console.warn('[LockedIn Vault] Errore lettura IndexedDB:', err);
    return null;
  }
}

/**
 * Request OS-level persistent storage permission (navigator.storage.persist)
 * Prevents iOS Safari & Android from deleting data on phone restart or low disk.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Check persistent storage state & quota
 */
export async function getStorageStatus(): Promise<StorageStatus> {
  let isPersistent = false;
  const persistenceSupported = typeof window !== 'undefined' && !!navigator.storage?.persist;
  const indexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
  let quotaUsedBytes = 0;
  let quotaTotalBytes = 0;

  if (typeof window !== 'undefined' && navigator.storage) {
    try {
      if (navigator.storage.persisted) {
        isPersistent = await navigator.storage.persisted();
      }
      if (navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        quotaUsedBytes = estimate.usage || 0;
        quotaTotalBytes = estimate.quota || 0;
      }
    } catch {
      // Ignore storage estimate unavailability
    }
  }

  let lastSavedAt = new Date().toLocaleTimeString('it-IT');
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(LS_KEYS.LAST_SAVED);
      if (cached) lastSavedAt = cached;
    }
  } catch {
    // Ignore localStorage unavailability
  }

  return {
    isPersistent,
    persistenceSupported,
    indexedDBAvailable,
    quotaUsedBytes,
    quotaTotalBytes,
    lastSavedAt,
  };
}

/**
 * Export complete application data to a timestamped JSON file
 */
export function exportDataAsJSON(state: AppFullState) {
  const exportPayload = {
    ...state,
    appName: 'LockedIn — Personal Command OS',
    exportedAt: new Date().toISOString(),
    humanDate: new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(new Date()),
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateFormatted = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `lockedin_backup_totale_${dateFormatted}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const MAX_BACKUP_BYTES = 10 * 1024 * 1024; // 10 MB

function isPlainRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function safeStr(val: unknown, fallback = '', maxLen = 500): string {
  return typeof val === 'string' ? val.slice(0, maxLen) : fallback;
}

function safeNum(val: unknown, fallback = 0): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

function safeBool(val: unknown, fallback = false): boolean {
  return typeof val === 'boolean' ? val : fallback;
}

/**
 * Validate and sanitize imported backup data (blocks prototype pollution & malformed entries)
 */
export function parseAndValidateBackup(jsonText: string): Partial<AppFullState> {
  if (typeof jsonText !== 'string' || jsonText.length > MAX_BACKUP_BYTES) {
    throw new Error('File di backup troppo grande o formato non valido.');
  }

  const parsed = JSON.parse(jsonText, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });

  if (!isPlainRecord(parsed)) {
    throw new Error('Struttura del backup non valida.');
  }

  const sanitized: Partial<AppFullState> = {};

  if (Array.isArray(parsed.projects)) {
    sanitized.projects = parsed.projects.filter(isPlainRecord).map((p, idx) => {
      const milestones = Array.isArray(p.milestones)
        ? p.milestones.filter(isPlainRecord).map((m, mIdx) => ({
            id: safeStr(m.id, `ms-${Date.now()}-${mIdx}`, 80),
            title: safeStr(m.title, 'Tappa', 240),
            completed: safeBool(m.completed),
          }))
        : [];
      const done = milestones.filter((m) => m.completed).length;
      const status = p.status === 'active' || p.status === 'scheduled' || p.status === 'frozen' ? p.status : 'active';
      const category =
        p.category === 'cash_now' ||
        p.category === 'scale_asset' ||
        p.category === 'mindset' ||
        p.category === 'reward' ||
        p.category === 'custom'
          ? p.category
          : 'custom';
      return {
        id: safeStr(p.id, `proj-${Date.now()}-${idx}`, 80),
        title: safeStr(p.title, 'Progetto', 160),
        shortDesc: safeStr(p.shortDesc, '', 300),
        category,
        status,
        accentColor: safeStr(p.accentColor ?? p.color, '#FFFFFF', 30),
        progressPercent: milestones.length > 0 ? Math.round((done / milestones.length) * 100) : Math.max(0, Math.min(100, safeNum(p.progressPercent))),
        deadline: typeof p.deadline === 'string' ? safeStr(p.deadline, '', 80) : undefined,
        targetAmount: typeof p.targetAmount === 'string' ? safeStr(p.targetAmount, '', 80) : undefined,
        milestones,
      };
    });
  }

  if (Array.isArray(parsed.habits)) {
    sanitized.habits = parsed.habits.filter(isPlainRecord).map((h, idx) => {
      const category =
        h.category === 'health' || h.category === 'commercial' || h.category === 'tech' || h.category === 'mindset'
          ? h.category
          : 'health';
      return {
        id: safeStr(h.id, `h-${Date.now()}-${idx}`, 80),
        title: safeStr(h.title, 'Abitudine', 160),
        subtitle: safeStr(h.subtitle, '', 240),
        category,
        targetDaysPerWeek: Math.max(1, Math.min(7, safeNum(h.targetDaysPerWeek, 7))),
        completedDates: Array.isArray(h.completedDates)
          ? h.completedDates.filter((d): d is string => typeof d === 'string').slice(0, 2000)
          : [],
        color: safeStr(h.color, '#FFFFFF', 30),
        streak: Math.max(0, safeNum(h.streak, 0)),
      };
    });
  }

  if (Array.isArray(parsed.tasks)) {
    sanitized.tasks = parsed.tasks.filter(isPlainRecord).map((t, idx) => ({
      id: safeStr(t.id, `task-${Date.now()}-${idx}`, 80),
      title: safeStr(t.title, 'Attività', 240),
      projectId: safeStr(t.projectId, 'general', 80),
      isTopPriority: safeBool(t.isTopPriority),
      completed: safeBool(t.completed),
      dueDate: safeStr(t.dueDate, new Date().toISOString().split('T')[0], 30),
      urgent: safeBool(t.urgent),
      important: safeBool(t.important, true),
      estimatedMinutes: typeof t.estimatedMinutes === 'number' && Number.isFinite(t.estimatedMinutes) ? Math.max(1, t.estimatedMinutes) : undefined,
      createdAt: safeStr(t.createdAt, new Date().toISOString(), 40),
    }));
  }

  if (Array.isArray(parsed.rejections)) {
    sanitized.rejections = parsed.rejections.filter(isPlainRecord).map((r, idx) => ({
      id: safeStr(r.id, `rej-${Date.now()}-${idx}`, 80),
      date: safeStr(r.date, new Date().toISOString().split('T')[0], 30),
      businessName: safeStr(r.businessName, 'Approccio', 160),
      location: safeStr(r.location, '', 160),
      fearBefore: Math.max(1, Math.min(10, safeNum(r.fearBefore, 5))),
      feelingAfter: Math.max(1, Math.min(10, safeNum(r.feelingAfter, 3))),
      outcomeNote: safeStr(r.outcomeNote, '', 500),
      lessonLearned: safeStr(r.lessonLearned, '', 500),
    }));
  }

  if (Array.isArray(parsed.journalEntries)) {
    sanitized.journalEntries = parsed.journalEntries.filter(isPlainRecord).map((j, idx) => {
      const mood =
        j.mood === 'great' || j.mood === 'good' || j.mood === 'neutral' || j.mood === 'struggling'
          ? j.mood
          : 'neutral';
      return {
        id: safeStr(j.id, `j-${Date.now()}-${idx}`, 80),
        date: safeStr(j.date, new Date().toISOString().split('T')[0], 30),
        mood,
        facingDiscomfort: safeBool(j.facingDiscomfort),
        avoidedDistractions: safeBool(j.avoidedDistractions),
        dailyWin: safeStr(j.dailyWin, '', 300),
        reflection: safeStr(j.reflection, '', 2000),
      };
    });
  }

  if (Array.isArray(parsed.reminders)) {
    sanitized.reminders = parsed.reminders.filter(isPlainRecord).map((rem, idx) => ({
      id: safeStr(rem.id, `rem-${Date.now()}-${idx}`, 80),
      title: safeStr(rem.title, 'Promemoria', 160),
      time: /^\d{2}:\d{2}$/.test(safeStr(rem.time)) ? safeStr(rem.time, '09:00', 5) : '09:00',
      enabled: safeBool(rem.enabled, true),
      message: safeStr(rem.message, '', 300),
    }));
  }

  if (isPlainRecord(parsed.financialProfile) && typeof parsed.financialProfile.bankBalance === 'number' && Number.isFinite(parsed.financialProfile.bankBalance)) {
    const fp = parsed.financialProfile;
    const validCategories = new Set(['fiscale', 'salute', 'logistica', 'viaggio', 'alloggio', 'vita_quotidiana', 'altro']);
    const expenses = Array.isArray(fp.expenses)
      ? fp.expenses.filter(isPlainRecord).map((e, idx) => ({
          id: safeStr(e.id, `exp-${Date.now()}-${idx}`, 80),
          title: safeStr(e.title, 'Spesa', 160),
          amount: Math.max(0, safeNum(e.amount, 0)),
          dateLabel: safeStr(e.dateLabel, '', 80),
          dueDate: typeof e.dueDate === 'string' ? safeStr(e.dueDate, '', 40) : undefined,
          category: (validCategories.has(safeStr(e.category)) ? safeStr(e.category) : 'altro') as FinancialProfile['expenses'][number]['category'],
          paid: safeBool(e.paid),
          paidDate: typeof e.paidDate === 'string' ? safeStr(e.paidDate, '', 40) : undefined,
          notes: typeof e.notes === 'string' ? safeStr(e.notes, '', 400) : undefined,
        }))
      : [];
    const incomes = Array.isArray(fp.incomes)
      ? fp.incomes.filter(isPlainRecord).map((inc, idx) => ({
          id: safeStr(inc.id, `inc-${Date.now()}-${idx}`, 80),
          title: safeStr(inc.title, 'Entrata', 160),
          amount: Math.max(0, safeNum(inc.amount, 0)),
          dateLabel: safeStr(inc.dateLabel, '', 80),
          expectedDate: typeof inc.expectedDate === 'string' ? safeStr(inc.expectedDate, '', 40) : undefined,
          received: safeBool(inc.received),
          receivedDate: typeof inc.receivedDate === 'string' ? safeStr(inc.receivedDate, '', 40) : undefined,
          notes: typeof inc.notes === 'string' ? safeStr(inc.notes, '', 400) : undefined,
        }))
      : [];

    const ct = isPlainRecord(fp.chinaTrip) ? fp.chinaTrip : {};
    const chinaStatus = ct.status === 'in_valutazione' ? 'in_valutazione' : 'congelato';

    sanitized.financialProfile = {
      bankBalance: Math.max(0, safeNum(fp.bankBalance, 0)),
      lastUpdated: safeStr(fp.lastUpdated, 'Importato', 80),
      expenses,
      incomes,
      chinaTrip: {
        budgetLimit: Math.max(0, safeNum(ct.budgetLimit, 0)),
        durationDays: safeStr(ct.durationDays, '', 60),
        period: safeStr(ct.period, '', 60),
        status: chinaStatus,
        notes: safeStr(ct.notes, '', 400),
      },
    };
  }

  return sanitized;
}
