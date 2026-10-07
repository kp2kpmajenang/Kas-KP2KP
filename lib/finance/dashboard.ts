import { getSheetRows } from '../google-sheets/sheets';
import { SHEET_TRANSAKSI, COL_TRANSAKSI } from '../google-sheets/constants';
import { getSaldoAwal } from './balance';

export interface HitungKasResult {
  periode: string;
  saldoAwal: number;
  totalMasuk: number;
  totalKeluar: number;
  saldoAkhir: number;
}

export interface DashboardKasResult extends HitungKasResult {
  jumlahTransaksi: number;
  jumlahMasuk: number;
  jumlahKeluar: number;
}

/**
 * Menghitung arus kas (total masuk, keluar, saldo awal, saldo akhir).
 * Porting langsung dari Code.gs: hitungKas()
 */
export async function hitungKas(periode: string): Promise<HitungKasResult> {
  const rows = await getSheetRows(SHEET_TRANSAKSI, 'A2:J');

  let totalMasuk = 0;
  let totalKeluar = 0;

  for (const row of rows) {
    const jenis = String(row[COL_TRANSAKSI.JENIS - 1] || '').trim().toUpperCase();
    const nominal = Number(row[COL_TRANSAKSI.NOMINAL - 1]) || 0;
    const periodeData = String(row[COL_TRANSAKSI.PERIODE - 1] || '').trim();
    const status = String(row[COL_TRANSAKSI.STATUS - 1] || '').trim().toUpperCase();

    if (status !== 'AKTIF' || periodeData !== periode) {
      continue;
    }

    if (jenis === 'MASUK') {
      totalMasuk += nominal;
    } else if (jenis === 'KELUAR') {
      totalKeluar += nominal;
    }
  }

  const saldoAwal = await getSaldoAwal(periode);
  const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

  return {
    periode,
    saldoAwal,
    totalMasuk,
    totalKeluar,
    saldoAkhir,
  };
}

/**
 * Mengambil ringkasan dashboard kas untuk suatu periode.
 * Porting langsung dari Code.gs: getDashboardKas()
 */
export async function getDashboardKas(periode: string): Promise<DashboardKasResult> {
  if (!periode || !/^\d{4}-\d{2}$/.test(periode)) {
    throw new Error('Periode harus menggunakan format YYYY-MM.');
  }

  const rows = await getSheetRows(SHEET_TRANSAKSI, 'A2:J');
  let jumlahMasuk = 0;
  let jumlahKeluar = 0;
  let jumlahTotal = 0;
  let totalMasuk = 0;
  let totalKeluar = 0;

  for (const row of rows) {
    const periodeData = String(row[COL_TRANSAKSI.PERIODE - 1] || '').trim();
    const status = String(row[COL_TRANSAKSI.STATUS - 1] || '').trim().toUpperCase();

    if (status !== 'AKTIF' || periodeData !== periode) {
      continue;
    }

    jumlahTotal++;
    const jenis = String(row[COL_TRANSAKSI.JENIS - 1] || '').trim().toUpperCase();
    const nominal = Number(row[COL_TRANSAKSI.NOMINAL - 1]) || 0;

    if (jenis === 'MASUK') {
      jumlahMasuk++;
      totalMasuk += nominal;
    } else if (jenis === 'KELUAR') {
      jumlahKeluar++;
      totalKeluar += nominal;
    }
  }

  const saldoAwal = await getSaldoAwal(periode);
  const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

  return {
    periode,
    saldoAwal,
    totalMasuk,
    totalKeluar,
    saldoAkhir,
    jumlahTransaksi: jumlahTotal,
    jumlahMasuk,
    jumlahKeluar,
  };
}
