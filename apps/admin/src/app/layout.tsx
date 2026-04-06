import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VTTM Admin',
  description: 'VTTM Logistics Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-bg-layout)]">{children}</body>
    </html>
  );
}
