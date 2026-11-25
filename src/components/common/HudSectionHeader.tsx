/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface HudSectionHeaderProps {
  code?: string;
  label: string;
  rightText?: string;
  onAction?: () => void;
  actionLabel?: string;
}

/**
 * Tactical HUD section header with a micro-tagged label and extending hairline divider,
 * inspired by high-density telemetry interfaces.
 */
export function HudSectionHeader({
  code,
  label,
  rightText,
  onAction,
  actionLabel,
}: HudSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
      <div className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-[4px] bg-white/[0.06] border border-white/[0.1] min-w-0 max-w-full">
        {code && (
          <span className="font-mono text-[10px] font-semibold text-[#7A828C] tracking-wider shrink-0">
            {code}
          </span>
        )}
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-[#E2E6EC] truncate">
          {label}
        </span>
      </div>

      <div className="flex-1 min-w-[8px] h-px bg-white/[0.09]" />

      {rightText && (
        <span className="font-mono text-[10px] sm:text-[11px] text-[#7A828C] tabular-nums truncate max-w-[42%] sm:max-w-none shrink-0">
          {rightText}
        </span>
      )}

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel || label}
          className="w-7 h-7 rounded-[6px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8A929A] hover:text-white hover:border-white/20 transition-colors apple-tap shrink-0"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
