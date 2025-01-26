'use client';

import { useState } from 'react';
import UpdateLinkButton from './UpdateLinkButton';
import DeleteLinkButton from './DeleteLinkButton';
import UserInfo from './UserInfo';
import EditLinkModal from '../../EditLinkModal';

type LinkCardHeaderProps = {
  userId: string;
  userName: string;
  userAvatarUrl: string;
  createdAt: string;
  isOwner: boolean;
  onDelete: () => void;
};

export default function LinkCardHeader({
  userId,
  userName,
  userAvatarUrl,
  createdAt,
  isOwner,
  onDelete,
}: LinkCardHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <UserInfo
          userId={userId}
          userName={userName}
          userAvatarUrl={userAvatarUrl}
          createdAt={createdAt}
        />
        {isOwner && (
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <UpdateLinkButton onUpdate={() => setShowEditModal(true)} />
            <DeleteLinkButton onDelete={onDelete} />
          </div>
        )}
      </div>

      {showEditModal && (
        <EditLinkModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          link={{
            id: userId,
            title: userName,
            description: '',
            url: '',
            createdAt: createdAt,
            user: {
              id: userId,
              name: userName,
              avatarUrl: userAvatarUrl,
            },
            voters: [],
            comments: [],
          }}
        />
      )}
    </>
  );
}
