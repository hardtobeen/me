/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flame, Check, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { HabitItem } from '../../types';
import { AppleSegmentedControl } from '../common/AppleSegmentedControl';
import { HudSectionHeader } from '../common/HudSectionHeader';

interface HabitsViewProps {
  habits: HabitItem[];
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
  onOpenNewHabitModal: () => void;
  onDeleteHabit?: (habitId: string) => void;
}

export function HabitsView({
  habits,
  onToggleHabitDay,
  onOpenNewHabitModal,
  onDeleteHabit,
}: HabitsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'health' | 'commercial' | 'tech' | 'mindset'>('all');

  const days: { dateStr: string; dayLabel: string; code: string; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = new Intl.DateTimeFormat('it-IT', { weekday: 'narrow' }).format(d).toUpperCase();
    days.push({
      dateStr,
      dayLabel,
      code: `0${7 - i}`,
      isToday: i === 0,
    });
  }

  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  const categoryOptions = [
    { value: 'all', label: 'Tutte' },
    { value: 'health', label: 'Salute' },
    { value: 'commercial', label: 'Lavoro' },
    { value: 'tech', label: 'Focus' },
    { value: 'mindset', label: 'Mindset' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <AppleSegmentedControl
          options={categoryOptions}
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val as any)}
          size="sm"
          aria-label="Filtra abitudini per categoria"
        />

        <button
          type="button"
          onClick={onOpenNewHabitModal}
          aria-label="Nuova abitudine"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap self-start sm:self-auto min-h-[40px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuova Abitudine</span>
        </button>
      </div>

      {/* Empty State or Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-[18px] hud-glass text-center space-y-4">
          <div className="w-12 h-12 rounded-[12px] hud-cell flex items-center justify-center mx-auto text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h3 className="text-[17px] font-semibold text-white">
              Nessuna abitudine inserita
            </h3>
            <p className="text-[13px] text-[#8A929A] leading-relaxed">
              Crea la tua prima abitudine quotidiana per tracciare la costanza settimana dopo settimana.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewHabitModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crea Abitudine</span>
          </button>
        </div>
      ) : (
        <section className="hud-glass rounded-[18px] p-5 sm:p-6 space-y-5">
          <HudSectionHeader
            code="01"
            label="Matrice Abitudini"
            rightText={`${filteredHabits.length} attive`}
          />

          <div className="space-y-3.5">
            {filteredHabits.map((habit, index) => {
              const completedThisWeek = days.filter((d) => habit.completedDates.includes(d.dateStr)).length;
              const weeklyTarget = habit.targetDaysPerWeek || 7;
              const isTargetMet = completedThisWeek >= weeklyTarget;

              return (
                <div
                  key={habit.id}
                  className="p-4 sm:p-5 rounded-[14px] hud-cell transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info & Streak */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-[10px] text-[#6E7681]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-[16px] font-semibold text-white truncate">
                          {habit.title}
                        </h3>

                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#E5943C]">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{habit.streak}g</span>
                        </span>

                        {onDeleteHabit && (
                          <button
                            type="button"
                            onClick={() => onDeleteHabit(habit.id)}
                            aria-label={`Elimina ${habit.title}`}
                            className="p-1 text-[#6E7681] hover:text-white apple-tap ml-auto lg:ml-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-[13px] text-[#8A929A] leading-snug">
                        {habit.subtitle}
                      </p>

                      <div className="font-mono text-[11px] text-[#7A828C] tabular-nums">
                        TARGET: <span className="text-white font-semibold">{completedThisWeek}/{weeklyTarget}</span> GIORNI
                        {isTargetMet && (
                          <span className="ml-2 text-[#3FB979] font-semibold">
                            · COMPLETATO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: 7-day Tactical Grid Tiles (Image 2 style: active flips solid white with bottom bar) */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 self-start lg:self-auto w-full lg:w-auto">
                      {days.map((day) => {
                        const isDone = habit.completedDates.includes(day.dateStr);
                        return (
                          <button
                            key={day.dateStr}
                            type="button"
                            onClick={() => onToggleHabitDay(habit.id, day.dateStr)}
                            aria-label={`${habit.title} ${day.dayLabel} ${day.dateStr} ${isDone ? 'completato' : 'non completato'}`}
                            className={`relative flex flex-col items-center justify-between px-2 py-2 sm:w-12 h-16 rounded-[10px] border transition-all apple-tap overflow-hidden ${
                              day.isToday && !isDone ? 'border-white/35' : ''
                            } ${
                              isDone
                                ? 'bg-white text-black border-white'
                                : 'bg-white/[0.03] border-white/[0.09] text-[#8A929A] hover:border-white/25 hover:text-white'
                            }`}
                          >
                            <span
                              className={`font-mono text-[9px] font-semibold ${
                                isDone ? 'text-black/60' : 'text-[#6E7681]'
                              }`}
                            >
                              {day.dayLabel}
                            </span>

                            <div className="flex items-center justify-center">
                              {isDone ? (
                                <Check className="w-4 h-4 stroke-[2.8]" />
                              ) : (
                                <span className="w-2 h-2 rounded-full border border-white/25" />
                              )}
                            </div>

                            {/* Bottom tactical status hairline */}
                            <div
                              className={`w-full h-0.5 rounded-full ${
                                isDone
                                  ? 'bg-[#E5943C]'
                                  : day.isToday
                                  ? 'bg-white/30'
                                  : 'bg-transparent'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
