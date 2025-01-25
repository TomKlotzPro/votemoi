'use client';

import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AvatarPreloader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Preload images only on client side
    AVATAR_OPTIONS.forEach((avatar) => {
      const img = new window.Image();
      img.src = avatar;
    });
  }, []);

  // Render a simple hidden div that's consistent between server and client
  return (
    <div className="hidden" aria-hidden="true">
      {isClient &&
        AVATAR_OPTIONS.map((avatar) => (
          <Image
            key={avatar}
            src={avatar}
            alt="Avatar preload"
            width={32}
            height={32}
            className="hidden"
            unoptimized
          />
        ))}
    </div>
  );
}
