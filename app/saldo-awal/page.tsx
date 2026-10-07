'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /saldo-awal → redirect ke /dashboard (beranda memiliki akses saldo awal).
 */
export default function SaldoAwalPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem('dashboard_tab', 'beranda');
    router.replace('/dashboard');
  }, [router]);

  return null;
}
