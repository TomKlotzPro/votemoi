'use client';

import { useEffect, useState } from 'react';
import ErrorMessage from '../components/common/ErrorMessage';
import UserList from '../components/users/UserList';
import { fr } from '../translations/fr';

type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  _count: {
    votes: number;
  };
  votes: {
    url: {
      id: string;
      title: string;
    };
  }[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError(fr.errors.failedToLoadUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-purple-900/20 rounded-lg border border-purple-500/20"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-purple-400 glow-text mb-4">
          {fr.common.noParticipants}
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-purple-400 glow-text mb-4">
          {fr.common.participants}
        </h1>
        <p className="text-gray-400">{fr.users.manageUsersDesc}</p>
      </div>

      <UserList users={users} />
    </div>
  );
}
