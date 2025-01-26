'use client';

import { useUserDataStore } from '@/app/stores/userDataStore';
import { fr } from '@/app/translations/fr';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import SafeImage from '@/app/components/ui/SafeImage';

type UserInfoProps = {
  userId: string;
  userName: string;
  userAvatarUrl: string;
  createdAt: string;
};

export default function UserInfo({ userId, userName, userAvatarUrl, createdAt }: UserInfoProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const userData = useUserDataStore((state) => state.getUserData(userId));
  const syncWithUser = useUserDataStore((state) => state.syncWithUser);

  // Sync user data on mount
  useEffect(() => {
    syncWithUser({
      id: userId,
      name: userName || '',
      avatarUrl: userAvatarUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [userId, userName, userAvatarUrl, syncWithUser]);

  // Update user info when user data changes
  useEffect(() => {
    if (userData) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  const formatDate = (date: Date | string) => {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - dateObject.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return fr.common.justNow;
    if (diffInMinutes < 60) return `${diffInMinutes} ${fr.common.minutesAgo}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${fr.common.hoursAgo}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${fr.common.daysAgo}`;
  };

  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={false}
        animate={
          isUpdating
            ? {
                scale: [1, 1.2, 0.9, 1.1, 1],
                rotate: [0, -15, 15, -5, 0],
                filter: [
                  'brightness(1)',
                  'brightness(1.3)',
                  'brightness(1)',
                ],
              }
            : {
                scale: 1,
                rotate: 0,
                filter: 'brightness(1)',
              }
        }
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="relative"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 blur-lg"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={
            isUpdating
              ? {
                  opacity: [0, 0.8, 0],
                  scale: [1.2, 1.8, 1.2],
                  rotate: [0, 180, 360],
                }
              : {
                  opacity: 0,
                  scale: 1.2,
                  rotate: 0,
                }
          }
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}
        />
        <SafeImage
          src={userData?.avatarUrl || userAvatarUrl || '/default-avatar.png'}
          alt={userData?.name || userName || 'User'}
          width={28}
          height={28}
          className="rounded-full shrink-0 relative z-10 ring-2 ring-purple-500/20"
        />
      </motion.div>
      <div className="flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={userData?.name || userName}
            initial={
              isUpdating
                ? {
                    y: 30,
                    x: -20,
                    opacity: 0,
                    scale: 0.5,
                    rotateX: 90,
                  }
                : false
            }
            animate={
              isUpdating
                ? {
                    y: 0,
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                  }
                : { opacity: 1 }
            }
            exit={
              isUpdating
                ? {
                    y: -30,
                    x: 20,
                    opacity: 0,
                    scale: 0.5,
                    rotateX: -90,
                  }
                : { opacity: 0 }
            }
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              mass: 1.5,
            }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-pink-500/30 rounded-lg blur-xl"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={
                isUpdating
                  ? {
                      opacity: [0, 0.8, 0],
                      scale: [1.2, 2, 1.2],
                      rotate: [0, 360],
                    }
                  : {
                      opacity: 0,
                      scale: 1.2,
                      rotate: 0,
                    }
              }
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
              }}
            />
            <p className="text-white font-medium text-sm whitespace-nowrap relative z-10 px-2 py-0.5">
              {userData?.name || userName}
            </p>
          </motion.div>
        </AnimatePresence>
        <span className="text-gray-500 mx-1.5 shrink-0">·</span>
        <span className="text-gray-500 text-sm shrink-0">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
}