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
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

export default function SafeImage({
  src,
  alt,
  fallbackSrc = '/default-avatar.png',
  className = '',
  width,
  height,
  style,
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const imageSource: string = error ? fallbackSrc : src;

  return (
    <div className="relative w-full h-full">
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
        style={style}
        onError={() => {
          console.error(`Failed to load image: ${src}`);
          setError(true);
          setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        unoptimized={(imageSource as string).indexOf('data:') !== 0}
      />
    </div>
  );
}
