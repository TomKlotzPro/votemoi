'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AVATAR_OPTIONS } from '@/app/constants/avatars';

export default function AvatarPreloader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Create an array to track loaded images
    const loadedImages = new Set<string>();

    // Function to mark an image as loaded
    const handleImageLoad = (src: string) => {
      loadedImages.add(src);
      if (loadedImages.size === AVATAR_OPTIONS.length) {
        setLoaded(true);
      }
    };

    // Preload all avatar images
    AVATAR_OPTIONS.forEach((avatar) => {
      const img = new window.Image();
      img.src = avatar;
      img.onload = () => handleImageLoad(avatar);
      img.onerror = () => handleImageLoad(avatar); // Count errors as loaded to prevent hanging
    });
  }, []);

  // Hidden container to hold preloaded images for Next.js optimization
  return (
    <div className="hidden" aria-hidden="true">
      {AVATAR_OPTIONS.map((avatar) => (
        <Image
          key={avatar}
          src={avatar}
          alt=""
          width={1}
          height={1}
          priority
        />
      ))}
    </div>
  );
}
