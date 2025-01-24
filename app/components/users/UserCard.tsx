'use client';

import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import Image from 'next/image';

interface UserCardProps {
  user: FormattedUser;
  onClick?: (user: FormattedUser) => void;
  isSelected?: boolean;
}

export default function UserCard({ user, onClick, isSelected }: UserCardProps) {
  return (
    <div 
      className={`card p-6 ${isSelected ? 'border-primary' : ''}`}
      onClick={() => onClick?.(user)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden">
          <Image
            src={user.avatarUrl || '/images/default-avatar.png'}
            alt={user.name}
            fill
            className="object-contain p-2"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{user.name}</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            {fr.participants.joinDate}
          </p>
        </div>
      </div>
    </div>
  );
}
