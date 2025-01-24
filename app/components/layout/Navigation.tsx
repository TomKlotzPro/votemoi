'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import ProfileMenu from '../profile/ProfileMenu';
import SafeImage from '../ui/SafeImage';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const { user, showAuthForm, logout } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.div
                    key="profile"
                    className="relative"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-4 py-2 transition-colors"
                    >
                      <motion.div
                        initial={false}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <SafeImage
                          src={user.avatarUrl || '/default-avatar.png'}
                          alt={user.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                        />
                      </motion.div>
                      <motion.span 
                        className="text-white text-sm sm:text-base hidden sm:block"
                        initial={false}
                        animate={{ 
                          opacity: 1,
                          x: 0
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        {user.name}
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            duration: 0.3
                          }}
                        >
                          <ProfileMenu
                            user={user}
                            onClose={() => setShowProfileMenu(false)}
                            onLogout={handleLogout}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.button
                    key="login"
                    onClick={showAuthForm}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="relative group px-6 py-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-blue-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-blue-500/50 blur-xl"
                      animate={{
                        opacity: isHovered ? 1 : 0.5,
                        scale: isHovered ? 1.2 : 1
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: isHovered ? '100%' : '-100%' }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />

                    {/* Content */}
                    <div className="relative flex items-center gap-2 text-sm font-medium">
                      <span className="text-white">Se connecter</span>
                      <motion.div
                        animate={{ x: isHovered ? 4 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRightIcon className="w-4 h-4 text-white" />
                      </motion.div>
                    </div>

                    {/* Border gradient */}
                    <div className="absolute inset-0 rounded-xl border border-white/20" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
