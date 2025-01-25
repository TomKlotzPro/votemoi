'use client';

import { User } from '@/app/types/user';
import SafeImage from './SafeImage';

type AvatarLoaderProps = {
  user?: User;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
};

export default function AvatarLoader({
  user,
  size = 'md',
  className = '',
  isLoading = false,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 animate-spin" style={{ clipPath: 'inset(0 0 0 50%)' }} />
          <div className="absolute inset-1 rounded-full bg-[#1e1e38]" />
        </div>
      </div>
    );
  }

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
