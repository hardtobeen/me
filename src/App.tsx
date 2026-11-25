/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AppTab,
  ProjectGoal,
  HabitItem,
  TaskItem,
  RejectionRecord,
  JournalEntry,
  ProjectId,
  FinancialProfile,
  ExpenseItem,
  IncomeItem,
} from './types';
import {
  INITIAL_FINANCIAL_PROFILE,
} from './data/initialData';
import { AppleNavBar } from './components/navigation/AppleNavBar';
import { AppleTabBar } from './components/navigation/AppleTabBar';
import { TacticalBackdrop } from './components/common/TacticalBackdrop';
import { TodayView } from './components/views/TodayView';
import { MoneyView } from './components/views/MoneyView';
import { HabitsView } from './components/views/HabitsView';
import { GoalsView } from './components/views/GoalsView';
import { CourageView } from './components/views/CourageView';
import { JournalView } from './components/views/JournalView';
import { SettingsView } from './components/views/SettingsView';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { RejectionLogModal } from './components/modals/RejectionLogModal';
import { NewHabitModal } from './components/modals/NewHabitModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { calculateHabitStreak, calculateDailyFocusProgress } from './utils/lifeOsLogic';
import {
  DEFAULT_REMINDERS,
  ReminderSetting,
  requestNotificationPermission,
  sendPushNotification,
} from './utils/notifications';
import {
  saveToIndexedDB,
  loadFromIndexedDB,
  requestPersistentStorage,
  getStorageStatus,
  exportDataAsJSON,
  parseAndValidateBackup,
  StorageStatus,
  LS_KEYS,
  AppFullState,
} from './utils/persistentStorage';

function safeSetLocalStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore QuotaExceededError / private mode localStorage restrictions; IndexedDB remains authoritative
  }
}

function isV5VirginInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LS_KEYS.VIRGIN_SLATE) === 'true';
  } catch {
    return false;
  }
}

