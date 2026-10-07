'use client';

import { ArrowDownLeft, ArrowUpRight, XCircle } from 'lucide-react';
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
    <div className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors shadow-2xs">
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isBatal
            ? 'bg-slate-100 text-slate-400'
            : isMasuk
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-600'
        }`}
      >
        {isMasuk ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
      </div>

      {/* Middle: Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {transaction.uraian}
          </span>
          {isBatal && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-red-100 text-red-700 rounded-sm">
              BATAL
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
          <span>{transaction.tanggal}</span>
          <span>•</span>
          <span className="font-mono text-[10px] text-slate-400">{transaction.idTransaksi}</span>
        </div>
        {transaction.keterangan && (
          <div className="text-[10px] text-slate-400 italic truncate mt-0.5">
            {transaction.keterangan}
          </div>
        )}
      </div>

      {/* Right: Nominal & Action */}
      <div className="text-right shrink-0">
        <div
          className={`text-xs sm:text-sm font-black tabular-nums ${
            isBatal
              ? 'text-slate-400 line-through'
              : isMasuk
              ? 'text-emerald-600'
              : 'text-rose-600'
          }`}
        >
          {isMasuk ? '+ ' : '- '}
          {formatRupiah(transaction.nominal)}
        </div>

        {isBendahara && !isBatal && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(transaction.idTransaksi)}
            className="mt-1 text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-sm inline-flex items-center gap-1 transition-colors"
          >
            <XCircle className="w-3 h-3" />
            <span>Batal</span>
          </button>
        )}
      </div>
    </div>
  );
}
