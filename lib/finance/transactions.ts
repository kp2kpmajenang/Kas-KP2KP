import { getSheetRows, appendSheetRow, updateSheetRange } from '../google-sheets/sheets';
import { SHEET_TRANSAKSI, COL_TRANSAKSI, APP_TIMEZONE } from '../google-sheets/constants';
import { formatTanggal, formatTimestamp, formatDateKey } from '../utils/date';
import { catatAuditLog } from '../audit/audit-log';
import { AuthenticatedUser } from '../auth/authorization';

export interface TransaksiItem {
  idTransaksi: string;
  tanggal: string; // dd/MM/yyyy
  rawTanggal: string; // YYYY-MM-DD
  jenis: 'MASUK' | 'KELUAR';
  uraian: string;
  nominal: number;
  keterangan: string;
  periode: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
  status: 'AKTIF' | 'BATAL' | string;
  rowIndex?: number;
}

export interface TambahTransaksiInput {
  tanggal: string; // YYYY-MM-DD
  jenis: 'MASUK' | 'KELUAR' | string;
  uraian: string;
  nominal: number;
  keterangan?: string;
}

/**
 * Generate ID unik transaksi dengan format KAS-YYYYMMDD-001.
 * Porting langsung dari Code.gs: generateIdTransaksi()
 */
export async function generateIdTransaksi(tanggalObj: Date): Promise<string> {
  const tanggalKey = formatDateKey(tanggalObj);
  const prefix = `KAS-${tanggalKey}-`;

  const rows = await getSheetRows(SHEET_TRANSAKSI, 'A2:A');
  let maxNomor = 0;

  for (const row of rows) {
    const id = String(row[0] || '').trim();
    if (id.startsWith(prefix)) {
      const partNum = id.substring(prefix.length);
      const num = parseInt(partNum, 10);
      if (!isNaN(num) && num > maxNomor) {
        maxNomor = num;
      }
    }
  }

  const nomorBaru = maxNomor + 1;
  return `${prefix}${String(nomorBaru).padStart(3, '0')}`;
}

/**
 * Mengambil daftar transaksi dari sheet TRANSAKSI.
 * Porting langsung dari Code.gs: getTransaksi()
 */
export async function getTransaksi(
  periode?: string,
  includeBatal = false
): Promise<TransaksiItem[]> {
  const rows = await getSheetRows(SHEET_TRANSAKSI, 'A2:J');
  const hasil: TransaksiItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = String(row[COL_TRANSAKSI.ID - 1] || '').trim();
    if (!id) continue;

    const periodeData = String(row[COL_TRANSAKSI.PERIODE - 1] || '').trim();
    if (periode && periodeData !== periode) continue;

    const status = String(row[COL_TRANSAKSI.STATUS - 1] || '').trim().toUpperCase();
    if (!includeBatal && status !== 'AKTIF') continue;

    const jenis = String(row[COL_TRANSAKSI.JENIS - 1] || '').trim().toUpperCase() as 'MASUK' | 'KELUAR';
    const rawTgl = row[COL_TRANSAKSI.TANGGAL - 1];

    hasil.push({
      idTransaksi: id,
      tanggal: formatTanggal(rawTgl),
      rawTanggal: String(rawTgl || ''),
      jenis,
      uraian: String(row[COL_TRANSAKSI.URAIAN - 1] || '').trim(),
      nominal: Number(row[COL_TRANSAKSI.NOMINAL - 1]) || 0,
      keterangan: String(row[COL_TRANSAKSI.KETERANGAN - 1] || '').trim(),
      periode: periodeData,
      createdAt: formatTimestamp(row[COL_TRANSAKSI.CREATED_AT - 1]),
      updatedAt: formatTimestamp(row[COL_TRANSAKSI.UPDATED_AT - 1]),
      status,
      rowIndex: i + 2,
    });
  }

  // Urutkan ID terbaru paling atas
  hasil.sort((a, b) => b.idTransaksi.localeCompare(a.idTransaksi));
  return hasil;
}

/**
 * Menambahkan transaksi kas baru ke sheet TRANSAKSI.
 * Dilengkapi retry mechanism untuk pengamanan ID saat konkurensi (Section 12).
 * Porting langsung dari Code.gs: tambahTransaksi()
 */
