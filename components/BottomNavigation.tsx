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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 pb-[calc(0.375rem+var(--safe-bottom))] shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Beranda */}
        <button
          type="button"
          onClick={() => onChangeTab('beranda')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'beranda'
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Beranda</span>
        </button>

        {/* Transaksi */}
        <button
          type="button"
          onClick={() => onChangeTab('transaksi')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'transaksi'
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Mutasi</span>
        </button>

        {/* FAB Quick Add for Bendahara */}
        {isBendahara && onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            className="-mt-5 w-11 h-11 rounded-full bg-blue-900 text-amber-400 border-2 border-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            title="Catat Transaksi"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Analisis / Laporan */}
        <button
          type="button"
          onClick={() => onChangeTab('analisis')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'analisis'
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span>Analisis</span>
        </button>

        {/* Kelola (Super Admin only) */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => onChangeTab('kelola')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeTab === 'kelola'
                ? 'text-blue-900 font-extrabold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Kelola</span>
          </button>
        )}

        {/* Akun */}
        <button
          type="button"
          onClick={() => onChangeTab('akun')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'akun'
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Akun</span>
        </button>
      </div>
    </nav>
  );
}
