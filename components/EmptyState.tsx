'use client';

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function EmptyState({
  title = 'Belum ada data',
  description = 'Tidak ada catatan transaksi pada periode ini.',
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#FFFDF5] border border-dashed border-[#DEDCCB] ${className}`}
    >
      <div className="relative w-11 h-11 rounded-full bg-[#EAF4F2] border border-[#D1E7E2] flex items-center justify-center text-[#0F766E] mb-2.5">
        <Inbox className="w-5 h-5" />

        <span className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full bg-[#D9B83F]" />
      </div>

      <h4 className="text-xs font-bold text-[#304944]">
        {title}
      </h4>

      <p className="text-[11px] text-[#8A918D] max-w-xs mt-0.5">
        {description}
      </p>
    </div>
  );
}
