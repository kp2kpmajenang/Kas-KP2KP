'use client';

import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastData {
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-[calc(4.5rem+var(--safe-bottom))] sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-sm animate-in fade-in slide-in-from-bottom duration-200">
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 text-white shadow-xl border-l-4 border-amber-400">
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-amber-300">
            {toast.title || (isSuccess ? 'Berhasil' : 'Perhatian')}
          </div>
          <div className="text-[11px] text-slate-200 leading-tight mt-0.5">
            {toast.message}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-0.5 rounded-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
