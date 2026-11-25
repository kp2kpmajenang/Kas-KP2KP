'use client';

import { Plus, Search, X } from 'lucide-react';
import TransactionCard from '@/components/TransactionCard';
import TransactionTable from '@/components/TransactionTable';
import EmptyState from '@/components/EmptyState';
import { formatRupiah } from '@/lib/utils/format';
import { TransaksiItem } from '@/lib/finance/transactions';

interface TransaksiTabProps {
  transactions: TransaksiItem[];
  dataLoading: boolean;
  selectedPeriodLabel: string;
  searchTx: string;
  onSearchChange: (value: string) => void;
  filterJenisTx: 'SEMUA' | 'MASUK' | 'KELUAR';
  onFilterJenisChange: (value: 'SEMUA' | 'MASUK' | 'KELUAR') => void;
  isBendahara: boolean;
  onOpenTxModal: (type: 'MASUK' | 'KELUAR') => void;
  onCancelTransaction: (tx: TransaksiItem) => void;
}

export default function TransaksiTab({
  transactions,
  dataLoading,
  selectedPeriodLabel,
  searchTx,
  onSearchChange,
  filterJenisTx,
  onFilterJenisChange,
  isBendahara,
  onOpenTxModal,
  onCancelTransaction,
}: TransaksiTabProps) {
  const filteredTransactions = transactions.filter((tx) => {
    const kw = searchTx.trim().toLowerCase();
    const matchKw =
      !kw ||
      tx.uraian.toLowerCase().includes(kw) ||
      tx.idTransaksi.toLowerCase().includes(kw) ||
      (tx.keterangan || '').toLowerCase().includes(kw);

    const matchJenis =
      filterJenisTx === 'SEMUA' || tx.jenis === filterJenisTx;

    return matchKw && matchJenis;
  });

  const activeFiltered = filteredTransactions.filter(
    (tx) => tx.status !== 'BATAL'
  );
  const sumMasuk = activeFiltered
    .filter((tx) => tx.jenis === 'MASUK')
    .reduce((acc, tx) => acc + (Number(tx.nominal) || 0), 0);
  const sumKeluar = activeFiltered
    .filter((tx) => tx.jenis === 'KELUAR')
    .reduce((acc, tx) => acc + (Number(tx.nominal) || 0), 0);

  return (
    <div className="space-y-3.5">
      {/* Header Judul + Tombol Catat */}
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-[19px] font-bold leading-tight text-[#143632]">
            Mutasi Kas
          </h1>
          <p className="mt-0.5 text-[11.5px] text-[#4E6661]">
            Periode {selectedPeriodLabel} · {filteredTransactions.length} data
          </p>
        </div>

        {isBendahara && (
          <button
            type="button"
            onClick={() => onOpenTxModal('MASUK')}
            className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#134E4A] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(19,78,74,0.34)] transition-all hover:bg-[#0F766E] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Catat</span>
          </button>
        )}
      </div>

      {/* Search Bar & Segmented Tabs (.kas-glass-clear) */}
      <div className="space-y-2.5">
        <div className="kas-glass-clear relative flex items-center rounded-[16px] px-3.5">
          <Search className="h-4 w-4 shrink-0 text-[#4E6661]" />
          <input
            type="text"
            placeholder="Cari uraian, keterangan, atau ID..."
            value={searchTx}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full bg-transparent px-2.5 text-[13px] text-[#143632] outline-none placeholder:text-[#4E6661]/60"
          />
          {searchTx && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="rounded-full p-1 text-[#4E6661] hover:bg-white/60 hover:text-[#143632]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Filter */}
        <div className="kas-glass-clear grid grid-cols-3 gap-1 rounded-[16px] p-1">
          {(
            [
              { value: 'SEMUA', label: 'Semua' },
              { value: 'MASUK', label: 'Uang Masuk' },
              { value: 'KELUAR', label: 'Uang Keluar' },
            ] as const
          ).map((item) => {
            const active = filterJenisTx === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterJenisChange(item.value)}
                className={`rounded-[12px] py-1.5 text-[12px] transition-all ${
                  active
                    ? 'bg-[#134E4A] font-semibold text-white shadow-sm'
                    : 'font-medium text-[#4E6661] hover:text-[#143632]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ringkasan Cepat Filter */}
      {filteredTransactions.length > 0 && (
        <div className="kas-glass-gold grid grid-cols-2 divide-x divide-[#143632]/10 rounded-[16px] px-3.5 py-2.5">
          <div className="pr-3">
            <div className="text-[10.5px] font-medium text-[#5E4706]">
              Total Masuk (Aktif)
            </div>
            <div className="kas-num mt-0.5 text-[12.5px] font-semibold text-[#0F766E]">
              {formatRupiah(sumMasuk)}
            </div>
          </div>
          <div className="pl-3">
            <div className="text-[10.5px] font-medium text-[#5E4706]">
              Total Keluar (Aktif)
            </div>
            <div className="kas-num mt-0.5 text-[12.5px] font-semibold text-[#9F3542]">
              {formatRupiah(sumKeluar)}
            </div>
          </div>
        </div>
      )}

      {/* Daftar Mutasi (.kas-glass-soft) */}
      <section className="kas-glass-soft rounded-[22px] p-4">
        {dataLoading ? (
          <div className="space-y-2.5 py-2">
            {[1, 2, 3, 4].map((i) => (
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
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi yang cocok"
            description="Coba ubah kata kunci pencarian atau pilih filter arus kas lainnya."
          />
        ) : (
          <>
            <div className="divide-y divide-[#143632]/8 sm:hidden">
              {filteredTransactions.map((tx) => (
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
                transactions={filteredTransactions}
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
