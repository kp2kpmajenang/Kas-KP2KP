'use client';

import {
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export interface ToastData {
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export default function Toast({
  toast,
  onClose,
}: ToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-[calc(4.5rem+var(--safe-bottom))] sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-sm animate-in fade-in slide-in-from-bottom duration-200">
      <div className="relative flex items-start gap-3 p-3.5 rounded-2xl bg-[#183B38] text-white shadow-[0_12px_35px_rgba(19,78,74,0.25)] border border-white/10 overflow-hidden">
        {/* Gold accent */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isSuccess
              ? 'bg-[#D9B83F]'
              : isInfo
              ? 'bg-[#5CBDB3]'
              : 'bg-[#E88D8D]'
          }`}
        />

        <div className="shrink-0 mt-0.5 ml-1">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-[#8BE0C4]" />
          ) : isInfo ? (
            <AlertCircle className="w-4 h-4 text-[#F7E7A8]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#F3A7A7]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#F7E7A8]">
            {toast.title ||
              (isSuccess
                ? 'Berhasil'
                : isInfo
                ? 'Informasi'
                : 'Perhatian')}
          </div>

          <div className="text-[11px] text-white/75 leading-tight mt-0.5">
            {toast.message}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-white/40 hover:text-white p-0.5 rounded-sm transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
