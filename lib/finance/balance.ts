import { getSheetRows, appendSheetRow, updateSheetRange } from '../google-sheets/sheets';
import { SHEET_SALDO_AWAL, BULAN_AWAL_SISTEM } from '../google-sheets/constants';
import { getPeriodeSebelumnya } from '../utils/date';
import { hitungKas } from './dashboard';
import { catatAuditLog } from '../audit/audit-log';
import { AuthenticatedUser } from '../auth/authorization';

export interface DetailSaldoAwal {
  periode: string;
  saldoAwal: number;
  keterangan: string;
}

/**
 * Mengambil saldo awal untuk suatu periode secara otomatis.
 * Porting langsung dari Code.gs: getSaldoAwal()
 * 1. Cek pengaturan manual di SALDO_AWAL
 * 2. Jika tidak ada dan merupakan bulan awal sistem (2026-05) -> return 0
 * 3. Ambil dari Saldo Akhir bulan sebelumnya secara berkelanjutan
 */
export async function getSaldoAwal(periode: string): Promise<number> {
  const rowsSaldo = await getSheetRows(SHEET_SALDO_AWAL, 'A2:C');

  // 1. Cek apakah ada input manual di sheet SALDO_AWAL
  for (const row of rowsSaldo) {
    const periodeData = String(row[0] || '').trim();
    if (periodeData === periode) {
      const nilaiManual = Number(row[1]);
      if (!isNaN(nilaiManual) && nilaiManual !== 0) {
        return nilaiManual;
      }
    }
  }

  // Jika ini adalah bulan awal sistem dan tanpa input manual
  if (periode === BULAN_AWAL_SISTEM) {
    return 0;
  }

  // 2. Ambil dari saldo akhir bulan sebelumnya
  const periodePrev = getPeriodeSebelumnya(periode);
  if (periodePrev < BULAN_AWAL_SISTEM) {
    return 0;
  }

  // Hitung kas bulan sebelumnya untuk memperoleh saldo akhir
  const hitungPrev = await hitungKas(periodePrev);
  return hitungPrev.saldoAkhir;
}

/**
 * Mengambil informasi detail saldo awal untuk suatu periode.
 * Porting langsung dari Code.gs: getDetailSaldoAwal()
 */
export async function getDetailSaldoAwal(periode: string): Promise<DetailSaldoAwal> {
  if (!periode) throw new Error('Periode wajib diisi.');

  const rows = await getSheetRows(SHEET_SALDO_AWAL, 'A2:C');
  for (const row of rows) {
    const rowPeriode = String(row[0] || '').trim();
    if (rowPeriode === periode.trim()) {
      return {
        periode: rowPeriode,
        saldoAwal: Number(row[1]) || 0,
        keterangan: String(row[2] || ''),
      };
    }
  }

  // Jika tidak ada di sheet, hitung saldo awal otomatisnya
  const autoSaldo = await getSaldoAwal(periode);
  return {
    periode,
    saldoAwal: autoSaldo,
    keterangan: '',
  };
}

export interface EditSaldoAwalInput {
  periode: string;
  saldoAwal: number;
  keterangan?: string;
}

/**
 * Menambah atau memperbarui saldo awal pada sheet SALDO_AWAL.
 * Porting langsung dari Code.gs: editSaldoAwal()
 */
export async function editSaldoAwal(
  data: EditSaldoAwalInput,
  user?: AuthenticatedUser
): Promise<DetailSaldoAwal> {
  if (!data) throw new Error('Data saldo awal tidak ditemukan.');

  const periode = String(data.periode || '').trim();
  const saldoAwal = Number(data.saldoAwal);
  const keterangan = String(data.keterangan || '').trim();

  if (!periode) throw new Error('Periode wajib diisi.');
  if (!/^\d{4}-\d{2}$/.test(periode)) throw new Error('Format periode harus YYYY-MM.');
  if (isNaN(saldoAwal) || saldoAwal < 0) {
    throw new Error('Saldo awal harus berupa angka 0 atau lebih.');
  }

  const rows = await getSheetRows(SHEET_SALDO_AWAL, 'A2:C');
  let targetRowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    const rowPeriode = String(rows[i][0] || '').trim();
    if (rowPeriode === periode) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex !== -1) {
    // Update baris yang sudah ada
    await updateSheetRange(`'${SHEET_SALDO_AWAL}'!B${targetRowIndex}:C${targetRowIndex}`, [
      [[saldoAwal, keterangan]],
    ]);
  } else {
    // Append baris baru
    await appendSheetRow(SHEET_SALDO_AWAL, [periode, saldoAwal, keterangan]);
  }

  // Catat ke Audit Log
  await catatAuditLog(
    'EDIT_SALDO_AWAL',
    periode,
    `Saldo awal diubah menjadi Rp${saldoAwal}. Keterangan: ${keterangan || '-'}`,
    '',
    user
  );

  return {
    periode,
    saldoAwal,
    keterangan,
  };
}