export async function tambahTransaksi(
  data: TambahTransaksiInput,
  user?: AuthenticatedUser
): Promise<TransaksiItem> {
  if (!data) throw new Error('Data transaksi tidak ditemukan.');
  if (!data.tanggal) throw new Error('Tanggal transaksi wajib diisi.');

  const jenis = String(data.jenis || '').trim().toUpperCase();
  if (jenis !== 'MASUK' && jenis !== 'KELUAR') {
    throw new Error('Jenis transaksi harus MASUK atau KELUAR.');
  }

  const uraian = String(data.uraian || '').trim();
  if (!uraian) throw new Error('Uraian transaksi wajib diisi.');

  const nominal = Number(data.nominal);
  if (isNaN(nominal) || nominal <= 0) {
    throw new Error('Nominal harus berupa angka lebih dari 0.');
  }

  const tanggalDate = new Date(data.tanggal);
  if (isNaN(tanggalDate.getTime())) {
    throw new Error('Format tanggal transaksi tidak valid.');
  }

  // Periode format YYYY-MM di timezone Asia/Jakarta
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(tanggalDate);
  const y = parts.find((p) => p.type === 'year')?.value || '';
  const m = parts.find((p) => p.type === 'month')?.value || '';
  const periode = `${y}-${m}`;

  const keterangan = data.keterangan ? String(data.keterangan).trim() : '';
  const sekarangStr = formatTimestamp(new Date());
  const tanggalFormatStr = formatTanggal(tanggalDate);
  const status = 'AKTIF';

  // Mekanisme retry untuk ID conflict prevention (Master Brief Section 12)
  let idTransaksi = '';
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    idTransaksi = await generateIdTransaksi(tanggalDate);

    // Cek apakah ID sudah terambil
    const existingRows = await getSheetRows(SHEET_TRANSAKSI, 'A2:A');
    const duplicate = existingRows.some((r) => String(r[0] || '').trim() === idTransaksi);

    if (!duplicate) {
      break;
    }
  }

  const rowData = [
    idTransaksi,
    tanggalFormatStr,
    jenis,
    uraian,
    nominal,
    keterangan,
    periode,
    sekarangStr,
    sekarangStr,
    status,
  ];

  await appendSheetRow(SHEET_TRANSAKSI, rowData);

  // Catat Audit Log
  await catatAuditLog(
    'TAMBAH_TRANSAKSI',
    idTransaksi,
    `Transaksi ${jenis} sebesar Rp${nominal} untuk "${uraian}". Periode: ${periode}`,
    '',
    user
  );

  return {
    idTransaksi,
    tanggal: tanggalFormatStr,
    rawTanggal: data.tanggal,
    jenis: jenis as 'MASUK' | 'KELUAR',
    uraian,
    nominal,
    keterangan,
    periode,
    createdAt: sekarangStr,
    updatedAt: sekarangStr,
    status,
  };
}

/**
 * Membatalkan transaksi kas dengan mengubah status menjadi BATAL (Soft delete).
 * Porting langsung dari Code.gs: batalkanTransaksi()
 */
export async function batalkanTransaksi(
  idTransaksi: string,
  user?: AuthenticatedUser
): Promise<{ idTransaksi: string; status: 'BATAL' }> {
  if (!idTransaksi || !String(idTransaksi).trim()) {
    throw new Error('ID transaksi wajib diisi.');
  }

  const targetId = String(idTransaksi).trim();
  const rows = await getSheetRows(SHEET_TRANSAKSI, 'A2:J');

  let targetRowIndex = -1;
  let statusSekarang = '';
  let jenisLama = '';
  let uraianLama = '';
  let nominalLama = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowId = String(rows[i][COL_TRANSAKSI.ID - 1] || '').trim();
    if (rowId === targetId) {
      targetRowIndex = i + 2;
      statusSekarang = String(rows[i][COL_TRANSAKSI.STATUS - 1] || '').trim().toUpperCase();
      jenisLama = String(rows[i][COL_TRANSAKSI.JENIS - 1] || '').trim().toUpperCase();
      uraianLama = String(rows[i][COL_TRANSAKSI.URAIAN - 1] || '').trim();
      nominalLama = Number(rows[i][COL_TRANSAKSI.NOMINAL - 1]) || 0;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error(`Transaksi dengan ID "${targetId}" tidak ditemukan.`);
  }

  if (statusSekarang === 'BATAL') {
    throw new Error(`Transaksi dengan ID "${targetId}" sudah berstatus BATAL.`);
  }

  if (statusSekarang !== 'AKTIF') {
    throw new Error(`Transaksi dengan ID "${targetId}" tidak dapat dibatalkan.`);
  }

  const sekarangStr = formatTimestamp(new Date());

  // Update kolom STATUS (J) dan UPDATED_AT (I)
  await updateSheetRange(
    `'${SHEET_TRANSAKSI}'!I${targetRowIndex}:J${targetRowIndex}`,
    [[sekarangStr, 'BATAL']]
  );

  // Catat Audit Log
  await catatAuditLog(
    'BATAL_TRANSAKSI',
    targetId,
    `Transaksi dibatalkan. Jenis: ${jenisLama}. Nominal: Rp${nominalLama}. Uraian: "${uraianLama}".`,
    '',
    user
  );

  return {
    idTransaksi: targetId,
    status: 'BATAL',
  };
}
