'use client';

import { fr } from '@/app/translations/fr';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeImage from '../../../../ui/SafeImage';

type CommentInputProps = {
  userAvatarUrl: string;
  userName: string;
  onSubmit: (content: string) => Promise<void>;
};

export default function CommentInput({ userAvatarUrl, userName, onSubmit }: CommentInputProps) {
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
            alt={userName}
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
            className="w-full px-4 py-3 bg-[#1e1e38] border border-purple-500/20 rounded-2xl text-sm text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </motion.div>
        <div className="flex-shrink-0">
          <motion.button
            type="submit"
            disabled={!content.trim()}
            className={`p-2.5 rounded-xl text-white w-10 h-10 flex items-center justify-center transition-all ${
              !content.trim()
                ? 'bg-purple-500/20 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600/80 to-pink-500/80 hover:from-purple-500/90 hover:to-pink-400/90'
            }`}
            whileHover={content.trim() ? { scale: 1.05 } : {}}
            whileTap={content.trim() ? { scale: 0.95 } : {}}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
          </motion.button>
        </div>
      </div>
    </form>
  );
}