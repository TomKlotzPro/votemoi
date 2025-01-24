'use client';

import { useUsers } from '@/app/hooks/useUsers';
import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { useCallback } from 'react';
import UserList from './UserList';

interface UserManagerProps {
  onUserSelect?: (user: FormattedUser) => void;
  selectedUserId?: string;
}

export default function UserManager({
  onUserSelect,
  selectedUserId,
}: UserManagerProps) {
  const { users, isLoading, error, refreshUsers } = useUsers();

  const handleUserSelect = useCallback((user: FormattedUser) => {
    onUserSelect?.(user);
  }, [onUserSelect]);

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => refreshUsers()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        >
          {fr.actions.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{fr.common.title}</h1>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary" />
        )}
      </div>
      <UserList
        users={users}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
      />
    </div>
  );
}
