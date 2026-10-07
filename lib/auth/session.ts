import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'kas_kp2kp_session';
export const SESSION_DURATION_SECONDS = 21600; // 6 jam, persis seperti Code.gs

export interface SessionPayload {
  username: string;
  nama: string;
  roles: string[];
  [key: string]: any;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'dev_secret_key_kas_kp2kp_min_32_characters_long_12345';
  return new TextEncoder().encode(secret);
}

/**
 * Membuat token JWT session bertanda tangan (signed JWT)
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);
}

/**
 * Memverifikasi keabsahan token JWT session
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Mengambil token session dari cookies Next.js
 */
export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return sessionCookie?.value || null;
}

/**
 * Menyimpan cookie session ke browser (HTTP-Only, Secure)
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Menghapus cookie session (Logout)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
