'use client';

import { TransaksiItem } from '@/lib/finance/transactions';
import { formatRupiah } from '@/lib/utils/format';
import { XCircle } from 'lucide-react';

interface TransactionTableProps {
  transactions: TransaksiItem[];
  isBendahara: boolean;
  onCancel?: (tx: TransaksiItem) => void;
}

export default function TransactionTable({
  transactions,
  isBendahara,
  onCancel,
}: TransactionTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12.5px]">
        <thead>
          <tr className="border-b border-[#143632]/10 text-[11px] font-bold text-[#4E6661]">
            <th className="py-2.5 pr-3">Tanggal</th>
            <th className="px-3 py-2.5">ID</th>
            <th className="px-3 py-2.5">Jenis</th>
            <th className="px-3 py-2.5">Uraian</th>
            <th className="py-2.5 pl-3 text-right">Nominal</th>
            {isBendahara && (
              <th className="py-2.5 pl-3 text-center">Aksi</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#143632]/8">
          {transactions.map((tx) => {
            const isMasuk = tx.jenis === 'MASUK';
            const isBatal = tx.status === 'BATAL';

            return (
              <tr
                key={tx.idTransaksi}
                className="transition-colors hover:bg-white/45"
              >
                <td className="whitespace-nowrap py-3 pr-3 text-[12px] font-medium text-[#4E6661]">
                  {tx.tanggal}
                </td>

                <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-[#4E6661]/80">
                  {tx.idTransaksi}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                      isBatal
                        ? 'bg-[#143632]/8 text-[#7A8C88]'
                        : isMasuk
                        ? 'bg-[#0F766E]/12 text-[#0F766E]'
                        : 'bg-[#9F3542]/12 text-[#9F3542]'
                    }`}
                  >
                    {isBatal ? 'BATAL' : isMasuk ? 'MASUK' : 'KELUAR'}
                  </span>
                </td>

                <td className="max-w-xs px-3 py-3">
                  <div
                    className={`text-[13px] font-semibold ${
                      isBatal
                        ? 'text-[#7A8C88] line-through'
                        : 'text-[#143632]'
                    }`}
                  >
                    {tx.uraian}
                  </div>
                  {tx.keterangan && (
                    <div className="mt-0.5 text-[11px] italic text-[#4E6661]/80">
                      {tx.keterangan}
                    </div>
                  )}
                </td>

                <td
                  className={`kas-num whitespace-nowrap py-3 pl-3 text-right text-[13px] font-medium ${
                    isBatal
                      ? 'text-[#7A8C88] line-through'
                      : isMasuk
                      ? 'text-[#0F766E]'
                      : 'text-[#9F3542]'
                  }`}
                >
                  {isMasuk ? '+' : '-'} {formatRupiah(tx.nominal)}
                </td>

                {isBendahara && (
                  <td className="whitespace-nowrap py-3 pl-3 text-center">
                    {!isBatal && onCancel ? (
                      <button
                        type="button"
                        onClick={() => onCancel(tx)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#9F3542]/10 px-2.5 py-1 text-[11px] font-semibold text-[#9F3542] transition-colors hover:bg-[#9F3542]/18"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Batal</span>
                      </button>
                    ) : (
                      <span className="text-[#4E6661]/40">-</span>
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
