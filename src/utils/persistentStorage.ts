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
      console.log(`[LockedIn Vault] Storage Persistente attivo: ${isPersisted}`);
      return isPersisted;
    } catch (e) {
      console.warn('[LockedIn Vault] Richiesta persistenza fallita:', e);
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
    } catch (e) {
      console.warn('[LockedIn Vault] Errore stima storage:', e);
    }
  }

  const lastSavedAt =
    (typeof window !== 'undefined' && localStorage.getItem(LS_KEYS.LAST_SAVED)) ||
    new Date().toLocaleTimeString('it-IT');

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
    appName: 'LockedIn — Apple HIG Personal Life & Focus OS',
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
  URL.revokeObjectURL(url);
}

/**
 * Validate and sanitize imported backup data
 */
export function parseAndValidateBackup(jsonText: string): Partial<AppFullState> {
  const parsed = JSON.parse(jsonText);

  const sanitized: Partial<AppFullState> = {};

  if (Array.isArray(parsed.projects)) {
    sanitized.projects = parsed.projects;
  }
  if (Array.isArray(parsed.habits)) {
    sanitized.habits = parsed.habits;
  }
  if (Array.isArray(parsed.tasks)) {
    sanitized.tasks = parsed.tasks;
  }
  if (Array.isArray(parsed.rejections)) {
    sanitized.rejections = parsed.rejections;
  }
  if (Array.isArray(parsed.journalEntries)) {
    sanitized.journalEntries = parsed.journalEntries;
  }
  if (Array.isArray(parsed.reminders)) {
    sanitized.reminders = parsed.reminders;
  }
  if (parsed.financialProfile && typeof parsed.financialProfile.bankBalance === 'number') {
    sanitized.financialProfile = parsed.financialProfile;
  }

  return sanitized;
}
