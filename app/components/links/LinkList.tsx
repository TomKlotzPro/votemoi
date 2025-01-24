'use client';

import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import { FormattedUser } from '@/app/types/user';
import EmptyLinkList from './EmptyLinkList';
import LinkCard from './LinkCard';

interface LinkListProps {
  links: FormattedLink[];
  currentUser: FormattedUser | null;
  onVote: (linkId: string) => Promise<void>;
  onUnvote: (linkId: string) => Promise<void>;
  onComment: (linkId: string, content: string) => Promise<void>;
  onEdit: (linkId: string) => void;
  onDelete: (linkId: string) => Promise<void>;
}

export default function LinkList({
  links,
  currentUser,
  onVote,
  onUnvote,
  onComment,
  onEdit,
  onDelete,
}: LinkListProps) {
  if (!links.length) {
    return <EmptyLinkList />;
  }

  return (
    <div className="space-y-4">
      {links.map(link => (
        <LinkCard
          key={link.id}
          link={link}
          currentUser={currentUser}
          onVote={() => onVote(link.id)}
          onUnvote={() => onUnvote(link.id)}
          onComment={content => onComment(link.id, content)}
          onEdit={() => onEdit(link.id)}
          onDelete={() => onDelete(link.id)}
        />
      ))}
    </div>
  );
}
