/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppleModal } from '../common/AppleModal';
import { RejectionRecord } from '../../types';

interface RejectionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<RejectionRecord, 'id' | 'date'>) => void;
}

export function RejectionLogModal({
  isOpen,
  onClose,
  onSave,
}: RejectionLogModalProps) {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [fearBefore, setFearBefore] = useState(7);
  const [feelingAfter, setFeelingAfter] = useState(2);
  const [lessonLearned, setLessonLearned] = useState('');

  const handleSubmit = () => {
    if (!businessName.trim() || !outcomeNote.trim()) return;
    onSave({
      businessName: businessName.trim(),
      location: location.trim(),
      outcomeNote: outcomeNote.trim(),
      fearBefore,
      feelingAfter,
      lessonLearned: lessonLearned.trim(),
    });
    setBusinessName('');
    setLocation('');
    setOutcomeNote('');
    setLessonLearned('');
    setFearBefore(7);
    setFeelingAfter(2);
    onClose();
  };

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registra Azione di Coraggio"
      subtitle="Ogni tentativo riduce la resistenza"
      primaryAction={{
        label: 'Salva',
        onClick: handleSubmit,
        disabled: !businessName.trim() || !outcomeNote.trim(),
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Attività / Persona contattata
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Nome attività o contatto..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Luogo
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Città o zona..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
          />
        </div>

        {/* Sliders: Fear Before vs Feeling After */}
        <div className="p-4 rounded-[16px] bg-[#2C2C2E]/60 space-y-3">
          <div>
            <div className="flex justify-between text-[13px] font-semibold mb-1">
              <span className="text-white">Ansia Prima:</span>
              <span className="text-white font-bold tabular-nums">{fearBefore}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={fearBefore}
              onChange={(e) => setFearBefore(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-semibold mb-1">
              <span className="text-white">Ansia Dopo:</span>
              <span className="text-[#D1D1D6] font-bold tabular-nums">{feelingAfter}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={feelingAfter}
              onChange={(e) => setFeelingAfter(Number(e.target.value))}
              className="w-full accent-[#D1D1D6] cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Esito
          </label>
          <textarea
            rows={2}
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            placeholder="Com'è andata l'interazione..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none resize-none placeholder-[#636366]"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Apprendimento
          </label>
          <input
            type="text"
            value={lessonLearned}
            onChange={(e) => setLessonLearned(e.target.value)}
            placeholder="Cosa hai notato o imparato..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
          />
        </div>
      </div>
    </AppleModal>
  );
}
