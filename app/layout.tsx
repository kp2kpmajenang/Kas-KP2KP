import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kas KP2KP Majenang',
  description:
    'Sistem Pengelolaan Keuangan & Kas Internal KP2KP Majenang',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kas KP2KP',
  },
  icons: {
    icon: [
      {
        url: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#EFF9F5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-[#EFF9F5] text-[#143632] antialiased selection:bg-[#F7E7A8]">
        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (
                'serviceWorker' in navigator &&
                window.location.protocol === 'https:'
              ) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker
                    .register('/sw.js')
                    .catch((err) =>
                      console.log('SW registration error:', err)
                    );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
