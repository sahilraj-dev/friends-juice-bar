import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Friends Juice Bar | Campus Food & Drinks',
  description: 'Order fresh juices, shakes, chaat and beverages from your favourite campus juice bar. Delivered to your hostel gate!',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-512.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F97316',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
