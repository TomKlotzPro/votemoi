'use client';

import { useUser } from '@/app/context/user-context';
import { useUserDataStore } from '@/app/stores/userDataStore';
import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import {
  LinkIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import AuthForm from '../auth/AuthForm';
import SafeImage from '../ui/SafeImage';

type LinkCardProps = {
  link: FormattedLink;
  isVoted: boolean;
  isOwner: boolean;
  isRemoving?: boolean;
  onVote: () => Promise<void>;
  onUnvote: () => Promise<void>;
  onEdit: (data: Partial<FormattedLink>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function LinkCard({
  link,
  isVoted,
  isOwner,
  isRemoving = false,
  onVote,
  onUnvote,
  onEdit,
  onDelete,
}: LinkCardProps) {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [voters, setVoters] = useState(link.voters);
  const [visibleComments, setVisibleComments] = useState(5);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const userData = useUserDataStore((state) => state.getUserData(link.user.id));
  const syncWithUser = useUserDataStore((state) => state.syncWithUser);
  const { user, setUser, session } = useUser();

  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 5);
  };

  useEffect(() => {
    if (user) {
      // Update link owner data if it matches the current user
      if (link.user.id === user.id) {
        link.user = {
          ...link.user,
          name: user.name,
          avatarUrl: user.avatarUrl,
        };
      }

      // Update voters data
      const updatedVoters = link.voters.map((voter) =>
        voter.id === user.id
          ? { ...voter, name: user.name, avatarUrl: user.avatarUrl }
          : voter
      );
      link.voters = updatedVoters;
      setVoters(updatedVoters);

      // Update comments data
      link.comments = link.comments.map((comment) =>
        comment.user.id === user.id
          ? {
              ...comment,
              user: {
                ...comment.user,
                name: user.name,
                avatarUrl: user.avatarUrl,
              },
            }
          : comment
      );
    }
  }, [user, link]);

  const handleAddComment = async () => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/links/${link.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowAuthForm(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.comment || !data.comment.id) {
        throw new Error('Invalid server response');
      }

      // Create new comment object with all required fields
      const newCommentObj = {
        id: data.comment.id,
        content: data.comment.content,
        createdAt: data.comment.createdAt,
        user: data.comment.user,
        userId: data.comment.userId,
        linkId: data.comment.linkId,
        isDeleted: false,
      };

      // Update comments array with new comment
      link.comments = [...link.comments, newCommentObj];
      setNewComment('');

      // Automatically show comments when adding the first comment
      if (!showComments) {
        setShowComments(true);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      // You might want to show a toast or error message to the user here
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      // Update the comments array by removing the deleted comment
      link.comments = link.comments.filter(
        (comment) => comment.id !== commentId
      );

      // If no comments left, hide the comments section
      if (link.comments.length === 0) {
        setShowComments(false);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // Sync user data on mount
  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    syncWithUser({
      id: link.user.id,
      name: link.user.name || '',
      avatarUrl: link.user.avatarUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [link.user.id, syncWithUser]);

  // Update voters when link.voters changes
  React.useEffect(() => {
    setVoters(link.voters);
  }, [link.voters]);

  // Update voter info when user data changes
  React.useEffect(() => {
    if (userData && voters.some((voter) => voter.id === link.user.id)) {
      const updatedVoters = voters.map((voter) => {
        if (voter.id === link.user.id) {
          return {
            ...voter,
            name: userData.name,
            avatarUrl: userData.avatarUrl,
          };
        }
        return voter;
      });
      setVoters(updatedVoters);
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [userData, link.user.id]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const formatDate = (date: Date | string) => {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - dateObject.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return fr.common.justNow;
    if (diffInMinutes < 60) return `${diffInMinutes} ${fr.common.minutesAgo}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${fr.common.hoursAgo}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${fr.common.daysAgo}`;
  };

  const handleVoteClick = async (
    _event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }

    if (isVoted) {
      await onUnvote();
    } else {
      await onVote();
    }
  };

  return (
    <>
      <motion.article
        className="relative rounded-xl"
        animate={{
          opacity: isRemoving ? 0.5 : 1,
          scale: isRemoving ? 0.98 : 1,
          filter: isRemoving ? 'blur(2px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="relative"
          whileHover={!isRemoving && { scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative bg-[#1e1e38]/80 rounded-xl border border-purple-500/10 overflow-hidden"
          >
            {/* Main card content */}
            <div className="p-4">
              {/* Header with User Info and Actions */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={false}
                    animate={
                      isUpdating
                        ? {
                            scale: [1, 1.2, 0.9, 1.1, 1],
                            rotate: [0, -15, 15, -5, 0],
                            filter: [
                              'brightness(1)',
                              'brightness(1.3)',
                              'brightness(1)',
                            ],
                          }
                        : {
                            scale: 1,
                            rotate: 0,
                            filter: 'brightness(1)',
                          }
                    }
                    transition={{
                      duration: 1.2,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="relative"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 blur-lg"
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={
                        isUpdating
                          ? {
                              opacity: [0, 0.8, 0],
                              scale: [1.2, 1.8, 1.2],
                              rotate: [0, 180, 360],
                            }
                          : {
                              opacity: 0,
                              scale: 1.2,
                              rotate: 0,
                            }
                      }
                      transition={{
                        duration: 1.5,
                        ease: 'easeInOut',
                      }}
                    />
                    <SafeImage
                      src={
                        userData?.avatarUrl ||
                        link.user.avatarUrl ||
                        '/default-avatar.png'
                      }
                      alt={userData?.name || link.user.name || 'User'}
                      width={28}
                      height={28}
                      className="rounded-full shrink-0 relative z-10 ring-2 ring-purple-500/20"
                    />
                  </motion.div>
                  <div className="flex items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={userData?.name || link.user.name}
                        initial={
                          isUpdating
                            ? {
                                y: 30,
                                x: -20,
                                opacity: 0,
                                scale: 0.5,
                                rotateX: 90,
                              }
                            : false
                        }
                        animate={
                          isUpdating
                            ? {
                                y: 0,
                                x: 0,
                                opacity: 1,
                                scale: 1,
                                rotateX: 0,
                              }
                            : { opacity: 1 }
                        }
                        exit={
                          isUpdating
                            ? {
                                y: -30,
                                x: 20,
                                opacity: 0,
                                scale: 0.5,
                                rotateX: -90,
                              }
                            : { opacity: 0 }
                        }
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 20,
                          mass: 1.5,
                        }}
                        className="relative"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-pink-500/30 rounded-lg blur-xl"
                          initial={{ opacity: 0, scale: 1.2 }}
                          animate={
                            isUpdating
                              ? {
                                  opacity: [0, 0.8, 0],
                                  scale: [1.2, 2, 1.2],
                                  rotate: [0, 360],
                                }
                              : {
                                  opacity: 0,
                                  scale: 1.2,
                                  rotate: 0,
                                }
                          }
                          transition={{
                            duration: 1.5,
                            ease: 'easeInOut',
                          }}
                        />
                        <p className="text-white font-medium text-sm whitespace-nowrap relative z-10 px-2 py-0.5">
                          {userData?.name || link.user.name}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                    <span className="text-gray-500 mx-1.5 shrink-0">·</span>
                    <span className="text-gray-500 text-sm shrink-0">
                      {formatDate(link.createdAt)}
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <motion.button
                      onClick={() => setShowEditModal(true)}
                      className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                      title={fr.common.edit}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(link.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title={fr.common.delete}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <div className="mb-3">
                <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <span className="line-clamp-2">
                      {link.title || link.url}
                    </span>
                    <LinkIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
                  </a>
                </h3>
                {link.description && (
                  <p className="mt-1 text-gray-400 text-sm line-clamp-2 sm:line-clamp-3">
                    {link.description}
                  </p>
                )}
              </div>

              {/* Preview Image */}
              {link.previewImage && (
                <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-800 flex justify-center items-center">
                  <SafeImage
                    src={link.previewImage}
                    alt={link.previewTitle || link.title || link.url}
                    width={300}
                    height={150}
                    className="w-full h-full object-cover"
                    fallbackSrc="/images/default-preview.png"
                  />
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleVoteClick}
                    className={`group relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isVoted
                        ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-amber-500/20 text-fuchsia-400'
                        : 'hover:bg-white/5 text-gray-400 hover:text-fuchsia-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="relative"
                      initial={false}
                      animate={
                        isVoted ? { rotate: [0, 15, -15, 0] } : { rotate: 0 }
                      }
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-5 w-5 transition-all duration-300 ease-out ${
                          isVoted ? 'stroke-[1.5]' : 'stroke-2'
                        }`}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <motion.path
                          d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          initial={false}
                          animate={
                            isVoted
                              ? {
                                  fill: [
                                    'rgba(0,0,0,0)',
                                    'rgba(217,70,219,0.2)',
                                  ],
                                  stroke: ['currentColor', '#d946db'],
                                  scale: [1, 1.2, 1],
                                }
                              : {
                                  fill: 'rgba(0,0,0,0)',
                                  stroke: 'currentColor',
                                  scale: 1,
                                }
                          }
                          transition={{ duration: 0.3 }}
                        />
                      </svg>
                      {isVoted && (
                        <>
                          <motion.div
                            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 0] }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                          <motion.div
                            className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-amber-400"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 0] }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                          <motion.div
                            className="absolute -top-2 -left-1 h-1.5 w-1.5 rounded-full bg-indigo-400"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 0] }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          />
                        </>
                      )}
                    </motion.div>
                    <motion.div className="relative">
                      <motion.span
                        key={`count-${link.voteCount}`}
                        className="block"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.voteCount}
                      </motion.span>
                    </motion.div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      if (!user && link.comments.length === 0) {
                        return;
                      }
                      setShowComments(!showComments);
                    }}
                    className="flex items-center gap-1 px-2 h-8 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!user && link.comments.length === 0}
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
                        key={`count-${link.comments.length}`}
                        className={`block text-sm ${!user && link.comments.length === 0 ? 'text-gray-500' : 'text-gray-400'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.comments.length}
                      </motion.span>
                    </motion.div>
                  </motion.button>
                </div>

                {/* Voters list */}
                {link.voteCount > 0 && voters && voters.length > 0 && (
                  <div className="flex -space-x-2 overflow-visible group">
                    <div className="flex relative">
                      <AnimatePresence mode="wait">
                        {voters.slice(0, 3).map((voter) => (
                          <motion.div
                            key={voter.id}
                            className="relative"
                            style={{
                              zIndex:
                                voters.indexOf(voter) === 0
                                  ? 3
                                  : voters.indexOf(voter) === 1
                                    ? 2
                                    : 1,
                            }}
                            initial={{
                              opacity: 0,
                              scale: 0.5,
                              x: -20,
                              marginLeft:
                                voters.indexOf(voter) === 0 ? '0' : '-8px',
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              x: 0,
                              marginLeft:
                                voters.indexOf(voter) === 0 ? '0' : '-8px',
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.5,
                              x: 20,
                              transition: { duration: 0.2 },
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                              delay: voters.indexOf(voter) * 0.1,
                            }}
                          >
                            <SafeImage
                              src={voter.avatarUrl || '/default-avatar.png'}
                              alt={voter.name || 'User'}
                              width={24}
                              height={24}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1e1e38] transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:ring-purple-500/30"
                            />
                          </motion.div>
                        ))}
                        {voters.length > 3 && (
                          <motion.div
                            key="more-voters"
                            className="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 ring-2 ring-[#1e1e38] transition-all duration-300 ease-out group-hover:ring-purple-500/30"
                            style={{ zIndex: 0, marginLeft: '-8px' }}
                            initial={{ opacity: 0, scale: 0.5, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5, x: 20 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                              delay: 0.3,
                            }}
                          >
                            <span className="text-xs text-purple-400">
                              +{voters.length - 3}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Voters tooltip */}
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#1e1e38]/95 backdrop-blur-sm rounded-lg shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none z-50">
                        <div className="flex items-center justify-between p-3 text-xs text-gray-300 border-b border-purple-500/10">
                          <div className="flex items-center gap-2">
                            <UserGroupIcon className="h-4 w-4 text-purple-400" />
                            <span>{fr.common.voters}</span>
                          </div>
                          <span className="text-purple-400">
                            {voters.length}
                          </span>
                        </div>
                        <div className="py-1 max-h-48 overflow-y-auto">
                          <AnimatePresence mode="popLayout">
                            {voters.map((voter) => (
                              <motion.div
                                key={voter.id}
                                className="flex items-center gap-2 mx-1 px-2 py-1.5 rounded-md hover:bg-purple-500/10 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 500,
                                  damping: 30,
                                  delay: voters.indexOf(voter) * 0.05,
                                }}
                              >
                                <SafeImage
                                  src={voter.avatarUrl || '/default-avatar.png'}
                                  alt={voter.name || 'User'}
                                  width={20}
                                  height={20}
                                  className="rounded-full ring-1 ring-purple-500/20"
                                />
                                <span className="text-xs text-gray-300 font-medium">
                                  {voter.name}
                                </span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {/* Comments list */}
                  {link.comments.length > 0 && (
                    <div className="px-4 pt-2 pb-2 space-y-4 border-t border-purple-500/10">
                      {link.comments.length > visibleComments && (
                        <div className="flex justify-center">
                          <button
                            onClick={handleLoadMore}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Charger plus
                          </button>
                        </div>
                      )}
                      <AnimatePresence initial={false} mode="popLayout">
                        {[...link.comments]
                          .sort(
                            (a, b) =>
                              new Date(a.createdAt).getTime() -
                              new Date(b.createdAt).getTime()
                          )
                          .slice(-visibleComments)
                          .map((comment) => (
                            <motion.div
                              key={comment.id}
                              className="flex space-x-3 py-2"
                            >
                              <div className="flex-shrink-0">
                                <SafeImage
                                  src={
                                    comment.user.avatarUrl ||
                                    '/default-avatar.png'
                                  }
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
                                  <span className="text-xs text-gray-400">
                                    ·
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(
                                      new Date(comment.createdAt),
                                      {
                                        addSuffix: true,
                                        locale: frLocale,
                                      }
                                    )}
                                  </span>
                                  {user?.id === comment.userId && (
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
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
                                <p className="text-gray-300 break-words">
                                  {comment.content}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Comment Input */}
                  {user && (
                    <div className="p-4 border-t border-purple-500/10">
                      <div className="grid grid-cols-[40px_1fr_40px] gap-3 items-center">
                        <div className="flex-shrink-0">
                          <SafeImage
                            src={user.avatarUrl || '/default-avatar.png'}
                            alt={user.name || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full ring-2 ring-purple-500/20"
                          />
                        </div>
                        <div className="w-full">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === ' ') return;
                              setNewComment(value);
                            }}
                            onKeyDown={(e) => {
                              if (
                                e.key === 'Enter' &&
                                !e.shiftKey &&
                                newComment.trim()
                              ) {
                                e.preventDefault();
                                handleAddComment();
                              }
                            }}
                            placeholder={fr.comments.placeholder}
                            className="w-full px-4 py-3 bg-[#1e1e38] border border-purple-500/20 rounded-2xl text-sm text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className={`p-2.5 rounded-xl text-white w-10 h-10 flex items-center justify-center transition-all ${
                              !newComment.trim()
                                ? 'bg-purple-500/20 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 hover:scale-105'
                            }`}
                            type="button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              fill="none"
                            >
                              <motion.path
                                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L11.414 12l4.293-4.293a1 1 0 111.414-1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 12 4.293 5.707a1 1 0 010-1.414z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {showAuthForm && (
          <AuthForm
            onSuccess={(newUser) => {
              setUser(newUser);
              setShowAuthForm(false);
              // Try to vote after successful login
              onVote();
            }}
            onClose={() => setShowAuthForm(false)}
          />
        )}
      </motion.article>
    </>
  );
}
