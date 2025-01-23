'use client';

interface AvatarLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AvatarLoader({ size = 'md', className = '' }: AvatarLoaderProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full border-current border-t-transparent animate-spin`}
    />
  );
}
