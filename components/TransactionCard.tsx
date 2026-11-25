'use client';

import { ArrowDownLeft, ArrowUpRight, XCircle } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';
import { TransaksiItem } from '@/lib/finance/transactions';

interface TransactionCardProps {
  transaction: TransaksiItem;
  isBendahara: boolean;
  onCancel?: (tx: TransaksiItem) => void;
}

export default function TransactionCard({
  transaction,
  isBendahara,
  onCancel,
}: TransactionCardProps) {
  const isMasuk = transaction.jenis === 'MASUK';
  const isBatal = transaction.status === 'BATAL';

  return (
    <div className="flex items-center justify-between gap-3 py-3 transition-colors">
      {/* Orb Ikon Kaca */}
      <div
        className={`kas-glass-orb flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isBatal
            ? 'text-[#7A8C88]'
            : isMasuk
            ? 'text-[#0F766E]'
            : 'text-[#9F3542]'
        }`}
      >
        {isMasuk ? (
          <ArrowDownLeft className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
      </div>

      {/* Detail */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            title={transaction.uraian}
            className={`truncate text-[13px] font-semibold ${
              isBatal ? 'text-[#7A8C88] line-through' : 'text-[#143632]'
            }`}
          >
            {transaction.uraian}
          </span>

          {isBatal && (
            <span className="shrink-0 rounded-md bg-[#9F3542]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#9F3542]">
              Batal
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#4E6661]">
          <span>{transaction.tanggal}</span>
          <span className="opacity-40">•</span>
          <span className="truncate font-mono text-[10.5px] opacity-80">
            {transaction.idTransaksi}
          </span>
        </div>

        {transaction.keterangan && (
          <div
            title={transaction.keterangan}
            className="mt-0.5 truncate text-[11px] italic text-[#4E6661]/80"
          >
            {transaction.keterangan}
          </div>
        )}
      </div>

      {/* Nominal & Aksi */}
      <div className="shrink-0 text-right">
        <div
          className={`kas-num text-[13px] font-medium ${
            isBatal
              ? 'text-[#7A8C88] line-through'
              : isMasuk
              ? 'text-[#0F766E]'
              : 'text-[#9F3542]'
          }`}
        >
          {isMasuk ? '+' : '-'} {formatRupiah(transaction.nominal)}
        </div>

        {isBendahara && !isBatal && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(transaction)}
            className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[#9F3542]/10 px-2 py-0.5 text-[10.5px] font-semibold text-[#9F3542] transition-colors hover:bg-[#9F3542]/18"
            title="Batalkan transaksi"
          >
            <XCircle className="h-3 w-3" />
            <span>Batal</span>
          </button>
        )}
      </div>
    </div>
  );
}
