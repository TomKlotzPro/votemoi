'use client';

import { FormattedLink } from '@/app/types/link';
import { User } from '@/app/types/user';
import EmptyLinkList from './EmptyLinkList';
import LinkCard from './LinkCard';

interface LinkListProps {
  links: FormattedLink[];
  isLoading: boolean;
  user: User | null;
  onVote: (linkId: string) => Promise<void>;
  onUnvote: (linkId: string) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
  onEdit: (data: string) => Promise<void>;
  onAddComment: (linkId: string, content: string) => Promise<void>;
}

export default function LinkList({
  links,
  isLoading,
  user,
  onVote,
  onUnvote,
  onDelete,
  onEdit,
  onAddComment,
}: LinkListProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!links.length) {
    return <EmptyLinkList />;
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          currentUser={user}
          onVote={() => onVote(link.id)}
          onUnvote={() => onUnvote(link.id)}
          onComment={(content) => onAddComment(link.id, content)}
          onEdit={() => onEdit(link.id)}
          onDelete={() => onDelete(link.id)}
        />
      ))}
    </div>
  );
}
