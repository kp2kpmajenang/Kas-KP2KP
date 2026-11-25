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
      className={`kas-glass-gold inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 transition-all hover:brightness-[0.98] ${className}`}
    >
      <Calendar className="h-3.5 w-3.5 shrink-0 text-[#7A5E0A]" />

      <select
        value={selectedPeriod}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Pilih Periode Kas"
        className="cursor-pointer bg-transparent pr-1 text-[12px] font-semibold text-[#5E4706] outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {periods.map((item) => (
          <option
            key={item.periode}
            value={item.periode}
            className="bg-white text-[#143632]"
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
