'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;

  const bgStyles =
    type === 'error'
      ? 'bg-rose-900/95 border-rose-500/50 text-rose-100 shadow-rose-950/40'
      : type === 'info'
      ? 'bg-sky-900/95 border-sky-500/50 text-sky-100 shadow-sky-950/40'
      : 'bg-slate-900/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40';

  const icon =
    type === 'error' ? (
      <AlertCircle size={20} className="text-rose-400 shrink-0" />
    ) : type === 'info' ? (
      <Info size={20} className="text-sky-400 shrink-0" />
    ) : (
      <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
    );

  return (
    <div className="fixed bottom-6 right-6 z-[200] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-md ${bgStyles}`}
      >
        {icon}
        <p className="text-sm font-semibold tracking-wide flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-white"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
