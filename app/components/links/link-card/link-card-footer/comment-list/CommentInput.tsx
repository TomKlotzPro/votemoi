'use client';

import { fr } from '@/app/translations/fr';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import SafeImage from '../../../../ui/SafeImage';

type CommentInputProps = {
  userAvatarUrl: string;
  userName: string;
  onSubmit: (content: string) => void;
};

export default function CommentInput({
  userAvatarUrl,
  userName,
  onSubmit,
}: CommentInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/10">
      <div className="grid grid-cols-[40px_1fr_40px] gap-3 items-center">
        <div className="flex-shrink-0">
          <SafeImage
            src={userAvatarUrl || '/default-avatar.png'}
            alt={userName || 'User'}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-purple-500/20"
          />
        </div>
        <div className="w-full">
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
        </div>
        <div className="flex-shrink-0">
          <motion.button
            type="submit"
            disabled={!content.trim()}
            className={`p-2.5 rounded-xl text-white w-10 h-10 flex items-center justify-center transition-all ${
              !content.trim()
                ? 'bg-purple-500/20 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 hover:scale-105'
            }`}
            whileHover={content.trim() ? { scale: 1.05 } : {}}
            whileTap={content.trim() ? { scale: 0.95 } : {}}
          >
            <svg
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
            </svg>
          </motion.button>
        </div>
      </div>
    </form>
  );
}