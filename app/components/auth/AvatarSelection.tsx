'use client';

import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { fr } from '@/app/translations/fr';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AvatarSelectionProps {
  onSelect: (avatar: string) => void;
  disabled?: boolean;
}

export default function AvatarSelection({
  onSelect,
  disabled,
}: AvatarSelectionProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleNext = () => {
    setFocusedIndex((prev) => (prev + 1) % AVATAR_OPTIONS.length);
  };

  const handlePrev = () => {
    setFocusedIndex(
      (prev) => (prev - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length
    );
  };

  // Automatically select the current avatar when it changes
  useEffect(() => {
    onSelect(AVATAR_OPTIONS[focusedIndex]);
  }, [focusedIndex, onSelect]);

  const currentAvatar = AVATAR_OPTIONS[focusedIndex];
  const prevAvatar =
    AVATAR_OPTIONS[
      (focusedIndex - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length
    ];
  const nextAvatar = AVATAR_OPTIONS[(focusedIndex + 1) % AVATAR_OPTIONS.length];

  return (
    <div className="relative flex items-center justify-center py-8 px-4">
      {/* Navigation buttons */}
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePrev();
        }}
        type="button"
        className="absolute left-2 z-10 p-2 text-white/60 hover:text-white/80 transition-colors"
        disabled={disabled}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          handleNext();
        }}
        type="button"
        className="absolute right-2 z-10 p-2 text-white/60 hover:text-white/80 transition-colors"
        disabled={disabled}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Avatar display */}
      <div className="flex items-center gap-4">
        {/* Previous avatar */}
        <div className="relative w-12 h-12 opacity-40">
          <Image
            src={prevAvatar}
            alt={fr.common.avatarOption}
            className="object-contain"
            fill
            sizes="48px"
          />
        </div>

        {/* Current avatar */}
        <div
          className={`
            relative w-20 h-20 rounded-xl overflow-hidden
            ${disabled ? 'opacity-50' : ''}
            bg-[#1e1e38] transition-all duration-300
            ring-2 ring-purple-500 ring-offset-2 ring-offset-[#1a1a38]
          `}
        >
          <motion.div
            key={currentAvatar}
            className="relative w-full h-full p-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          >
            <Image
              src={currentAvatar}
              alt={fr.common.avatarOption}
              className="object-contain"
              fill
              sizes="80px"
              priority
            />
          </motion.div>
        </div>

        {/* Next avatar */}
        <div className="relative w-12 h-12 opacity-40">
          <Image
            src={nextAvatar}
            alt={fr.common.avatarOption}
            className="object-contain"
            fill
            sizes="48px"
          />
        </div>
      </div>

      {/* Avatar indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5">
        {AVATAR_OPTIONS.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFocusedIndex(index);
            }}
            disabled={disabled}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === focusedIndex
                ? 'bg-purple-500 w-3'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
