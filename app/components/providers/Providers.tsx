'use client';

import { StoreProvider } from './StoreProvider';
import { ThemeProvider } from './ThemeProvider';

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
