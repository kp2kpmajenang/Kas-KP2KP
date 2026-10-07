import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireAuth, requireRole, AuthError } from '@/lib/auth/authorization';
import { getTransaksi, tambahTransaksi } from '@/lib/finance/transactions';
import { TransaksiInputSchema } from '@/lib/validation/validation';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const periode = searchParams.get('periode') || undefined;
    const includeBatal = searchParams.get('includeBatal') === 'true';

    const data = await getTransaksi(periode, includeBatal);
    return apiSuccess(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal memuat transaksi.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Hanya BENDAHARA yang berhak menambah transaksi (Section 18)
    const user = await requireRole('BENDAHARA');

    const body = await request.json();
    const parsed = TransaksiInputSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Data transaksi tidak valid.';
      return apiError(msg, 400);
    }

    const created = await tambahTransaksi(parsed.data, user);
    return apiSuccess(created, 'Transaksi berhasil dicatat.', 201);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal menyimpan transaksi.', 500);
  }
}
