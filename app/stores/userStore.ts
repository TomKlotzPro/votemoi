'use client';

import { User } from '@/app/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserState = {
  user: User | null;
  isAuthFormVisible: boolean;
};

type UserActions = {
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  showAuthForm: () => void;
  hideAuthForm: () => void;
  logout: () => void;
};

export const useUserStore = create<UserState & UserActions>()(
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
      partialize: (state) => ({ user: state.user }), // Only persist user data
    }
  )
);

// Initialize user from localStorage
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('votemoi-user-storage');
  if (storedUser) {
    try {
      useUserStore.getState().setUser(JSON.parse(storedUser).user);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('votemoi-user-storage');
    }
  }
}
