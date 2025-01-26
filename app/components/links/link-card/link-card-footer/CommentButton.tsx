'use client';

import { motion } from 'framer-motion';
import React from 'react';

type CommentButtonProps = {
  showComments: boolean;
  commentCount: number;
  isDisabled: boolean;
  onClick: () => void;
};

export default function CommentButton({
  showComments,
  commentCount,
  isDisabled,
  onClick,
}: CommentButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1 px-2 h-8 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-colors duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isDisabled}
    >
      <motion.div className="relative">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={false}
          animate={
            showComments
              ? {
                  fill: '#d946db',
                  stroke: '#d946db',
                  scale: 1,
                }
              : {
                  fill: 'rgba(0,0,0,0)',
                  stroke: 'currentColor',
                  scale: 1,
                }
          }
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </motion.svg>
      </motion.div>
      <motion.div className="relative">
        <motion.span
          key={`count-${commentCount}`}
          className={`block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-400'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {commentCount}
        </motion.span>
      </motion.div>
    </motion.button>
  );
}