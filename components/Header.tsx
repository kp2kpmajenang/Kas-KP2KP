'use client';

import ProfileAvatar from './ProfileAvatar';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-2xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* User Info & Avatar */}
        <div className="flex items-center gap-2.5 min-w-0">
          <ProfileAvatar name={userName} />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-slate-500 leading-tight">
              {greeting}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {userName || 'Pegawai KP2KP'}
              </span>
              <RoleBadge roles={roles} />
            </div>
          </div>
        </div>

        {/* Period Selector */}
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
