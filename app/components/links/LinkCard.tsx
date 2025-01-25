'use client';

import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import {
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';
import SafeImage from '../ui/SafeImage';
import CommentModal from './CommentModal';
import EditLinkModal from './EditLinkModal';

type LinkCardProps = {
  link: FormattedLink;
  isVoted: boolean;
  isOwner: boolean;
  isRemoving?: boolean;
  onVote: () => Promise<void>;
  onUnvote: () => Promise<void>;
  onComment: (content: string) => Promise<void>;
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
  onComment,
  onEdit,
  onDelete,
}: LinkCardProps) {
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showCommentModal, setShowCommentModal] = React.useState(false);

  const formatDate = (date: Date | string) => {
    const dateString = date instanceof Date ? date.toISOString() : date;
    const dateObject = new Date(dateString);
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

  const handleVote = async (_e: React.MouseEvent<HTMLButtonElement>) => {
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
                      onClick={onDelete}
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
                      className="object-cover"
                      fallbackSrc="/images/default-preview.png"
                    />
                  </div>
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleVote}
                    title={isVoted ? fr.common.unvote : fr.common.vote}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isVoted
                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-400'
                    }`}
                  >
                    <ArrowUpIcon
                      className={`h-4 w-4 transition-transform ${
                        isVoted
                          ? 'text-purple-400 transform -translate-y-0.5'
                          : ''
                      }`}
                    />
                    <span>{link.votes}</span>
                    {isVoted && (
                      <span className="ml-1 text-xs bg-purple-500/30 px-1.5 py-0.5 rounded">
                        {fr.common.voted}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowCommentModal(true);
                      onComment('');
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span>{link.comments.length}</span>
                  </button>
                </div>

                {/* Voters list */}
                {link.votes > 0 && link.voters && (
                  <div className="relative">
                    <div className="flex -space-x-2 overflow-visible group">
                      <div className="flex cursor-pointer">
                        {link.voters.slice(0, 3).map((voter, index) => (
                          <div
                            key={voter.id}
                            className="relative"
                            style={{
                              zIndex: 3 - index,
                              marginLeft: index === 0 ? '0' : '-8px',
                            }}
                          >
                            <SafeImage
                              src={voter.avatarUrl || '/default-avatar.png'}
                              alt={voter.name || 'User'}
                              width={24}
                              height={24}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1e1e38] transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:ring-purple-500/30"
                            />
                          </div>
                        ))}
                        {link.voters.length > 3 && (
                          <div
                            className="relative flex items-center justify-center h-6 w-6 -ml-2 rounded-full bg-purple-500/20 ring-2 ring-[#1e1e38] transition-all duration-300 ease-out group-hover:ring-purple-500/30"
                            style={{ zIndex: 0 }}
                          >
                            <span className="text-xs text-purple-400">
                              +{link.voters.length - 3}
                            </span>
                          </div>
                        )}

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
                            {link.voters.map((voter, index) => (
                              <div
                                key={voter.id}
                                className="flex items-center gap-2 mx-1 px-2 py-1.5 rounded-md hover:bg-purple-500/10 transition-colors"
                                style={{
                                  animationDelay: `${index * 30}ms`,
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
                              </div>
                            ))}
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
          onSubmit={async (title, description) => {
            await onEdit({ title, description });
            setShowEditModal(false);
          }}
          link={link}
        />
      )}

      {showCommentModal && (
        <CommentModal
          link={link}
          onClose={() => setShowCommentModal(false)}
          onSubmit={async (content: string) => {
            if (onComment) {
              await onComment(content);
            }
            setShowCommentModal(false);
          }}
        />
      )}
    </>
  );
}
