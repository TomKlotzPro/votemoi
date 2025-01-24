'use client';

import { useUserState } from '@/app/hooks/useUserState';
import { User } from '@/app/types/user';
import { useEffect } from 'react';

interface UseUserSyncProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export function useUserSync({ user, setUser }: UseUserSyncProps) {
  const { user: currentUser } = useUserState();

  useEffect(() => {
    if (currentUser !== user) {
      setUser(currentUser);
    }
  }, [currentUser, user, setUser]);
}
