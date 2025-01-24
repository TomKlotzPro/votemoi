'use client';

import { useUsers } from '@/app/hooks/useUsers';
import { fr } from '@/app/translations/fr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from '../users/UserMenu';

export default function Navigation() {
  const pathname = usePathname();
  const { currentUser } = useUsers();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#1e1e38] border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-bold text-white hover:text-primary transition-colors"
            >
              {fr.common.title}
            </Link>

            {currentUser && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/urls"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/urls')
                      ? 'text-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {fr.nav.urls}
                </Link>
              </div>
            )}
          </div>

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
