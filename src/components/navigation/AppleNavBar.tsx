/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { AppTab } from '../../types';

interface AppleNavBarProps {
  currentTab: AppTab;
  onOpenQuickAdd: () => void;
  onSelectTab?: (tab: AppTab) => void;
  summaryMetrics?: {
    balance: number;
    focusPct: number;
    activeFronts: number;
  };
}

export function AppleNavBar({
  currentTab,
  onOpenQuickAdd,
  onSelectTab,
  summaryMetrics,
}: AppleNavBarProps) {
  const getTabTitle = (tab: AppTab) => {
    switch (tab) {
      case 'today':
        return 'Oggi';
      case 'money':
        return 'Soldi';
      case 'habits':
        return 'Abitudini';
      case 'goals':
        return 'Obiettivi';
      case 'courage':
        return 'Coraggio';
      case 'journal':
        return 'Diario';
      case 'settings':
        return 'Impostazioni';
      default:
        return 'LockedIn';
    }
  };

  const getSubtitle = (tab: AppTab) => {
    switch (tab) {
      case 'today':
        return new Intl.DateTimeFormat('it-IT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(new Date());
      case 'money':
        return 'Bilancio & Cash Flow';
      case 'habits':
        return 'Disciplina Quotidiana';
      case 'goals':
        return 'Fronti & Tappe';
      case 'courage':
        return 'Esposizione al Rifiuto';
      case 'journal':
        return 'Check-in Serale';
      case 'settings':
        return 'Archiviazione & Sistema';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090B]/78 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4 min-w-0">
        {/* Zone 1: Active Section Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#7A828C] truncate leading-tight">
              {getSubtitle(currentTab)}
            </span>
            <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-white leading-[1.2] pb-0.5 mt-0.5 truncate">
              {getTabTitle(currentTab)}
            </h1>
          </div>
        </div>

        {/* Zone 2: Tactical Segmented Telemetry Readout Strip (Desktop) */}
        {summaryMetrics && (
          <div className="hidden md:flex items-center rounded-full bg-white/[0.035] border border-white/[0.09] px-1.5 py-1 gap-1">
            <button
              type="button"
              onClick={() => onSelectTab?.('money')}
              className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/[0.06] transition-colors text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3FB979]" />
              <span className="font-mono text-[11px] text-[#8A929A]">Saldo:</span>
              <span className="font-mono text-[11px] font-semibold text-white tabular-nums">
                {summaryMetrics.balance.toLocaleString('it-IT')} €
              </span>
            </button>

            <span className="w-px h-3.5 bg-white/10" aria-hidden="true" />

            <button
              type="button"
              onClick={() => onSelectTab?.('today')}
              className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/[0.06] transition-colors text-left"
            >
              <span className="font-mono text-[11px] text-[#8A929A]">Focus:</span>
              <span className="font-mono text-[11px] font-semibold text-white tabular-nums">
                {summaryMetrics.focusPct}%
              </span>
            </button>

            <span className="w-px h-3.5 bg-white/10" aria-hidden="true" />

            <button
              type="button"
              onClick={() => onSelectTab?.('goals')}
              className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/[0.06] transition-colors text-left"
            >
              <span className="font-mono text-[11px] text-[#8A929A]">Fronti:</span>
              <span className="font-mono text-[11px] font-semibold text-white tabular-nums">
                {summaryMetrics.activeFronts}
              </span>
            </button>
          </div>
        )}

        {/* Zone 3: Single Primary Tactical CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenQuickAdd}
            aria-label="Aggiungi nuovo elemento"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap min-h-[40px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Nuovo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
