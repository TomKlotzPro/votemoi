'use client';

import { useUser } from '@/app/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useState, useMemo } from 'react';
import { fr } from '@/app/translations/fr';
import { useCommentsStore } from '@/app/stores/commentsStore';

type CommentButtonProps = {
  linkId: string;
  showComments: boolean;
  commentCount: number;
  onClick: () => void;
};

export default function CommentButton({
  linkId,
  showComments,
  commentCount: initialCommentCount,
  onClick,
}: CommentButtonProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const commentsStore = useCommentsStore();
  const commentCount = commentsStore.getCommentCount(linkId) || initialCommentCount;

  const handleClick = useCallback(async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('show-auth-form'));
      return;
    }

    setIsLoading(true);
    try {
      onClick();
    } catch (error) {
      console.error('Failed to toggle comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, onClick]);

  return (
    <motion.button
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm ${
        showComments ? 'text-purple-400' : 'text-gray-400'
      } hover:text-purple-300 transition-colors`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isLoading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        role="img"
        aria-label={fr.comments.comment}
      >
        <title>{fr.comments.comment}</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <motion.span
        key={commentCount}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`block ${isLoading ? 'text-gray-500' : 'text-gray-400'}`}
      >
        {commentCount}{' '}
        {commentCount === 1 ? fr.comments.comment : fr.comments.comments}
      </motion.span>
    </motion.button>
  );
}