'use client';

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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={link.user.avatarUrl || '/default-avatar.png'}
                    alt={link.user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-medium">
                      {link.user.name}
                    </span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(link.createdAt)}
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-1">
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
                    {link.title || link.url}
                    <LinkIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
                  </a>
                </h3>
                {link.description && (
                  <p className="mt-1 text-gray-400 text-sm line-clamp-2">
                    {link.description}
                  </p>
                )}
              </div>

              {/* Preview Image */}
              {link.previewImage && (
                <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-800">
                  <div className="relative aspect-[2/1] w-full">
                    <SafeImage
                      src={link.previewImage}
                      alt={link.previewTitle || link.title || link.url}
                      width={800}
                      height={400}
                      className="object-cover w-full h-full"
                      fallbackSrc="/images/default-preview.png"
                    />
                  </div>
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                        className={`h-5 w-5 transition-all duration-300 ${
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
                {link.voteCount > 0 &&
                  link.voters &&
                  link.voters.length > 0 && (
                    <div className="relative">
                      <div className="flex -space-x-2 overflow-visible group">
                        <div className="flex cursor-pointer">
                          <AnimatePresence mode="popLayout">
                            {link.voters.slice(0, 3).map((voter, index) => (
                              <motion.div
                                key={voter.id}
                                className="relative"
                                style={{
                                  zIndex: 3 - index,
                                }}
                                initial={{
                                  opacity: 0,
                                  scale: 0.5,
                                  x: -20,
                                  marginLeft: index === 0 ? '0' : '-8px',
                                }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  x: 0,
                                  marginLeft: index === 0 ? '0' : '-8px',
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
                                  delay: index * 0.1,
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
                            {link.voters.length > 3 && (
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
                                  +{link.voters.length - 3}
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
                                {link.voters.length}
                              </span>
                            </div>
                            <div className="py-1 max-h-48 overflow-y-auto">
                              <AnimatePresence mode="popLayout">
                                {link.voters.map((voter, index) => (
                                  <motion.div
                                    key={voter.id}
                                    className="flex items-center gap-2 mx-1 px-2 py-1.5 rounded-md hover:bg-purple-500/10 transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 500,
                                      damping: 30,
                                      delay: index * 0.05,
                                    }}
                                  >
                                    <SafeImage
                                      src={
                                        voter.avatarUrl || '/default-avatar.png'
                                      }
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
