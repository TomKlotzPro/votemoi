'use client';

import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import AuthForm from '../auth/AuthForm';
import AddLinkForm from './AddLinkForm';

type AddLinkButtonProps = {
  onAdd: (data: {
    url: string;
    title?: string;
    description?: string;
  }) => Promise<void>;
};

export default function AddLinkButton({ onAdd }: AddLinkButtonProps) {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user, setUser } = useUser();

  const handleClick = () => {
    if (!user) {
      setShowAuthForm(true);
    } else {
      setShowAddForm(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-400 hover:scale-105"
      >
        <PlusIcon className="h-5 w-5" />
        <span>{fr.common.addLink}</span>
      </button>

      {showAuthForm && (
        <AuthForm
          onSuccess={(newUser) => {
            setUser(newUser);
            setShowAuthForm(false);
            setShowAddForm(true);
          }}
          onClose={() => setShowAuthForm(false)}
        />
      )}

      <AddLinkForm
        isOpen={showAddForm}
        onSubmit={async (data) => {
          await onAdd(data);
          setShowAddForm(false);
        }}
        onClose={() => setShowAddForm(false)}
      />
    </>
  );
}
