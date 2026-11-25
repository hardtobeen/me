/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface AppleSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

export function AppleSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Selettore vista',
}: AppleSegmentedControlProps<T>) {
  const isSm = size === 'sm';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center p-1 bg-white/[0.04] border border-white/[0.09] rounded-[10px] select-none ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex items-center justify-center gap-1.5 transition-all duration-200 rounded-[7px] font-medium apple-tap whitespace-nowrap shrink-0 ${
              isSm ? 'px-3 py-1.5 text-[12px] min-h-[32px]' : 'px-4 py-1.5 text-[13px] min-h-[38px]'
            } ${
              isSelected
                ? 'bg-white text-black font-semibold'
                : 'text-[#8A929A] hover:text-white'
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span className="truncate">{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full font-mono text-[10px] font-semibold ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-white/10 text-[#8A929A]'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
