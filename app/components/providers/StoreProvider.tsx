'use client';

import { User } from '@/app/types/user';
import { useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserState = {
  user: User | null;
  isAuthFormVisible: boolean;
}

type UserActions = {
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  showAuthForm: () => void;
  hideAuthForm: () => void;
  logout: () => void;
}

export const createUserStore = () =>
  create<UserState & UserActions>()(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isAuthFormVisible: false,

        // Actions
        setUser: (user) => set({ user }),

        updateUser: (data) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
          })),

        showAuthForm: () => set({ isAuthFormVisible: true }),
        hideAuthForm: () => set({ isAuthFormVisible: false }),

        logout: () => set({ user: null }),
      }),
      {
        name: 'votemoi-user-storage',
        partialize: (state) => ({ user: state.user }),
      }
    )
  );

export type UserStore = ReturnType<typeof createUserStore>;

let store: UserStore;

function initializeStore() {
  if (!store) {
    store = createUserStore();
  }
  return store;
}

export function useUserStore<T>(
  selector: (state: UserState & UserActions) => T
): T {
  const storeRef = useRef<UserStore>();
  if (!storeRef.current) {
    storeRef.current = initializeStore();
  }
  return storeRef.current(selector);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<UserStore>();
  if (!storeRef.current) {
    storeRef.current = initializeStore();
  }

  return <>{children}</>;
}
