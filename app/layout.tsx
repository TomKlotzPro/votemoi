import ClientLayout from '@/app/components/layout/ClientLayout';
import Navigation from '@/app/components/layout/Navigation';
import { Providers } from '@/app/components/providers/Providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import AvatarPreloader from './components/ui/AvatarPreloader';
import LinkPreloader from './components/ui/LinkPreloader';
import './globals.css';
import { preloadAvatars } from './utils/image-preloader';
import { preloadLinks } from './utils/link-preloader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoteMoi',
  description: 'Partagez et votez pour vos liens préférés',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Preload avatar images and links on initial render
  if (typeof window !== 'undefined') {
    preloadAvatars();
    preloadLinks();
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-black`} suppressHydrationWarning>
        <Providers>
          <AvatarPreloader />
          <LinkPreloader />
          <ClientLayout>
            {/* Synthwave sun */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-purple-500 via-transparent to-transparent opacity-20 blur-3xl" />

            {/* Stars */}
            <div className="fixed inset-0 stars" />

            {/* Grid floor */}
            <div className="fixed bottom-0 left-0 right-0 h-[400px] perspective-effect">
              <div className="grid-floor w-full h-full" />
            </div>

            {/* Content */}
            <div className="relative">
              <Navigation />
              <Providers>
                <AvatarPreloader />
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 2000,
                    style: {
                      background: 'rgba(30, 30, 56, 0.8)',
                      color: '#fff',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      backdropFilter: 'blur(8px)',
                      fontSize: '0.875rem',
                      boxShadow:
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      maxWidth: '380px',
                    },
                    success: {
                      style: {
                        background: 'rgba(30, 30, 56, 0.8)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                      },
                      iconTheme: {
                        primary: '#8B5CF6',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      style: {
                        background: 'rgba(30, 30, 56, 0.8)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      },
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                {children}
              </Providers>
            </div>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
