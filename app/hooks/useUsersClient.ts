'use client';

import { useCallback, useEffect, useState } from 'react';
import { createUser, getUsers } from '../actions/users';
import { FormattedUser } from '../types/user';

export function useUsers() {
  const [users, setUsers] = useState<FormattedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getUsers();
      setUsers(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (data: { name: string; image: string }) => {
    try {
      setError(null);
      const response = await createUser({
        name: data.name.trim(),
        avatarUrl: data.image,
      });

      if (!response) {
        throw new Error('No user data returned from server');
      }

      await fetchUsers(); // Refresh the list after adding
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add user';
      setError(errorMessage);
      throw err;
    }
  };

  const refresh = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    addUser,
    refresh,
  };
}
