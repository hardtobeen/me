/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { TaskItem, HabitItem, RejectionRecord, FinancialProfile, ProjectGoal } from '../../types';
import { AppleTripleActivityRings } from '../common/AppleActivityRing';
import { HudSectionHeader } from '../common/HudSectionHeader';
import { calculateDailyFocusProgress, generateDailyActionableInsight } from '../../utils/lifeOsLogic';

interface TodayViewProps {
  tasks: TaskItem[];
  habits: HabitItem[];
  rejections: RejectionRecord[];
  projects?: ProjectGoal[];
  financialProfile?: FinancialProfile;
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, projectId: string, isTop: boolean) => void;
  onOpenCourageTab: () => void;
  onOpenGoalsTab: () => void;
  onOpenMoneyTab?: () => void;
  onOpenHabitsTab?: () => void;
}

export function TodayView({
  tasks,
  habits,
  rejections,
  projects = [],
  financialProfile,
  onToggleTask,
  onAddTask,
  onOpenCourageTab,
  onOpenGoalsTab,
  onOpenMoneyTab,
  onOpenHabitsTab,
}: TodayViewProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickProject, setQuickProject] = useState<string>(
    projects.length > 0 ? projects[0].id : ''
  );
  const [isTopPriority, setIsTopPriority] = useState(false);
  const [isInsightExpanded, setIsInsightExpanded] = useState(true);

  React.useEffect(() => {
    if (projects.length > 0 && !quickProject) {
      setQuickProject(projects[0].id);
    }
  }, [projects, quickProject]);

  const todayStr = new Date().toISOString().split('T')[0];

  const habitsDone = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const tasksDone = tasks.filter((t) => t.completed).length;
  const rejectionsCount = rejections.length;

  const ringsProgress = calculateDailyFocusProgress(
    habitsDone,
    habits.length,
    tasksDone,
    tasks.length,
    rejectionsCount,
    10
  );

  const activeFrontsCount = projects.filter((p) => p.status === 'active').length;

  const dailyInsight = generateDailyActionableInsight({
    activeFrontsCount: activeFrontsCount > 0 ? activeFrontsCount : 1,
    tasksDueTodayCount: tasks.filter((t) => !t.completed).length,
    rejectionsThisWeek: rejectionsCount,
    uncomfortableActionDone: rejectionsCount > 0,
    hoursUntilEvening: 6,
  });

  const topPriorityTasks = tasks.filter((t) => t.isTopPriority);
  const otherTasks = tasks.filter((t) => !t.isTopPriority);
  const pendingTasks = tasks.filter((t) => !t.completed);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onAddTask(
      quickTitle.trim(),
      quickProject || (projects.length > 0 ? projects[0].id : 'general'),
      isTopPriority
    );
    setQuickTitle('');
    setIsTopPriority(false);
  };

  const getProjectInfo = (projId: string) => {
    const found = projects.find((p) => p.id === projId);
    return found ? found.title : 'Generale';
  };

  const unpaidExpenses = financialProfile?.expenses.filter((e) => !e.paid) || [];
  const unpaidExpensesCount = unpaidExpenses.length;
  const totalUnpaid = unpaidExpenses.reduce((s, e) => s + e.amount, 0);
  const bankBalance = financialProfile?.bankBalance || 0;
  const disposable = bankBalance - totalUnpaid;

  // Build real 7-day habit completion series for the stepped sparkline
  const weekSeries = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dStr = d.toISOString().split('T')[0];
    const label = new Intl.DateTimeFormat('it-IT', { weekday: 'short' })
      .format(d)
      .slice(0, 3)
      .toUpperCase();
    if (habits.length === 0) {
      return { label, pct: 0 };
    }
    const doneCount = habits.filter((h) => h.completedDates.includes(dStr)).length;
    return {
      label,
      pct: Math.round((doneCount / habits.length) * 100),
    };
  });

  const hasAlerts = pendingTasks.length > 0 || unpaidExpensesCount > 0;

  return (
    <div className="space-y-5 pb-8">
      {/* TOP HUD SPLIT: Left Telemetry Focus & Stepped Chart + Right Collapsible Status/Warning Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT PANEL (7 cols): Focus Telemetry & 7-Day Stepped Graph */}
        <section className="lg:col-span-7 hud-glass rounded-[18px] p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] font-medium text-[#E2E6EC] tracking-tight">
              Focus Quotidiano & Ritmo
            </span>
            <button
              type="button"
              onClick={onOpenGoalsTab}
              aria-label="Apri obiettivi e fronti"
              className="w-7 h-7 rounded-[6px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8A929A] hover:text-white hover:border-white/20 transition-colors apple-tap"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Big Split-Contrast Numeric Readout + Concentric Radar Ring */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[48px] sm:text-[56px] font-light tracking-[-0.03em] text-white leading-none tabular-nums">
                  {ringsProgress.overallScore}
                </span>
                <span className="text-[28px] sm:text-[32px] font-light text-[#6E7681] leading-none tabular-nums">
                  %
                </span>
                <span className="font-mono text-[11px] text-[#7A828C] ml-1.5 uppercase tracking-wider">
                  oggi
                </span>
              </div>
              <p className="text-[12px] text-[#8A929A] mt-2">
                {tasks.length === 0 && habits.length === 0
                  ? 'Nessun dato ancora inserito per oggi.'
                  : `${tasksDone} di ${tasks.length} attività completate · ${habitsDone} di ${habits.length} abitudini`}
              </p>
            </div>

            <div className="shrink-0">
              <AppleTripleActivityRings
                ring1={{ pct: ringsProgress.habitsPct, color: '#FFFFFF', label: 'Abitudini' }}
                ring2={{ pct: ringsProgress.tasksPct, color: '#9EA7B0', label: 'Priorità' }}
                ring3={{ pct: ringsProgress.couragePct, color: '#E5943C', label: 'Coraggio' }}
                size={98}
              />
            </div>
          </div>

          {/* Stepped Line Telemetry Graph (7-Day Consistency) */}
          <div className="pt-1">
            <div className="relative h-28 sm:h-24 w-full flex items-end gap-1.5">
              {/* Background vertical band columns + stepped percentage bars */}
              <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-1.5 h-full items-end">
                {weekSeries.map((day, idx) => {
                  const isLast = idx === weekSeries.length - 1;
                  const barHeight = Math.max(4, day.pct);
                  return (
                    <div
                      key={day.label + idx}
                      className="h-full flex flex-col justify-end rounded-[4px] bg-white/[0.025] border border-white/[0.04] px-1 sm:px-1.5 py-1.5 relative overflow-hidden"
                    >
                      {/* Stepped level bar */}
                      <div className="w-full flex flex-col justify-end flex-1">
                        <div
                          className={`w-full transition-all duration-500 border-t-2 ${
                            day.pct >= 70
                              ? 'border-white bg-white/[0.09]'
                              : day.pct > 0
                              ? 'border-[#E5943C] bg-[#E5943C]/10'
                              : isLast
                              ? 'border-white/40 bg-transparent'
                              : 'border-white/15 bg-transparent'
                          }`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-0.5 mt-1.5">
                        <span className="font-mono text-[9px] text-[#7A828C] tracking-wider leading-none">
                          {day.label}
                        </span>
                        <span className="font-mono text-[9px] text-[#9EA7B0] tabular-nums leading-none">
                          {day.pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right scale ticks */}
              <div className="hidden sm:flex flex-col justify-between h-full py-1 pl-2 font-mono text-[9px] text-[#5E6670] tabular-nums shrink-0">
                <span>100%</span>
                <span>50%</span>
                <span>0%</span>
              </div>
            </div>
          </div>

          {/* 3-Column Numbered Tactical Telemetry Strip */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenHabitsTab}
              className="hud-cell rounded-[10px] p-3 text-left hover:border-white/20 transition-colors apple-tap"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-[#6E7681]">01</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#8A929A]">
                Abitudini
              </span>
              <span className="font-mono text-[15px] font-semibold text-white tabular-nums">
                {habitsDone}/{habits.length}
              </span>
            </button>

            <div className="hud-cell rounded-[10px] p-3 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-[#6E7681]">02</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#9EA7B0]" />
              </div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#8A929A]">
                Priorità
              </span>
              <span className="font-mono text-[15px] font-semibold text-white tabular-nums">
                {tasksDone}/{tasks.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenCourageTab}
              className="hud-cell rounded-[10px] p-3 text-left hover:border-white/20 transition-colors apple-tap"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-[#6E7681]">03</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5943C]" />
              </div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#8A929A]">
                Coraggio
              </span>
              <span className="font-mono text-[15px] font-semibold text-white tabular-nums">
                {rejectionsCount}/10
              </span>
            </button>
          </div>
        </section>

        {/* RIGHT PANEL (5 cols): Collapsible Alert / Insight Panel */}
        <aside className="lg:col-span-5 hud-glass rounded-[18px] p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Collapsible Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-white tracking-tight">
                  Stato & Avvisi
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsInsightExpanded((v) => !v)}
                aria-label={isInsightExpanded ? 'Comprimi pannello stato' : 'Espandi pannello stato'}
                className="w-7 h-7 rounded-[6px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8A929A] hover:text-white transition-colors apple-tap"
              >
                {isInsightExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isInsightExpanded && (
              <>
                {/* Sub-section 1: Active Operational Fronts / Insight */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[12px] text-[#9EA7B0]">
                    <AlertCircle className="w-3.5 h-3.5 text-[#8A929A]" />
                    <span className="font-medium text-[#E2E6EC]">Situazione Operativa</span>
                    <span className="font-mono text-[11px] text-[#6E7681]">
                      ({activeFrontsCount} {activeFrontsCount === 1 ? 'fronte' : 'fronti'})
                    </span>
                  </div>

                  <div
                    className={`rounded-[14px] p-4 space-y-3 ${
                      hasAlerts ? 'hud-glass-alert' : 'hud-cell'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            pendingTasks.length > 0
                              ? 'bg-[#E03E36] text-white'
                              : 'bg-white/10 text-[#9EA7B0]'
                          }`}
                        >
                          {pendingTasks.length}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-white leading-tight">
                            {dailyInsight.title}
                          </p>
                          <span className="font-mono text-[10px] text-[#7A828C]">
                            {pendingTasks.length} attività aperte oggi
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vertical Hairline Connector Detail Block */}
                    <div className="pl-2 space-y-2">
                      <div className="border-l border-white/20 pl-3 py-0.5">
                        <p className="text-[12px] font-medium text-[#E2E6EC]">
                          {topPriorityTasks.length > 0
                            ? topPriorityTasks[0].title
                            : 'Nessuna priorità impostata'}
                        </p>
                        <span className="text-[11px] text-[#7A828C]">
                          {topPriorityTasks.length > 0
                            ? `Fronte: ${getProjectInfo(topPriorityTasks[0].projectId)}`
                            : 'Aggiungi una priorità per bloccare il focus'}
                        </span>
                      </div>

                      {unpaidExpensesCount > 0 && (
                        <div className="border-l border-[#E5943C]/60 pl-3 py-0.5">
                          <p className="text-[12px] font-medium text-[#E2E6EC]">
                            {unpaidExpensesCount} {unpaidExpensesCount === 1 ? 'spesa da saldare' : 'spese da saldare'}
                          </p>
                          <span className="font-mono text-[11px] text-[#E5943C] tabular-nums">
                            −{totalUnpaid.toLocaleString('it-IT')} € previsti
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Recommendation Footer */}
                    <div className="pt-2 border-t border-white/[0.08] flex items-start gap-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4D8DD] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#9EA7B0] block">
                          Consigliato
                        </span>
                        <p className="text-[12px] text-[#8A929A] leading-snug">
                          {dailyInsight.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-section 2: Cashflow Glance Row */}
                {financialProfile && onOpenMoneyTab && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[12px] text-[#9EA7B0]">
                      <Clock className="w-3.5 h-3.5 text-[#8A929A]" />
                      <span className="font-medium text-[#E2E6EC]">Bilancio Conto</span>
                      <span className="font-mono text-[11px] text-[#6E7681]">
                        ({financialProfile.lastUpdated})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenMoneyTab}
                      className="w-full text-left hud-cell rounded-[12px] px-3.5 py-3 flex items-center justify-between gap-3 hover:border-white/20 transition-colors apple-tap"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            unpaidExpensesCount > 0
                              ? 'bg-[#E03E36] text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {unpaidExpensesCount}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-white truncate tabular-nums">
                            Saldo: {bankBalance.toLocaleString('it-IT')} €
                          </p>
                          <p className="font-mono text-[10px] text-[#7A828C] truncate tabular-nums">
                            Residuo netto: {disposable.toLocaleString('it-IT')} €
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#7A828C] shrink-0" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* BOTTOM DUAL COMMAND PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANEL (7 cols): Priorità & Attività */}
        <section className="lg:col-span-7 hud-glass rounded-[18px] p-5 sm:p-6 space-y-4">
          <HudSectionHeader
            code="01"
            label="Priorità & Attività"
            rightText={`${tasksDone}/${tasks.length} completate`}
          />

          {/* Top 3 Priority List */}
          {topPriorityTasks.length === 0 && otherTasks.length === 0 ? (
            <div className="hud-cell rounded-[14px] p-6 text-center space-y-1.5">
              <p className="text-[14px] font-medium text-white">
                Nessuna attività inserita per oggi
              </p>
              <p className="text-[12px] text-[#7A828C]">
                Usa la barra qui sotto o il pulsante "+ Nuovo" per aggiungere una priorità.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] border border-white/[0.07] rounded-[14px] bg-white/[0.015] overflow-hidden">
              {topPriorityTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    task.completed ? 'opacity-45' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label={task.completed ? `Segna ${task.title} come non completato` : `Completa ${task.title}`}
                    className="min-h-[40px] min-w-[40px] -ml-1.5 flex items-center justify-center text-[#7A828C] hover:text-white apple-tap"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#484F58]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#8A929A] mb-0.5">
                      <span className="text-white font-semibold">TOP 0{idx + 1}</span>
                      <span>·</span>
                      <span className="truncate">{getProjectInfo(task.projectId)}</span>
                      {task.estimatedMinutes && (
                        <>
                          <span>·</span>
                          <span>{task.estimatedMinutes}m</span>
                        </>
                      )}
                    </div>
                    <p
                      className={`text-[14px] font-medium leading-snug ${
                        task.completed ? 'line-through text-[#6E7681]' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>
                </div>
              ))}

              {otherTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    task.completed ? 'opacity-45' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label={task.completed ? `Segna ${task.title} come non completato` : `Completa ${task.title}`}
                    className="min-h-[40px] min-w-[40px] -ml-1.5 flex items-center justify-center text-[#7A828C] hover:text-white apple-tap"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#484F58]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-medium leading-snug ${
                        task.completed ? 'line-through text-[#6E7681]' : 'text-[#E2E6EC]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <span className="font-mono text-[10px] text-[#6E7681]">
                      {getProjectInfo(task.projectId)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline Tactical Command Input */}
          <form
            onSubmit={handleQuickSubmit}
            className="hud-cell rounded-[12px] p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Aggiungi una nuova attività per oggi..."
              aria-label="Nuova attività"
              className="flex-1 px-2.5 py-2 text-[13px] bg-transparent text-white placeholder-[#525860] focus:outline-none min-h-[40px]"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={quickProject}
                onChange={(e) => setQuickProject(e.target.value)}
                aria-label="Seleziona progetto"
                className="px-2.5 py-1.5 text-[12px] font-mono rounded-[8px] bg-white/[0.06] border border-white/[0.08] text-[#D4D8DD] focus:outline-none min-h-[36px]"
              >
                {projects.length > 0 ? (
                  projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#101316]">
                      {p.title}
                    </option>
                  ))
                ) : (
                  <option value="" className="bg-[#101316]">
                    Generale
                  </option>
                )}
              </select>

              <button
                type="button"
                onClick={() => setIsTopPriority(!isTopPriority)}
                aria-label="Contrassegna come Top Priority"
                className={`px-2.5 py-1.5 font-mono text-[11px] font-semibold rounded-[8px] border transition-colors apple-tap min-h-[36px] ${
                  isTopPriority
                    ? 'bg-white text-black border-white'
                    : 'bg-white/[0.04] border-white/[0.08] text-[#8A929A] hover:text-white'
                }`}
              >
                Top 3
              </button>

              <button
                type="submit"
                disabled={!quickTitle.trim()}
                aria-label="Aggiungi task"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-[12px] font-semibold rounded-[8px] bg-white text-black disabled:opacity-30 hover:bg-white/90 apple-tap min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi</span>
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT PANEL (5 cols): Numbered Tactical Module Tiles (Image 2 & 3 style) */}
        <section className="lg:col-span-5 hud-glass rounded-[18px] p-5 sm:p-6 space-y-4">
          <HudSectionHeader code="02" label="Moduli Rapidi" />

          <div className="grid grid-cols-2 gap-2.5">
            {/* Tile 01: Bilancio */}
            <button
              type="button"
              onClick={onOpenMoneyTab}
              className="hud-cell rounded-[12px] p-3.5 text-left hover:border-white/25 transition-all apple-tap flex flex-col justify-between min-h-[108px] relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-[#6E7681]">01</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#6E7681]" />
              </div>
              <div className="mt-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A929A] block">
                  Bilancio
                </span>
                <span className="text-[18px] font-semibold text-white tabular-nums">
                  {bankBalance.toLocaleString('it-IT')} €
                </span>
              </div>
              <div className="mt-2.5 h-0.5 w-full bg-white/[0.08] overflow-hidden rounded-full">
                <div
                  className="h-full bg-[#3FB979]"
                  style={{ width: bankBalance > 0 ? '100%' : '0%' }}
                />
              </div>
            </button>

            {/* Tile 02: Abitudini */}
            <button
              type="button"
              onClick={onOpenHabitsTab}
              className={`rounded-[12px] p-3.5 text-left transition-all apple-tap flex flex-col justify-between min-h-[108px] border relative overflow-hidden ${
                habits.length > 0 && habitsDone === habits.length
                  ? 'bg-white text-black border-white'
                  : 'hud-cell hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`font-mono text-[10px] ${
                    habits.length > 0 && habitsDone === habits.length ? 'text-black/60' : 'text-[#6E7681]'
                  }`}
                >
                  02
                </span>
                <ArrowUpRight
                  className={`w-3.5 h-3.5 ${
                    habits.length > 0 && habitsDone === habits.length ? 'text-black/60' : 'text-[#6E7681]'
                  }`}
                />
              </div>
              <div className="mt-2">
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider block ${
                    habits.length > 0 && habitsDone === habits.length ? 'text-black/60' : 'text-[#8A929A]'
                  }`}
                >
                  Abitudini
                </span>
                <span className="text-[18px] font-semibold tabular-nums">
                  {habitsDone}/{habits.length}
                </span>
              </div>
              <div
                className={`mt-2.5 h-0.5 w-full overflow-hidden rounded-full ${
                  habits.length > 0 && habitsDone === habits.length ? 'bg-black/15' : 'bg-white/[0.08]'
                }`}
              >
                <div
                  className="h-full bg-[#E5943C]"
                  style={{ width: `${ringsProgress.habitsPct}%` }}
                />
              </div>
            </button>

            {/* Tile 03: Obiettivi & Fronti */}
            <button
              type="button"
              onClick={onOpenGoalsTab}
              className="hud-cell rounded-[12px] p-3.5 text-left hover:border-white/25 transition-all apple-tap flex flex-col justify-between min-h-[108px] relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-[#6E7681]">03</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#6E7681]" />
              </div>
              <div className="mt-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A929A] block">
                  Fronti Attivi
                </span>
                <span className="text-[18px] font-semibold text-white tabular-nums">
                  {projects.length}
                </span>
              </div>
              <div className="mt-2.5 h-0.5 w-full bg-white/[0.08] overflow-hidden rounded-full">
                <div
                  className="h-full bg-white"
                  style={{ width: projects.length > 0 ? '60%' : '0%' }}
                />
              </div>
            </button>

            {/* Tile 04: Quota Coraggio */}
            <button
              type="button"
              onClick={onOpenCourageTab}
              className="hud-cell rounded-[12px] p-3.5 text-left hover:border-white/25 transition-all apple-tap flex flex-col justify-between min-h-[108px] relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-[#6E7681]">04</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#6E7681]" />
              </div>
              <div className="mt-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A929A] block">
                  Coraggio
                </span>
                <span className="text-[18px] font-semibold text-white tabular-nums">
                  {rejectionsCount}/10
                </span>
              </div>
              <div className="mt-2.5 h-0.5 w-full bg-white/[0.08] overflow-hidden rounded-full">
                <div
                  className="h-full bg-[#E5943C]"
                  style={{ width: `${Math.min(100, rejectionsCount * 10)}%` }}
                />
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
