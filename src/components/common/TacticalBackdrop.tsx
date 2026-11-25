/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Atmospheric topographic contour & tactical telemetry coordinate backdrop
 * inspired by dark tactical spatial command interfaces.
 */
export function TacticalBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#07090B]"
    >
      {/* Subtle atmospheric dark terrain glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 20% 35%, rgba(44, 68, 56, 0.14) 0%, transparent 65%), radial-gradient(ellipse 65% 50% at 80% 60%, rgba(160, 72, 42, 0.09) 0%, transparent 65%), radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.025) 0%, transparent 55%)',
        }}
      />

      {/* Micro coordinate grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.22) 0.75px, transparent 0.75px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Topographic contours + Concentric Radar Rings */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.22]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Concentric radar arcs */}
        <circle
          cx="720"
          cy="430"
          r="190"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        <circle
          cx="720"
          cy="430"
          r="330"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        <circle
          cx="720"
          cy="430"
          r="480"
          stroke="rgba(255,255,255,0.045)"
          strokeWidth="1"
          strokeDasharray="2 8"
        />

        {/* Topographic organic contour lines */}
        <path
          d="M-60 640 C 180 580, 320 420, 540 460 C 740 495, 860 310, 1120 340 C 1280 358, 1380 280, 1500 260"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        <path
          d="M-40 690 C 210 630, 350 470, 570 505 C 770 538, 890 365, 1140 390 C 1300 406, 1400 330, 1510 310"
          stroke="rgba(255,255,255,0.045)"
          strokeWidth="1"
        />
        <path
          d="M-20 745 C 240 685, 380 525, 600 555 C 800 582, 920 420, 1165 445 C 1320 460, 1420 385, 1520 365"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
        />
        <path
          d="M120 -30 C 260 120, 410 190, 590 140 C 790 85, 970 180, 1190 110 C 1310 72, 1400 30, 1480 -20"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* Fine axis crosshairs */}
        <line
          x1="720"
          y1="60"
          x2="720"
          y2="840"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
          strokeDasharray="2 10"
        />
        <line
          x1="120"
          y1="430"
          x2="1320"
          y2="430"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
          strokeDasharray="2 10"
        />
      </svg>

      {/* Vignette edge framing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 48%, rgba(4, 5, 7, 0.72) 100%)',
        }}
      />
    </div>
  );
}
