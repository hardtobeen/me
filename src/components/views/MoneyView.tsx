/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { ExpenseItem, IncomeItem, FinancialProfile, ExpenseCategory } from '../../types';
import { HudSectionHeader } from '../common/HudSectionHeader';

interface MoneyViewProps {
  financialProfile: FinancialProfile;
  onUpdateBalance: (newBalance: number) => void;
  onToggleExpensePaid: (expenseId: string, markPaid: boolean) => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
  onToggleIncomeReceived: (incomeId: string, markReceived: boolean) => void;
  onAddIncome: (income: Omit<IncomeItem, 'id'>) => void;
}

function splitCurrencyParts(amount: number): { intPart: string; decPart: string } {
  const fixed = amount.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const commaIdx = fixed.lastIndexOf(',');
  if (commaIdx === -1) return { intPart: fixed, decPart: ',00' };
  return {
    intPart: fixed.slice(0, commaIdx),
    decPart: fixed.slice(commaIdx),
  };
}

export function MoneyView({
  financialProfile,
  onUpdateBalance,
  onToggleExpensePaid,
  onAddExpense,
  onDeleteExpense,
  onToggleIncomeReceived,
  onAddIncome,
}: MoneyViewProps) {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(financialProfile.bankBalance.toString());
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpDateLabel, setNewExpDateLabel] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseCategory>('vita_quotidiana');
  const [newExpNotes, setNewExpNotes] = useState('');

  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [newIncTitle, setNewIncTitle] = useState('');
  const [newIncAmount, setNewIncAmount] = useState('');
  const [newIncDateLabel, setNewIncDateLabel] = useState('');

  const unpaidExpenses = financialProfile.expenses.filter((e) => !e.paid);
  const paidExpenses = financialProfile.expenses.filter((e) => e.paid);

  const totalUnpaidAmount = unpaidExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netDisposableBalance = financialProfile.bankBalance - totalUnpaidAmount;

  const pendingIncomes = financialProfile.incomes.filter((i) => !i.received);
  const totalPendingIncome = pendingIncomes.reduce((sum, i) => sum + i.amount, 0);
  const theoreticalBalance = netDisposableBalance + totalPendingIncome;

  const balanceParts = splitCurrencyParts(financialProfile.bankBalance);
  const unpaidParts = splitCurrencyParts(totalUnpaidAmount);
  const netParts = splitCurrencyParts(netDisposableBalance);

  const expenseRatioPct =
    financialProfile.bankBalance > 0
      ? Math.min(100, Math.round((totalUnpaidAmount / financialProfile.bankBalance) * 100))
      : 0;
  const netRatioPct =
    financialProfile.bankBalance > 0
      ? Math.max(0, Math.min(100, Math.round((netDisposableBalance / financialProfile.bankBalance) * 100)))
      : 0;

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(balanceInput.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      onUpdateBalance(val);
      setIsEditingBalance(false);
    }
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpAmount.replace(',', '.'));
    if (!newExpTitle.trim() || isNaN(amt) || amt <= 0) return;

    onAddExpense({
      title: newExpTitle.trim(),
      amount: amt,
      dateLabel: newExpDateLabel.trim() || 'Da programmare',
      category: newExpCategory,
      paid: false,
      notes: newExpNotes.trim(),
    });

    setNewExpTitle('');
    setNewExpAmount('');
    setNewExpDateLabel('');
    setNewExpNotes('');
    setIsAddingExpense(false);
  };

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newIncAmount.replace(',', '.'));
    if (!newIncTitle.trim() || isNaN(amt) || amt <= 0) return;

    onAddIncome({
      title: newIncTitle.trim(),
      amount: amt,
      dateLabel: newIncDateLabel.trim() || 'In attesa',
      received: false,
    });

    setNewIncTitle('');
    setNewIncAmount('');
    setNewIncDateLabel('');
    setIsAddingIncome(false);
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'fiscale':
        return 'Tasse & Fiscale';
      case 'salute':
        return 'Salute';
      case 'logistica':
        return 'Trasporti';
      case 'viaggio':
        return 'Viaggi';
      case 'alloggio':
        return 'Alloggio';
      case 'vita_quotidiana':
        return 'Quotidiano';
      default:
        return 'Altro';
    }
  };

  const filteredExpenses = financialProfile.expenses.filter((e) => {
    if (filter === 'unpaid') return !e.paid;
    if (filter === 'paid') return e.paid;
    return true;
  });

  return (
    <div className="space-y-6 pb-8 min-w-0">
      {/* 1. HERO TELEMETRY CASHFLOW PANEL */}
      <section className="hud-glass rounded-[18px] p-4 sm:p-6 space-y-5 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <HudSectionHeader
            code="01"
            label="Bilancio & Cash Flow"
            rightText={financialProfile.lastUpdated}
          />
          <button
            type="button"
            onClick={() => {
              setBalanceInput(financialProfile.bankBalance.toString());
              setIsEditingBalance(!isEditingBalance);
            }}
            className="px-3.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/10 text-[12px] font-medium text-white hover:bg-white/[0.12] apple-tap flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Modifica Saldo</span>
          </button>
        </div>

        {/* Edit Balance Form */}
        {isEditingBalance && (
          <form
            onSubmit={handleSaveBalance}
            className="p-4 rounded-[14px] hud-cell flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="flex-1 w-full">
              <label htmlFor="balance-input" className="block font-mono text-[10px] text-[#8A929A] uppercase tracking-wider font-semibold mb-1.5">
                Saldo Attuale (€)
              </label>
              <input
                id="balance-input"
                type="text"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3.5 py-2 text-white text-[16px] font-mono font-semibold focus:outline-none focus:border-white/40"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto self-end">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-[8px] bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap min-h-[40px]"
              >
                Salva
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBalance(false)}
                className="px-3.5 py-2.5 rounded-[8px] bg-white/[0.06] border border-white/10 text-white text-[13px] hover:bg-white/10 apple-tap min-h-[40px]"
              >
                Annulla
              </button>
            </div>
          </form>
        )}

        {/* 3-Column Split-Contrast Telemetry Readouts + Horizontal Gauge Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Tile 01: Saldo Attuale */}
          <div className="hud-cell rounded-[14px] p-4 flex flex-col justify-between gap-3 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A929A] truncate">
                01 · Saldo Attuale
              </span>
              <span className="font-mono text-[10px] text-[#6E7681] shrink-0">CONTO</span>
            </div>
            <div className="flex items-baseline flex-wrap gap-1 tabular-nums min-w-0">
              <span className="text-[28px] sm:text-[34px] font-light tracking-[-0.02em] text-white leading-none break-all">
                {balanceParts.intPart}
              </span>
              <span className="text-[18px] sm:text-[20px] font-light text-[#6E7681] leading-none shrink-0">
                {balanceParts.decPart} €
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="h-1 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: financialProfile.bankBalance > 0 ? '100%' : '0%' }}
                />
              </div>
              <p className="text-[11px] text-[#7A828C]">Disponibilità reale attuale</p>
            </div>
          </div>

          {/* Tile 02: Spese Previste */}
          <div className="hud-cell rounded-[14px] p-4 flex flex-col justify-between gap-3 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A929A] truncate">
                02 · Spese Previste
              </span>
              <span className="font-mono text-[10px] text-[#E5943C] tabular-nums shrink-0">
                {unpaidExpenses.length} APERTE
              </span>
            </div>
            <div className="flex items-baseline flex-wrap gap-1 tabular-nums min-w-0">
              <span className="text-[28px] sm:text-[34px] font-light tracking-[-0.02em] text-[#D4D8DD] leading-none break-all">
                {totalUnpaidAmount > 0 ? '−' : ''}{unpaidParts.intPart}
              </span>
              <span className="text-[18px] sm:text-[20px] font-light text-[#6E7681] leading-none shrink-0">
                {unpaidParts.decPart} €
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="h-1 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E5943C] transition-all duration-500"
                  style={{ width: `${expenseRatioPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#7A828C]">Totale uscite ancora da saldare</p>
            </div>
          </div>

          {/* Tile 03: Residuo Disponibile (Highlighted) */}
          <div className="rounded-[14px] p-4 bg-white/[0.05] border border-white/20 flex flex-col justify-between gap-3 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white truncate">
                03 · Residuo Netto
              </span>
              <span className="font-mono text-[10px] text-[#3FB979] font-semibold shrink-0">
                DISPONIBILE
              </span>
            </div>
            <div className="flex items-baseline flex-wrap gap-1 tabular-nums min-w-0">
              <span className="text-[28px] sm:text-[34px] font-light tracking-[-0.02em] text-white leading-none break-all">
                {netParts.intPart}
              </span>
              <span className="text-[18px] sm:text-[20px] font-light text-[#8A929A] leading-none shrink-0">
                {netParts.decPart} €
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3FB979] transition-all duration-500"
                  style={{ width: `${netRatioPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9EA7B0]">Saldo al netto delle spese previste</p>
            </div>
          </div>
        </div>

        {/* Pending income summary row */}
        {financialProfile.incomes.length > 0 && (
          <div className="pt-3 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
            <div className="flex items-center gap-2 text-[#9EA7B0]">
              <TrendingUp className="w-4 h-4 text-[#3FB979]" />
              <span>
                Entrate in attesa:{' '}
                <strong className="font-mono text-white tabular-nums">
                  +{totalPendingIncome.toLocaleString('it-IT')} €
                </strong>
              </span>
            </div>
            <div className="font-mono text-[12px] text-[#D4D8DD] tabular-nums">
              Proiezione dopo entrate: <strong className="text-white">{theoreticalBalance.toLocaleString('it-IT')} €</strong>
            </div>
          </div>
        )}
      </section>

      {/* 2. BARRA FILTRI & AZIONI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap sm:inline-flex p-1 gap-1 rounded-[10px] bg-white/[0.04] border border-white/[0.09] w-full sm:w-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-colors apple-tap text-center ${
              filter === 'all' ? 'bg-white text-black font-semibold' : 'text-[#8A929A] hover:text-white'
            }`}
          >
            Tutte ({financialProfile.expenses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unpaid')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-colors apple-tap text-center ${
              filter === 'unpaid' ? 'bg-white text-black font-semibold' : 'text-[#8A929A] hover:text-white'
            }`}
          >
            Da Pagare ({unpaidExpenses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-colors apple-tap text-center ${
              filter === 'paid' ? 'bg-white text-black font-semibold' : 'text-[#8A929A] hover:text-white'
            }`}
          >
            Saldate ({paidExpenses.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddingIncome(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white text-[13px] font-medium apple-tap min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Nuova Entrata</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddingExpense(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-white/90 text-black text-[13px] font-semibold apple-tap min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span>Aggiungi Spesa</span>
          </button>
        </div>
      </div>

      {/* FORM: AGGIUNGI NUOVA SPESA */}
      {isAddingExpense && (
        <form
          onSubmit={handleCreateExpense}
          className="p-5 rounded-[18px] hud-glass space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h3 className="text-[15px] font-semibold text-white">Nuova Spesa</h3>
            <button
              type="button"
              onClick={() => setIsAddingExpense(false)}
              className="text-[12px] text-[#8A929A] hover:text-white"
            >
              Chiudi
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="exp-title-input" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
                Nome Spesa *
              </label>
              <input
                id="exp-title-input"
                type="text"
                required
                value={newExpTitle}
                onChange={(e) => setNewExpTitle(e.target.value)}
                placeholder="Descrizione spesa..."
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white text-[14px] focus:outline-none focus:border-white/40 placeholder-[#525860]"
              />
            </div>

            <div>
              <label htmlFor="exp-amount-input" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
                Importo (€) *
              </label>
              <input
                id="exp-amount-input"
                type="number"
                step="0.01"
                required
                value={newExpAmount}
                onChange={(e) => setNewExpAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white font-mono text-[14px] focus:outline-none focus:border-white/40 placeholder-[#525860]"
              />
            </div>

            <div>
              <label htmlFor="exp-date-input" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
                Scadenza
              </label>
              <input
                id="exp-date-input"
                type="text"
                value={newExpDateLabel}
                onChange={(e) => setNewExpDateLabel(e.target.value)}
                placeholder="Data o periodo..."
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white text-[14px] focus:outline-none focus:border-white/40 placeholder-[#525860]"
              />
            </div>

            <div>
              <label htmlFor="exp-cat-select" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                id="exp-cat-select"
                value={newExpCategory}
                onChange={(e) => setNewExpCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white text-[14px] focus:outline-none focus:border-white/40"
              >
                <option value="vita_quotidiana">Quotidiano</option>
                <option value="fiscale">Tasse & Fiscale</option>
                <option value="salute">Salute</option>
                <option value="logistica">Trasporti</option>
                <option value="viaggio">Viaggi</option>
                <option value="alloggio">Alloggio</option>
                <option value="altro">Altro</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="exp-notes-input" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
              Note
            </label>
            <input
              id="exp-notes-input"
              type="text"
              value={newExpNotes}
              onChange={(e) => setNewExpNotes(e.target.value)}
              placeholder="Note opzionali..."
              className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white text-[14px] focus:outline-none focus:border-white/40 placeholder-[#525860]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingExpense(false)}
              className="px-3.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/10 text-white text-[13px] hover:bg-white/10 apple-tap"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[8px] bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap"
            >
              Salva Spesa
            </button>
          </div>
        </form>
      )}

      {/* FORM: AGGIUNGI NUOVA ENTRATA */}
      {isAddingIncome && (
        <form
          onSubmit={handleCreateIncome}
          className="p-5 rounded-[18px] hud-glass space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h3 className="text-[15px] font-semibold text-white">Nuova Entrata</h3>
            <button
              type="button"
              onClick={() => setIsAddingIncome(false)}
              className="text-[12px] text-[#8A929A] hover:text-white"
            >
              Chiudi
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="inc-title-input" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
                Descrizione *
              </label>
              <input
                id="inc-title-input"
                type="text"
                required
                value={newIncTitle}
                onChange={(e) => setNewIncTitle(e.target.value)}
                placeholder="Descrizione entrata..."
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white text-[14px] focus:outline-none focus:border-white/40 placeholder-[#525860]"
              />
            </div>

            <div>
              <label htmlFor="inc-amount-input" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
                Importo (€) *
              </label>
              <input
                id="inc-amount-input"
                type="number"
                step="0.01"
                required
                value={newIncAmount}
                onChange={(e) => setNewIncAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white font-mono text-[14px] focus:outline-none focus:border-white/40 placeholder-[#525860]"
              />
            </div>

            <div>
              <label htmlFor="inc-date-input" className="block font-mono text-[10px] font-semibold text-[#8A929A] uppercase tracking-wider mb-1">
                Data Prevista
              </label>
              <input
                id="inc-date-input"
                type="text"
                value={newIncDateLabel}
                onChange={(e) => setNewIncDateLabel(e.target.value)}
                placeholder="Data prevista..."
                className="w-full bg-[#0A0D10] border border-white/15 rounded-[8px] px-3 py-2 text-white text-[14px] focus:outline-none focus:border-white/40 placeholder-[#525860]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingIncome(false)}
              className="px-3.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/10 text-white text-[13px] hover:bg-white/10 apple-tap"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[8px] bg-white text-black text-[13px] font-semibold hover:bg-white/90 apple-tap"
            >
              Salva Entrata
            </button>
          </div>
        </form>
      )}

      {/* 3. DUAL PANEL SPLIT: SPESE (7 cols) & ENTRATE (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* SPESE */}
        <section className="lg:col-span-7 hud-glass rounded-[18px] p-4 sm:p-6 space-y-4 min-w-0">
          <HudSectionHeader
            code="02"
            label="Spese"
            rightText={`${filteredExpenses.length} voci`}
          />

          {filteredExpenses.length === 0 ? (
            <div className="p-8 rounded-[14px] hud-cell text-center">
              <Wallet className="w-7 h-7 text-[#525860] mx-auto mb-2" />
              <h4 className="text-[14px] font-semibold text-white">Nessuna spesa inserita</h4>
              <p className="text-[12px] text-[#7A828C] mt-1">
                Premi "Aggiungi Spesa" per tracciare le tue uscite.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] rounded-[14px] border border-white/[0.07] bg-white/[0.015] overflow-hidden">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors min-w-0 ${
                    exp.paid ? 'opacity-50' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleExpensePaid(exp.id, !exp.paid)}
                      aria-label={exp.paid ? 'Segna come non pagata' : 'Segna come pagata'}
                      className="mt-0.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-full text-[#7A828C] hover:text-white apple-tap shrink-0"
                    >
                      {exp.paid ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="border-l border-white/15 pl-3 min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px] text-[#8A929A]">
                        <span>{getCategoryLabel(exp.category)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {exp.dateLabel}
                        </span>
                      </div>
                      <h4
                        className={`text-[14px] font-semibold mt-0.5 tracking-tight break-words ${
                          exp.paid ? 'line-through text-[#7A828C]' : 'text-white'
                        }`}
                      >
                        {exp.title}
                      </h4>
                      {exp.notes && (
                        <p className="text-[12px] text-[#7A828C] mt-0.5 leading-relaxed break-words">
                          {exp.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/[0.06]">
                    <div className="text-left sm:text-right">
                      <div className="font-mono text-[16px] font-semibold tabular-nums text-white">
                        −{exp.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </div>
                      <span className={`font-mono text-[10px] ${exp.paid ? 'text-[#3FB979]' : 'text-[#E5943C]'}`}>
                        {exp.paid ? 'SALDATO' : 'DA PAGARE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleExpensePaid(exp.id, !exp.paid)}
                        className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold apple-tap ${
                          exp.paid
                            ? 'bg-white/[0.06] border border-white/10 text-[#9EA7B0] hover:text-white'
                            : 'bg-white text-black hover:bg-white/90'
                        }`}
                      >
                        {exp.paid ? 'Riapri' : 'Paga'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteExpense(exp.id)}
                        aria-label="Elimina spesa"
                        className="p-1.5 text-[#6E7681] hover:text-white apple-tap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ENTRATE */}
        <section className="lg:col-span-5 hud-glass rounded-[18px] p-4 sm:p-6 space-y-4 min-w-0">
          <HudSectionHeader
            code="03"
            label="Entrate & Accrediti"
            rightText={`${financialProfile.incomes.length} voci`}
          />

          {financialProfile.incomes.length === 0 ? (
            <div className="p-6 rounded-[14px] hud-cell text-center">
              <p className="text-[12px] text-[#7A828C]">
                Nessuna entrata registrata. Usa "Nuova Entrata" per aggiungerne una.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] rounded-[14px] border border-white/[0.07] bg-white/[0.015] overflow-hidden">
              {financialProfile.incomes.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-[8px] bg-white/[0.05] border border-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px] text-[#8A929A]">
                        <span className={inc.received ? 'text-[#3FB979]' : 'text-[#8A929A]'}>
                          {inc.received ? 'ACCREDITATO' : 'IN ATTESA'}
                        </span>
                        <span>·</span>
                        <span>{inc.dateLabel}</span>
                      </div>
                      <h4 className="text-[14px] font-semibold text-white mt-0.5 break-words">
                        {inc.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/[0.06]">
                    <div className="font-mono text-[15px] font-semibold text-white tabular-nums">
                      +{inc.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleIncomeReceived(inc.id, !inc.received)}
                      className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold apple-tap ${
                        inc.received
                          ? 'bg-white/[0.06] border border-white/10 text-white hover:bg-white/10'
                          : 'bg-white text-black hover:bg-white/90'
                      }`}
                    >
                      {inc.received ? 'Annulla' : 'Accredita'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
