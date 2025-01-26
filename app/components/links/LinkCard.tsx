'use client';

import { useUserDataStore } from '@/app/stores/userDataStore';
import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import {
  ChatBubbleLeftIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import SafeImage from '../ui/SafeImage';
import EditLinkModal from './EditLinkModal';

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
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [voters, setVoters] = React.useState(link.voters);
  const userData = useUserDataStore((state) => state.getUserData(link.user.id));
  const syncWithUser = useUserDataStore((state) => state.syncWithUser);

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
          <div className="rounded-lg bg-[#1e1e38]/80 backdrop-blur-md shadow-sm ring-1 ring-purple-500/20 overflow-hidden">
            {/* Main Content Area */}
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
                          d="M12 4L14.2857 9.57143L20 10.1429L16 14.2857L17.1429 20L12 17.1429L6.85714 20L8 14.2857L4 10.1429L9.71429 9.57143L12 4Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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

                  <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span>{link.comments.length}</span>
                  </button>
                </div>

                {/* Voters list */}
                {link.voteCount > 0 && voters && voters.length > 0 && (
                  <div className="flex -space-x-2 overflow-visible group">
                    <div className="flex relative">
                      <AnimatePresence mode="popLayout">
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
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#1e1e38]/95 backdrop-blur-sm rounded-lg shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none z-50">
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
          </div>
        </motion.div>
      </motion.article>

      {showEditModal && (
        <EditLinkModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (url, title, description) => {
            await onEdit({
              id: link.id,
              url,
              title: title || undefined,
              description: description || undefined,
            });
            setShowEditModal(false);
          }}
          link={link}
        />
      )}
    </>
  );
}
