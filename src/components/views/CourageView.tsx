/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Plus, TrendingDown, MapPin, Lightbulb } from 'lucide-react';
import { RejectionRecord } from '../../types';
import { calculateRejectionTargetProgress } from '../../utils/lifeOsLogic';
import { AppleSingleRing } from '../common/AppleActivityRing';
import { HudSectionHeader } from '../common/HudSectionHeader';

interface CourageViewProps {
  rejections: RejectionRecord[];
  onOpenLogModal: () => void;
}

export function CourageView({
  rejections,
  onOpenLogModal,
}: CourageViewProps) {
  const weeklyGoal = 10;
  const { percentage, remaining, label } = calculateRejectionTargetProgress(
    rejections.length,
    weeklyGoal
  );

  const avgFearDrop =
    rejections.length > 0
      ? Math.round(
          rejections.reduce((acc, r) => acc + (r.fearBefore - r.feelingAfter), 0) /
            rejections.length
        )
      : 0;

  return (
    <div className="space-y-6 pb-8 min-w-0">
      {/* 1. Header Telemetry Panel */}
      <section className="hud-glass rounded-[18px] p-4 sm:p-6 space-y-5 min-w-0">
        <HudSectionHeader
          code="01"
          label="Esposizione & Azione"
          rightText={`${rejections.length}/${weeklyGoal}`}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 min-w-0">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="shrink-0">
              <AppleSingleRing
                percentage={percentage}
                color="#FFFFFF"
                size={84}
                strokeWidth={5}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline flex-wrap gap-1.5">
                <span className="text-[34px] font-light text-white tracking-tight tabular-nums leading-none">
                  {rejections.length}
                </span>
                <span className="text-[20px] font-light text-[#6E7681] tabular-nums leading-none">
                  /{weeklyGoal}
                </span>
                <span className="font-mono text-[11px] text-[#8A929A] ml-1 uppercase">
                  approcci
                </span>
              </div>
              <h2 className="text-[16px] font-semibold text-white mt-1.5 break-words">
                Quota {weeklyGoal} Approcci Settimanali
              </h2>
              <p className="text-[13px] text-[#8A929A] mt-0.5 break-words">{label}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLogModal}
            aria-label="Registra nuovo approccio o rifiuto"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap shrink-0 min-h-[42px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registra Approccio</span>
          </button>
        </div>

        {/* 3-Column Tactical Readout Strip + SVG Waveform Trace */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="hud-cell rounded-[12px] p-3.5 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#7A828C] uppercase block">
                01 · Registrati
              </span>
              <span className="font-mono text-[22px] font-semibold text-white tabular-nums">
                {rejections.length}
              </span>
            </div>
            <svg width="48" height="22" viewBox="0 0 48 22" fill="none" aria-hidden="true">
              <polyline
                points="2,16 12,16 16,6 22,19 28,12 46,12"
                stroke="#3FB979"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="hud-cell rounded-[12px] p-3.5 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#7A828C] uppercase block">
                02 · Rimanenti
              </span>
              <span className="font-mono text-[22px] font-semibold text-[#D4D8DD] tabular-nums">
                {remaining}
              </span>
            </div>
            <svg width="48" height="22" viewBox="0 0 48 22" fill="none" aria-hidden="true">
              <polyline
                points="2,11 14,11 20,7 28,14 36,11 46,11"
                stroke="#E5943C"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="hud-cell rounded-[12px] p-3.5 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#7A828C] uppercase block">
                03 · Calo Tensione
              </span>
              <span className="font-mono text-[22px] font-semibold text-white tabular-nums">
                {avgFearDrop > 0 ? `−${avgFearDrop}` : '0'}
              </span>
            </div>
            <svg width="48" height="22" viewBox="0 0 48 22" fill="none" aria-hidden="true">
              <polyline
                points="2,6 15,8 26,13 38,16 46,17"
                stroke="#FFFFFF"
                strokeOpacity="0.6"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* 2. Action Log */}
      <section className="hud-glass rounded-[18px] p-4 sm:p-6 space-y-4 min-w-0">
        <HudSectionHeader
          code="02"
          label="Registro Azioni"
          rightText={`${rejections.length} registrati`}
        />

        {rejections.length === 0 ? (
          <div className="p-8 text-center rounded-[14px] hud-cell space-y-3">
            <ShieldAlert className="w-8 h-8 text-[#525860] mx-auto" />
            <div className="space-y-1">
              <h4 className="text-[15px] font-semibold text-white">Nessun approccio registrato</h4>
              <p className="text-[13px] text-[#8A929A] max-w-sm mx-auto">
                Registra qui la tua prima azione fuori dalla zona di comfort, l'esito e cosa hai imparato.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenLogModal}
              className="px-4 py-2 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap min-h-[40px]"
            >
              Registra Primo Approccio
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rejections.map((rec, idx) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 rounded-[14px] hud-cell space-y-3 min-w-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px] text-[#7A828C] mb-1">
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                      <span>·</span>
                      <span>{rec.date}</span>
                      {rec.location && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 break-words">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {rec.location}
                          </span>
                        </>
                      )}
                    </div>
                    <h4 className="text-[16px] font-semibold text-white break-words">
                      {rec.businessName}
                    </h4>
                  </div>

                  <div className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/[0.06] border border-white/10 text-white font-mono text-[11px] font-semibold shrink-0 tabular-nums">
                    <TrendingDown className="w-3.5 h-3.5 text-[#3FB979]" />
                    <span>{rec.fearBefore}/10 → {rec.feelingAfter}/10</span>
                  </div>
                </div>

                {rec.outcomeNote && (
                  <div className="border-l border-white/20 pl-3 text-[13px] text-[#D4D8DD] break-words">
                    <strong className="text-white">Esito:</strong> {rec.outcomeNote}
                  </div>
                )}

                {rec.lessonLearned && (
                  <p className="flex items-start gap-2 text-[12px] text-[#8A929A] break-words">
                    <Lightbulb className="w-4 h-4 text-[#E5943C] shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">
                      <strong className="text-[#E2E6EC]">Nota:</strong> {rec.lessonLearned}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
