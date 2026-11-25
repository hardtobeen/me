/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { ProjectGoal, TaskItem } from '../../types';
import { AppleSegmentedControl } from '../common/AppleSegmentedControl';
import { HudSectionHeader } from '../common/HudSectionHeader';
import { categorizeEisenhower } from '../../utils/lifeOsLogic';

interface GoalsViewProps {
  projects: ProjectGoal[];
  tasks: TaskItem[];
  onToggleMilestone: (projectId: string, milestoneId: string) => void;
  onAddMilestone: (projectId: string, title: string) => void;
  onDeleteMilestone: (projectId: string, milestoneId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (project: ProjectGoal) => void;
  onOpenNewProjectModal: () => void;
  onToggleTask: (taskId: string) => void;
}

export function GoalsView({
  projects,
  tasks,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  onDeleteProject,
  onEditProject,
  onOpenNewProjectModal,
  onToggleTask,
}: GoalsViewProps) {
  const [viewMode, setViewMode] = useState<'roadmaps' | 'eisenhower'>('roadmaps');
  const [newMilestoneInputs, setNewMilestoneInputs] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleMilestoneInputChange = (projectId: string, val: string) => {
    setNewMilestoneInputs((prev) => ({ ...prev, [projectId]: val }));
  };

  const handleAddMilestoneSubmit = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    const val = (newMilestoneInputs[projectId] || '').trim();
    if (!val) return;
    onAddMilestone(projectId, val);
    setNewMilestoneInputs((prev) => ({ ...prev, [projectId]: '' }));
  };

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <AppleSegmentedControl
          options={[
            { value: 'roadmaps', label: 'Roadmap' },
            { value: 'eisenhower', label: 'Matrice Eisenhower' },
          ]}
          value={viewMode}
          onChange={(val) => setViewMode(val as any)}
          size="sm"
          aria-label="Modalità visualizzazione obiettivi"
        />

        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-white/90 text-black text-[13px] font-semibold apple-tap min-h-[40px] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuovo Fronte</span>
        </button>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-[18px] hud-glass text-center space-y-5">
          <div className="w-12 h-12 rounded-[12px] hud-cell flex items-center justify-center mx-auto text-white">
            <Target className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-[17px] font-semibold text-white tracking-tight">
              Nessun fronte impostato
            </h3>
            <p className="text-[13px] text-[#8A929A] leading-relaxed">
              Spazio completamente pulito. Aggiungi un fronte o obiettivo personale quando vuoi iniziare.
            </p>
          </div>

          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-white/90 text-black text-[13px] font-semibold apple-tap flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Crea il tuo Primo Fronte</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <HudSectionHeader
            code="01"
            label={viewMode === 'roadmaps' ? 'Fronti Operativi' : 'Matrice Priorità'}
            rightText={`${activeProjectsCount} attivi su ${projects.length}`}
          />

