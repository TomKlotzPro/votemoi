import ClientLayout from '@/app/components/layout/ClientLayout';
import Navigation from '@/app/components/layout/Navigation';
import { Providers } from '@/app/components/providers/Providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import AvatarPreloader from './components/ui/AvatarPreloader';
import LinkPreloader from './components/ui/LinkPreloader';
import SynthwaveBackground from './components/ui/SynthwaveBackground';
import './globals.css';
import { preloadAvatars } from './utils/image-preloader';
import { preloadLinks } from './utils/link-preloader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoteMoi - Partagez et votez pour vos liens préférés',
  description: 'VoteMoi est une plateforme sociale permettant de partager et voter pour vos liens préférés dans une ambiance synthwave unique.',
  keywords: ['vote', 'social', 'liens', 'partage', 'synthwave', 'communauté'],
  authors: [{ name: 'Tom Klotz' }],
  creator: 'Tom Klotz',
  publisher: 'VoteMoi',
  robots: 'index, follow',
  themeColor: '#1e1e38',
  colorScheme: 'dark',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://votemoi.vercel.app',
    title: 'VoteMoi - Partagez et votez pour vos liens préférés',
    description: 'VoteMoi est une plateforme sociale permettant de partager et voter pour vos liens préférés dans une ambiance synthwave unique.',
    siteName: 'VoteMoi',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoteMoi Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoteMoi - Partagez et votez pour vos liens préférés',
    description: 'VoteMoi est une plateforme sociale permettant de partager et voter pour vos liens préférés dans une ambiance synthwave unique.',
    images: ['/og-image.png']
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#1e1e38'
      }
    ]
  },
  manifest: '/site.webmanifest'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Preload avatar images and links on initial render
  if (typeof window !== 'undefined') {
    preloadAvatars();
    preloadLinks();
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <AvatarPreloader />
          <LinkPreloader />
          <SynthwaveBackground />
          <ClientLayout>
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
