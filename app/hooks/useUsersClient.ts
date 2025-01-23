'use client';

import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { getUsers, createUser } from '../actions/users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const addUser = async (data: { name: string; avatarUrl: string }) => {
    try {
      const newUser = await createUser(data);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError('Failed to add user');
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
  };
}
