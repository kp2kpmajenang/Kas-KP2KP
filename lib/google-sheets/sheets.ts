import { getGoogleSheetsClient, getSpreadsheetId } from './client';
import { REQUIRED_SHEETS } from './constants';

/**
 * Membaca semua baris dari sheet tertentu (mulai baris 2 atau dari range tertentu).
 */
export async function getSheetRows(sheetName: string, range = 'A2:Z'): Promise<any[][]> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!${range}`,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  return (response.data.values as any[][]) || [];
}

/**
 * Menambahkan satu baris data ke sheet tertentu.
 */
export async function appendSheetRow(sheetName: string, rowData: any[]): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [rowData],
    },
  });
}

/**
 * Mengubah range baris atau sel tertentu di Google Sheets.
 */
export async function updateSheetRange(rangeWithSheet: string, values: any[][]): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: rangeWithSheet,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

/**
 * Batch read untuk efisiensi request: mengambil beberapa range dalam 1 network trip.
 */
export async function batchGetSheetRanges(ranges: string[]): Promise<{ [range: string]: any[][] }> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  const result: { [range: string]: any[][] } = {};
  if (response.data.valueRanges) {
    for (const vr of response.data.valueRanges) {
      if (vr.range) {
        result[vr.range] = (vr.values as any[][]) || [];
      }
    }
  }
  return result;
}

/**
 * Memastikan semua 5 sheet wajib (MASTER, SALDO_AWAL, TRANSAKSI, USER, AUDIT_LOG) tersedia.
 */
export async function verifyDatabaseSheets(): Promise<{
  success: boolean;
  sheetsFound: string[];
  missingSheets: string[];
}> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  const existingSheetTitles = (metadata.data.sheets || [])
    .map((s) => s.properties?.title || '')
    .filter(Boolean);

  const missing = REQUIRED_SHEETS.filter((req) => !existingSheetTitles.includes(req));

  return {
    success: missing.length === 0,
    sheetsFound: existingSheetTitles,
    missingSheets: missing,
  };
}
