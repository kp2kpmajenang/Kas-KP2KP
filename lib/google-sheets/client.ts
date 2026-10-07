import { google } from 'googleapis';

let sheetsClientInstance: ReturnType<typeof google.sheets> | null = null;

export function getSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Konfigurasi server tidak lengkap: GOOGLE_SHEET_ID belum diatur.');
  }
  return spreadsheetId;
}

export function getGoogleSheetsClient() {
  if (sheetsClientInstance) {
    return sheetsClientInstance;
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !rawPrivateKey) {
    throw new Error(
      'Kredensial Google Service Account belum diatur. Pastikan GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_PRIVATE_KEY tersedia di environment variables.'
    );
  }

  // Handle escaped \n from Vercel/environment strings
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClientInstance = google.sheets({ version: 'v4', auth });
  return sheetsClientInstance;
}
