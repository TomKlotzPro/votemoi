'use client';

import { fr } from '@/app/translations/fr';
import { createComment, deleteComment } from '@/app/actions/comments';
import { formatDistanceToNow } from 'date-fns';
import { fr as dateFnsFR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
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
  linkId: string;
};

type CommentListProps = {
  comments: Comment[];
  currentUser: {
    id: string;
    name: string;
    avatarUrl: string;
  } | null;
  linkId: string;
  onCommentSuccess: (comment: Comment | null) => void;
};

const COMMENTS_PER_PAGE = 5;

export default function CommentList({
  comments,
  currentUser,
  linkId,
  onCommentSuccess,
}: CommentListProps) {
  const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const handleSubmitComment = useCallback(async (content: string) => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('show-auth-form'));
      return;
    }

    if (!content.trim()) return;

    setIsSubmitting(true);
    // Create optimistic comment
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      linkId,
    };

    // Optimistically add the comment
    onCommentSuccess(optimisticComment);

    try {
      const newComment = await createComment(linkId, content);
      // Replace optimistic comment with real one
      onCommentSuccess(newComment);
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Remove optimistic comment on error
      onCommentSuccess(null);
      toast.error(fr.errors.failedToCreateComment);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, linkId, onCommentSuccess]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('show-auth-form'));
      return;
    }

    // Store comment for potential restoration
    const deletedComment = optimisticComments.find(c => c.id === commentId);
    
    // Optimistically remove comment and update UI
    onCommentSuccess(null);
    setOptimisticComments(prev => prev.filter(c => c.id !== commentId));

    try {
      await deleteComment(linkId, commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      // Restore comment on error
      if (deletedComment) {
        onCommentSuccess(deletedComment);
        setOptimisticComments(prev => [...prev, deletedComment]);
      }
      toast.error(fr.errors.failedToDeleteComment);
    }
  }, [currentUser, linkId, optimisticComments, onCommentSuccess]);

  useEffect(() => {
    setOptimisticComments(comments);
  }, [comments]);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading for smooth transition
    setTimeout(() => {
      setVisibleComments((prev) => prev + COMMENTS_PER_PAGE);
      setIsLoading(false);
    }, 300);
  };

  const sortedComments = [...optimisticComments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const displayedComments = sortedComments.slice(-visibleComments);

  return (
    <div>
      {/* Comments list */}
      {optimisticComments.length > 0 && (
        <div className="px-4 pt-2 pb-2 space-y-4 border-t border-purple-500/10">
          {/* Load More button */}
          {optimisticComments.length > visibleComments && (
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                {fr.buttons.loadMore}
              </motion.button>
            </div>
          )}

          {/* Comments */}
          <AnimatePresence mode="popLayout" initial={false}>
            {displayedComments.map((comment) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 40,
                  mass: 1
                }}
                className="flex space-x-3 py-2"
              >
                <div className="flex-shrink-0">
                  <SafeImage
                    src={comment.user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback'}
                    alt={comment.user.name}
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
                    {currentUser?.id === comment.userId && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        disabled={deletingCommentId === comment.id}
                      >
                        {deletingCommentId === comment.id ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            fill="none"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </motion.button>
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
        <div className="p-4 pt-2">
          <CommentInput
            userAvatarUrl={currentUser.avatarUrl}
            userName={currentUser.name}
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}