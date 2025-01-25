'use client';

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function Loader({ size = 'md', className = '' }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/10 border-t-purple-500`}
      />
    </div>
  );
}
