'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import ProfileMenu from '../profile/ProfileMenu';
import SafeImage from '../ui/SafeImage';

export default function Navigation() {
  const { user, showAuthForm, logout } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/80 backdrop-blur-lg border-b border-white/10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link 
              href="/" 
              className="text-2xl sm:text-3xl font-bold text-white hover:text-purple-400 transition-colors"
            >
              VoteMoi
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-4 py-2 transition-colors"
                  >
                    <SafeImage
                      src={user.avatarUrl || '/default-avatar.png'}
                      alt={user.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    />
                    <span className="text-white text-sm sm:text-base hidden sm:block">
                      {user.name}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <ProfileMenu
                      user={user}
                      onClose={() => setShowProfileMenu(false)}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              ) : (
                <button
                  onClick={showAuthForm}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  {fr.common.login}
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
