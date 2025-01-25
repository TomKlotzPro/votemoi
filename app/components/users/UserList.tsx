'use client';

import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import UserCard from './UserCard';

type UserListProps = {
  users: FormattedUser[];
  onUserSelect?: (user: FormattedUser) => void;
  selectedUserId?: string;
};

export default function UserList({
  users,
  onUserSelect,
  selectedUserId,
}: UserListProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onClick={onUserSelect}
          isSelected={selectedUserId === user.id}
        />
      ))}
    </div>
  );
}
