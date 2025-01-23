'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserList from './UserList';
import UserForm from '../forms/UserForm';
import { fr } from '@/app/translations/fr';
import ErrorMessage from '../common/ErrorMessage';
import { createUser, updateUser, deleteUser } from '@/app/actions/user-actions';

type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  _count?: {
    votes: number;
  };
  votes?: {
    url: {
      id: string;
      title: string;
    };
  }[];
};

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateUser = async (userData: { name: string; avatarUrl?: string }) => {
    try {
      setLoading(true);
      setError('');
      const newUser = await createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      router.refresh();
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error instanceof Error ? error.message : fr.errors.createUserFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, userData: { name: string; avatarUrl?: string }) => {
    try {
      setLoading(true);
      setError('');
      const updatedUser = await updateUser(id, userData);
      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));
      setSelectedUser(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : fr.errors.updateUserFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error instanceof Error ? error.message : fr.errors.deleteUserFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-purple-400 glow-text mb-4">
          {fr.users.manageUsers}
        </h1>
        <p className="text-gray-400">{fr.users.manageUsersDesc}</p>
      </div>

      {error && <ErrorMessage message={error} />}

      <UserForm
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        initialData={selectedUser}
        loading={loading}
      />

      <UserList
        users={users}
        onEdit={setSelectedUser}
        onDelete={handleDeleteUser}
        disabled={loading}
      />
    </div>
  );
}
