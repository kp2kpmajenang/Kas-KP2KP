'use client';

import { Home, FileText, PieChart, Shield, User, Plus } from 'lucide-react';

export type NavTab = 'beranda' | 'transaksi' | 'analisis' | 'kelola' | 'akun';

interface BottomNavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  isBendahara: boolean;
  isSuperAdmin: boolean;
  onQuickAdd?: () => void;
}

export default function BottomNavigation({
  activeTab,
  onChangeTab,
  isBendahara,
  isSuperAdmin,
  onQuickAdd,
}: BottomNavigationProps) {
  const getNavClass = (active: boolean) =>
    `relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] py-1.5 px-1.5 text-[10.5px] leading-none transition-all duration-200 ${
      active
        ? 'bg-[#134E4A]/10 font-bold text-[#134E4A]'
        : 'font-semibold text-[#4E6661] hover:text-[#134E4A]'
    }`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] px-3.5 pt-2"
      style={{
        paddingBottom:
          'max(18px, calc(env(safe-area-inset-bottom, 0px) + 12px))',
      }}
    >
      <nav
        aria-label="Navigasi Utama"
        className="kas-glass-dock pointer-events-auto mx-auto flex max-w-md items-center justify-around gap-1 rounded-[28px] px-2 py-2"
      >
        {/* Beranda */}
        <button
          type="button"
          onClick={() => onChangeTab('beranda')}
          className={getNavClass(activeTab === 'beranda')}
        >
          <Home
            className={`h-[19px] w-[19px] ${
              activeTab === 'beranda' ? 'stroke-[2.3]' : 'stroke-[1.8]'
            }`}
          />
          <span>Beranda</span>
        </button>

        {/* Mutasi */}
        <button
          type="button"
          onClick={() => onChangeTab('transaksi')}
          className={getNavClass(activeTab === 'transaksi')}
        >
          <FileText
            className={`h-[19px] w-[19px] ${
              activeTab === 'transaksi' ? 'stroke-[2.3]' : 'stroke-[1.8]'
            }`}
          />
          <span>Mutasi</span>
        </button>

        {/* Tombol Aksi Utama Tengah (Bendahara) */}
        {isBendahara && onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            aria-label="Catat Transaksi"
            title="Catat Transaksi"
            className="mx-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#134E4A] via-[#0F766E] to-[#1A8A7F] text-white shadow-[0_8px_18px_rgba(19,78,74,0.34)] ring-1 ring-white/40 transition-all duration-200 hover:brightness-105 active:scale-95"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}

        {/* Analisis */}
        <button
          type="button"
          onClick={() => onChangeTab('analisis')}
          className={getNavClass(activeTab === 'analisis')}
        >
          <PieChart
            className={`h-[19px] w-[19px] ${
              activeTab === 'analisis' ? 'stroke-[2.3]' : 'stroke-[1.8]'
            }`}
          />
          <span>Analisis</span>
        </button>

        {/* Kelola (Super Admin) */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onChangeTab('kelola')}
            className={getNavClass(activeTab === 'kelola')}
          >
            <Shield
              className={`h-[19px] w-[19px] ${
                activeTab === 'kelola' ? 'stroke-[2.3]' : 'stroke-[1.8]'
              }`}
            />
            <span>Kelola</span>
          </button>
        )}

        {/* Akun */}
        <button
          type="button"
          onClick={() => onChangeTab('akun')}
          className={getNavClass(activeTab === 'akun')}
        >
          <User
            className={`h-[19px] w-[19px] ${
              activeTab === 'akun' ? 'stroke-[2.3]' : 'stroke-[1.8]'
            }`}
          />
          <span>Akun</span>
        </button>
      </nav>
    </div>
  );
}
