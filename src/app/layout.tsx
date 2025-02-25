import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Instagram Clone',
  description: 'A full-featured Instagram clone built with Next.js',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex">
            {session?.user && <Sidebar />}
            <main
              className={`flex-1 min-h-screen ${
                session?.user ? 'ml-[245px]' : ''
              }`}
            >
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
