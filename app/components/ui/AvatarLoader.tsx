'use client';

import { User } from '@/app/types/user';
import SafeImage from './SafeImage';

type AvatarLoaderProps = {
  user?: User;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AvatarLoader({
  user,
  size = 'md',
  className = '',
}: AvatarLoaderProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const defaultAvatarUrl = '/default-avatar.png';
  const avatarUrl =
    user?.avatarUrl ||
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'default'}`;

  return (
    <div
      className={`${sizeClasses[size]} ${className} relative rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800`}
    >
      <SafeImage
        src={avatarUrl}
        alt={user?.name || 'User avatar'}
        className="w-full h-full object-cover"
        fallbackSrc={defaultAvatarUrl}
      />
    </div>
  );
}
