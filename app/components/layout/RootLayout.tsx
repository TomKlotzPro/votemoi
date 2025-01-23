'use client';

import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@/app/context/user-context';
import Navigation from './Navigation';
import { fr } from '@/app/translations/fr';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <UserProvider>
        <div className="relative min-h-screen bg-gradient-to-b from-[#2b1055] to-[#7597de] dark:from-[#1a1a2e] dark:to-[#0f0f1a]">
          {/* Synthwave sun */}
          <div className="fixed bottom-[40vh] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-purple-500 via-purple-500/30 to-transparent opacity-30 blur-3xl" />
          
          {/* Grid floor */}
          <div className="fixed bottom-0 left-0 right-0 h-[40vh] perspective-effect">
            <div className="absolute inset-0 grid-floor" />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <Navigation />
            
            {/* Welcome Banner */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white neon-text mb-4">
                {fr.common.welcome}
              </h1>
              <p className="text-xl text-purple-500/80">
                {fr.common.description}
              </p>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              {children}
            </main>
          </div>
          
          {/* Stars */}
          <div className="fixed inset-0 stars" />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}
