import crypto from 'crypto';

/**
 * Hash password menggunakan SHA-256 hex string.
 * Kompatibel 100% dengan hashPassword() pada Code.gs lama:
 * Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, UTF_8)
 */
export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password wajib diisi.');
  }

  return crypto.createHash('sha256').update(String(password), 'utf8').digest('hex');
}

/**
 * Verifikasi kecocokan password dengan hash tersimpan
 */
export function verifyPassword(passwordInput: string, storedHash: string): boolean {
  if (!passwordInput || !storedHash) return false;
  const computedHash = hashPassword(passwordInput);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}
