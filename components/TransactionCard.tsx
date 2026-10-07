'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  XCircle,
} from 'lucide-react';

import { formatRupiah } from '@/lib/utils/format';
import { TransaksiItem } from '@/lib/finance/transactions';

interface TransactionCardProps {
  transaction: TransaksiItem;
  isBendahara: boolean;
  onCancel?: (id: string) => void;
}

export default function TransactionCard({
  transaction,
  isBendahara,
  onCancel,
}: TransactionCardProps) {
  const isMasuk = transaction.jenis === 'MASUK';
  const isBatal = transaction.status === 'BATAL';

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-[#EAE9DD] hover:border-[#CFE1DD] transition-colors shadow-[0_2px_10px_rgba(19,78,74,0.03)]">
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isBatal
            ? 'bg-[#F2F3EE] text-[#9AA19D]'
            : isMasuk
            ? 'bg-[#E5F4F0] text-[#0F766E]'
            : 'bg-[#FBEDED] text-[#C65B5B]'
        }`}
      >
        {isMasuk ? (
          <ArrowDownLeft className="w-5 h-5" />
        ) : (
          <ArrowUpRight className="w-5 h-5" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            title={transaction.uraian}
            className="text-xs sm:text-sm font-bold text-[#233E3A] truncate"
          >
            {transaction.uraian}
          </span>

          {isBatal && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#F1EEEE] text-[#8C6A6A] rounded-sm shrink-0">
              BATAL
            </span>
          )}
        </div>

        <div className="text-[11px] text-[#7F8985] flex items-center gap-2 mt-0.5">
          <span>{transaction.tanggal}</span>
          <span>•</span>
          <span className="font-mono text-[10px] text-[#A0A7A3] truncate">
            {transaction.idTransaksi}
          </span>
        </div>

        {transaction.keterangan && (
          <div
            title={transaction.keterangan}
            className="text-[10px] text-[#9AA19D] italic truncate mt-0.5"
          >
            {transaction.keterangan}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <div
          className={`text-xs sm:text-sm font-black tabular-nums ${
            isBatal
              ? 'text-[#A1A6A3] line-through'
              : isMasuk
              ? 'text-[#0F766E]'
              : 'text-[#C65B5B]'
          }`}
        >
          {isMasuk ? '+ ' : '- '}
          {formatRupiah(transaction.nominal)}
        </div>

        {isBendahara && !isBatal && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(transaction.idTransaksi)}
            className="mt-1 text-[10px] font-bold text-[#B85454] hover:text-[#923D3D] bg-[#FBEDED] hover:bg-[#F6DDDD] px-2 py-0.5 rounded-md inline-flex items-center gap-1 transition-colors"
            title="Batalkan transaksi"
          >
            <XCircle className="w-3 h-3" />
            <span>Batal</span>
          </button>
        )}
      </div>
    </div>
  );
}
