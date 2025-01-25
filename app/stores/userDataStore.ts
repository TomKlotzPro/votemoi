import { create } from 'zustand';
import { FormattedUser } from '../types/user';

type UserData = {
  name: string;
  avatarUrl: string;
};

type UserDataState = {
  userData: Record<string, UserData>;
  updateUserData: (userId: string, data: UserData) => void;
  getUserData: (userId: string) => UserData | undefined;
  syncWithUser: (user: FormattedUser) => void;
};

export const useUserDataStore = create<UserDataState>((set, get) => ({
  userData: {},

  updateUserData: (userId, data) => {
    set((state) => ({
      userData: {
        ...state.userData,
        [userId]: data,
      },
    }));
  },

  getUserData: (userId) => {
    return get().userData[userId];
  },

  syncWithUser: (user) => {
    set((state) => ({
      userData: {
        ...state.userData,
        [user.id]: {
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
      },
    }));
  },
}));
