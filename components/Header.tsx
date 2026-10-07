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
    <header className="sticky top-0 z-40 bg-[#FFF9E8]/92 backdrop-blur-xl border-b border-[#E9E4CF] px-4 py-2.5 shadow-[0_4px_20px_rgba(19,78,74,0.04)]">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* User Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <ProfileAvatar name={userName} />

          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-[#7B817D] leading-tight">
              {greeting}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-[#183B38] truncate">
                {userName || 'Pegawai KP2KP'}
              </span>

              <RoleBadge roles={roles} />
            </div>
          </div>
        </div>

        {/* Period */}
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
