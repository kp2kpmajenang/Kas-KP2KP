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
    <div className="w-full overflow-x-auto border border-[#E7E6DB] rounded-2xl bg-white shadow-[0_2px_12px_rgba(19,78,74,0.03)]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-[#FFFDF5] border-b border-[#E7E6DB] text-[#687772] font-bold uppercase text-[10px] tracking-wider">
            <th className="py-2.5 px-3.5">Tanggal</th>
            <th className="py-2.5 px-3">ID Transaksi</th>
            <th className="py-2.5 px-3">Jenis</th>
            <th className="py-2.5 px-3">Uraian</th>
            <th className="py-2.5 px-3.5 text-right">
              Nominal
            </th>

            {isBendahara && (
              <th className="py-2.5 px-3 text-center">
                Aksi
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F0EFE7]">
          {transactions.map((tx) => {
            const isMasuk = tx.jenis === 'MASUK';
            const isBatal = tx.status === 'BATAL';

            return (
              <tr
                key={tx.idTransaksi}
                className="hover:bg-[#FFFDF5] transition-colors"
              >
                <td className="py-3 px-3.5 whitespace-nowrap text-[#687772] font-medium">
                  {tx.tanggal}
                </td>

                <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#9AA19D]">
                  {tx.idTransaksi}
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isBatal
                        ? 'bg-[#F1F2EE] text-[#777E7A]'
                        : isMasuk
                        ? 'bg-[#E5F4F0] text-[#0F766E]'
                        : 'bg-[#FBEDED] text-[#B85454]'
                    }`}
                  >
                    {isMasuk ? 'MASUK' : 'KELUAR'}
                  </span>
                </td>

                <td className="py-3 px-3 text-[#29443F] font-semibold max-w-xs">
                  <div>{tx.uraian}</div>

                  {tx.keterangan && (
                    <div className="text-[10px] text-[#9AA19D] font-normal italic">
                      {tx.keterangan}
                    </div>
                  )}
                </td>

                <td
                  className={`py-3 px-3.5 text-right font-black tabular-nums whitespace-nowrap ${
                    isBatal
                      ? 'text-[#A1A6A3] line-through'
                      : isMasuk
                      ? 'text-[#0F766E]'
                      : 'text-[#C65B5B]'
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
                        onClick={() =>
                          onCancel(tx.idTransaksi)
                        }
                        className="text-[11px] font-bold text-[#B85454] hover:text-[#923D3D] bg-[#FBEDED] hover:bg-[#F6DDDD] px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Batal</span>
                      </button>
                    ) : (
                      <span className="text-[#C8CCC8]">-</span>
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
