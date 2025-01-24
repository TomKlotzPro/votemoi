'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';
import { getUsers, createUser } from '../actions/users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      
      if (response.error) {
        setError(response.error);
        setUsers([]);
      } else {
        setUsers(response.data || []);
      }
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

  const addUser = async (data: { name: string; avatarUrl: string }) => {
    try {
      setError(null);
      const response = await createUser({
        name: data.name.trim(),
        avatarUrl: data.avatarUrl
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No user data returned from server');
      }

      await fetchUsers(); // Refresh the list after adding
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add user';
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
    refresh
  };
}
