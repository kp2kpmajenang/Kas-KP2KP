import { apiSuccess, apiError } from '@/lib/utils/response';
import { verifyDatabaseSheets } from '@/lib/google-sheets/sheets';

export async function GET() {
  try {
    const result = await verifyDatabaseSheets();
    if (!result.success) {
      return apiError(
        `Database belum lengkap. Sheet yang belum ditemukan: ${result.missingSheets.join(', ')}`,
        500
      );
    }

    return apiSuccess({
      status: 'OK',
      message: 'Koneksi ke Google Sheets API berhasil.',
      sheetsFound: result.sheetsFound,
    });
  } catch (err: any) {
    return apiError(err.message || 'Gagal terhubung ke Google Sheets API.', 500);
  }
}
