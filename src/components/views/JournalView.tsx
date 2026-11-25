/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  CheckCircle2,
  Zap,
  TrendingUp,
  Minus,
  CloudRain,
  Award,
} from 'lucide-react';
import { JournalEntry } from '../../types';
import { AppleToggle } from '../common/AppleToggle';
import { HudSectionHeader } from '../common/HudSectionHeader';

interface JournalViewProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: Omit<JournalEntry, 'id'>) => void;
}

export function JournalView({
  entries,
  onSaveEntry,
}: JournalViewProps) {
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'struggling'>('good');
  const [facingDiscomfort, setFacingDiscomfort] = useState(true);
  const [avoidedDistractions, setAvoidedDistractions] = useState(true);
  const [dailyWin, setDailyWin] = useState('');
  const [reflection, setReflection] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyWin.trim() && !reflection.trim()) return;

    onSaveEntry({
      date: new Date().toISOString().split('T')[0],
      mood,
      facingDiscomfort,
      avoidedDistractions,
      dailyWin: dailyWin.trim(),
      reflection: reflection.trim(),
    });

    setDailyWin('');
    setReflection('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const moodOptions: Record<
    'great' | 'good' | 'neutral' | 'struggling',
    { code: string; label: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    great: { code: '01', label: 'Forte & Chiaro', Icon: Zap },
    good: { code: '02', label: 'In Movimento', Icon: TrendingUp },
    neutral: { code: '03', label: 'Neutro', Icon: Minus },
    struggling: { code: '04', label: 'Sotto Pressione', Icon: CloudRain },
  };

  return (
    <div className="space-y-6 pb-8 min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANEL (7 cols): Evening Debrief Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 hud-glass rounded-[18px] p-4 sm:p-6 space-y-5 min-w-0"
        >
          <HudSectionHeader
            code="01"
            label="Check-in della Sera"
            rightText={new Date().toISOString().split('T')[0]}
          />

          {/* Mood Selector Tiles (Image 2 style: active flips solid white with bottom bar) */}
          <div className="space-y-2">
            <label className="font-mono text-[11px] uppercase tracking-wider text-[#8A929A] block">
              Stato della Giornata
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['great', 'good', 'neutral', 'struggling'] as const).map((m) => {
                const Icon = moodOptions[m].Icon;
                const isSelected = mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`flex flex-col justify-between p-3 rounded-[10px] border transition-all apple-tap min-h-[82px] text-left overflow-hidden ${
                      isSelected
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-white/[0.03] border-white/[0.09] text-[#8A929A] hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-mono text-[10px] ${
                          isSelected ? 'text-black/60' : 'text-[#6E7681]'
                        }`}
                      >
                        {moodOptions[m].code}
                      </span>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[12px] leading-tight mt-2 block">
                      {moodOptions[m].label}
                    </span>
                    <div
                      className={`w-full h-0.5 rounded-full mt-2 ${
                        isSelected ? 'bg-[#E5943C]' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Binary Self-Honesty Check */}
          <div className="space-y-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <span className="text-[14px] font-medium text-white block">
                  Hai affrontato il disagio oggi?
                </span>
                <span className="text-[12px] text-[#7A828C] break-words">
                  Hai svolto l'azione importante invece di rimandarla?
                </span>
              </div>
              <div className="shrink-0">
                <AppleToggle checked={facingDiscomfort} onChange={setFacingDiscomfort} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <span className="text-[14px] font-medium text-white block">
                  Nessuna distrazione passiva?
                </span>
                <span className="text-[12px] text-[#7A828C] break-words">
                  Sei rimasto focalizzato senza fughe mentali durante la giornata?
                </span>
              </div>
              <div className="shrink-0">
                <AppleToggle checked={avoidedDistractions} onChange={setAvoidedDistractions} />
              </div>
            </div>
          </div>

          {/* Daily Win */}
          <div className="space-y-1.5 pt-3 border-t border-white/[0.08]">
            <label className="font-mono text-[11px] uppercase tracking-wider text-[#8A929A] block">
              Vittoria Principale
            </label>
            <input
              type="text"
              value={dailyWin}
              onChange={(e) => setDailyWin(e.target.value)}
              placeholder="Es. Ho completato la mia priorità principale..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0A0D10] text-white placeholder-[#525860] text-[14px] border border-white/10 focus:border-white/35 outline-none min-h-[44px]"
            />
          </div>

          {/* Freeform Reflection */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase tracking-wider text-[#8A929A] block">
              Note Libere per Domani
            </label>
            <textarea
              rows={3}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Scrivi qui pensieri, idee o ciò che vuoi ricordare domani..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0A0D10] text-white placeholder-[#525860] text-[14px] border border-white/10 focus:border-white/35 outline-none resize-none"
            />
          </div>

          {/* Save CTA Button */}
          <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
            {savedSuccess ? (
              <span className="flex items-center gap-1.5 font-mono text-[12px] font-semibold text-[#3FB979]">
                <CheckCircle2 className="w-4 h-4" /> Check-in salvato.
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={!dailyWin.trim() && !reflection.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-[13px] font-semibold disabled:opacity-30 hover:bg-white/90 apple-tap min-h-[42px]"
            >
              <Send className="w-4 h-4" />
              <span>Salva Giornata</span>
            </button>
          </div>
        </form>

        {/* RIGHT PANEL (5 cols): History Log */}
        <section className="lg:col-span-5 hud-glass rounded-[18px] p-4 sm:p-6 space-y-4 min-w-0">
          <HudSectionHeader
            code="02"
            label="Archivio Diario"
            rightText={`${entries.length} note`}
          />

          {entries.length === 0 ? (
            <div className="p-8 text-center rounded-[14px] hud-cell space-y-2">
              <BookOpen className="w-7 h-7 text-[#525860] mx-auto" />
              <p className="text-[13px] text-[#8A929A]">
                Nessuna nota archiviata. Registra la prima riflessione per iniziare il tuo diario.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const moodInfo = moodOptions[entry.mood] || moodOptions.neutral;
                const MoodIcon = moodInfo.Icon;
                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-[14px] hud-cell space-y-2.5 min-w-0"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-mono text-[11px] font-semibold text-[#D4D8DD] tabular-nums">
                        {entry.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">
                        <MoodIcon className="w-3 h-3 shrink-0" />
                        {moodInfo.label}
                      </span>
                    </div>

                    {entry.dailyWin && (
                      <p className="flex items-start gap-2 text-[14px] font-semibold text-white break-words">
                        <Award className="w-4 h-4 text-[#E5943C] shrink-0 mt-0.5" />
                        <span className="min-w-0 break-words">{entry.dailyWin}</span>
                      </p>
                    )}

                    {entry.reflection && (
                      <p className="border-l border-white/15 pl-3 text-[13px] text-[#9EA7B0] leading-relaxed break-words">
                        {entry.reflection}
                      </p>
                    )}

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-1 font-mono text-[10px] text-[#7A828C]">
                      <span>{entry.facingDiscomfort ? '✓ Disagio affrontato' : '✗ Evitamento'}</span>
                      <span>·</span>
                      <span>{entry.avoidedDistractions ? '✓ Zero distrazioni' : '✗ Distrazioni'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
