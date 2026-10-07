'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /laporan → redirect ke /dashboard dengan tab analisis aktif.
 */
export default function LaporanPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem('dashboard_tab', 'analisis');
    router.replace('/dashboard');
  }, [router]);

  return null;
}
