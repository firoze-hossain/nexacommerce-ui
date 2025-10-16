// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/providers/auth-provider'; // Fixed import
import { WishlistProvider } from '@/app/contexts/wishlist-context';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexaCommerce',
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
          <WishlistProvider>
          {children}
          </WishlistProvider>
      </AuthProvider>
      </body>
    </html>
  );
}