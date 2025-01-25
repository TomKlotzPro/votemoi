'use client';

import {
  createUser,
  deleteUser,
  getUsers,
  signOut,
  updateUser,
} from '@/app/actions/users';
import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { useCallback, useEffect, useState } from 'react';

type UseUsersReturn = {
  users: FormattedUser[];
  isLoading: boolean;
  error: string | null;
  currentUser: FormattedUser | null;
  refreshUsers: () => Promise<void>;
  createUser: (data: {
    name: string;
    image?: string;
  }) => Promise<FormattedUser>;
  updateUser: (
    id: string,
    data: { name?: string; avatarUrl?: string }
  ) => Promise<FormattedUser>;
  deleteUser: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<FormattedUser[]>([]);
  const [currentUser, setCurrentUser] = useState<FormattedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(fr.errors.failedToFetchUsers);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleCreateUser = useCallback(
    async (data: { name: string; image?: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const newUser = await createUser(data);
        setUsers((prev) => [...prev, newUser]);
        return newUser;
      } catch (error) {
        console.error('Failed to create user:', error);
        setError(fr.errors.failedToAddUser);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleUpdateUser = useCallback(
    async (id: string, data: { name?: string; avatarUrl?: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const updatedUser = await updateUser(id, data);
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? updatedUser : user))
        );
        return updatedUser;
      } catch (error) {
        console.error('Failed to update user:', error);
        setError(fr.errors.failedToUpdateUser);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleDeleteUser = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError(fr.errors.failedToDeleteUser);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
      setError(fr.errors.failedToSignOut);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    currentUser,
    isLoading,
    error,
    refreshUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    signOut: handleSignOut,
  };
}
