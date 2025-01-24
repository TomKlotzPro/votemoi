'use client';

import { Link } from '@/app/types/link';
import { User } from '@/app/types/user';
import { fr } from '@/app/translations/fr';
import SafeImage from '../ui/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { HandThumbUpIcon, EllipsisVerticalIcon, ChatBubbleLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import LinkCardMenu from './LinkCardMenu';
import LinkComments from './LinkComments';
import VotersModal from './VotersModal';
import { useState } from 'react';

interface LinkCardProps {
  link: Link;
  user: User | null;
  onVote: (linkId: string) => Promise<void>;
  onUnvote: (linkId: string) => Promise<void>;
  onEdit: (data: { id: string; url: string; title?: string; description?: string }) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
  onComment: (link: Link) => void;
  showAuthForm: () => void;
}

export default function LinkCard({
  link,
  user,
  onVote,
  onUnvote,
  onEdit,
  onDelete,
  onComment,
  showAuthForm
}: LinkCardProps) {
  const [showVotersModal, setShowVotersModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVoteClick = async () => {
    if (!user) {
      showAuthForm();
      return;
    }

    setIsVoting(true);
    try {
      if (link.hasVoted) {
        await onUnvote(link.id);
      } else {
        await onVote(link.id);
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <SafeImage
                  src={link.createdBy.avatarUrl}
                  alt={link.createdBy.name}
                  className="w-5 h-5 rounded-full"
                />
                <span>{link.createdBy.name}</span>
              </div>
              <span>•</span>
              <time dateTime={link.createdAt}>
                {new Date(link.createdAt).toLocaleDateString()}
              </time>
            </div>
            <h2 className="mt-1 text-lg font-medium text-[var(--text-primary)] truncate">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--primary)] transition-colors"
              >
                {link.title}
              </a>
            </h2>
            {link.description && (
              <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
                {link.description}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          {user && user.id === link.createdBy.id && (
            <div className="relative z-50">
              <LinkCardMenu onEdit={() => onEdit(link)} onDelete={() => onDelete(link.id)} />
            </div>
          )}
        </div>

        {/* Preview */}
        {link.previewImage && (
          <div className="mt-4 aspect-[2/1] rounded-lg overflow-hidden bg-black/50 relative z-10">
            <SafeImage
              src={link.previewImage}
              alt={link.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleVoteClick}
              disabled={isVoting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 ${
                link.hasVoted
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--primary)]'
              }`}
            >
              <motion.div
                animate={{ 
                  scale: isVoting ? [1, 1.4, 0.8, 1.2, 1] : (link.hasVoted ? 1.1 : 1),
                  rotate: isVoting ? [0, -25, 25, -15, 0] : 0
                }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
              >
                <HandThumbUpIcon 
                  className={`w-4 h-4 transition-colors ${
                    link.hasVoted ? 'text-[var(--primary)]' : ''
                  }`}
                />
              </motion.div>
              
              <motion.span
                key={link.votes.length}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
              >
                {link.votes.length}
              </motion.span>

              {/* Confetti effect on vote */}
              <AnimatePresence>
                {isVoting && !link.hasVoted && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          scale: 0,
                          opacity: 1,
                          x: 0,
                          y: 0
                        }}
                        animate={{ 
                          scale: [1, 0],
                          opacity: [1, 0],
                          x: [0, (i % 2 === 0 ? 1 : -1) * Math.random() * 50],
                          y: [0, -Math.random() * 50]
                        }}
                        transition={{ 
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        className={`absolute w-1 h-1 rounded-full bg-[var(--primary)]`}
                        style={{
                          left: '50%',
                          top: '50%'
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={() => user ? onComment(link) : showAuthForm()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-white/5 transition-colors"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{link.comments.length}</span>
            </button>
          </div>

          {/* Voters Preview */}
          {link.votes.length > 0 && (
            <motion.button
              onClick={() => setShowVotersModal(true)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center -space-x-2 hover:space-x-1 transition-all duration-300">
                <AnimatePresence>
                  {link.votes.slice(0, 3).map((vote, index) => (
                    <motion.div
                      key={vote.user.id}
                      initial={{ opacity: 0, scale: 0.5, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5, x: 20 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                    >
                      <SafeImage
                        src={vote.user.avatarUrl}
                        alt={vote.user.name}
                        className="w-6 h-6 rounded-full border-2 border-black/30 transition-all duration-200"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {link.votes.length > 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative flex items-center gap-1 pl-3"
                  >
                    <UserGroupIcon className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white/60">
                      +{link.votes.length - 3}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          )}
        </div>
      </div>

      {/* Comments */}
      {link.comments.length > 0 && (
        <LinkComments comments={link.comments} />
      )}

      {/* Voters Modal */}
      <VotersModal
        isOpen={showVotersModal}
        onClose={() => setShowVotersModal(false)}
        votes={link.votes}
      />
    </motion.div>
  );
}
