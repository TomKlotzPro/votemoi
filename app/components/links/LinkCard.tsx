'use client';

import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import {
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import SafeImage from '../ui/SafeImage';
import CommentModal from './CommentModal';
import EditLinkModal from './EditLinkModal';

type LinkCardProps = {
  link: FormattedLink;
  isVoted: boolean;
  isOwner: boolean;
  onVote: () => Promise<void>;
  onUnvote: () => Promise<void>;
  onComment: (content: string) => Promise<void>;
  onEdit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function LinkCard({
  link,
  isVoted,
  isOwner,
  onVote,
  onUnvote,
  onComment,
  onEdit,
  onDelete,
}: LinkCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

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

  return (
    <>
      <article className="group relative rounded-xl">
        <div className="relative group">
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
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                      title={fr.common.edit}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(link.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title={fr.common.delete}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (isVoted) {
                      onUnvote();
                    } else {
                      onVote();
                    }
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${
                    isVoted
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-400'
                  }`}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  <span>{link.voteCount}</span>
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
            </div>
          </div>
        </div>
      </article>

      {showEditModal && (
        <EditLinkModal
          link={link}
          onClose={() => setShowEditModal(false)}
          onSubmit={onEdit}
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
