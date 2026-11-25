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
      className={`kas-glass-clear flex flex-col items-center justify-center rounded-[20px] px-6 py-8 text-center ${className}`}
    >
      <div className="kas-glass-orb relative mb-3 flex h-12 w-12 items-center justify-center rounded-full text-[#0F766E]">
        <Inbox className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#C9A227] ring-2 ring-white" />
      </div>

      <h4 className="text-[13px] font-bold text-[#143632]">
        {title}
      </h4>

      <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-[#4E6661]">
        {description}
      </p>
    </div>
  );
}
