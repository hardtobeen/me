/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Wallet, CheckCircle2, Target, ShieldAlert, BookOpen, Settings } from 'lucide-react';
import { AppTab } from '../../types';

interface AppleTabBarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  pendingTasksCount?: number;
  habitsLeftCount?: number;
  unpaidExpensesCount?: number;
}

export function AppleTabBar({
  currentTab,
  onSelectTab,
  pendingTasksCount = 0,
  habitsLeftCount = 0,
  unpaidExpensesCount = 0,
}: AppleTabBarProps) {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'today',
      label: 'Oggi',
      icon: <Calendar className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" strokeWidth={currentTab === 'today' ? 2.1 : 1.6} />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'money',
      label: 'Soldi',
      icon: <Wallet className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" strokeWidth={currentTab === 'money' ? 2.1 : 1.6} />,
      badge: unpaidExpensesCount > 0 ? unpaidExpensesCount : undefined,
    },
    {
      id: 'habits',
      label: 'Abitudini',
      icon: <CheckCircle2 className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" strokeWidth={currentTab === 'habits' ? 2.1 : 1.6} />,
      badge: habitsLeftCount > 0 ? habitsLeftCount : undefined,
    },
    {
      id: 'goals',
      label: 'Obiettivi',
      icon: <Target className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" strokeWidth={currentTab === 'goals' ? 2.1 : 1.6} />,
    },
    {
      id: 'courage',
      label: 'Coraggio',
      icon: <ShieldAlert className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" strokeWidth={currentTab === 'courage' ? 2.1 : 1.6} />,
    },
    {
      id: 'journal',
      label: 'Diario',
      icon: <BookOpen className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" strokeWidth={currentTab === 'journal' ? 2.1 : 1.6} />,
    },
    {
      id: 'settings',
      label: 'Impostazioni',
      icon: <Settings className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" strokeWidth={currentTab === 'settings' ? 2.1 : 1.6} />,
    },
  ];

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 hud-dock-glass rounded-full px-1.5 sm:px-2 py-1 sm:py-1.5 max-w-[calc(100vw-16px)]"
    >
      <div
        role="tablist"
        aria-label="Sezioni app"
        className="flex items-center justify-center gap-1 sm:gap-1.5"
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-label={tab.label}
              title={tab.label}
              aria-selected={isActive}
              role="tab"
              className={`relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full shrink-0 transition-all apple-tap border ${
                isActive
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'bg-white/[0.03] border-white/[0.07] text-[#7A828C] hover:text-white hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-2 -right-2 px-1 min-w-[14px] h-[14px] sm:min-w-[15px] sm:h-[15px] rounded-full font-mono text-[8px] sm:text-[9px] font-bold flex items-center justify-center border ${
                      isActive
                        ? 'bg-[#07090B] text-white border-white/25'
                        : 'bg-white text-black border-transparent'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
