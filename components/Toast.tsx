'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!toast || !mounted) return null;

  const isSuccess = toast.type === 'success';
  const isInfo = toast.type === 'info';

  return createPortal(
    <div
      className="fixed left-4 right-4 z-[320] sm:left-auto sm:right-6 sm:max-w-sm kas-animate-sheet"
      style={{
        bottom:
          'max(94px, calc(84px + env(safe-area-inset-bottom, 0px)))',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="kas-glass-hero relative flex items-start gap-3 overflow-hidden rounded-[20px] p-3.5 text-white">
        <div
          className={`absolute bottom-0 left-0 top-0 w-1 ${
            isSuccess
              ? 'bg-[#8EF0C0]'
              : isInfo
              ? 'bg-[#FFF0A8]'
              : 'bg-[#FFB8C4]'
          }`}
        />

        <div className="ml-1 mt-0.5 shrink-0">
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-[#8EF0C0]" />
          ) : isInfo ? (
            <Info className="h-4 w-4 text-[#FFF0A8]" />
          ) : (
            <AlertCircle className="h-4 w-4 text-[#FFB8C4]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-[#FFF0A8]">
            {toast.title ||
              (isSuccess
                ? 'Berhasil'
                : isInfo
                ? 'Informasi'
                : 'Perhatian')}
          </div>
          <div className="mt-0.5 text-[11.5px] leading-snug text-white/85">
            {toast.message}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>,
    document.body
  );
}
