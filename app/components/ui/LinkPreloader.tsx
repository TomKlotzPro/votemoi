'use client';

import { useEffect } from 'react';

export default function LinkPreloader() {
  useEffect(() => {
    const preloadLinks = async () => {
      try {
        // Prefetch the links data
        await fetch('/api/links', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Links preloaded successfully');
      } catch (error) {
        console.error('Error preloading links:', error);
      }
    };

    preloadLinks();
  }, []);

  // This component doesn't render anything visible
  return null;
}
