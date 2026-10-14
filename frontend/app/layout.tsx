import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';
import { Nav } from '@/components/nav';

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Suivi de finances personnelles',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
      <html lang="fr">
      <body className="min-h-screen">
      <Providers>
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </Providers>
      </body>
      </html>
  );
}