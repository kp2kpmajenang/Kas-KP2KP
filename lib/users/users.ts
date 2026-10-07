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

  const rows = await getSheetRows(SHEET_USER, 'A2:E');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowUsername = String(row[0] || '').trim().toLowerCase();

    if (rowUsername === target) {
      const roleString = String(row[2] || '').trim().toUpperCase();
      const roles = roleString
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      return {
        username: rowUsername,
        passwordHash: String(row[1] || '').trim(),
        roles,
        nama: String(row[3] || '').trim(),
        status: String(row[4] || '').trim().toUpperCase(),
        rowIndex: i + 2, // Baris asli di sheet (header di row 1)
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
  const rows = await getSheetRows(SHEET_USER, 'A2:E');
  let jumlah = 0;

  for (const row of rows) {
    const roleString = String(row[2] || '').trim().toUpperCase();
    const status = String(row[4] || '').trim().toUpperCase();
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
  const rows = await getSheetRows(SHEET_USER, 'A2:E');

  return rows.map((row) => {
    const roles = String(row[2] || '')
      .trim()
      .toUpperCase()
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    return {
      username: String(row[0] || '').trim().toLowerCase(),
      roles,
      nama: String(row[3] || '').trim(),
      status: String(row[4] || '').trim().toUpperCase(),
    };
  });
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
