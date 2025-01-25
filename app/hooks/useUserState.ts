'use client';

import { User } from '@/app/types/user';
import { create } from 'zustand';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserInfo: (data: { name: string; avatarUrl: string }) => void;
}

export const useUserState = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUserInfo: (data) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...data,
          }
        : null,
    })),
}));
