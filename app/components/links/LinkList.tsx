'use client';

import { FormattedLink } from '@/app/types/link';
import { User } from '@/app/types/user';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import EmptyLinkList from './EmptyLinkList';
import LinkCard from './LinkCard';
import LinkCardSkeleton from './LinkCardSkeleton';

type LinkListProps = {
  links: FormattedLink[];
  isLoading: boolean;
  user: User | null;
  onVote: (linkId: string) => Promise<void>;
  onUnvote: (linkId: string) => Promise<void>;
  onEdit: (link: Partial<FormattedLink>) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
};

const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function LinkList({
  links,
  isLoading,
  user,
  onVote,
  onUnvote,
  onEdit,
  onDelete,
}: LinkListProps) {
  const [localLinks, setLocalLinks] = useState(links);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoading) return;
    const newLinks = links.filter((link) => !removingIds.has(link.id));
    setLocalLinks(newLinks);
  }, [links, isLoading, removingIds]);

  const handleDelete = async (linkId: string) => {
    setRemovingIds((prev) => new Set([...prev, linkId]));
    await onDelete(linkId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <LinkCardSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {localLinks.length > 0 ? (
          <motion.div
            key="links"
            className="max-w-3xl mx-auto space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence mode="popLayout">
              {localLinks.map((link) => (
                <motion.div
                  key={link.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                  className={
                    removingIds.has(link.id)
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                >
                  <LinkCard
                    link={link}
                    isVoted={
                      user
                        ? link.voters.some((voter) => voter.id === user.id)
                        : false
                    }
                    isOwner={user ? link.createdById === user.id : false}
                    onVote={() => onVote(link.id)}
                    onUnvote={() => onUnvote(link.id)}
                    onEdit={(data) => onEdit({ ...link, ...data })}
                    onDelete={() => handleDelete(link.id)}
                    isRemoving={removingIds.has(link.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 25,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: {
                duration: 0.2,
              },
            }}
          >
            <EmptyLinkList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
