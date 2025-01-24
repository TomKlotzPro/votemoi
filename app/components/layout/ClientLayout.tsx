'use client';

import { UserProvider } from '@/app/context/user-context';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
