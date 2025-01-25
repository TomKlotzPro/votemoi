'use client';

import { fr } from '@/app/translations/fr';
import { Link } from '@/app/types/link';
import { User } from '@/app/types/user';
import { PlusIcon } from '@heroicons/react/24/outline';
import EmptyLinkList from './EmptyLinkList';
import LinkCard from './LinkCard';

type LinkListProps = {
  links: Link[];
  isLoading: boolean;
  user: User | null;
  onVote: (linkId: string) => Promise<void>;
  onUnvote: (linkId: string) => Promise<void>;
  onComment: (linkId: string) => void;
  onEdit: (link: Link) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
}

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
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-white/5 p-6 space-y-4"
            >
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (links.length === 0) {
    return <EmptyLinkList />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            isVoted={user ? link.votedByUsers.includes(user.id) : false}
            isOwner={user ? link.createdById === user.id : false}
            onVote={() => onVote(link.id)}
            onUnvote={() => onUnvote(link.id)}
            onComment={() => onComment(link.id)}
            onEdit={(data) => onEdit({ ...link, ...data })}
            onDelete={() => onDelete(link.id)}
          />
        ))}
      </div>
    </div>
  );
}
