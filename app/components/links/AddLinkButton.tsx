'use client';

import { useState } from 'react';
import { fr } from '@/app/translations/fr';
import { Link } from '@/app/types/link';
import { useUser } from '@/app/context/user-context';
import LinkFormModal from './LinkFormModal';

interface AddLinkButtonProps {
  onAdd: (data: { url: string; title?: string; description?: string }) => Promise<void>;
}

export default function AddLinkButton({ onAdd }: AddLinkButtonProps) {
  const { user, showAuthForm } = useUser();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!user) {
      showAuthForm();
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        {fr.common.addLink}
      </button>

      <LinkFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={onAdd}
        mode="create"
      />
    </>
  );
}
