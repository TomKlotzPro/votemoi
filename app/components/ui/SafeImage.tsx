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

  return (
    <>
      {!loaded && !error && (
        <div
          className={`${className} bg-gray-200 animate-pulse`}
          style={{ width, height }}
        />
      )}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${!loaded ? 'hidden' : ''}`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}
