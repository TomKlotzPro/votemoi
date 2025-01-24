'use client';

import { fr } from '@/app/translations/fr';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 text-white/60 hover:text-white transition-colors"
      aria-label={theme === 'dark' ? fr.common.lightMode : fr.common.darkMode}
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
