'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fr } from '@/app/translations/fr';
import { User } from '@/app/types/user';
import ErrorMessage from '../common/ErrorMessage';
import { useUsers } from '@/app/hooks/useUsers';

const AVATAR_OPTIONS = [
 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey2&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey3&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey4&backgroundColor=ffd5dc',
];

interface UserSelectorProps {
  onSelect: (user: User) => void;
  onClose: () => void;
  currentUser?: User;
}

export default function UserSelector({ onSelect, onClose, currentUser }: UserSelectorProps) {
  const { users } = useUsers();
  const [name, setName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatarUrl || AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(fr.errors.nameRequired);
      return;
    }

    if (!selectedAvatar) {
      setError(fr.errors.avatarRequired);
      return;
    }

    // Check if name is taken by another user
    if (users.some(u => u.id !== currentUser?.id && u.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(fr.errors.nameExists);
      return;
    }

    onSelect({
      id: currentUser?.id || Math.random().toString(36).substring(7),
      name: trimmedName,
      avatarUrl: selectedAvatar,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold neon-text">
            {currentUser ? fr.common.editProfile : fr.common.selectAvatar}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {fr.common.name}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="synthwave-input"
              placeholder={fr.common.enterName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {fr.common.avatar}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                    selectedAvatar === avatar
                      ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black/30 scale-105'
                      : 'hover:ring-2 hover:ring-purple-500/50 hover:ring-offset-2 hover:ring-offset-black/30'
                  }`}
                >
                  <Image
                    src={avatar}
                    alt="Avatar option"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              {fr.common.cancel}
            </button>
            <button
              type="submit"
              className="synthwave-button"
            >
              {currentUser ? fr.common.save : fr.common.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
