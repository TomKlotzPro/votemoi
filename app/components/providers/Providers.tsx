'use client';

import { UserProvider } from '@/app/context/user-context';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';

type Props = {
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
        <UserProvider>
          {children}
        </UserProvider>
      </NextThemeProvider>
    </SessionProvider>
  );
}
