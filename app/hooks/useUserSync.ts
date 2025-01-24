'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/app/context/user-context';
import { User } from '@/app/types/user';

export function useUserSync(user: User | null) {
  const { user: currentUser, setUser } = useUser();
  const prevUserRef = useRef<User | null>(null);

  useEffect(() => {
    // Only update if the user data has actually changed
    if (user && currentUser && user.id === currentUser.id) {
      const hasChanged = 
        prevUserRef.current?.name !== user.name || 
        prevUserRef.current?.avatarUrl !== user.avatarUrl;

      if (hasChanged) {
        prevUserRef.current = user;
        setUser({
          ...currentUser,
          name: user.name,
          avatarUrl: user.avatarUrl
        });
      }
    }
  }, [user?.name, user?.avatarUrl, currentUser?.id]); // Only depend on specific fields
}
