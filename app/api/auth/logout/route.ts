import { apiSuccess, apiError } from '@/lib/utils/response';
import { clearSessionCookie } from '@/lib/auth/session';
import { requireAuth } from '@/lib/auth/authorization';
import { catatAuditLog } from '@/lib/audit/audit-log';

export async function POST() {
  try {
    let user = null;
    try {
      user = await requireAuth();
    } catch {
      // User might already be unauthenticated
    }

    if (user) {
      await catatAuditLog('LOGOUT', 'SESSION', 'User melakukan logout.', '', user);
    }

    await clearSessionCookie();
    return apiSuccess({ loggedOut: true }, 'Logout berhasil.');
  } catch (err: any) {
    return apiError(err.message || 'Gagal melakukan logout.', 500);
  }
}
