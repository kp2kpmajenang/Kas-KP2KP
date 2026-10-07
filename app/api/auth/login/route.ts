import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/utils/response';
import { LoginInputSchema } from '@/lib/validation/validation';
import { cariUserByUsername } from '@/lib/users/users';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { catatAuditLog } from '@/lib/audit/audit-log';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginInputSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Data login tidak valid.';
      return apiError(msg, 400);
    }

    const { username, password } = parsed.data;
    const user = await cariUserByUsername(username);

    if (!user || !user.passwordHash) {
      return apiError('Username atau password salah.', 401);
    }

    if (user.status !== 'AKTIF') {
      return apiError('Akun ini tidak aktif.', 403);
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return apiError('Username atau password salah.', 401);
    }

    // Buat JWT Token
    const token = await createSessionToken({
      username: user.username,
      nama: user.nama,
      roles: user.roles,
    });

    // Pasang HTTP-Only Cookie
    await setSessionCookie(token);

    // Catat Audit Log Login
    await catatAuditLog('LOGIN', 'SESSION', 'User berhasil login.', '', {
      username: user.username,
      nama: user.nama,
      roles: user.roles,
    });

    return apiSuccess(
      {
        username: user.username,
        nama: user.nama,
        roles: user.roles,
      },
      'Login berhasil.'
    );
  } catch (err: any) {
    console.error('Login error:', err);
    return apiError(err.message || 'Terjadi kesalahan sistem saat login.', 500);
  }
}
