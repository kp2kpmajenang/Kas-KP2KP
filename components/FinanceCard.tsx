'use client';

import { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
} from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#134E4A] via-[#0F766E] to-[#166E68] p-5 text-white shadow-[0_14px_34px_rgba(19,78,74,0.22)]">
      {/* Decorative Glow */}
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#D9B83F]/16 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/8 blur-3xl" />

      {/* Decorative watermark */}
      <div className="pointer-events-none absolute -right-2 -top-2 select-none text-[58px] font-black tracking-tighter text-white/[0.045]">
        KAS
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-5">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <div className="h-1.5 w-6 rounded-full bg-gradient-to-r from-[#F7E7A8] to-[#D9B83F]" />
            <div className="h-1.5 w-2 rounded-full bg-white/40" />
          </div>

          <div className="text-[10px] font-bold tracking-[0.16em] text-white/65 uppercase">
            KAS OPERASIONAL KANTOR
          </div>

          <div className="mt-0.5 text-xs font-bold text-[#F7E7A8]">
            {periodeLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHideBalance(!hideBalance)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/15 text-white transition-colors"
          title={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
        >
          {hideBalance ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Saldo */}
      <div className="relative mb-5">
        <div className="text-[11px] font-medium text-white/60">
          Saldo Kas Tersedia
        </div>

        <div className="mt-1 text-[28px] sm:text-[30px] font-black tracking-tight tabular-nums text-white">
          {hideBalance ? 'Rp ••••••••' : formatRupiah(saldoAkhir)}
        </div>
      </div>

      {/* Quick Actions */}
      {isBendahara && (
        <div className="relative flex items-center gap-2 border-t border-white/12 pt-3">
          <button
            type="button"
            onClick={onTambahMasuk}
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border border-white/8 bg-white/8 hover:bg-white/14 active:bg-white/18 py-2 px-1 text-center transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4 text-[#8BE0C4]" />
            <span className="text-[10px] font-extrabold text-white">
              Masuk
            </span>
          </button>

          <button
            type="button"
            onClick={onTambahKeluar}
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border border-white/8 bg-white/8 hover:bg-white/14 active:bg-white/18 py-2 px-1 text-center transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-[#F3A7A7]" />
            <span className="text-[10px] font-extrabold text-white">
              Keluar
            </span>
          </button>

          <button
            type="button"
            onClick={onEditSaldoAwal}
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border border-white/8 bg-white/8 hover:bg-white/14 active:bg-white/18 py-2 px-1 text-center transition-colors"
          >
            <Settings className="w-4 h-4 text-[#F7E7A8]" />
            <span className="text-[10px] font-extrabold text-white">
              Saldo Awal
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
