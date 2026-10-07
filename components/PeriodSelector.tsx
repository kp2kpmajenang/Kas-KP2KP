'use client';

import { Calendar } from 'lucide-react';

interface PeriodItem {
  periode: string;
  label: string;
}

interface PeriodSelectorProps {
  periods: PeriodItem[];
  selectedPeriod: string;
  onChange: (periode: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function PeriodSelector({
  periods,
  selectedPeriod,
  onChange,
  disabled = false,
  className = '',
}: PeriodSelectorProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/90 rounded-full px-2.5 py-1 transition-colors ${className}`}
    >
      <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
      <select
        value={selectedPeriod}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Pilih Periode Kas"
        className="bg-transparent text-amber-950 font-bold text-xs outline-none cursor-pointer pr-1 py-0.5"
      >
        {periods.map((item) => (
          <option key={item.periode} value={item.periode} className="bg-white text-slate-800">
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
