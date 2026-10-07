import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireRole, AuthError } from '@/lib/auth/authorization';
import { batalkanTransaksi } from '@/lib/finance/transactions';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole('BENDAHARA');
    const { id } = await params;

    if (!id) {
      return apiError('ID transaksi wajib diisi.', 400);
    }

    const result = await batalkanTransaksi(id, user);
    return apiSuccess(result, 'Transaksi berhasil dibatalkan.');
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal membatalkan transaksi.', 500);
  }
}
