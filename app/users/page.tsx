'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /users → redirect ke /dashboard tab kelola (Super Admin only).
 */
export default function UsersPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem('dashboard_tab', 'kelola');
    router.replace('/dashboard');
  }, [router]);

  return null;
}
