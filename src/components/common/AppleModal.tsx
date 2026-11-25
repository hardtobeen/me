/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AppleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  maxWidth?: string;
}

export function AppleModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  maxWidth = 'max-w-lg',
}: AppleModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidth} hud-glass rounded-t-[20px] sm:rounded-[18px] overflow-hidden max-h-[90vh] flex flex-col z-10 transition-transform duration-300 ease-out`}
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi finestra"
            className="text-[14px] font-medium text-[#8A929A] hover:text-white min-h-[44px] min-w-[44px] flex items-center apple-tap"
          >
            Annulla
          </button>

          <div className="text-center px-2 flex-1">
            <h3 className="text-[16px] font-semibold text-white leading-tight tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="font-mono text-[11px] text-[#7A828C] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {primaryAction ? (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              aria-label={primaryAction.label}
              className="px-3.5 py-1.5 rounded-[8px] bg-white text-black text-[13px] font-semibold disabled:opacity-30 hover:bg-white/90 min-h-[38px] flex items-center justify-center apple-tap"
            >
              {primaryAction.loading ? 'Salvataggio...' : primaryAction.label}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi finestra"
              className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#8A929A] hover:text-white apple-tap"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-5 text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
