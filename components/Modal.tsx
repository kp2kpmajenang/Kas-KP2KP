'use client';

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4 kas-animate-fade"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D2B28]/45 backdrop-blur-[6px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet / Modal Kaca */}
      <div className="kas-glass-sheet kas-animate-sheet relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[28px] sm:max-w-md sm:rounded-[26px]">
        {/* Mobile Drag Handle */}
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#143632]/20 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#143632]/8 px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="text-[16.5px] font-bold leading-snug text-[#143632]">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-[11.5px] text-[#4E6661]">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="kas-glass-orb flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4E6661] transition-colors hover:text-[#143632]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2.5 border-t border-[#143632]/8 bg-white/45 px-5 pt-3.5"
            style={{
              paddingBottom:
                'max(20px, calc(16px + env(safe-area-inset-bottom, 0px)))',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
