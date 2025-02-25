'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Home,
  Search,
  Compass,
  Heart,
  PlusSquare,
  MessageCircle,
  Menu,
  Bookmark,
  Settings,
  LogOut,
} from 'lucide-react';
import CreatePostModal from './CreatePostModal';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMore, setShowMore] = useState(false);

  if (!session?.user) return null;

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Explore', href: '/explore', icon: Compass },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Notifications', href: '/notifications', icon: Heart },
    {
      name: 'Create',
      href: '#',
      icon: PlusSquare,
      onClick: () => setShowCreatePost(true),
    },
    {
      name: 'Profile',
      href: `/profile/${session.user.username}`,
      icon: () => (
        <div className="relative w-6 h-6 rounded-full overflow-hidden">
          <Image
            src={session.user.image || '/default-avatar.png'}
            alt={session.user.name || 'Profile'}
            fill
            className="object-cover"
          />
        </div>
      ),
    },
  ];

  const moreItems = [
    { name: 'Saved', href: '/saved', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Log out', href: '/auth/signout', icon: LogOut },
  ];

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-[245px] border-r bg-white p-4">
        <div className="flex flex-col h-full">
          <Link href="/" className="py-4 mb-6">
            <Image
              src="/instagram-logo.png"
              alt="Instagram"
              width={103}
              height={29}
              className="cursor-pointer"
            />
          </Link>

          <nav className="flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={item.onClick}
                      className={`flex items-center gap-4 px-3 py-3 text-base rounded-lg hover:bg-gray-100 transition-colors ${
                        isActive ? 'font-bold' : ''
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto">
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-4 px-3 py-3 text-base rounded-lg hover:bg-gray-100 transition-colors w-full"
            >
              <Menu className="w-6 h-6" />
              <span>More</span>
            </button>

            {showMore && (
              <div className="absolute bottom-20 left-4 right-4 bg-white border rounded-lg shadow-lg">
                <ul className="py-2">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-4 px-4 py-3 text-base hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </>
  );
}
