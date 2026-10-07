import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireRole, AuthError } from '@/lib/auth/authorization';
import { getAuditLog } from '@/lib/audit/audit-log';

export async function GET() {
  try {
    await requireRole('SUPER ADMIN');
    const logs = await getAuditLog();
    return apiSuccess(logs);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal memuat audit log.', 500);
  }
}
