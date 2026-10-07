import { z } from 'zod';

export const TransaksiInputSchema = z.object({
  tanggal: z.string().min(1, 'Tanggal transaksi wajib diisi.'),
  jenis: z.enum(['MASUK', 'KELUAR'], {
    message: 'Jenis transaksi harus MASUK atau KELUAR.',
  }),
  uraian: z.string().trim().min(1, 'Uraian transaksi wajib diisi.'),
  nominal: z
    .number({ message: 'Nominal harus berupa angka.' })
    .positive('Nominal harus lebih dari 0.'),
  keterangan: z.string().optional().default(''),
});

export const SaldoAwalInputSchema = z.object({
  periode: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Format periode harus YYYY-MM (contoh: 2026-05).'),
  saldoAwal: z
    .number({ message: 'Saldo awal harus berupa angka.' })
    .min(0, 'Saldo awal harus berupa angka 0 atau lebih.'),
  keterangan: z.string().optional().default(''),
});

export const LoginInputSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

export const TambahUserSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi.'),
  password: z.string().min(1, 'Password wajib diisi.'),
  nama: z.string().trim().min(1, 'Nama wajib diisi.'),
  roles: z.array(z.string()).min(1, 'Minimal satu role harus dipilih.'),
  status: z.enum(['AKTIF', 'NONAKTIF']).default('AKTIF'),
});