          {viewMode === 'roadmaps' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((project, index) => {
                const totalMilestones = project.milestones.length;
                const completedCount = project.milestones.filter((m) => m.completed).length;
                const progress =
                  totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    className="p-4 sm:p-6 rounded-[18px] hud-glass space-y-4 flex flex-col justify-between min-w-0"
                  >
                    <div className="space-y-4 min-w-0">
                      {/* Project Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px] text-[#8A929A] mb-1">
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            <span>·</span>
                            <span className="text-white uppercase">
                              {project.status === 'active'
                                ? 'Attivo'
                                : project.status === 'scheduled'
                                ? 'Pianificato'
                                : 'In Pausa'}
                            </span>
                            {project.deadline && (
                              <>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  {project.deadline}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="text-[18px] font-semibold text-white leading-tight break-words">
                            {project.title}
                          </h3>
                          <p className="text-[13px] text-[#8A929A] mt-0.5 break-words">
                            {project.shortDesc}
                          </p>
                        </div>

                        <div className="flex items-center flex-wrap gap-1.5 shrink-0">
                          {project.targetAmount && (
                            <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-[6px] bg-white/[0.06] border border-white/10 text-white tabular-nums">
                              {project.targetAmount}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => onEditProject(project)}
                            title="Modifica fronte"
                            aria-label={`Modifica ${project.title}`}
                            className="p-2 rounded-[8px] text-[#8A929A] hover:text-white hover:bg-white/[0.06] apple-tap"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {confirmDeleteId === project.id ? (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(null);
                                onDeleteProject(project.id);
                              }}
                              className="px-2.5 py-1 rounded-[6px] bg-[#E03E36] text-white text-[11px] font-semibold apple-tap"
                            >
                              Elimina
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(project.id)}
                              title="Elimina fronte"
                              aria-label={`Elimina ${project.title}`}
                              className="p-2 rounded-[8px] text-[#8A929A] hover:text-white hover:bg-white/[0.06] apple-tap"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Telemetry Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-mono text-[11px] text-[#8A929A]">
                          <span>AVANZAMENTO</span>
                          <span className="text-white font-semibold tabular-nums">
                            {progress}% ({completedCount}/{totalMilestones})
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones Checklist */}
                      <div className="space-y-2 pt-3 border-t border-white/[0.07]">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A828C] block">
                          Tappe Operative ({totalMilestones})
                        </span>

                        {totalMilestones === 0 ? (
                          <p className="text-[12px] text-[#7A828C] py-1">
                            Nessuna tappa definita. Aggiungine una qui sotto.
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {project.milestones.map((m, mIdx) => (
                              <div
                                key={m.id}
                                className="group flex items-center justify-between gap-2 p-2 rounded-[8px] hover:bg-white/[0.03] transition-colors min-w-0"
                              >
                                <button
                                  type="button"
                                  onClick={() => onToggleMilestone(project.id, m.id)}
                                  className="flex-1 min-w-0 flex items-center gap-2.5 text-left apple-tap"
                                >
                                  <span className="font-mono text-[10px] text-[#525860] w-4 shrink-0">
                                    {String(mIdx + 1).padStart(2, '0')}
                                  </span>
                                  {m.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-[#484F58] group-hover:text-white shrink-0" />
                                  )}
                                  <span
                                    className={`text-[13px] leading-snug break-words min-w-0 ${
                                      m.completed ? 'line-through text-[#6E7681]' : 'text-white font-medium'
                                    }`}
                                  >
                                    {m.title}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeleteMilestone(project.id, m.id)}
                                  title="Elimina tappa"
                                  className="opacity-65 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-[#7A828C] hover:text-white apple-tap transition-opacity shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => handleAddMilestoneSubmit(project.id, e)}
                      className="flex items-center gap-2 pt-2 border-t border-white/[0.06] min-w-0"
                    >
                      <input
                        type="text"
                        value={newMilestoneInputs[project.id] || ''}
                        onChange={(e) => handleMilestoneInputChange(project.id, e.target.value)}
                        placeholder="+ Aggiungi nuova tappa..."
                        className="flex-1 min-w-0 px-3 py-2 rounded-[8px] bg-[#0A0D10] border border-white/10 text-white text-[13px] focus:border-white/30 outline-none placeholder-[#525860]"
                      />
                      <button
                        type="submit"
                        disabled={!(newMilestoneInputs[project.id] || '').trim()}
                        className="px-3.5 py-2 rounded-[8px] bg-white text-black hover:bg-white/90 disabled:opacity-30 text-[12px] font-semibold apple-tap shrink-0"
                      >
                        Aggiungi
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Tactical Eisenhower Matrix View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-[18px] hud-glass border-white/20 space-y-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-white">
                    01 · Fai Subito (Urgente & Importante)
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white text-black font-bold shrink-0">
                    Q1
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {tasks
                    .filter((t) => categorizeEisenhower(t.urgent, t.important) === 'q1_do_now')
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-[8px] hud-cell text-[13px] min-w-0"
                      >
                        <button type="button" onClick={() => onToggleTask(t.id)} className="apple-tap shrink-0">
                          {t.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#7A828C]" />
                          )}
                        </button>
                        <span className={`break-words min-w-0 ${t.completed ? 'line-through text-[#6E7681]' : 'font-medium text-white'}`}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  {tasks.filter((t) => categorizeEisenhower(t.urgent, t.important) === 'q1_do_now').length === 0 && (
                    <div className="p-3 text-[12px] text-[#7A828C]">
                      Nessuna attività in Q1.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-[18px] hud-glass space-y-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-white">
                    02 · Pianifica (Importante)
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#D4D8DD] shrink-0">
                    Q2
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {tasks
                    .filter((t) => categorizeEisenhower(t.urgent, t.important) === 'q2_schedule')
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-[8px] hud-cell text-[13px] min-w-0"
                      >
                        <button type="button" onClick={() => onToggleTask(t.id)} className="apple-tap shrink-0">
                          {t.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#7A828C]" />
                          )}
                        </button>
                        <span className={`break-words min-w-0 ${t.completed ? 'line-through text-[#6E7681]' : 'font-medium text-white'}`}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  {tasks.filter((t) => categorizeEisenhower(t.urgent, t.important) === 'q2_schedule').length === 0 && (
                    <div className="p-3 text-[12px] text-[#7A828C]">
                      Nessuna attività in Q2.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-[18px] hud-glass space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-white">03 · Delega (Urgente)</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-[#8A929A]">
                    Q3
                  </span>
                </div>
                <p className="text-[12px] text-[#7A828C]">
                  Riduci al minimo le interruzioni non strategiche.
                </p>
              </div>

              <div className="p-5 rounded-[18px] hud-glass space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-white">04 · Elimina (Superfluo)</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-[#8A929A]">
                    Q4
                  </span>
                </div>
                <p className="text-[12px] text-[#7A828C]">
                  Posticipa ciò che non sposta i tuoi fronti principali.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
