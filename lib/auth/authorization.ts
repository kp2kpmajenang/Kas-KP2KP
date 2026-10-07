import { getSessionTokenFromCookies, verifySessionToken } from './session';
import { cariUserByUsername } from '../users/users';

export interface AuthenticatedUser {
  username: string;
  nama: string;
  roles: string[];
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/**
 * Memastikan user sedang login, session valid, dan akun masih aktif di Google Sheets.
 * Porting langsung dari Code.gs: wajibLogin() & getSessionUser()
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const token = await getSessionTokenFromCookies();
  if (!token) {
    throw new AuthError('Session tidak ditemukan. Silakan login kembali.', 401);
  }

  const payload = await verifySessionToken(token);
  if (!payload || !payload.username) {
    throw new AuthError('Session telah berakhir atau tidak valid. Silakan login kembali.', 401);
  }

  // Verifikasi ulang status user secara live dari database sheet USER
  const userLive = await cariUserByUsername(payload.username);
  if (!userLive) {
    throw new AuthError('Akun tidak ditemukan. Silakan login kembali.', 401);
  }

  if (userLive.status !== 'AKTIF') {
    throw new AuthError('Akun ini tidak aktif.', 403);
  }

  return {
    username: userLive.username,
    nama: userLive.nama,
    roles: userLive.roles,
  };
}

/**
 * Memastikan user memiliki minimal satu dari role yang diizinkan.
 * Porting langsung dari Code.gs: wajibRole() & wajibSalahSatuRole()
 */
export async function requireRole(allowedRoles: string[] | string): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  const rolesNeeded = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  const hasAccess = rolesNeeded.some((role) => user.roles.includes(role));
  if (!hasAccess) {
    throw new AuthError('Anda tidak memiliki hak akses untuk melakukan tindakan ini.', 403);
  }

  return user;
}
