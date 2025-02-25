'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 w-full border-t bg-white md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          Instagram
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`${
              isActive('/') ? 'text-black' : 'text-neutral-500'
            } hover:text-black`}
          >
            <Home className="h-6 w-6" />
          </Link>

          <Link
            href="/create"
            className={`${
              isActive('/create') ? 'text-black' : 'text-neutral-500'
            } hover:text-black`}
          >
            <PlusSquare className="h-6 w-6" />
          </Link>

          <Link
            href={`/profile/${session.user?.name}`}
            className={`${
              pathname.startsWith('/profile')
                ? 'text-black'
                : 'text-neutral-500'
            } hover:text-black`}
          >
            {session.user?.image ? (
              <div className="h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={session.user.image}
                  alt={session.user.name || ''}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            ) : (
              <User className="h-6 w-6" />
            )}
          </Link>

          <button
            onClick={() => signOut()}
            className="text-sm font-semibold text-neutral-500 hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
