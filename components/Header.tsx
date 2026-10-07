'use client';

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

/**
 * Logo KAS KP2KP
 * Dibuat inline agar tidak membutuhkan file gambar tambahan.
 */
function KasLogo() {
  return (
    <div className="relative shrink-0 w-10 h-10 sm:w-11 sm:h-11">
      <div className="absolute inset-0 rounded-[14px] bg-[#D9B83F]/20 blur-md" />

      <svg
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full"
        aria-label="Logo KAS KP2KP"
      >
        <defs>
          <linearGradient
            id="kasHeaderGradient"
            x1="8"
            y1="8"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#134E4A" />
            <stop offset="0.55" stopColor="#0F766E" />
            <stop offset="1" stopColor="#D9B83F" />
          </linearGradient>

          <linearGradient
            id="kasHeaderGold"
            x1="18"
            y1="10"
            x2="58"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F7E7A8" />
            <stop offset="1" stopColor="#D9B83F" />
          </linearGradient>
        </defs>

        <rect
          x="3"
          y="3"
          width="66"
          height="66"
          rx="22"
          fill="url(#kasHeaderGradient)"
        />

        <path
          d="M18 13C24 9 32 8 39 10C50 13 59 21 62 31"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* K */}
        <path
          d="M20 22V50"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <path
          d="M23 36L38 22"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M28 36L39 50"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Grafik */}
        <path
          d="M43 47V38"
          stroke="url(#kasHeaderGold)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M51 47V32"
          stroke="url(#kasHeaderGold)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M59 47V27"
          stroke="url(#kasHeaderGold)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M17 53H59"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
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
    <header className="sticky top-0 z-40 bg-[#FFF9E8]/92 backdrop-blur-xl border-b border-[#E9E4CF] px-4 py-2.5 shadow-[0_4px_20px_rgba(19,78,74,0.05)]">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">

        {/* KAS KP2KP + USER INFO */}
        <div className="flex items-center gap-2.5 min-w-0">

          <KasLogo />

          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-semibold text-[#7B817D] leading-tight">
              {greeting}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-[#183B38] truncate">
                {userName || 'Pegawai KP2KP'}
              </span>

              <RoleBadge roles={roles} />
            </div>

            <div className="hidden sm:block text-[9px] font-bold tracking-[0.12em] text-[#0F766E]/70 uppercase mt-0.5">
              KAS KP2KP Majenang
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
