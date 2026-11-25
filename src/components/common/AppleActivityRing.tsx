/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ActivityRingProps {
  percentage: number;
  color: string;
  backgroundColor?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function AppleSingleRing({
  percentage,
  color,
  backgroundColor,
  size = 64,
  strokeWidth = 4,
  label,
}: ActivityRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Outer subtle reticle tick ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth + 1}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray="2 4"
            fill="none"
          />
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor || 'rgba(255, 255, 255, 0.1)'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[13px] font-bold text-white tabular-nums leading-none">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A929A] mt-1.5 text-center">
          {label}
        </span>
      )}
    </div>
  );
}

interface TripleRingsProps {
  ring1: { pct: number; color: string; label: string };
  ring2: { pct: number; color: string; label: string };
  ring3: { pct: number; color: string; label: string };
  size?: number;
}

export function AppleTripleActivityRings({
  ring1,
  ring2,
  ring3,
  size = 112,
}: TripleRingsProps) {
  const strokeWidth = 5;
  const gap = 5;

  // Outer reticle ring
  const outerTickR = size / 2 - 2;

  // Ring 1 (Habits)
  const r1 = (size - strokeWidth * 2 - 10) / 2;
  const c1 = 2 * Math.PI * r1;
  const offset1 = c1 - (Math.min(100, Math.max(0, ring1.pct)) / 100) * c1;

  // Ring 2 (Tasks)
  const r2 = r1 - strokeWidth - gap;
  const c2 = 2 * Math.PI * r2;
  const offset2 = c2 - (Math.min(100, Math.max(0, ring2.pct)) / 100) * c2;

  // Ring 3 (Courage)
  const r3 = r2 - strokeWidth - gap;
  const c3 = 2 * Math.PI * r3;
  const offset3 = c3 - (Math.min(100, Math.max(0, ring3.pct)) / 100) * c3;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Tactical outer degree reticle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerTickR}
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1"
          strokeDasharray="1.5 5.5"
          fill="none"
        />

        {/* Ring 1 */}
        <circle cx={size / 2} cy={size / 2} r={r1} stroke="rgba(255, 255, 255, 0.09)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r1}
          stroke={ring1.color}
          strokeWidth={strokeWidth}
          strokeDasharray={c1}
          strokeDashoffset={offset1}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-800 ease-out"
        />

        {/* Ring 2 */}
        <circle cx={size / 2} cy={size / 2} r={r2} stroke="rgba(255, 255, 255, 0.07)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r2}
          stroke={ring2.color}
          strokeWidth={strokeWidth}
          strokeDasharray={c2}
          strokeDashoffset={offset2}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-800 ease-out"
        />

        {/* Ring 3 */}
        <circle cx={size / 2} cy={size / 2} r={r3} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r3}
          stroke={ring3.color}
          strokeWidth={strokeWidth}
          strokeDasharray={c3}
          strokeDashoffset={offset3}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-800 ease-out"
        />
      </svg>

      {/* Center pinpoint dot */}
      <div className="absolute w-1.5 h-1.5 rounded-full bg-white/60" />
    </div>
  );
}
