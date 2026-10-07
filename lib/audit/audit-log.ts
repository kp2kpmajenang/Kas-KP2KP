import crypto from 'crypto';
import { appendSheetRow, getSheetRows } from '../google-sheets/sheets';
import { SHEET_AUDIT_LOG, APP_TIMEZONE } from '../google-sheets/constants';
import { formatTimestamp } from '../utils/date';
import { AuthenticatedUser } from '../auth/authorization';

export interface AuditLogEntry {
  idLog: string;
  waktu: string;
  username: string;
  nama: string;
  aksi: string;
  target: string;
  detail: string;
  info: string;
}

/**
 * Generate ID unik Audit Log.
 * Porting langsung dari Code.gs: generateIdAuditLog()
 * Format: LOG-YYYYMMDD-HHmmss-XXXXXXXX
 */
export function generateIdAuditLog(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  const timestamp = `${get('year')}${get('month')}${get('day')}-${get('hour')}${get('minute')}${get('second')}`;
  const randomSuffix = crypto.randomUUID().substring(0, 8).toUpperCase();

  return `LOG-${timestamp}-${randomSuffix}`;
}

/**
 * Mencatat aktivitas penting ke sheet AUDIT_LOG.
 * Password dan password hash TIDAK PERNAH dicatat.
 * Porting langsung dari Code.gs: catatAuditLog()
 */
export async function catatAuditLog(
  aksi: string,
  target: string,
  detail: string,
  info = '',
  user?: AuthenticatedUser | null
): Promise<string> {
  const idLog = generateIdAuditLog();
  const waktuStr = formatTimestamp(new Date());

  const username = user ? user.username : '';
  const nama = user ? user.nama : '';

  try {
    await appendSheetRow(SHEET_AUDIT_LOG, [
      idLog,
      waktuStr,
      username,
      nama,
      aksi || '',
      target || '',
      detail || '',
      info || '',
    ]);
  } catch (err) {
    // Sesuai Code.gs: kegagalan audit tidak boleh menggagalkan proses utama
    console.error('Audit log write error:', err);
  }

  return idLog;
}

/**
 * Mengambil seluruh data audit log (data terbaru di atas).
 * Porting langsung dari Code.gs: getAuditLog()
 */
export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const rows = await getSheetRows(SHEET_AUDIT_LOG, 'A2:H');

  const result: AuditLogEntry[] = rows.map((row) => ({
    idLog: String(row[0] || ''),
    waktu: String(row[1] || ''),
    username: String(row[2] || ''),
    nama: String(row[3] || ''),
    aksi: String(row[4] || ''),
    target: String(row[5] || ''),
    detail: String(row[6] || ''),
    info: String(row[7] || ''),
  }));

  // Urutkan dari data paling baru ke paling lama
  result.reverse();
  return result;
}
