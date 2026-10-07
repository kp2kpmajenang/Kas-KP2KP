import { getSheetRows, appendSheetRow, updateSheetRange } from '../google-sheets/sheets';
import { SHEET_USER } from '../google-sheets/constants';
import { hashPassword } from '../auth/password';

export interface UserRecord {
  username: string;
  nama: string;
  roles: string[];
  status: 'AKTIF' | 'NONAKTIF' | string;
  passwordHash?: string;
  rowIndex?: number; // 1-indexed row number in sheet
}

/**
 * Mencari user di sheet USER berdasarkan username (case-insensitive).
 * Porting langsung dari Code.gs: cariUserByUsername()
 */
export async function cariUserByUsername(username: string): Promise<UserRecord | null> {
  const target = String(username || '').trim().toLowerCase();
  if (!target) return null;

  const allRows = await getSheetRows(SHEET_USER, 'A1:Z');
  if (allRows.length < 2) return null;

  const header = allRows[0].map((c) => String(c || '').trim().toUpperCase());

  // Deteksi kolom secara dinamis berdasarkan nama header
  let colUsername = header.findIndex((h) => h === 'USERNAME' || h === 'USER');
  let colPassword = header.findIndex((h) => h.includes('PASS'));
  let colRole = header.findIndex((h) => h === 'ROLES' || h === 'ROLE');
  let colNama = header.findIndex((h) => h === 'NAMA' || h === 'NAME');
  let colStatus = header.findIndex((h) => h === 'STATUS');

  // Fallback ke urutan default Code.gs jika header tidak dikenali
  if (colUsername === -1) colUsername = 0;
  if (colPassword === -1) colPassword = 1;
  if (colRole === -1) colRole = 2;
  if (colNama === -1) colNama = 3;
  if (colStatus === -1) colStatus = 4;

  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i];
    const rowUsername = String(row[colUsername] || '').trim().toLowerCase();

    if (rowUsername === target) {
      const roleString = String(row[colRole] || '').trim().toUpperCase();
      const roles = roleString
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      return {
        username: rowUsername,
        passwordHash: String(row[colPassword] || '').trim(),
        roles,
        nama: String(row[colNama] || '').trim(),
        status: String(row[colStatus] || '').trim().toUpperCase(),
        rowIndex: i + 1, // Baris asli di sheet (1-indexed)
      };
    }
  }

  return null;
}

/**
 * Menghitung jumlah SUPER ADMIN yang masih berstatus AKTIF.
 * Porting langsung dari Code.gs: hitungSuperAdminAktif()
 */
export async function hitungSuperAdminAktif(): Promise<number> {
  const allRows = await getSheetRows(SHEET_USER, 'A1:Z');
  if (allRows.length < 2) return 0;

  const header = allRows[0].map((c) => String(c || '').trim().toUpperCase());
  let colRole = header.findIndex((h) => h === 'ROLES' || h === 'ROLE');
  let colStatus = header.findIndex((h) => h === 'STATUS');

  if (colRole === -1) colRole = 2;
  if (colStatus === -1) colStatus = 4;

  let jumlah = 0;

  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i];
    const roleString = String(row[colRole] || '').trim().toUpperCase();
    const status = String(row[colStatus] || '').trim().toUpperCase();
    const roles = roleString
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    if (status === 'AKTIF' && roles.includes('SUPER ADMIN')) {
      jumlah++;
    }
  }

  return jumlah;
}

/**
 * Memastikan perubahan user tidak menghilangkan SUPER ADMIN terakhir yang masih aktif.
 * Porting langsung dari Code.gs: validasiPerubahanSuperAdmin()
 */
export async function validasiPerubahanSuperAdmin(
  usernameTarget: string,
  roleBaru: string | string[],
  statusBaru: string
): Promise<void> {
  const userLama = await cariUserByUsername(usernameTarget);
  if (!userLama) {
    throw new Error('User tidak ditemukan.');
  }

  const masihSuperAdminLama = userLama.roles.includes('SUPER ADMIN');

  const rolesBaruList = Array.isArray(roleBaru)
    ? roleBaru.map((r) => r.trim().toUpperCase())
    : String(roleBaru || '')
        .split(',')
        .map((r) => r.trim().toUpperCase())
        .filter(Boolean);

  const masihSuperAdminBaru = rolesBaruList.includes('SUPER ADMIN');
  const masihAktifBaru = String(statusBaru || '').trim().toUpperCase() === 'AKTIF';

  if (masihSuperAdminLama && (!masihSuperAdminBaru || !masihAktifBaru)) {
    const totalSuperAdmin = await hitungSuperAdminAktif();
    if (totalSuperAdmin <= 1) {
      throw new Error('Perubahan ditolak. Sistem harus memiliki minimal 1 SUPER ADMIN aktif.');
    }
  }
}

/**
 * Mengambil seluruh daftar pengguna.
 * Porting langsung dari Code.gs: getDaftarUser()
 */
