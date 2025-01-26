'use client';

import { useUser } from '@/app/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { fr } from '@/app/translations/fr';

type CommentButtonProps = {
  showComments: boolean;
  commentCount: number;
  onClick: () => void;
};

export default function CommentButton({
  showComments,
  commentCount,
  onClick,
}: CommentButtonProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticCommentCount, setOptimisticCommentCount] = useState(commentCount);

  const handleClick = useCallback(async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('show-auth-form'));
      return;
    }

    setIsLoading(true);
    setOptimisticCommentCount(showComments ? commentCount - 1 : commentCount + 1);
    try {
      onClick();
    } catch (error) {
      console.error('Failed to handle comment:', error);
      setOptimisticCommentCount(commentCount);
    } finally {
      setIsLoading(false);
    }
  }, [user, showComments, commentCount, onClick]);

  return (
    <motion.button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm text-purple-400/50 hover:text-purple-300 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isLoading}
    >
      <motion.div
        animate={showComments ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          key={commentCount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`block ${isLoading ? 'text-gray-500' : 'text-gray-400'}`}
        >
          {commentCount}{' '}
          {commentCount === 1 ? fr.comments.comment : fr.comments.comments}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}