'use client';

import { useState } from 'react';
import { User } from '@/app/types/user';
import { fr } from '@/app/translations/fr';
import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { useUsers } from '@/app/hooks/useUsersClient';
import { useUser } from '@/app/context/user-context';
import ErrorMessage from '../common/ErrorMessage';
import SafeImage from '../ui/SafeImage';

interface ProfileMenuProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileMenu({ user, onClose, onLogout }: ProfileMenuProps) {
  const { users } = useUsers();
  const { setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();
      
      // Only check for duplicate names if the name has changed
      if (trimmedName !== user.name) {
        if (!trimmedName) {
          setError(fr.errors.nameRequired);
          setIsSubmitting(false);
          return;
        }

        // Check for duplicate names, excluding the current user
        const nameExists = users.some(u => 
          u.id !== user.id && 
          u.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (nameExists) {
          setError(fr.errors.nameExists);
          setIsSubmitting(false);
          return;
        }
      }

      const updatedUser: User = {
        ...user,
        name: trimmedName,
        avatarUrl: selectedAvatar,
      };

      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="absolute right-0 mt-2 w-80 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg border border-white/10 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
              {fr.common.name}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className={`input ${error ? 'error' : ''}`}
              required
            />
            {error && (
              <ErrorMessage message={error} className="mt-2" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              {fr.common.avatar}
            </label>
            <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`
                    group relative aspect-square rounded-lg overflow-hidden
                    transition-all duration-300 ease-out transform
                    hover:scale-105 hover:shadow-lg hover:z-10
                    ${selectedAvatar === avatar
                      ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-105 rotate-3'
                      : 'ring-1 ring-white/10 hover:ring-white/30'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <SafeImage
                    src={avatar}
                    alt={fr.common.avatarOption}
                    className={`
                      w-full h-full object-cover transform transition-transform duration-300
                      ${selectedAvatar === avatar ? 'scale-110' : 'group-hover:scale-110'}
                    `}
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 backdrop-blur-sm">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="button-secondary"
              disabled={isSubmitting}
            >
              {fr.profile.cancel}
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? fr.common.saving : fr.profile.save}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg border border-white/10">
      <div className="p-2">
        <div className="px-2 py-1.5 text-sm text-white/60">{user.name}</div>
        <button
          onClick={() => setIsEditing(true)}
          className="w-full px-2 py-1.5 text-left text-sm hover:text-[var(--primary)] transition-colors"
        >
          {fr.profile.edit}
        </button>
        <button
          onClick={onLogout}
          className="w-full px-2 py-1.5 text-left text-sm text-red-500 hover:text-red-400 transition-colors"
        >
          {fr.auth.logout}
        </button>
      </div>
    </div>
  );
}
