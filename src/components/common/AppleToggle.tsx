/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AppleToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export function AppleToggle({
  checked,
  onChange,
  id,
  label,
  disabled = false,
  ariaLabel,
}: AppleToggleProps) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 select-none cursor-pointer ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      {label && (
        <span className="text-[15px] font-normal text-black dark:text-white">
          {label}
        </span>
      )}
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={ariaLabel || label}
          className="sr-only"
        />
        <div
          className={`w-[51px] h-[31px] rounded-full transition-colors duration-250 ease-in-out apple-tap ${
            checked
              ? 'bg-white'
              : 'bg-[#2C2C2E]'
          }`}
        >
          <div
            className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-250 ease-in-out ${
              checked ? 'translate-x-[20px] bg-black' : 'translate-x-0 bg-[#8E8E93]'
            }`}
          />
        </div>
      </div>
    </label>
  );
}
