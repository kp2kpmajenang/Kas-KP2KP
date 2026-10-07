import { APP_TIMEZONE } from '../google-sheets/constants';

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format tanggal ke dd/MM/yyyy (Asia/Jakarta)
 */
export function formatTanggal(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format timestamp ke dd/MM/yyyy HH:mm:ss (Asia/Jakarta)
 */
export function formatTimestamp(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);

  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

/**
 * Format periode '2026-05' menjadi 'Mei 2026'
 */
export function formatPeriode(periode: string): string {
  if (!periode || !/^\d{4}-\d{2}$/.test(periode)) {
    return periode || '';
  }
  const [tahun, bulanStr] = periode.split('-');
  const bulanIndex = parseInt(bulanStr, 10) - 1;
  const namaBulan = NAMA_BULAN[bulanIndex] || bulanStr;
  return `${namaBulan} ${tahun}`;
}

/**
 * Mendapatkan string periode sebelumnya (format YYYY-MM).
 * Porting langsung dari Code.gs: getPeriodeSebelumnya()
 * Contoh: '2026-06' -> '2026-05', '2026-01' -> '2025-12'
 */
export function getPeriodeSebelumnya(periode: string): string {
  const parts = periode.split('-');
  let tahun = parseInt(parts[0], 10);
  let bulan = parseInt(parts[1], 10);

  bulan--;
  if (bulan < 1) {
    bulan = 12;
    tahun--;
  }

  return `${tahun}-${String(bulan).padStart(2, '0')}`;
}

/**
 * Mendapatkan periode saat ini dalam format YYYY-MM (Asia/Jakarta)
 */
export function getCurrentPeriode(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);

  const year = parts.find((p) => p.type === 'year')?.value || `${now.getFullYear()}`;
  const month = parts.find((p) => p.type === 'month')?.value || `${now.getMonth() + 1}`.padStart(2, '0');

  return `${year}-${month}`;
}

/**
 * Format tanggal YYYYMMDD untuk ID Transaksi (Asia/Jakarta)
 */
export function formatDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';

  return `${year}${month}${day}`;
}

/**
 * Mengembalikan tanggal dalam format YYYY-MM-DD.
 * Client-safe: tidak mengimpor modul server.
 * Catatan: Selalu berikan Date eksplisit — jangan andalkan default parameter
 * agar tidak dipanggil saat prerender Next.js.
 */
export function formatTanggalLokal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
