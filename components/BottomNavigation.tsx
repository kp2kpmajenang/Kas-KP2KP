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
    `relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all duration-200 ${
      active
        ? 'text-[#0F766E]'
        : 'text-[#8A918D] hover:text-[#41615D]'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E9E4CF] px-3 py-1.5 pb-[calc(0.375rem+var(--safe-bottom))] shadow-[0_-8px_30px_rgba(19,78,74,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Beranda */}
        <button
          type="button"
          onClick={() => onChangeTab('beranda')}
          className={getNavClass(activeTab === 'beranda')}
        >
          {activeTab === 'beranda' && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#D9B83F]" />
          )}

          <Home
            className={`w-5 h-5 ${
              activeTab === 'beranda'
                ? 'stroke-[2.4]'
                : 'stroke-[1.8]'
            }`}
          />
          <span>Beranda</span>
        </button>

        {/* Transaksi */}
        <button
          type="button"
          onClick={() => onChangeTab('transaksi')}
          className={getNavClass(activeTab === 'transaksi')}
        >
          {activeTab === 'transaksi' && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#D9B83F]" />
          )}

          <FileText
            className={`w-5 h-5 ${
              activeTab === 'transaksi'
                ? 'stroke-[2.4]'
                : 'stroke-[1.8]'
            }`}
          />
          <span>Mutasi</span>
        </button>

        {/* FAB Quick Add for Bendahara */}
        {isBendahara && onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            className="relative -mt-5 w-12 h-12 rounded-full bg-gradient-to-br from-[#134E4A] via-[#0F766E] to-[#D9B83F] text-white border-[3px] border-white flex items-center justify-center shadow-[0_8px_22px_rgba(15,118,110,0.28)] active:scale-95 hover:shadow-[0_10px_26px_rgba(15,118,110,0.34)] transition-all duration-200"
            title="Catat Transaksi"
          >
            <div className="absolute inset-[3px] rounded-full border border-white/15" />
            <Plus className="relative w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Analisis / Laporan */}
        <button
          type="button"
          onClick={() => onChangeTab('analisis')}
          className={getNavClass(activeTab === 'analisis')}
        >
          {activeTab === 'analisis' && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#D9B83F]" />
          )}

          <PieChart
            className={`w-5 h-5 ${
              activeTab === 'analisis'
                ? 'stroke-[2.4]'
                : 'stroke-[1.8]'
            }`}
          />
          <span>Analisis</span>
        </button>

        {/* Kelola */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onChangeTab('kelola')}
            className={getNavClass(activeTab === 'kelola')}
          >
            {activeTab === 'kelola' && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#D9B83F]" />
            )}

            <Shield
              className={`w-5 h-5 ${
                activeTab === 'kelola'
                  ? 'stroke-[2.4]'
                  : 'stroke-[1.8]'
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
          {activeTab === 'akun' && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#D9B83F]" />
          )}

          <User
            className={`w-5 h-5 ${
              activeTab === 'akun'
                ? 'stroke-[2.4]'
                : 'stroke-[1.8]'
            }`}
          />
          <span>Akun</span>
        </button>
      </div>
    </nav>
  );
}
