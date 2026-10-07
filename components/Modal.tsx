'use client';

import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#183B38]/55 backdrop-blur-sm p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[24px] sm:rounded-[24px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(19,78,74,0.20)] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Handle */}
        <div className="w-9 h-1 bg-[#D9DDD7] rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EEEBDD]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#134E4A] to-[#D9B83F]" />

            <h3 className="text-sm font-extrabold text-[#183B38]">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F2F3EE] hover:bg-[#E8EAE3] flex items-center justify-center text-[#68736F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 bg-[#FFFDF5] border-t border-[#EEEBDD] flex items-center justify-end gap-2.5 pb-[calc(0.875rem+var(--safe-bottom))] sm:pb-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
