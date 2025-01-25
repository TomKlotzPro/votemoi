'use client';

import { FormattedUser } from '@/app/types/user';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AnimatedUserInfoProps {
  user: FormattedUser;
  imageSize?: number;
  showName?: boolean;
  className?: string;
  imageClassName?: string;
  nameClassName?: string;
  afterName?: React.ReactNode;
}

export default function AnimatedUserInfo({
  user,
  imageSize = 32,
  showName = false,
  className = '',
  imageClassName = '',
  nameClassName = '',
  afterName,
}: AnimatedUserInfoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        layout
        className={`relative shrink-0 ${imageClassName}`}
        style={{ width: imageSize, height: imageSize }}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            fill
            className="object-cover rounded-lg"
            sizes={`${imageSize}px`}
          />
        ) : (
          <UserCircleIcon className="w-full h-full text-gray-400" />
        )}
      </motion.div>

      {showName && (
        <motion.div
          layout
          className={`flex items-center text-sm text-gray-300 ${nameClassName}`}
        >
          <motion.span
            layout
            className="truncate"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {user.name}
          </motion.span>
          {afterName}
        </motion.div>
      )}
    </div>
  );
}