export async function getDaftarUser(): Promise<Omit<UserRecord, 'passwordHash' | 'rowIndex'>[]> {
  const allRows = await getSheetRows(SHEET_USER, 'A1:Z');
  if (allRows.length < 2) return [];

  const header = allRows[0].map((c) => String(c || '').trim().toUpperCase());
  let colUsername = header.findIndex((h) => h === 'USERNAME' || h === 'USER');
  let colRole = header.findIndex((h) => h === 'ROLES' || h === 'ROLE');
  let colNama = header.findIndex((h) => h === 'NAMA' || h === 'NAME');
  let colStatus = header.findIndex((h) => h === 'STATUS');

  if (colUsername === -1) colUsername = 0;
  if (colRole === -1) colRole = 2;
  if (colNama === -1) colNama = 3;
  if (colStatus === -1) colStatus = 4;

  const results: Omit<UserRecord, 'passwordHash' | 'rowIndex'>[] = [];

  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i];
    const username = String(row[colUsername] || '').trim().toLowerCase();
    if (!username) continue;

    const roles = String(row[colRole] || '')
      .trim()
      .toUpperCase()
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    results.push({
      username,
      roles,
      nama: String(row[colNama] || '').trim(),
      status: String(row[colStatus] || '').trim().toUpperCase(),
    });
  }

  return results;
}

export interface TambahUserInput {
  username: string;
  password: string;
  nama: string;
  roles?: string[];
  role?: string;
  status?: string;
}

/**
 * Menambahkan pengguna baru ke sheet USER.
 * Porting langsung dari Code.gs: tambahUser()
 */
export async function tambahUser(data: TambahUserInput): Promise<Omit<UserRecord, 'passwordHash'>> {
  if (!data) throw new Error('Data user tidak ditemukan.');

  const username = String(data.username || '').trim().toLowerCase();
  const password = String(data.password || '');
  const nama = String(data.nama || '').trim();
  const status = String(data.status || 'AKTIF').trim().toUpperCase();

  let roles: string[] = [];
  if (Array.isArray(data.roles)) {
    roles = data.roles.map((r) => String(r).trim().toUpperCase()).filter(Boolean);
  } else if (data.role) {
    roles = String(data.role)
      .split(',')
      .map((r) => r.trim().toUpperCase())
      .filter(Boolean);
  }

  const roleValid = ['SUPER ADMIN', 'BENDAHARA', 'USER'];
  roles = Array.from(new Set(roles));

  if (!username) throw new Error('Username wajib diisi.');
  if (!password) throw new Error('Password wajib diisi.');
  if (!nama) throw new Error('Nama wajib diisi.');
  if (roles.length === 0) throw new Error('Minimal satu role harus dipilih.');
  if (status !== 'AKTIF' && status !== 'NONAKTIF') throw new Error('Status harus AKTIF atau NONAKTIF.');

  for (const r of roles) {
    if (!roleValid.includes(r)) {
      throw new Error(`Role tidak valid: ${r}`);
    }
  }

  // Cek username duplicate
  const existing = await cariUserByUsername(username);
  if (existing) {
    throw new Error('Username sudah digunakan.');
  }

  const passwordHash = hashPassword(password);
  const roleString = roles.join(',');

  await appendSheetRow(SHEET_USER, [username, passwordHash, roleString, nama, status]);

  return {
    username,
    roles,
    nama,
    status,
  };
}

export interface EditUserInput {
  usernameLama: string;
  username: string;
  nama: string;
  roles?: string[];
  role?: string;
  status: string;
}

/**
 * Memperbarui data pengguna.
 * Porting langsung dari Code.gs: editUser()
 */
export async function editUser(data: EditUserInput): Promise<Omit<UserRecord, 'passwordHash'>> {
  if (!data) throw new Error('Data user tidak ditemukan.');

  const usernameLama = String(data.usernameLama || '').trim().toLowerCase();
  const usernameBaru = String(data.username || '').trim().toLowerCase();
  const nama = String(data.nama || '').trim();
  const status = String(data.status || '').trim().toUpperCase();

  let roles: string[] = [];
  if (Array.isArray(data.roles)) {
    roles = data.roles.map((r) => String(r).trim().toUpperCase()).filter(Boolean);
  } else if (data.role) {
    roles = String(data.role).split(',').map((r) => r.trim().toUpperCase()).filter(Boolean);
  }
  roles = Array.from(new Set(roles));

  if (!usernameLama) throw new Error('Username lama wajib diisi.');
  if (!usernameBaru) throw new Error('Username wajib diisi.');
  if (!nama) throw new Error('Nama wajib diisi.');
  if (roles.length === 0) throw new Error('Minimal satu role harus dipilih.');
  if (status !== 'AKTIF' && status !== 'NONAKTIF') throw new Error('Status tidak valid.');

  const userTarget = await cariUserByUsername(usernameLama);
  if (!userTarget || !userTarget.rowIndex) {
    throw new Error('User tidak ditemukan.');
  }

  if (usernameLama !== usernameBaru) {
    const cekDuplicate = await cariUserByUsername(usernameBaru);
    if (cekDuplicate) {
      throw new Error('Username sudah digunakan.');
    }
  }

  const roleString = roles.join(',');
  await validasiPerubahanSuperAdmin(usernameLama, roleString, status);

  // Simpan perubahan ke baris user
  await updateSheetRange(`'${SHEET_USER}'!A${userTarget.rowIndex}:E${userTarget.rowIndex}`, [
    [usernameBaru, userTarget.passwordHash, roleString, nama, status],
  ]);

  return {
    username: usernameBaru,
    roles,
    nama,
    status,
  };
}
