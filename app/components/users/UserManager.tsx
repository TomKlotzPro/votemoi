'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserList from './UserList';
import UserForm from '../forms/UserForm';
import { fr } from '@/app/translations/fr';
import ErrorMessage from '../common/ErrorMessage';
import { useUsers } from '@/app/hooks/useUsersClient';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { users, error, addUser } = useUsers();

  const handleCreateUser = async (_: string | undefined, userData: { name: string; avatarUrl?: string }) => {
    if (!userData.name || !userData.avatarUrl) {
      console.error('Missing required fields:', userData);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Creating user with data:', userData);
      
      await addUser({
        name: userData.name,
        avatarUrl: userData.avatarUrl
      });
      
      console.log('User created successfully');
      router.refresh();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 rounded-lg">
          <ErrorMessage message={error} />
        </div>
      )}
      
      <div className="bg-[#1e1e38] p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {fr.users.createUser}
        </h2>
        <UserForm onSubmit={handleCreateUser} loading={loading} />
      </div>

      <div className="bg-[#1e1e38] p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {fr.users.userList}
        </h2>
        <UserList users={users || []} />
      </div>
    </div>
  );
}
