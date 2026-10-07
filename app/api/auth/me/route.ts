import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireAuth, AuthError } from '@/lib/auth/authorization';

export async function GET() {
  try {
    const user = await requireAuth();
    return apiSuccess({
      username: user.username,
      nama: user.nama,
      roles: user.roles,
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError('Sesi tidak valid.', 401);
  }
}
