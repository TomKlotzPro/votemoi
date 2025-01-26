'use client';

import { fr } from '@/app/translations/fr';
import { useCommentsStore } from '@/app/stores/commentsStore';
import { formatDistanceToNow } from 'date-fns';
import { fr as dateFnsFR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  linkId: string;
  initialComments: Comment[];
  currentUser: {
    id: string;
    name: string;
    avatarUrl: string;
  } | null;
  onCommentSuccess: (comment: Comment | null) => void;
  createComment: (linkId: string, content: string) => Promise<Comment>;
  deleteComment: (linkId: string, commentId: string) => Promise<void>;
};

const COMMENTS_PER_PAGE = 5;

export default function CommentList({
  linkId,
  initialComments,
  currentUser,
  onCommentSuccess,
  createComment,
  deleteComment,
}: CommentListProps) {
  const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  
  const commentsStore = useCommentsStore();
  const comments = commentsStore.getComments(linkId);

  // Initialize comments in store only once on mount
  useEffect(() => {
    if (initialComments?.length > 0) {
      commentsStore.setComments(linkId, initialComments);
    }
  }, [linkId]); // Remove initialComments and commentsStore from dependencies

  const handleAddComment = useCallback(async (content: string) => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('show-auth-form'));
      return;
    }

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await createComment(linkId, content);
      console.log('API Response:', response); // Debug log
      
      // Construct comment with fallback values
      const newComment = {
        id: response?.id || `${Date.now()}`,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        user: currentUser,
        linkId,
      };
      
      commentsStore.addComment(linkId, newComment);
      onCommentSuccess(newComment);

      // Update visible comments
      setVisibleComments(prev => Math.max(prev, comments.length));
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error(fr.errors.failedToCreateComment);
    } finally {
      setIsSubmitting(false);
    }
  }, [linkId, currentUser, commentsStore, createComment, onCommentSuccess, comments.length]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    setDeletingCommentId(commentId);
    
    try {
      await deleteComment(linkId, commentId);
      commentsStore.removeComment(linkId, commentId);
      onCommentSuccess(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error(fr.errors.failedToDeleteComment);
    } finally {
      setDeletingCommentId(null);
    }
  }, [linkId, commentsStore, deleteComment, onCommentSuccess]);

  const handleLoadMore = useCallback(() => {
    // When loading more, we want to show more of the older messages
    setVisibleComments(prev => Math.min(prev + COMMENTS_PER_PAGE, comments.length));
  }, [comments.length]);

  const displayedComments = useMemo(() => {
    // First sort by date ascending (oldest first)
    const sortedComments = [...comments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Then take the last COMMENTS_PER_PAGE items for most recent
    const recentComments = sortedComments.slice(
      Math.max(0, sortedComments.length - visibleComments)
    );
    
    return recentComments;
  }, [comments, visibleComments]);

  const formatCommentDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return fr.comments.justNow;
      }
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: dateFnsFR,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return fr.comments.justNow;
    }
  }, []);

  const renderComment = useCallback((comment: Comment) => {
    const isDeleting = deletingCommentId === comment.id;
    
    return (
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
            alt={`${comment.user.name}'s avatar`}
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
              {formatCommentDate(comment.createdAt)}
            </span>
            {currentUser?.id === comment.userId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteComment(comment.id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label={fr.comments.deleting}
                  >
                    <title>{fr.comments.deleting}</title>
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
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    role="img"
                    aria-label={fr.comments.delete}
                  >
                    <title>{fr.comments.delete}</title>
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
          <p className="text-sm text-gray-300 break-words">
            {comment.content}
          </p>
        </div>
      </motion.div>
    );
  }, [currentUser?.id, deletingCommentId, formatCommentDate, handleDeleteComment]);

  return (
    <div className="space-y-4">
      {comments.length > 0 && (
        <div className="px-4 pt-2 pb-2 border-t border-purple-500/10">
          {comments.length > visibleComments && (
            <div className="flex justify-center">
              <motion.button
                onClick={handleLoadMore}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors mb-4 px-4 py-2 rounded-lg hover:bg-purple-500/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {fr.comments.loadMore}
              </motion.button>
            </div>
          )}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayedComments.map(comment => (
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
                  {renderComment(comment)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      <CommentInput 
        onSubmit={handleAddComment} 
        isSubmitting={isSubmitting}
        userAvatarUrl={currentUser?.avatarUrl || ''}
        userName={currentUser?.name || ''}
      />
    </div>
  );
}