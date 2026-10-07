import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './lib/auth/session';

export const config = {
  matcher: ['/dashboard/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('kas_kp2kp_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('kas_kp2kp_session');
    return res;
  }

  return NextResponse.next();
}
