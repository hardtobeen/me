/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppleModal } from '../common/AppleModal';
import { ProjectGoal, ProjectId } from '../../types';
import { AppleToggle } from '../common/AppleToggle';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: ProjectGoal[];
  onAddTask: (
    title: string,
    projectId: ProjectId,
    isTopPriority: boolean,
    urgent: boolean,
    important: boolean,
    estimatedMinutes?: number
  ) => void;
}

export function QuickAddModal({
  isOpen,
  onClose,
  projects = [],
  onAddTask,
}: QuickAddModalProps) {
  const [title, setTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<ProjectId>(
    projects.length > 0 ? projects[0].id : ''
  );
  const [isTopPriority, setIsTopPriority] = useState(false);
  const [urgent, setUrgent] = useState(true);
  const [important, setImportant] = useState(true);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  // If projects change and selected is empty, set default
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAddTask(
      title.trim(),
      selectedProjectId || (projects.length > 0 ? projects[0].id : 'general'),
      isTopPriority,
      urgent,
      important,
      estimatedMinutes > 0 ? estimatedMinutes : undefined
    );
    setTitle('');
    setIsTopPriority(false);
    onClose();
  };

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuova Attività"
      subtitle="Organizza il tuo focus quotidiano"
      primaryAction={{
        label: 'Aggiungi',
        onClick: handleSubmit,
        disabled: !title.trim(),
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Titolo dell'attività
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Inserisci un'attività..."
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none placeholder-[#636366]"
            autoFocus
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Fronte / Sezione di Riferimento
          </label>
          {projects.length > 0 ? (
            <select
              value={selectedProjectId || projects[0]?.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.targetAmount ? `(${p.targetAmount})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 rounded-[12px] bg-[#2C2C2E] text-[#8E8E93] text-[13px]">
              Nessun fronte creato (sarà salvata come Generale).
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="p-4 rounded-[16px] bg-[#2C2C2E]/60 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[14px] font-semibold text-white block">
                Priorità Principale (Top 3)
              </span>
              <span className="text-[12px] text-[#8E8E93]">
                Da completare per prima oggi
              </span>
            </div>
            <AppleToggle checked={isTopPriority} onChange={setIsTopPriority} />
          </div>

          <div className="flex items-center justify-between border-t border-[#38383A] pt-3">
            <div>
              <span className="text-[14px] font-semibold text-white block">
                Urgente
              </span>
              <span className="text-[12px] text-[#8E8E93]">
                Scadenza immediata
              </span>
            </div>
            <AppleToggle checked={urgent} onChange={setUrgent} />
          </div>

          <div className="flex items-center justify-between border-t border-[#38383A] pt-3">
            <div>
              <span className="text-[14px] font-semibold text-white block">
                Importante
              </span>
              <span className="text-[12px] text-[#8E8E93]">
                Obiettivo di medio-lungo termine
              </span>
            </div>
            <AppleToggle checked={important} onChange={setImportant} />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-white block mb-1">
            Tempo stimato (minuti)
          </label>
          <input
            type="number"
            min={5}
            step={5}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full px-3.5 py-2 rounded-[12px] bg-[#2C2C2E] text-white text-[14px] border-0 focus:ring-1 focus:ring-white/40 outline-none"
          />
        </div>
      </div>
    </AppleModal>
  );
}
