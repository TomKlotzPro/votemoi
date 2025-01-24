'use client';

import { useState } from 'react';
import { Link } from '@/app/types/link';
import { User } from '@/app/types/user';
import Loader from '../ui/Loader';
import LinkFormModal from './LinkFormModal';
import CommentModal from './CommentModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { fr } from '@/app/translations/fr';
import LinkCard from './LinkCard';
import EmptyLinkList from './EmptyLinkList';

interface LinkListProps {
  links: Link[];
  isLoading: boolean;
  onVote: (linkId: string, user: User) => Promise<void>;
  onUnvote: (linkId: string, user: User) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
  onEdit: (data: { id: string; url: string; title?: string; description?: string }) => Promise<void>;
  onAddComment: (linkId: string, content: string) => Promise<void>;
  user: User;
  showAuthForm: () => void;
}

export default function LinkList({ 
  links, 
  isLoading, 
  onVote, 
  onUnvote,
  onDelete,
  onEdit,
  onAddComment,
  user,
  showAuthForm
}: LinkListProps) {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [commentingLink, setCommentingLink] = useState<Link | null>(null);
  const [deleteLink, setDeleteLink] = useState<Link | null>(null);
  const [comment, setComment] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-4"
          >
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return <EmptyLinkList />;
  }

  return (
    <>
      <div className="space-y-4">
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            user={user}
            onVote={(linkId) => onVote(linkId, user)}
            onUnvote={(linkId) => onUnvote(linkId, user)}
            onEdit={(data) => {
              setEditingLink(link);
            }}
            onDelete={(linkId) => setDeleteLink(link)}
            onComment={(link) => setCommentingLink(link)}
            showAuthForm={showAuthForm}
          />
        ))}
      </div>

      {/* Edit Modal */}
      <LinkFormModal
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        onSubmit={(data) => {
          if (editingLink) {
            onEdit({ id: editingLink.id, ...data });
            setEditingLink(null);
          }
        }}
        initialData={editingLink || undefined}
        mode="edit"
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={!!commentingLink}
        onClose={() => {
          setCommentingLink(null);
          setComment('');
        }}
        onSubmit={() => {
          if (commentingLink && comment.trim()) {
            onAddComment(commentingLink.id, comment.trim());
            setCommentingLink(null);
            setComment('');
          }
        }}
        comment={comment}
        onChange={setComment}
        showAuthForm={showAuthForm}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteLink}
        onClose={() => setDeleteLink(null)}
        onConfirm={() => {
          if (deleteLink) {
            onDelete(deleteLink.id);
            setDeleteLink(null);
          }
        }}
        title={fr.confirmations.deleteLinkTitle}
        message={fr.confirmations.deleteLinkMessage}
        confirmText={fr.actions.delete}
        cancelText={fr.actions.cancel}
        type="danger"
      />
    </>
  );
}
