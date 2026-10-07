'use client';

import { TransaksiItem } from '@/lib/finance/transactions';
import { formatRupiah } from '@/lib/utils/format';
import { XCircle } from 'lucide-react';

interface TransactionTableProps {
  transactions: TransaksiItem[];
  isBendahara: boolean;
  onCancel?: (id: string) => void;
}

export default function TransactionTable({
  transactions,
  isBendahara,
  onCancel,
}: TransactionTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
            <th className="py-2.5 px-3.5">Tanggal</th>
            <th className="py-2.5 px-3">ID Transaksi</th>
            <th className="py-2.5 px-3">Jenis</th>
            <th className="py-2.5 px-3">Uraian</th>
            <th className="py-2.5 px-3.5 text-right">Nominal</th>
            {isBendahara && <th className="py-2.5 px-3 text-center">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isMasuk = tx.jenis === 'MASUK';
            const isBatal = tx.status === 'BATAL';

            return (
              <tr key={tx.idTransaksi} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 font-medium">
                  {tx.tanggal}
                </td>
                <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                  {tx.idTransaksi}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isBatal
                        ? 'bg-slate-100 text-slate-500'
                        : isMasuk
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isMasuk ? 'MASUK' : 'KELUAR'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-800 font-semibold max-w-xs">
                  <div>{tx.uraian}</div>
                  {tx.keterangan && (
                    <div className="text-[10px] text-slate-400 font-normal italic">
                      {tx.keterangan}
                    </div>
                  )}
                </td>
                <td
                  className={`py-3 px-3.5 text-right font-black tabular-nums whitespace-nowrap ${
                    isBatal
                      ? 'text-slate-400 line-through'
                      : isMasuk
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {isMasuk ? '+ ' : '- '}
                  {formatRupiah(tx.nominal)}
                </td>
                {isBendahara && (
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {!isBatal && onCancel ? (
                      <button
                        type="button"
                        onClick={() => onCancel(tx.idTransaksi)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Batal</span>
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
