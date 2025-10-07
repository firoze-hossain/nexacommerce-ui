// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/providers/auth-provider'; // Fixed import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexaCommerce - Vendor Platform',
  description: 'Manage your ecommerce business with NexaCommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <AuthProvider>
          {children}
      </AuthProvider>
      </body>
    </html>
  );
}