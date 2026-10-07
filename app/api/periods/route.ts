import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireAuth, AuthError } from '@/lib/auth/authorization';
import { getPeriodeDropdown } from '@/lib/finance/periods';

export async function GET() {
  try {
    await requireAuth();
    const periods = await getPeriodeDropdown();
    return apiSuccess(periods);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal memuat daftar periode.', 500);
  }
}