function readCachedArray<T>(key: string): T[] {
  if (!isV5VirginInitialized()) return [];
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('today');
  const [storageStatus, setStorageStatus] = useState<StorageStatus | undefined>(undefined);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectGoal | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [reminders, setReminders] = useState<ReminderSetting[]>(() =>
    readCachedArray<ReminderSetting>(LS_KEYS.REMINDERS)
  );
  const [projects, setProjects] = useState<ProjectGoal[]>(() =>
    readCachedArray<ProjectGoal>(LS_KEYS.PROJECTS)
  );
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    readCachedArray<HabitItem>(LS_KEYS.HABITS)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    readCachedArray<TaskItem>(LS_KEYS.TASKS)
  );
  const [rejections, setRejections] = useState<RejectionRecord[]>(() =>
    readCachedArray<RejectionRecord>(LS_KEYS.REJECTIONS)
  );
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    readCachedArray<JournalEntry>(LS_KEYS.JOURNAL)
  );

  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>(() => {
    if (!isV5VirginInitialized()) return INITIAL_FINANCIAL_PROFILE;
    try {
      const saved = localStorage.getItem(LS_KEYS.FINANCE);
      return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_PROFILE;
    } catch {
      return INITIAL_FINANCIAL_PROFILE;
    }
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#07090B';
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#07090B';
    document.body.style.color = '#F5F7FA';
  }, []);

  const isHydratedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const latestStateRef = useRef({
    projects,
    habits,
    tasks,
    rejections,
    journalEntries,
    reminders,
    financialProfile,
  });

  latestStateRef.current = {
    projects,
    habits,
    tasks,
    rejections,
    journalEntries,
    reminders,
    financialProfile,
  };

  useEffect(() => {
    async function initStorageVault() {
      try {
        await requestPersistentStorage();
        const status = await getStorageStatus();
        setStorageStatus(status);

        // Always inspect IndexedDB FIRST so cleared localStorage never wipes persisted IndexedDB data
        const idbState = await loadFromIndexedDB();
        const isV5Virgin = isV5VirginInitialized();

        if (idbState) {
          if (Array.isArray(idbState.projects)) {
            setProjects(idbState.projects);
            safeSetLocalStorage(LS_KEYS.PROJECTS, JSON.stringify(idbState.projects));
          }
          if (Array.isArray(idbState.habits)) {
            setHabits(idbState.habits);
            safeSetLocalStorage(LS_KEYS.HABITS, JSON.stringify(idbState.habits));
          }
          if (Array.isArray(idbState.tasks)) {
            setTasks(idbState.tasks);
            safeSetLocalStorage(LS_KEYS.TASKS, JSON.stringify(idbState.tasks));
          }
          if (Array.isArray(idbState.rejections)) {
            setRejections(idbState.rejections);
            safeSetLocalStorage(LS_KEYS.REJECTIONS, JSON.stringify(idbState.rejections));
          }
          if (Array.isArray(idbState.journalEntries)) {
            setJournalEntries(idbState.journalEntries);
            safeSetLocalStorage(LS_KEYS.JOURNAL, JSON.stringify(idbState.journalEntries));
          }
          if (Array.isArray(idbState.reminders)) {
            setReminders(idbState.reminders);
            safeSetLocalStorage(LS_KEYS.REMINDERS, JSON.stringify(idbState.reminders));
          }
          if (idbState.financialProfile && typeof idbState.financialProfile.bankBalance === 'number') {
            setFinancialProfile(idbState.financialProfile);
            safeSetLocalStorage(LS_KEYS.FINANCE, JSON.stringify(idbState.financialProfile));
          }
          safeSetLocalStorage(LS_KEYS.VIRGIN_SLATE, 'true');
        } else if (!isV5Virgin) {
          try {
            localStorage.clear();
          } catch {
            // Ignore private mode restrictions
          }
          safeSetLocalStorage(LS_KEYS.PROJECTS, JSON.stringify([]));
          safeSetLocalStorage(LS_KEYS.HABITS, JSON.stringify([]));
          safeSetLocalStorage(LS_KEYS.TASKS, JSON.stringify([]));
          safeSetLocalStorage(LS_KEYS.REJECTIONS, JSON.stringify([]));
          safeSetLocalStorage(LS_KEYS.JOURNAL, JSON.stringify([]));
          safeSetLocalStorage(LS_KEYS.REMINDERS, JSON.stringify(DEFAULT_REMINDERS));
          safeSetLocalStorage(LS_KEYS.FINANCE, JSON.stringify(INITIAL_FINANCIAL_PROFILE));
          safeSetLocalStorage(LS_KEYS.VIRGIN_SLATE, 'true');

          setProjects([]);
          setHabits([]);
          setTasks([]);
          setRejections([]);
          setJournalEntries([]);
          setReminders(DEFAULT_REMINDERS);
          setFinancialProfile(INITIAL_FINANCIAL_PROFILE);

          const nowStr = new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(new Date());

          await saveToIndexedDB({
            projects: [],
            habits: [],
            tasks: [],
            rejections: [],
            journalEntries: [],
            reminders: DEFAULT_REMINDERS,
            financialProfile: INITIAL_FINANCIAL_PROFILE,
            lastSavedAt: `Oggi alle ${nowStr}`,
            version: '5.0',
          });
        }
      } catch (err) {
        console.warn('Storage init failed:', err);
      } finally {
        isHydratedRef.current = true;
      }
    }
    initStorageVault();
  }, []);

  useEffect(() => {
    if (!isHydratedRef.current) return;

    safeSetLocalStorage(LS_KEYS.PROJECTS, JSON.stringify(projects));
    safeSetLocalStorage(LS_KEYS.HABITS, JSON.stringify(habits));
    safeSetLocalStorage(LS_KEYS.TASKS, JSON.stringify(tasks));
    safeSetLocalStorage(LS_KEYS.REJECTIONS, JSON.stringify(rejections));
    safeSetLocalStorage(LS_KEYS.JOURNAL, JSON.stringify(journalEntries));
    safeSetLocalStorage(LS_KEYS.REMINDERS, JSON.stringify(reminders));
    safeSetLocalStorage(LS_KEYS.FINANCE, JSON.stringify(financialProfile));

    const nowStr = new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
    safeSetLocalStorage(LS_KEYS.LAST_SAVED, `Oggi alle ${nowStr}`);

    const fullRecord: AppFullState = {
      projects,
      habits,
      tasks,
      rejections,
      journalEntries,
      reminders,
      financialProfile,
      lastSavedAt: `Oggi alle ${nowStr}`,
      version: '5.0',
    };

    saveToIndexedDB(fullRecord);

    setStorageStatus((prev) =>
      prev
        ? { ...prev, lastSavedAt: `Oggi alle ${nowStr}` }
        : {
            isPersistent: true,
            persistenceSupported: true,
            indexedDBAvailable: true,
            quotaUsedBytes: 0,
            quotaTotalBytes: 0,
            lastSavedAt: `Oggi alle ${nowStr}`,
          }
    );
  }, [projects, habits, tasks, rejections, journalEntries, reminders, financialProfile]);

  useEffect(() => {
    const handleEmergencySave = () => {
      if (!isHydratedRef.current) return;
      const nowStr = new Intl.DateTimeFormat('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date());

      saveToIndexedDB({
        ...latestStateRef.current,
        lastSavedAt: `Oggi alle ${nowStr}`,
        version: '5.0',
      });
    };

    window.addEventListener('visibilitychange', handleEmergencySave);
    window.addEventListener('pagehide', handleEmergencySave);
    window.addEventListener('beforeunload', handleEmergencySave);

    return () => {
      window.removeEventListener('visibilitychange', handleEmergencySave);
      window.removeEventListener('pagehide', handleEmergencySave);
      window.removeEventListener('beforeunload', handleEmergencySave);
    };
  }, []);

  // Lightweight local reminder scheduler (checks every 30s, zero external network usage)
  const firedRemindersRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const rem of latestStateRef.current.reminders) {
        if (!rem.enabled || rem.time !== hhmm) continue;
        const fireKey = `${dateStr}:${rem.id}:${hhmm}`;
        if (!firedRemindersRef.current.has(fireKey)) {
          firedRemindersRef.current.add(fireKey);
          if (firedRemindersRef.current.size > 200) {
            firedRemindersRef.current.clear();
            firedRemindersRef.current.add(fireKey);
          }
          sendPushNotification(`LockedIn — ${rem.title}`, rem.message);
        }
      }
    };

    checkReminders();
    const timerId = window.setInterval(checkReminders, 30000);
    return () => window.clearInterval(timerId);
  }, []);

  const playTactileFeedback = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  const handleRequestNotificationPermission = async () => {
    playTactileFeedback();
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      sendPushNotification(
        'LockedIn — Notifiche Attivate',
        'Riceverai i promemoria configurati.'
      );
    }
  };

  const handleSendTestNotification = () => {
    playTactileFeedback();
    sendPushNotification('LockedIn — Promemoria', 'Notifica di prova attiva.');
  };

  const handleToggleReminder = (reminderId: string) => {
    playTactileFeedback();
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleAddReminder = (reminder: Omit<ReminderSetting, 'id'>) => {
    playTactileFeedback();
    setReminders((prev) => [{ ...reminder, id: `rem-${Date.now()}` }, ...prev]);
  };

  const handleDeleteReminder = (reminderId: string) => {
    playTactileFeedback();
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const handleToggleTask = (taskId: string) => {
    playTactileFeedback();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (
    title: string,
    projectId: ProjectId,
    isTopPriority: boolean,
    urgent = false,
    important = true,
    estimatedMinutes?: number
  ) => {
    playTactileFeedback();
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      projectId,
      isTopPriority,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      urgent,
      important,
      estimatedMinutes,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleHabitDay = (habitId: string, dateStr: string) => {
    playTactileFeedback();
    const todayStr = new Date().toISOString().split('T')[0];

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateStr);
        const updatedDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];

        const updatedStreak = calculateHabitStreak(updatedDates, todayStr);
        return {
          ...h,
          completedDates: updatedDates,
          streak: updatedStreak,
        };
      })
    );
  };

  const handleCreateHabit = (habitData: Omit<HabitItem, 'id' | 'completedDates' | 'streak'>) => {
    playTactileFeedback();
    const newHabit: HabitItem = {
      ...habitData,
      id: `h-${Date.now()}`,
      completedDates: [],
      streak: 0,
    };
    setHabits((prev) => [newHabit, ...prev]);
  };

  const handleDeleteHabit = (habitId: string) => {
    playTactileFeedback();
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const handleCreateOrUpdateProject = (
    projectData: Omit<ProjectGoal, 'id' | 'progressPercent'> & { id?: string }
  ) => {
    playTactileFeedback();
    const existingIndex = projects.findIndex((p) => p.id === projectData.id);

    if (existingIndex >= 0) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectData.id) return p;
          const completedCount = projectData.milestones.filter((m) => m.completed).length;
          const progress =
            projectData.milestones.length > 0
              ? Math.round((completedCount / projectData.milestones.length) * 100)
              : 0;
          return {
            ...p,
            ...projectData,
            id: p.id,
            progressPercent: progress,
          };
        })
      );
    } else {
      const newId = projectData.id || `proj-${Date.now()}`;
      const completedCount = projectData.milestones.filter((m) => m.completed).length;
      const progress =
        projectData.milestones.length > 0
          ? Math.round((completedCount / projectData.milestones.length) * 100)
          : 0;

      const newProj: ProjectGoal = {
        ...projectData,
        id: newId,
        progressPercent: progress,
      };
      setProjects((prev) => [...prev, newProj]);
    }

    setEditingProject(null);
    setIsNewProjectModalOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    playTactileFeedback();
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleAddMilestone = (projectId: string, title: string) => {
    playTactileFeedback();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedMilestones = [
          ...p.milestones,
          { id: `ms-${Date.now()}`, title, completed: false },
        ];
        const done = updatedMilestones.filter((m) => m.completed).length;
        const progress = Math.round((done / updatedMilestones.length) * 100);
        return {
          ...p,
          milestones: updatedMilestones,
          progressPercent: progress,
        };
      })
    );
  };

  const handleDeleteMilestone = (projectId: string, milestoneId: string) => {
    playTactileFeedback();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedMilestones = p.milestones.filter((m) => m.id !== milestoneId);
        const done = updatedMilestones.filter((m) => m.completed).length;
        const progress =
          updatedMilestones.length > 0
            ? Math.round((done / updatedMilestones.length) * 100)
            : 0;
        return {
          ...p,
          milestones: updatedMilestones,
          progressPercent: progress,
        };
      })
    );
  };

  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    playTactileFeedback();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const done = updatedMilestones.filter((m) => m.completed).length;
        const progress =
          updatedMilestones.length > 0
            ? Math.round((done / updatedMilestones.length) * 100)
            : 0;
        return {
          ...p,
          milestones: updatedMilestones,
          progressPercent: progress,
        };
      })
    );
  };

  const handleSaveRejection = (record: Omit<RejectionRecord, 'id' | 'date'>) => {
    playTactileFeedback();
    const newRecord: RejectionRecord = {
      ...record,
      id: `rej-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setRejections((prev) => [newRecord, ...prev]);
  };

  const handleSaveJournal = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    playTactileFeedback();
    const newEntry: JournalEntry = {
      ...entry,
      id: `j-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  const handleUpdateBalance = (newBalance: number) => {
    playTactileFeedback();
    setFinancialProfile((prev) => ({
      ...prev,
      bankBalance: newBalance,
      lastUpdated: new Intl.DateTimeFormat('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    }));
  };

  const handleToggleExpensePaid = (expenseId: string, markPaid: boolean) => {
    playTactileFeedback();
    setFinancialProfile((prev) => {
      const exp = prev.expenses.find((e) => e.id === expenseId);
      if (!exp) return prev;

      const updatedBalance = markPaid
        ? Math.max(0, prev.bankBalance - exp.amount)
        : prev.bankBalance + exp.amount;

      return {
        ...prev,
        bankBalance: updatedBalance,
        expenses: prev.expenses.map((e) =>
          e.id === expenseId
            ? {
                ...e,
                paid: markPaid,
                paidDate: markPaid ? new Date().toISOString() : undefined,
              }
            : e
        ),
      };
    });
  };

  const handleAddExpense = (expenseData: Omit<ExpenseItem, 'id'>) => {
    playTactileFeedback();
    const newExp: ExpenseItem = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setFinancialProfile((prev) => ({
      ...prev,
      expenses: [newExp, ...prev.expenses],
    }));
  };

  const handleDeleteExpense = (expenseId: string) => {
    playTactileFeedback();
    setFinancialProfile((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }));
  };

  const handleToggleIncomeReceived = (incomeId: string, markReceived: boolean) => {
    playTactileFeedback();
    setFinancialProfile((prev) => {
      const inc = prev.incomes.find((i) => i.id === incomeId);
      if (!inc) return prev;

      const updatedBalance = markReceived
        ? prev.bankBalance + inc.amount
        : Math.max(0, prev.bankBalance - inc.amount);

      return {
        ...prev,
        bankBalance: updatedBalance,
        incomes: prev.incomes.map((i) =>
          i.id === incomeId
            ? {
                ...i,
                received: markReceived,
                receivedDate: markReceived ? new Date().toISOString() : undefined,
              }
            : i
        ),
      };
    });
  };

  const handleAddIncome = (incomeData: Omit<IncomeItem, 'id'>) => {
    playTactileFeedback();
    const newInc: IncomeItem = {
      ...incomeData,
      id: `inc-${Date.now()}`,
    };
    setFinancialProfile((prev) => ({
      ...prev,
      incomes: [newInc, ...prev.incomes],
    }));
  };

  const handleExportData = () => {
    playTactileFeedback();
    const nowStr = new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());

    exportDataAsJSON({
      projects,
      habits,
      tasks,
      rejections,
      journalEntries,
      reminders,
      financialProfile,
      lastSavedAt: `Oggi alle ${nowStr}`,
      version: '5.0',
    });

    setStatusFeedback('Backup completo generato e salvato nei download.');
    setTimeout(() => setStatusFeedback(null), 5000);
  };

  const handleResetData = () => {
    playTactileFeedback();
    setProjects([]);
    setHabits([]);
    setTasks([]);
    setRejections([]);
    setJournalEntries([]);
    setReminders(DEFAULT_REMINDERS);
    setFinancialProfile(INITIAL_FINANCIAL_PROFILE);

    try {
      localStorage.clear();
    } catch {
      // Ignore private mode restrictions
    }
    safeSetLocalStorage(LS_KEYS.VIRGIN_SLATE, 'true');

    const nowStr = new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());

    saveToIndexedDB({
      projects: [],
      habits: [],
      tasks: [],
      rejections: [],
      journalEntries: [],
      reminders: DEFAULT_REMINDERS,
      financialProfile: INITIAL_FINANCIAL_PROFILE,
      lastSavedAt: `Oggi alle ${nowStr}`,
      version: '5.0',
    });

    setStatusFeedback('App ripristinata allo stato vergine (tutti i dati azzerati).');
    setTimeout(() => setStatusFeedback(null), 5000);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatusFeedback('File di backup troppo grande (limite massimo 10 MB).');
      setTimeout(() => setStatusFeedback(null), 5000);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseAndValidateBackup(text);

        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.habits) setHabits(parsed.habits);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.rejections) setRejections(parsed.rejections);
        if (parsed.journalEntries) setJournalEntries(parsed.journalEntries);
        if (parsed.reminders) setReminders(parsed.reminders);
        if (parsed.financialProfile) setFinancialProfile(parsed.financialProfile);

        const nowStr = new Intl.DateTimeFormat('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date());

        saveToIndexedDB({
          projects: parsed.projects || projects,
          habits: parsed.habits || habits,
          tasks: parsed.tasks || tasks,
          rejections: parsed.rejections || rejections,
          journalEntries: parsed.journalEntries || journalEntries,
          reminders: parsed.reminders || reminders,
          financialProfile: parsed.financialProfile || financialProfile,
          lastSavedAt: `Oggi alle ${nowStr}`,
          version: '5.0',
        });

        setStatusFeedback('Backup importato e salvato nella memoria permanente.');
        setTimeout(() => setStatusFeedback(null), 5000);
      } catch (err) {
        console.error('Import error:', err);
        setStatusFeedback('Errore nella lettura del file JSON di backup.');
        setTimeout(() => setStatusFeedback(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const habitsDone = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const habitsLeftCount = habits.length - habitsDone;
  const tasksDone = tasks.filter((t) => t.completed).length;
  const unpaidExpensesCount = financialProfile.expenses.filter((e) => !e.paid).length;
  const focusProgress = calculateDailyFocusProgress(
    habitsDone,
    habits.length,
    tasksDone,
    tasks.length,
    rejections.length,
    10
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#07090B] text-white flex flex-col antialiased">
      {/* Atmospheric Topographic & Radar Coordinate Backdrop */}
      <TacticalBackdrop />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 w-full">
        <AppleNavBar
          currentTab={currentTab}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onSelectTab={setCurrentTab}
          summaryMetrics={{
            balance: financialProfile.bankBalance,
            focusPct: focusProgress.overallScore,
            activeFronts: projects.filter((p) => p.status === 'active').length,
          }}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 pb-28 min-w-0">
          {currentTab === 'today' && (
            <TodayView
              tasks={tasks}
              habits={habits}
              rejections={rejections}
              projects={projects}
              financialProfile={financialProfile}
              onToggleTask={handleToggleTask}
              onAddTask={(title, projectId, isTop) => handleAddTask(title, projectId, isTop)}
              onOpenCourageTab={() => setCurrentTab('courage')}
              onOpenGoalsTab={() => setCurrentTab('goals')}
              onOpenMoneyTab={() => setCurrentTab('money')}
              onOpenHabitsTab={() => setCurrentTab('habits')}
            />
          )}

          {currentTab === 'money' && (
            <MoneyView
              financialProfile={financialProfile}
              onUpdateBalance={handleUpdateBalance}
              onToggleExpensePaid={handleToggleExpensePaid}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onToggleIncomeReceived={handleToggleIncomeReceived}
              onAddIncome={handleAddIncome}
            />
          )}

          {currentTab === 'habits' && (
            <HabitsView
              habits={habits}
              onToggleHabitDay={handleToggleHabitDay}
              onOpenNewHabitModal={() => setIsHabitModalOpen(true)}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsView
              projects={projects}
              tasks={tasks}
              onToggleMilestone={handleToggleMilestone}
              onAddMilestone={handleAddMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onDeleteProject={handleDeleteProject}
              onEditProject={(p) => {
                setEditingProject(p);
                setIsNewProjectModalOpen(true);
              }}
              onOpenNewProjectModal={() => {
                setEditingProject(null);
                setIsNewProjectModalOpen(true);
              }}
              onToggleTask={handleToggleTask}
            />
          )}

          {currentTab === 'courage' && (
            <CourageView
              rejections={rejections}
              onOpenLogModal={() => setIsRejectionModalOpen(true)}
            />
          )}

          {currentTab === 'journal' && (
            <JournalView
              entries={journalEntries}
              onSaveEntry={handleSaveJournal}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              onExportData={handleExportData}
              onResetData={handleResetData}
              onImportData={handleImportData}
              notificationPermission={notificationPermission}
              onRequestNotificationPermission={handleRequestNotificationPermission}
              onSendTestNotification={handleSendTestNotification}
              reminders={reminders}
              onToggleReminder={handleToggleReminder}
              onAddReminder={handleAddReminder}
              onDeleteReminder={handleDeleteReminder}
              storageStatus={storageStatus}
              onRequestPersistStorage={async () => {
                await requestPersistentStorage();
                const status = await getStorageStatus();
                setStorageStatus(status);
              }}
              statusFeedback={statusFeedback}
            />
          )}
        </main>
      </div>

      {/* Unified Icon-Only Floating HUD Bottom Dock */}
      <AppleTabBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingTasksCount={pendingTasksCount}
        habitsLeftCount={habitsLeftCount}
        unpaidExpensesCount={unpaidExpensesCount}
      />

      {/* Action Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        projects={projects}
        onAddTask={(title, projectId, isTop, urgent, important, estimatedMinutes) =>
          handleAddTask(title, projectId, isTop, urgent, important, estimatedMinutes)
        }
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => {
          setIsNewProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleCreateOrUpdateProject}
        initialProject={editingProject}
      />

      <RejectionLogModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onSave={handleSaveRejection}
      />

      <NewHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleCreateHabit}
      />
    </div>
  );
}
