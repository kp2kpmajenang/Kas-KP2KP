import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireAuth, AuthError } from '@/lib/auth/authorization';
import { getDashboardKas } from '@/lib/finance/dashboard';
import { getCurrentPeriode } from '@/lib/utils/date';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    let periode = searchParams.get('periode') || getCurrentPeriode();

    if (!/^\d{4}-\d{2}$/.test(periode)) {
      return apiError('Parameter periode harus berupa format YYYY-MM.', 400);
    }

    const data = await getDashboardKas(periode);
    return apiSuccess(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal memuat dashboard kas.', 500);
  }
}
