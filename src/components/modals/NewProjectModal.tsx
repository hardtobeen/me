/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppleModal } from '../common/AppleModal';
import { ProjectGoal } from '../../types';
import { Plus, Trash2, Check } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<ProjectGoal, 'id' | 'progressPercent'> & { id?: string }) => void;
  initialProject?: ProjectGoal | null;
}

const MONO_TONES = [
  { name: 'Bianco', hex: '#FFFFFF' },
  { name: 'Argento', hex: '#D1D1D6' },
  { name: 'Grigio Chiaro', hex: '#A1A1A6' },
  { name: 'Grigio', hex: '#8E8E93' },
  { name: 'Grigio Scuro', hex: '#636366' },
];

export function NewProjectModal({
  isOpen,
  onClose,
  onSave,
  initialProject,
}: NewProjectModalProps) {
  const [title, setTitle] = useState(initialProject?.title || '');
  const [shortDesc, setShortDesc] = useState(initialProject?.shortDesc || '');
  const [targetAmount, setTargetAmount] = useState(initialProject?.targetAmount || '');
  const [deadline, setDeadline] = useState(initialProject?.deadline || '');
  const [category, setCategory] = useState<ProjectGoal['category']>(initialProject?.category || 'custom');
  const [status, setStatus] = useState<ProjectGoal['status']>(initialProject?.status || 'active');
  const [accentColor, setAccentColor] = useState(initialProject?.accentColor || '#FFFFFF');

  const [milestonesList, setMilestonesList] = useState<string[]>(
    initialProject ? initialProject.milestones.map((m) => m.title) : ['']
  );

  const handleAddMilestoneField = () => {
    setMilestonesList((prev) => [...prev, '']);
  };

  const handleMilestoneChange = (index: number, val: string) => {
    setMilestonesList((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveMilestoneField = (index: number) => {
    setMilestonesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const filteredMilestones = milestonesList
      .filter((m) => m.trim().length > 0)
      .map((m, idx) => ({
        id: `ms-${Date.now()}-${idx}`,
        title: m.trim(),
        completed: false,
      }));

    onSave({
      id: initialProject ? initialProject.id : `proj-${Date.now()}`,
      title: title.trim(),
      shortDesc: shortDesc.trim() || 'Obiettivo personale',
      targetAmount: targetAmount.trim() || undefined,
      deadline: deadline.trim() || undefined,
      category,
      status,
      accentColor,
      milestones: filteredMilestones,
    });

    onClose();
  };

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProject ? 'Modifica Fronte' : 'Nuovo Fronte / Obiettivo'}
      subtitle="Definisci il tuo obiettivo e le relative tappe"
      primaryAction={{
        label: initialProject ? 'Salva' : 'Crea',
        onClick: () => {
          const form = document.getElementById('new-project-form') as HTMLFormElement;
          if (form) form.requestSubmit();
        },
        disabled: !title.trim(),
      }}
    >
      <form id="new-project-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="proj-title" className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
            Nome del Fronte / Progetto *
          </label>
          <input
            id="proj-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Inserisci il nome del progetto..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[15px] font-semibold border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="proj-desc" className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
            Descrizione
          </label>
          <input
            id="proj-desc"
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Descrizione sintetica..."
            className="w-full px-3.5 py-2 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="proj-target" className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
              Target
            </label>
            <input
              id="proj-target"
              type="text"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Es. Traguardo numerico..."
              className="w-full px-3.5 py-2 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
            />
          </div>

          <div>
            <label htmlFor="proj-deadline" className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
              Scadenza
            </label>
            <input
              id="proj-deadline"
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Es. Orizzonte temporale..."
              className="w-full px-3.5 py-2 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="proj-cat" className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
              Tipologia
            </label>
            <select
              id="proj-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#2C2C2E] text-white text-[13px] font-medium border-0 focus:ring-1 focus:ring-white/40 outline-none"
            >
              <option value="custom">Obiettivo Personale</option>
              <option value="cash_now">Flusso di Cassa</option>
              <option value="scale_asset">Progetto Scalabile</option>
              <option value="mindset">Mindset & Disciplina</option>
              <option value="reward">Traguardo Personale</option>
            </select>
          </div>

          <div>
            <label htmlFor="proj-status" className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
              Stato
            </label>
            <select
              id="proj-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#2C2C2E] text-white text-[13px] font-medium border-0 focus:ring-1 focus:ring-white/40 outline-none"
            >
              <option value="active">Attivo</option>
              <option value="scheduled">Pianificato</option>
              <option value="frozen">In Pausa</option>
            </select>
          </div>
        </div>

        {/* Tono monocromatico */}
        <div>
          <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-2">
            Tono
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {MONO_TONES.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setAccentColor(c.hex)}
                title={c.name}
                aria-label={c.name}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 apple-tap border border-white/20"
                style={{ backgroundColor: c.hex }}
              >
                {accentColor === c.hex && (
                  <Check className={`w-4 h-4 stroke-[3] ${c.hex === '#FFFFFF' || c.hex === '#D1D1D6' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
              Tappe Operative
            </label>
            <button
              type="button"
              onClick={handleAddMilestoneField}
              className="text-[12px] font-semibold text-white hover:underline flex items-center gap-1 apple-tap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Tappa</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {milestonesList.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={m}
                  onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                  placeholder={`Tappa ${idx + 1}...`}
                  className="flex-1 px-3 py-2 rounded-[10px] bg-[#2C2C2E] text-white text-[13px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
                />
                {milestonesList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestoneField(idx)}
                    className="p-2 text-[#8E8E93] hover:text-white apple-tap"
                    title="Rimuovi tappa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </AppleModal>
  );
}
