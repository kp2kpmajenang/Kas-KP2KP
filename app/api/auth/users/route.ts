import { NextResponse } from 'next/server';
import { getDaftarUser } from '@/lib/users/users';

export async function GET() {
  try {
    const users = await getDaftarUser();

    // Hanya akun aktif yang boleh ditampilkan
    const activeUsers = users.filter(
      (user) => user.status === 'AKTIF'
    );

    return NextResponse.json({
      success: true,
      data: activeUsers.map((user) => ({
        username: user.username,
        nama: user.nama,
        roles: user.roles,
      })),
    });
  } catch (error: any) {
    console.error('Get login users error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Daftar akun tidak dapat dimuat.',
      },
      { status: 500 }
    );
  }
}
