'use client';

import { FormattedLink } from '@/app/types/link';
import { User } from '@/app/types/user';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import EmptyLinkList from './EmptyLinkList';
import LinkCard from './LinkCard';

type LinkListProps = {
  links: FormattedLink[];
  isLoading: boolean;
  user: User | null;
  onVote: (linkId: string) => Promise<void>;
  onUnvote: (linkId: string) => Promise<void>;
  onComment: (linkId: string) => void;
  onEdit: (link: Partial<FormattedLink>) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
};

export default function LinkList({
  links,
  isLoading,
  user,
  onVote,
  onUnvote,
  onComment,
  onEdit,
  onDelete,
}: LinkListProps) {
  // Keep a local copy of links to handle smooth transitions
  const [localLinks, setLocalLinks] = useState(links);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Update local links when props change, but only if not removing items
  useEffect(() => {
    if (!isLoading) {
      const newLinks = links.filter((link) => !removingIds.has(link.id));
      setLocalLinks((prevLinks) => {
        // Keep items being removed in the list
        const removedLinks = prevLinks.filter((link) =>
          removingIds.has(link.id)
        );
        // Add new links at the beginning
        const addedLinks = newLinks.filter(
          (newLink) => !prevLinks.some((oldLink) => oldLink.id === newLink.id)
        );
        // Keep existing links in their current order
        const existingLinks = newLinks.filter((newLink) =>
          prevLinks.some((oldLink) => oldLink.id === newLink.id)
        );
        return [...addedLinks, ...existingLinks, ...removedLinks];
      });
    }
  }, [links, isLoading, removingIds]);

  const handleDelete = async (linkId: string) => {
    setRemovingIds((prev) => new Set([...prev, linkId]));
    await onDelete(linkId);
    // Wait for exit animation to complete
    setTimeout(() => {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(linkId);
        return next;
      });
    }, 500);
  };

  if (localLinks.length === 0 && !isLoading) {
    return <EmptyLinkList />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div className="max-w-3xl mx-auto" layout>
        <AnimatePresence mode="popLayout" initial={false}>
          {localLinks.map((link) => (
            <motion.div
              key={link.id}
              layout="position"
              initial={
                !removingIds.has(link.id)
                  ? { opacity: 0, y: -20, scale: 0.95 }
                  : false
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -20,
                transition: {
                  duration: 0.2,
                },
              }}
              className="mb-6"
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
                onComment={() => onComment(link.id)}
                onEdit={(data) => onEdit({ ...link, ...data })}
                onDelete={() => handleDelete(link.id)}
                isRemoving={removingIds.has(link.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
