'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <NextThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemeProvider>
    </SessionProvider>
  );
}
