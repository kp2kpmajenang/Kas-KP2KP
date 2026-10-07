import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/utils/response';
import { requireRole, AuthError } from '@/lib/auth/authorization';
import { getDaftarUser, tambahUser } from '@/lib/users/users';
import { TambahUserSchema } from '@/lib/validation/validation';

export async function GET() {
  try {
    await requireRole('SUPER ADMIN');
    const users = await getDaftarUser();
    return apiSuccess(users);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal memuat daftar user.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('SUPER ADMIN');
    const body = await request.json();

    const parsed = TambahUserSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Data user tidak valid.';
      return apiError(msg, 400);
    }

    const created = await tambahUser(parsed.data);
    return apiSuccess(created, 'User berhasil ditambahkan.', 201);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    return apiError(err.message || 'Gagal menambahkan user.', 500);
  }
}
