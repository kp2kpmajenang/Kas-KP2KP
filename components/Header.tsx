'use client';

import KasLogo from './KasLogo';
import RoleBadge from './RoleBadge';
import PeriodSelector from './PeriodSelector';

interface PeriodItem {
  periode: string;
  label: string;
}

interface HeaderProps {
  userName: string;
  roles: string[];
  periods: PeriodItem[];
  selectedPeriod: string;
  onPeriodChange: (periode: string) => void;
  greeting?: string;
}

export default function Header({
  userName,
  roles,
  periods,
  selectedPeriod,
  onPeriodChange,
  greeting = 'Selamat Datang,',
}: HeaderProps) {
  return (
    <header className="kas-safe-top sticky top-0 z-40 px-3.5 pt-2.5 sm:px-5">
      <div className="kas-glass-soft mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-[22px] px-3.5 py-2.5">
        {/* LOGO + USER INFO */}
        <div className="flex min-w-0 items-center gap-2.5">
          <KasLogo size="xs" />

          <div className="min-w-0">
            <div className="text-[11px] font-medium leading-tight text-[#4E6661]">
              {greeting}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="truncate text-[13.5px] font-bold leading-tight text-[#143632]">
                {userName || 'Pegawai KP2KP'}
              </span>
              <RoleBadge roles={roles} />
            </div>
          </div>
        </div>

        {/* PERIODE */}
        {periods.length > 0 && (
          <PeriodSelector
            periods={periods}
            selectedPeriod={selectedPeriod}
            onChange={onPeriodChange}
          />
        )}
      </div>
    </header>
  );
}
