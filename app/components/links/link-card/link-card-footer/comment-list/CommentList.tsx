'use client';

import { fr } from '@/app/translations/fr';
import { formatDistanceToNow } from 'date-fns';
import { fr as dateFnsFR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import SafeImage from '../../../../ui/SafeImage';
import CommentInput from './CommentInput';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

type CommentListProps = {
  comments: Comment[];
  currentUser: {
    id: string;
    name: string;
    avatarUrl: string;
  } | null;
  onSubmitComment: (content: string) => void;
  onDeleteComment?: (commentId: string) => void;
};

const COMMENTS_PER_PAGE = 5;

export default function CommentList({
  comments,
  currentUser,
  onSubmitComment,
  onDeleteComment,
}: CommentListProps) {
  const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading for smooth transition
    setTimeout(() => {
      setVisibleComments((prev) => prev + COMMENTS_PER_PAGE);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    setVisibleComments(COMMENTS_PER_PAGE);
  }, [comments.length]);

  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const displayedComments = sortedComments.slice(-visibleComments);

  return (
    <div>
      {/* Comments list */}
      {comments.length > 0 && (
        <div className="px-4 pt-2 pb-2 space-y-4 border-t border-purple-500/10">
          {/* Load More button */}
          {comments.length > visibleComments && (
            <div className="flex justify-center">
              <motion.button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-pink-500/80 px-4 py-2 text-sm font-medium text-white/90 transition-all hover:from-purple-500/90 hover:to-pink-400/90 hover:scale-105 hover:text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform duration-300 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isLoading ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  )}
                </svg>
                {fr.comments.loadMore}
              </motion.button>
            </div>
          )}
          <AnimatePresence initial={false} mode="popLayout">
            {displayedComments.map((comment) => (
              <motion.div
                key={comment.id}
                className="flex space-x-3 py-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <div className="flex-shrink-0">
                  <SafeImage
                    src={comment.user.avatarUrl || '/default-avatar.png'}
                    alt={comment.user.name || 'User'}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full ring-2 ring-purple-500/20"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: dateFnsFR,
                      })}
                    </span>
                    {currentUser?.id === comment.userId && onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors duration-200 ml-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 break-words">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Comment Input */}
      {currentUser && (
        <CommentInput
          userAvatarUrl={currentUser.avatarUrl}
          userName={currentUser.name}
          onSubmit={onSubmitComment}
        />
      )}
    </div>
  );
}