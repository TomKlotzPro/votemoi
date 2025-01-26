'use client';

import { fr } from '@/app/translations/fr';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeImage from '../../../../ui/SafeImage';

type CommentInputProps = {
  userAvatarUrl?: string;
  userName?: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
};

export default function CommentInput({ 
  userAvatarUrl, 
  userName, 
  onSubmit,
  isSubmitting 
}: CommentInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const currentContent = content;
    setContent(''); // Clear immediately for optimistic update
    try {
      await onSubmit(currentContent);
    } catch (error) {
      setContent(currentContent); // Restore on error
      console.error('Failed to submit comment:', error);
    }
  };

  const avatarAlt = userName ? `${userName}'s avatar` : fr.comments.anonymousUser;

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="grid grid-cols-[40px_1fr_40px] gap-3 items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-shrink-0"
        >
          <SafeImage
            src={userAvatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback'}
            alt={avatarAlt}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-purple-500/20"
          />
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full"
        >
          <input
            type="text"
            value={content}
            onChange={(e) => {
              const value = e.target.value;
              if (value === ' ') return;
              setContent(value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && content.trim()) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={fr.comments.placeholder}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[#1e1e38] border border-purple-500/20 rounded-2xl text-sm text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </motion.div>
        <div className="flex-shrink-0">
          <motion.button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`p-2.5 rounded-xl text-white w-10 h-10 flex items-center justify-center transition-all ${
              !content.trim() || isSubmitting
                ? 'bg-purple-500/20 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600/80 to-pink-500/80 hover:from-purple-500/90 hover:to-pink-400/90'
            }`}
            whileHover={content.trim() && !isSubmitting ? { scale: 1.05 } : {}}
            whileTap={content.trim() && !isSubmitting ? { scale: 0.95 } : {}}
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                role="img"
                aria-label={fr.comments.loading}
              >
                <title>{fr.comments.loading}</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label={fr.comments.send}
              >
                <title>{fr.comments.send}</title>
                <motion.path
                  d="M22 2L11 13"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                />
                <motion.path
                  d="M22 2L15 22L11 13L2 9L22 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                />
              </motion.svg>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  );
}