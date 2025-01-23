'use client';

import { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fallback = '/default-avatar.png',
  ...props 
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error || !src) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div className={`relative ${className} bg-white/5`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-full object-cover
          transition-all duration-300 ease-out
          ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
}
