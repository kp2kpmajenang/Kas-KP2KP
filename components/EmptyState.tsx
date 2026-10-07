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
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
        <Inbox className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-bold text-slate-700">{title}</h4>
      <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">{description}</p>
    </div>
  );
}
