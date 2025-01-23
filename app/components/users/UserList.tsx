'use client';

import { fr } from '@/app/translations/fr';
import { useUsers } from '@/app/hooks/useUsers';
import UserCard from './UserCard';

export default function UserList() {
  const { users } = useUsers();

  if (!users?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-secondary)]">
          {fr.participants.noParticipants}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
