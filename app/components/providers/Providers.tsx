'use client';

import { ThemeProvider } from './ThemeProvider';
import { StoreProvider } from './StoreProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
