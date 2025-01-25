'use client';

import { fr } from '@/app/translations/fr';
import { Link } from '@/app/types/link';
import {
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';
import CommentModal from './CommentModal';
import EditLinkModal from './EditLinkModal';

type LinkCardProps = {
  link: Link;
  isVoted: boolean;
  isOwner: boolean;
  onVote: () => Promise<void>;
  onUnvote: () => Promise<void>;
  onComment: () => void;
  onEdit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
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
      <article className="group relative rounded-lg bg-[#1e1e38] p-4 sm:p-6 hover:bg-[#1e1e38]/90 transition-colors">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Vote Button */}
          <div className="flex sm:flex-col items-center gap-2">
            <button
              onClick={() => {
                if (isVoted) {
                  onUnvote();
                } else {
                  onVote();
                }
              }}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 text-sm transition-all ${
                isVoted
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-400'
              }`}
            >
              <ArrowUpIcon className="h-4 w-4" />
              <span>{link.votes.length}</span>
            </button>
            <button
              onClick={() => {
                setShowCommentModal(true);
                onComment();
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{link.comments.length}</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-white">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.title || link.url}
                  </a>
                </h3>
                {link.description && (
                  <p className="text-sm text-gray-400">{link.description}</p>
                )}
              </div>

              {/* Actions */}
              {isOwner && (
                <div className="flex items-center gap-2 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                    title={fr.common.edit}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(link.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title={fr.common.delete}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
              <span>
                {fr.common.postedBy} {link.user.name}
              </span>
              <span>{formatDate(link.createdAt)}</span>
            </div>
          </div>
        </div>

        {link.previewImage && (
          <div className="relative h-48 rounded-lg overflow-hidden mt-4">
            <Image
              src={link.previewImage}
              alt={link.title || link.url}
              fill
              className="object-cover"
            />
          </div>
        )}
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
          onSubmit={() => {}}
        />
      )}
    </>
  );
}
