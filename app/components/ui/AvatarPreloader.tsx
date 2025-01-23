'use client';

import { useEffect, useState } from 'react';
import { AVATAR_OPTIONS } from '@/app/constants/avatars';

interface AvatarPreloaderProps {
  onLoadComplete: () => void;
}

export default function AvatarPreloader({ onLoadComplete }: AvatarPreloaderProps) {
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const preloadImages = async () => {
      const loadPromises = AVATAR_OPTIONS.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            setLoadedCount(prev => prev + 1);
            resolve(null);
          };
          img.onerror = () => {
            // Still count errors to avoid hanging
            setLoadedCount(prev => prev + 1);
            resolve(null);
          };
          img.src = url;
        });
      });

      await Promise.all(loadPromises);
      onLoadComplete();
    };

    preloadImages();
  }, [onLoadComplete]);

  return null; // This component doesn't render anything
}
