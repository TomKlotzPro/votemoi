'use client';

import { updateUser } from '@/app/actions/user-actions';
import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { useUser } from '@/app/context/user-context';
import { useUsers } from '@/app/hooks/useUsersClient';
import { fr } from '@/app/translations/fr';
import { User } from '@/app/types/user';
import {
  ArrowRightOnRectangleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import SafeImage from '../ui/SafeImage';

interface ProfileMenuProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileMenu({
  user,
  onClose,
  onLogout,
}: ProfileMenuProps) {
  const { users } = useUsers();
  const { setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousUserRef = useRef<User>(user);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();

      if (!trimmedName) {
        setError(fr.errors.nameRequired);
        setIsSubmitting(false);
        return;
      }

      const nameExists = users.some(
        (u) =>
          u.id !== user.id && u.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (nameExists) {
        setError(fr.errors.nameExists);
        setIsSubmitting(false);
        return;
      }

      if (!user.id) {
        throw new Error('User ID is required');
      }

      // Store the previous user state
      previousUserRef.current = user;

      // Optimistically update the UI
      const optimisticUser = {
        ...user,
        name: trimmedName,
        avatarUrl: selectedAvatar || user.avatarUrl,
      };
      setUser(optimisticUser);
      setIsEditing(false);
      onClose();

      // Make the actual update
      const updatedUser = await updateUser(user.id, {
        name: trimmedName,
        avatarUrl: selectedAvatar || user.avatarUrl,
      });

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      // Revert to previous state on error without reopening menu
      setUser(previousUserRef.current);
      // Show error in a toast or notification instead of reopening menu
      console.error(
        err instanceof Error ? err.message : fr.errors.unknownError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  if (isEditing) {
    return (
      <div
        ref={menuRef}
        className="absolute right-0 mt-2 w-80 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg border border-white/10 p-4"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              {fr.common.name}
            </label>
            <motion.input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={fr.common.enterName}
              disabled={isSubmitting}
              required
              initial={false}
              animate={{ scale: name !== user.name ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
            {error && <ErrorMessage message={error} className="mt-2" />}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              {fr.common.selectAvatar}
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
                    hover:shadow-lg hover:z-10
                    ${
                      selectedAvatar === avatar
                        ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-105 rotate-3'
                        : 'ring-1 ring-white/10 hover:ring-white/30'
                    }
                  `}
                  disabled={isSubmitting}
                >
                  <SafeImage
                    src={avatar}
                    alt={fr.common.avatarOption}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              {fr.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? fr.common.saving : fr.common.save}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg border border-white/10"
    >
      <div className="p-2 space-y-1">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-white/60 hover:text-white transition-colors group"
        >
          <span className="flex-1">{fr.actions.editProfile}</span>
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:text-red-400 transition-colors group"
        >
          <span className="flex-1">Se Déconnecter</span>
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
