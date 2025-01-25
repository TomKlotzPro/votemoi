'use client';

import Image from 'next/image';
import { useState } from 'react';

type SafeImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = '/default-avatar.png',
  className = '',
  width = 32,
  height = 32,
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const imageSource = error ? fallbackSrc : src;

  return (
    <div className="relative" style={{ width, height }}>
      {!loaded && !error && (
        <div
          className={`absolute inset-0 ${className} bg-gray-200 animate-pulse`}
        />
      )}
      <Image
        src={imageSource}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={() => {
          console.error(`Failed to load image: ${src}`);
          setError(true);
          setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        unoptimized={imageSource.startsWith('data:')}
      />
    </div>
  );
}
