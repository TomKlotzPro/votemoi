'use client';

import Image from 'next/image';
import { fr } from '@/app/translations/fr';
import { User } from '@/app/types/user';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden">
          <Image
            src={user.avatarUrl}
            alt={user.name}
            fill
            className="object-contain p-2"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {user.name}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm">
            {fr.participants.joinDate}
          </p>
        </div>
      </div>
    </div>
  );
}
