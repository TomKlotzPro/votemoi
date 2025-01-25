import ClientLayout from '@/app/components/layout/ClientLayout';
import Navigation from '@/app/components/layout/Navigation';
import { Providers } from '@/app/components/providers/Providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { preloadAvatars } from './utils/image-preloader';
import AvatarPreloader from './components/ui/AvatarPreloader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoteMoi',
  description: 'Partagez et votez pour vos liens préférés',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Preload avatar images on initial render
  if (typeof window !== 'undefined') {
    preloadAvatars();
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-black`} suppressHydrationWarning>
        <Providers>
          <AvatarPreloader />
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
              {children}
            </div>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
