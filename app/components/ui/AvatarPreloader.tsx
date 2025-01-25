'use client';

import { useEffect, useRef } from 'react';

type AvatarPreloaderProps = {
  avatars: string[];
  onLoad?: () => void;
};

export default function AvatarPreloader({
  avatars,
  onLoad,
}: AvatarPreloaderProps) {
  const loadedRef = useRef(0);

  useEffect(() => {
    if (avatars.length === 0) {
      onLoad?.();
      return;
    }

    const handleLoad = () => {
      loadedRef.current += 1;
      if (loadedRef.current === avatars.length) {
        onLoad?.();
      }
    };

    avatars.forEach((avatar) => {
      const img = new window.Image();
      img.src = avatar;
      img.onload = handleLoad;
      img.onerror = handleLoad; // Count errors as loaded to avoid blocking
    });

    return () => {
      loadedRef.current = 0;
    };
  }, [avatars, onLoad]);

  return null;
}
