import { getSheetRows } from '../google-sheets/sheets';
import { SHEET_SALDO_AWAL, SHEET_TRANSAKSI, COL_TRANSAKSI } from '../google-sheets/constants';
import { formatPeriode } from '../utils/date';

export interface PeriodeItem {
  periode: string;
  label: string;
}

/**
 * Mengambil seluruh daftar periode unik dari sheet SALDO_AWAL dan TRANSAKSI.
 * Porting langsung dari Code.gs: getDaftarPeriode()
 */
export async function getDaftarPeriode(): Promise<string[]> {
  const periodeSet = new Set<string>();

  // Baca dari SALDO_AWAL
  try {
    const rowsSaldo = await getSheetRows(SHEET_SALDO_AWAL, 'A2:A');
    for (const row of rowsSaldo) {
      const p = String(row[0] || '').trim();
      if (/^\d{4}-\d{2}$/.test(p)) {
        periodeSet.add(p);
      }
    }
  } catch (err) {
    console.error('Error reading SALDO_AWAL periods:', err);
  }

  // Baca dari TRANSAKSI kolom PERIODE (Kolom G)
  try {
    const rowsTransaksi = await getSheetRows(
      SHEET_TRANSAKSI,
      `G2:G`
    );
    for (const row of rowsTransaksi) {
      const p = String(row[0] || '').trim();
      if (/^\d{4}-\d{2}$/.test(p)) {
        periodeSet.add(p);
      }
    }
  } catch (err) {
    console.error('Error reading TRANSAKSI periods:', err);
  }

  const list = Array.from(periodeSet);
  // Urutkan dari yang terbaru ke yang terlama
  list.sort((a, b) => b.localeCompare(a));
  return list;
}

/**
 * Mengambil daftar periode untuk dropdown frontend.
 * Porting langsung dari Code.gs: getPeriodeDropdown()
 */
export async function getPeriodeDropdown(): Promise<PeriodeItem[]> {
  const daftar = await getDaftarPeriode();
  return daftar.map((p) => ({
    periode: p,
    label: formatPeriode(p),
  }));
}
