'use client';

import { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';

interface FinanceCardProps {
  saldoAkhir: number;
  totalMasuk: number;
  totalKeluar: number;
  periodeLabel: string;
  isBendahara: boolean;
  onTambahMasuk?: () => void;
  onTambahKeluar?: () => void;
  onEditSaldoAwal?: () => void;
}

export default function FinanceCard({
  saldoAkhir,
  totalMasuk,
  totalKeluar,
  periodeLabel,
  isBendahara,
  onTambahMasuk,
  onTambahKeluar,
  onEditSaldoAwal,
}: FinanceCardProps) {
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <section className="kas-glass-hero relative overflow-hidden rounded-[24px] p-5 text-white">
      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-[#FFF0A8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFF0A8]" />
            <span>{periodeLabel}</span>
          </div>

          <div className="mt-2.5 text-[11.5px] font-medium text-white/75">
            Saldo Kas Tersedia
          </div>

          <div className="kas-num mt-0.5 text-[26px] font-bold leading-tight text-white sm:text-[28px]">
            {hideBalance ? 'Rp ••••••••' : formatRupiah(saldoAkhir)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHideBalance((prev) => !prev)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white transition-colors hover:bg-white/20"
          aria-label={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
          title={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
        >
          {hideBalance ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Sub-metrik Terpadu (DESIGN.md Pattern 1) */}
      <div className="relative mt-4 grid grid-cols-2 divide-x divide-white/20 border-t border-white/20 pt-3.5">
        <div className="pr-3">
          <div className="flex items-center gap-1 text-[11px] font-medium text-white/75">
            <ArrowDownLeft className="h-3.5 w-3.5 text-[#8EF0C0]" />
            <span>Pemasukan</span>
          </div>
          <div className="kas-num mt-0.5 text-[13.5px] font-semibold text-[#8EF0C0]">
            {hideBalance ? 'Rp ••••••' : formatRupiah(totalMasuk)}
          </div>
        </div>

        <div className="pl-3.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-white/75">
            <ArrowUpRight className="h-3.5 w-3.5 text-[#FFB8C4]" />
            <span>Pengeluaran</span>
          </div>
          <div className="kas-num mt-0.5 text-[13.5px] font-semibold text-[#FFB8C4]">
            {hideBalance ? 'Rp ••••••' : formatRupiah(totalKeluar)}
          </div>
        </div>
      </div>

      {/* Quick Actions Bendahara */}
      {isBendahara && (
        <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/20 pt-3.5">
          <button
            type="button"
            onClick={onTambahMasuk}
            className="flex items-center justify-center gap-1.5 rounded-[14px] border border-white/18 bg-white/12 px-2.5 py-2 text-[11.5px] font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-[#8EF0C0]" />
            <span>Masuk</span>
          </button>

          <button
            type="button"
            onClick={onTambahKeluar}
            className="flex items-center justify-center gap-1.5 rounded-[14px] border border-white/18 bg-white/12 px-2.5 py-2 text-[11.5px] font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-[#FFB8C4]" />
            <span>Keluar</span>
          </button>

          <button
            type="button"
            onClick={onEditSaldoAwal}
            className="flex items-center justify-center gap-1.5 rounded-[14px] border border-white/18 bg-white/12 px-2.5 py-2 text-[11.5px] font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#FFF0A8]" />
            <span>Saldo Awal</span>
          </button>
        </div>
      )}
    </section>
  );
}
