'use client';

import { useState } from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Settings } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';

interface FinanceCardProps {
  saldoAkhir: number;
  periodeLabel: string;
  isBendahara: boolean;
  onTambahMasuk?: () => void;
  onTambahKeluar?: () => void;
  onEditSaldoAwal?: () => void;
}

export default function FinanceCard({
  saldoAkhir,
  periodeLabel,
  isBendahara,
  onTambahMasuk,
  onTambahKeluar,
  onEditSaldoAwal,
}: FinanceCardProps) {
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-5 text-white shadow-lg shadow-blue-950/20">
      {/* Background Watermark */}
      <div className="pointer-events-none absolute -right-3 -top-4 select-none text-7xl font-black tracking-tighter text-white/5">
        KP2KP
      </div>

      {/* Chip and Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-6 w-8 rounded-sm bg-gradient-to-tr from-amber-500 to-amber-300 shadow-xs mb-1.5" />
          <div className="text-[10px] font-bold tracking-wider text-blue-200 uppercase">
            KAS OPERASIONAL KANTOR
          </div>
          <div className="text-xs font-semibold text-amber-400">
            {periodeLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHideBalance(!hideBalance)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
        >
          {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Saldo Display */}
      <div className="mb-4">
        <div className="text-[11px] font-medium text-blue-200">
          Saldo Kas Tersedia
        </div>
        <div className="mt-1 text-[28px] sm:text-[30px] font-black tracking-tight tabular-nums text-white">
          {hideBalance ? 'Rp ••••••••' : formatRupiah(saldoAkhir)}
        </div>
      </div>

      {/* Quick Action Buttons for Bendahara */}
      {isBendahara && (
        <div className="flex items-center gap-2 border-t border-white/15 pt-3">
          <button
            type="button"
            onClick={onTambahMasuk}
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 py-2 px-1 text-center transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-extrabold text-white">Masuk</span>
          </button>

          <button
            type="button"
            onClick={onTambahKeluar}
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 py-2 px-1 text-center transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] font-extrabold text-white">Keluar</span>
          </button>

          <button
            type="button"
            onClick={onEditSaldoAwal}
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 py-2 px-1 text-center transition-colors"
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span className="text-[10px] font-extrabold text-white">Saldo Awal</span>
          </button>
        </div>
      )}
    </div>
  );
}
