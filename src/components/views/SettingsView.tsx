/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  BellRing,
  Check,
  Clock,
  ShieldCheck,
  Database,
  HardDrive,
  Smartphone,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { AppleToggle } from '../common/AppleToggle';
import { HudSectionHeader } from '../common/HudSectionHeader';
import { ReminderSetting } from '../../utils/notifications';
import { StorageStatus } from '../../utils/persistentStorage';

interface SettingsViewProps {
  onExportData: () => void;
  onResetData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  onSendTestNotification: () => void;
  reminders: ReminderSetting[];
  onToggleReminder: (id: string) => void;
  onAddReminder?: (reminder: Omit<ReminderSetting, 'id'>) => void;
  onDeleteReminder?: (id: string) => void;
  storageStatus?: StorageStatus;
  onRequestPersistStorage?: () => Promise<void>;
  statusFeedback?: string | null;
}

export function SettingsView({
  onExportData,
  onResetData,
  onImportData,
  notificationPermission,
  onRequestNotificationPermission,
  onSendTestNotification,
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  storageStatus,
  onRequestPersistStorage,
  statusFeedback,
}: SettingsViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isRequestingPersist, setIsRequestingPersist] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newRemTitle, setNewRemTitle] = useState('');
  const [newRemTime, setNewRemTime] = useState('09:00');
  const [newRemMessage, setNewRemMessage] = useState('');

  const isGranted = notificationPermission === 'granted';

  const handleRequestPersist = async () => {
    if (!onRequestPersistStorage) return;
    setIsRequestingPersist(true);
    await onRequestPersistStorage();
    setIsRequestingPersist(false);
    setLocalFeedback('Archiviazione persistente richiesta al dispositivo.');
    setTimeout(() => setLocalFeedback(null), 4000);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemTitle.trim() || !onAddReminder) return;
    onAddReminder({
      title: newRemTitle.trim(),
      time: newRemTime || '09:00',
      enabled: true,
      message: newRemMessage.trim() || 'Promemoria personale LockedIn.',
    });
    setNewRemTitle('');
    setNewRemTime('09:00');
    setNewRemMessage('');
    setShowAddReminder(false);
  };

  return (
    <div className="space-y-6 pb-8 min-w-0">
      {/* Dynamic Feedback Banner */}
      {(statusFeedback || localFeedback) && (
        <div className="p-4 rounded-[14px] hud-glass border-white/25 text-white flex items-center gap-3 animate-fade-in min-w-0">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#3FB979]" />
          <p className="text-[13px] font-medium leading-tight break-words min-w-0">
            {statusFeedback || localFeedback}
          </p>
        </div>
      )}

      {/* 1. Archiviazione Permanente */}
      <section className="hud-glass rounded-[18px] p-4 sm:p-6 space-y-4 min-w-0">
        <HudSectionHeader
          code="01"
          label="Archiviazione & Memoria"
          rightText="INDEXEDDB ATTIVO"
        />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[10px] hud-cell text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[16px] font-semibold text-white">
              Salvataggio Permanente Locale
            </h4>
            <p className="text-[12px] text-[#8A929A] mt-0.5">
              Sincronizzazione automatica su IndexedDB e LocalStorage con salvataggio alla chiusura del dispositivo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-[12px] hud-cell space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#7A828C] uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-[#D4D8DD]" />
              <span>Database</span>
            </div>
            <p className="text-[14px] font-semibold text-white">IndexedDB Attivo</p>
            <p className="text-[11px] text-[#7A828C]">Resistente alla chiusura app</p>
          </div>

          <div className="p-3.5 rounded-[12px] hud-cell space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#7A828C] uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-[#D4D8DD]" />
              <span>Protezione Riavvio</span>
            </div>
            <p className="text-[14px] font-semibold text-white">
              {storageStatus?.isPersistent ? 'Garantita da OS' : 'Locale Sicura'}
            </p>
            <p className="text-[11px] text-[#7A828C]">Persistente tra sessioni</p>
          </div>

          <div className="p-3.5 rounded-[12px] hud-cell space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#7A828C] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#D4D8DD]" />
              <span>Ultimo Salvataggio</span>
            </div>
            <p className="font-mono text-[13px] font-semibold text-white truncate">
              {storageStatus?.lastSavedAt || 'In tempo reale'}
            </p>
            <p className="text-[11px] text-[#7A828C]">Sincronizzato ad ogni azione</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onRequestPersistStorage && (
            <button
              type="button"
              onClick={handleRequestPersist}
              disabled={isRequestingPersist}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[13px] font-semibold text-black hover:bg-white/90 apple-tap disabled:opacity-50 min-h-[40px]"
            >
              <HardDrive className="w-4 h-4" />
              <span>{isRequestingPersist ? 'Verifica...' : 'Blocca Memoria Permanente'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExportData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.05] border border-white/10 text-[13px] font-medium text-white hover:bg-white/10 apple-tap min-h-[40px]"
          >
            <Download className="w-4 h-4 text-[#D4D8DD]" />
            <span>Esporta Backup (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.05] border border-white/10 text-[13px] font-medium text-white hover:bg-white/10 apple-tap min-h-[40px]"
          >
            <Upload className="w-4 h-4 text-[#D4D8DD]" />
            <span>Importa Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onImportData}
            className="hidden"
          />
        </div>
      </section>

      {/* 2. Notifiche & Promemoria */}
      <section className="hud-glass rounded-[18px] p-4 sm:p-6 space-y-4 min-w-0">
        <HudSectionHeader
          code="02"
          label="Notifiche & Promemoria"
          rightText={`${reminders.length} attivi`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] hud-cell text-white flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-white">
                Avvisi Personalizzati
              </h4>
              <p className="text-[12px] text-[#8A929A]">
                Notifiche locali configurate in autonomia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isGranted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-[#3FB979] font-mono text-[11px] font-semibold">
                <Check className="w-3.5 h-3.5" /> ATTIVE
              </span>
            ) : (
              <button
                type="button"
                onClick={onRequestNotificationPermission}
                className="px-3.5 py-2 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap min-h-[40px]"
              >
                Attiva Notifiche
              </button>
            )}

            <button
              type="button"
              onClick={onSendTestNotification}
              className="px-3.5 py-2 rounded-full bg-white/[0.05] border border-white/10 text-[#D4D8DD] hover:text-white text-[12px] font-medium apple-tap min-h-[40px]"
            >
              Test Notifica
            </button>

            {onAddReminder && (
              <button
                type="button"
                onClick={() => setShowAddReminder((v) => !v)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-white/[0.05] border border-white/15 text-white text-[12px] font-semibold hover:bg-white/10 apple-tap min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuovo</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline add reminder form */}
        {showAddReminder && onAddReminder && (
          <form
            onSubmit={handleSaveReminder}
            className="p-4 rounded-[14px] hud-cell space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Titolo promemoria..."
                value={newRemTitle}
                onChange={(e) => setNewRemTitle(e.target.value)}
                required
                className="sm:col-span-2 px-3.5 py-2 rounded-[8px] bg-[#0A0D10] border border-white/15 text-white placeholder-[#525860] text-[14px] outline-none focus:border-white/35 min-h-[42px]"
              />
              <input
                type="time"
                value={newRemTime}
                onChange={(e) => setNewRemTime(e.target.value)}
                className="px-3.5 py-2 rounded-[8px] bg-[#0A0D10] border border-white/15 text-white font-mono text-[14px] outline-none focus:border-white/35 min-h-[42px]"
              />
            </div>
            <input
              type="text"
              placeholder="Messaggio notifica (opzionale)..."
              value={newRemMessage}
              onChange={(e) => setNewRemMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-[8px] bg-[#0A0D10] border border-white/15 text-white placeholder-[#525860] text-[14px] outline-none focus:border-white/35 min-h-[42px]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddReminder(false)}
                className="px-3.5 py-2 rounded-[8px] text-[13px] font-medium text-[#8A929A] hover:text-white min-h-[40px]"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={!newRemTitle.trim()}
                className="px-4 py-2 rounded-[8px] bg-white text-black text-[13px] font-semibold disabled:opacity-30 min-h-[40px]"
              >
                Salva Promemoria
              </button>
            </div>
          </form>
        )}

        {/* Reminders list */}
        <div className="border-t border-white/[0.07] pt-3">
          {reminders.length === 0 ? (
            <p className="text-[13px] text-[#7A828C] py-2">
              Nessun promemoria impostato. Premi "+ Nuovo" per crearne uno personalizzato.
            </p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {reminders.map((rem) => (
                <div key={rem.id} className="py-3 flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-[8px] hud-cell flex items-center justify-center text-[#D4D8DD] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5 min-w-0">
                        <span className="text-[14px] font-medium text-white break-words">
                          {rem.title}
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[#D4D8DD] shrink-0">
                          {rem.time}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#7A828C] break-words">{rem.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AppleToggle
                      checked={rem.enabled}
                      onChange={() => onToggleReminder(rem.id)}
                    />
                    {onDeleteReminder && (
                      <button
                        type="button"
                        onClick={() => onDeleteReminder(rem.id)}
                        aria-label={`Elimina promemoria ${rem.title}`}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#6E7681] hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Reset Applicazione */}
      <section className="hud-glass rounded-[18px] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div>
          <h4 className="text-[15px] font-semibold text-white">
            Svuota Tutti i Dati
          </h4>
          <p className="text-[12px] text-[#8A929A]">
            Ripristina l'app allo stato vergine (0 € bilancio, 0 abitudini, 0 obiettivi, 0 promemoria)
          </p>
        </div>

        {confirmingReset ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="px-3.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/10 text-[13px] font-semibold text-[#9EA7B0] hover:text-white apple-tap min-h-[40px]"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmingReset(false);
                onResetData();
              }}
              className="px-4 py-2 rounded-[8px] bg-[#E03E36] text-white text-[13px] font-semibold hover:bg-[#E03E36]/90 apple-tap min-h-[40px]"
            >
              Conferma Reset
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/15 text-[13px] font-semibold text-[#D4D8DD] hover:text-white hover:bg-white/10 apple-tap shrink-0 min-h-[40px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ripristina App Vergine</span>
          </button>
        )}
      </section>
    </div>
  );
}
