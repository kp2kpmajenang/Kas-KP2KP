import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireAuth, requireRole, AuthError } from '@/lib/auth/authorization';
import { getDetailSaldoAwal, editSaldoAwal } from '@/lib/finance/balance';
import { SaldoAwalInputSchema } from '@/lib/validation/validation';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const periode = searchParams.get('periode');

    if (!periode || !/^\d{4}-\d{2}$/.test(periode)) {
      return apiError('Parameter periode wajib dengan format YYYY-MM.', 400);
    }

    const data = await getDetailSaldoAwal(periode);
    return apiSuccess(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal memuat detail saldo awal.', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole('BENDAHARA');
    const body = await request.json();

    const parsed = SaldoAwalInputSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Data saldo awal tidak valid.';
      return apiError(msg, 400);
    }

    const result = await editSaldoAwal(parsed.data, user);
    return apiSuccess(result, 'Saldo awal berhasil diperbarui.');
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal memperbarui saldo awal.', 500);
  }
}
