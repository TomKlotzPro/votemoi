'use client';

import { AVATAR_OPTIONS, LOADING_MESSAGES } from '@/app/constants/avatars';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AvatarPreloader from './AvatarPreloader';

type LoadingScreenProps = {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({
  onLoadingComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [avatarsLoaded, setAvatarsLoaded] = useState(false);

  useEffect(() => {
    if (!avatarsLoaded) return;

    const duration = 2000; // Reduced to 2 seconds since we're also waiting for avatars
    const interval = 200; // Update every 200ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          setTimeout(onLoadingComplete, 500); // Give time for final animation
        }
        return next;
      });
    }, interval);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onLoadingComplete, avatarsLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      <AvatarPreloader
        avatars={AVATAR_OPTIONS}
        onLoad={() => setAvatarsLoaded(true)}
      />
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <p className="text-white/60">{LOADING_MESSAGES[messageIndex]}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
