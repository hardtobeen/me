/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppleModal } from '../common/AppleModal';
import { HabitItem } from '../../types';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<HabitItem, 'id' | 'completedDates' | 'streak'>) => void;
}

export function NewHabitModal({
  isOpen,
  onClose,
  onSave,
}: NewHabitModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'mindset' | 'commercial' | 'tech' | 'health'>('health');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Abitudine quotidiana',
      category,
      targetDaysPerWeek,
      color: '#FFFFFF',
    });
    setTitle('');
    setSubtitle('');
    onClose();
  };

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuova Abitudine"
      subtitle="Definisci un'azione ripetibile"
      primaryAction={{
        label: 'Crea',
        onClick: handleSubmit,
        disabled: !title.trim(),
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Nome dell'abitudine
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Inserisci il nome dell'abitudine..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Dettaglio breve
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Note o obiettivo..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none"
          >
            <option value="health">Salute & Allenamento</option>
            <option value="commercial">Lavoro & Outreach</option>
            <option value="tech">Focus & Studio</option>
            <option value="mindset">Mindset & Disciplina</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between text-[13px] font-semibold mb-1">
            <span className="text-white">Frequenza settimanale:</span>
            <span className="text-white font-bold">{targetDaysPerWeek} giorni / settimana</span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            value={targetDaysPerWeek}
            onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
        </div>
      </div>
    </AppleModal>
  );
}
