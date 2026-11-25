'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import FinanceCard from '@/components/FinanceCard';
import DonutRing from '@/components/DonutRing';
import TransactionCard from '@/components/TransactionCard';
import TransactionTable from '@/components/TransactionTable';
import EmptyState from '@/components/EmptyState';
import { formatRupiah } from '@/lib/utils/format';
import { TransaksiItem } from '@/lib/finance/transactions';
import { DashboardKasResult } from '@/lib/finance/dashboard';
import { NavTab } from '@/components/BottomNavigation';

interface BerandaTabProps {
  dashboardData: DashboardKasResult | null;
  transactions: TransaksiItem[];
  dataLoading: boolean;
  selectedPeriodLabel: string;
  isBendahara: boolean;
  onOpenTxModal: (type: 'MASUK' | 'KELUAR') => void;
  onOpenSaldoModal: () => void;
  onCancelTransaction: (tx: TransaksiItem) => void;
  onChangeTab: (tab: NavTab) => void;
}

export default function BerandaTab({
  dashboardData,
  transactions,
  dataLoading,
  selectedPeriodLabel,
  isBendahara,
  onOpenTxModal,
  onOpenSaldoModal,
  onCancelTransaction,
  onChangeTab,
}: BerandaTabProps) {
  const saldoAwal = dashboardData?.saldoAwal || 0;
  const totalMasuk = dashboardData?.totalMasuk || 0;
  const totalKeluar = dashboardData?.totalKeluar || 0;
  const saldoAkhir = dashboardData?.saldoAkhir || 0;
  const netFlow = totalMasuk - totalKeluar;

  // Rasio serapan pengeluaran terhadap dana tersedia (Saldo Awal + Pemasukan)
  const totalDanaTersedia = saldoAwal + totalMasuk;
  const rasioPengeluaran =
    totalDanaTersedia > 0
      ? (totalKeluar / totalDanaTersedia) * 100
      : totalKeluar > 0
      ? 100
      : 0;

  const statusRasio =
    rasioPengeluaran >= 100
      ? 'Melebihi dana tersedia'
      : rasioPengeluaran >= 80
      ? 'Mendekati batas dana'
      : 'Kondisi kas aman';

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 1. HERO CARD TERPADU */}
      <FinanceCard
        saldoAkhir={saldoAkhir}
        totalMasuk={totalMasuk}
        totalKeluar={totalKeluar}
        periodeLabel={selectedPeriodLabel}
        isBendahara={isBendahara}
        onTambahMasuk={() => onOpenTxModal('MASUK')}
        onTambahKeluar={() => onOpenTxModal('KELUAR')}
        onEditSaldoAwal={onOpenSaldoModal}
      />

      {/* 2. CAROUSEL SWIPEABLE 2,5 KOTAK (DESIGN.md Pattern 3) */}
      <div className="no-scrollbar -mr-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 pr-4 sm:-mr-5 sm:pr-5">
        <div className="kas-tile-gold w-[42%] min-w-[138px] shrink-0 snap-start rounded-[16px] px-3 py-2.5 text-white sm:flex-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-white/85">
            <Wallet className="h-3.5 w-3.5 shrink-0 text-[#FFF0A8]" />
            <span className="truncate">Saldo Awal</span>
          </div>
          <div className="kas-num mt-1.5 truncate text-[13px] font-medium text-white">
            {formatRupiah(saldoAwal)}
          </div>
        </div>

        <div className="kas-tile-income w-[42%] min-w-[138px] shrink-0 snap-start rounded-[16px] px-3 py-2.5 text-white sm:flex-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-white/85">
            <ArrowDownLeft className="h-3.5 w-3.5 shrink-0 text-[#8EF0C0]" />
            <span className="truncate">Pemasukan</span>
          </div>
          <div className="kas-num mt-1.5 truncate text-[13px] font-medium text-white">
            {formatRupiah(totalMasuk)}
          </div>
        </div>

        <div className="kas-tile-expense w-[42%] min-w-[138px] shrink-0 snap-start rounded-[16px] px-3 py-2.5 text-white sm:flex-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-white/85">
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#FFB8C4]" />
            <span className="truncate">Pengeluaran</span>
          </div>
          <div className="kas-num mt-1.5 truncate text-[13px] font-medium text-white">
            {formatRupiah(totalKeluar)}
          </div>
        </div>

        <div className="kas-tile-emerald w-[42%] min-w-[138px] shrink-0 snap-start rounded-[16px] px-3 py-2.5 text-white sm:flex-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-white/85">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#FFF0A8]" />
            <span className="truncate">Arus Bersih</span>
          </div>
          <div className="kas-num mt-1.5 truncate text-[13px] font-medium text-white">
            {netFlow >= 0 ? '+' : ''}
            {formatRupiah(netFlow)}
          </div>
        </div>
      </div>

      {/* 3. KARTU DONUT RING SERAPAN KAS (.kas-glass-clear) */}
      <button
        type="button"
        onClick={() => onChangeTab('analisis')}
        className="kas-glass-clear group flex w-full items-center gap-4 rounded-[20px] p-4 text-left transition-all hover:bg-white/60 active:scale-[0.995]"
      >
        <DonutRing percentage={rasioPengeluaran} label="Terpakai" size={78} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13.5px] font-bold text-[#143632]">
              Serapan Kas Periode Ini
            </h2>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#4E6661] transition-transform group-hover:translate-x-0.5" />
          </div>

          <p className="mt-0.5 text-[11.5px] text-[#4E6661]">
            {statusRasio} · {transactions.length} catatan mutasi
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#4E6661]">
            <span>
              Dana tersedia:{' '}
              <span className="kas-num font-semibold text-[#143632]">
                {formatRupiah(totalDanaTersedia)}
              </span>
            </span>
          </div>
        </div>
      </button>

      {/* 4. MUTASI KAS TERAKHIR (.kas-glass-soft) */}
      <section className="kas-glass-soft rounded-[22px] p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[13.5px] font-bold text-[#143632]">
              Mutasi Kas Terakhir
            </h2>
            <p className="text-[11px] text-[#4E6661]">
              {transactions.length} transaksi pada {selectedPeriodLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChangeTab('transaksi')}
            className="inline-flex items-center gap-0.5 rounded-full bg-[#134E4A]/8 px-2.5 py-1 text-[11.5px] font-semibold text-[#0F766E] transition-colors hover:bg-[#134E4A]/14"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {dataLoading ? (
          <div className="space-y-2.5 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-1.5 animate-pulse"
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-[#143632]/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded-md bg-[#143632]/10" />
                  <div className="h-2.5 w-1/3 rounded-md bg-[#143632]/8" />
                </div>
                <div className="h-3.5 w-20 rounded-md bg-[#143632]/10" />
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="pt-2">
            <EmptyState
              title="Belum ada transaksi"
              description="Tidak ada catatan mutasi kas pada periode ini."
            />
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#143632]/8 sm:hidden">
              {recentTransactions.map((tx) => (
                <TransactionCard
                  key={tx.idTransaksi}
                  transaction={tx}
                  isBendahara={isBendahara}
                  onCancel={onCancelTransaction}
                />
              ))}
            </div>

            <div className="hidden sm:block">
              <TransactionTable
                transactions={recentTransactions}
                isBendahara={isBendahara}
                onCancel={onCancelTransaction}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
