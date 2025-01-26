'use client';

import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { useUser } from '@/app/context/user-context';
import { useUsers } from '@/app/hooks/useUsers';
import { useUserDataStore } from '@/app/stores/userDataStore';
import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Fragment, useState } from 'react';
import SafeImage from '../ui/SafeImage';

interface ProfileDropdownProps {
  onClose: () => void;
}

export default function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const { user, setUser } = useUser();
  const { users, updateUser } = useUsers();
  const { updateUserData, syncWithUser } = useUserDataStore();
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatarUrl || AVATAR_OPTIONS[0]
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayedAvatars = AVATAR_OPTIONS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const trimmedName = name.trim();

      if (!trimmedName) {
        setError(fr.errors.nameRequired);
        setIsSubmitting(false);
        return;
      }

      const nameExists = users.some(
        (u) =>
          u.id !== user?.id &&
          u.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (nameExists) {
        setError(fr.errors.nameExists);
        setIsSubmitting(false);
        return;
      }

      if (!user) {
        setError('Utilisateur non connecté');
        setIsSubmitting(false);
        return;
      }

      const updatedUser = await updateUser(user.id, {
        name: trimmedName,
        avatarUrl: selectedAvatar,
      });

      if (updatedUser) {
        updateUserData(user.id, {
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl,
        });
        setUser(updatedUser as FormattedUser);
        syncWithUser(updatedUser as FormattedUser);
      }
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(fr.errors.generic);
      setIsSubmitting(false);
    }
  };

  return (
    <Transition
      as={Fragment}
      show={true}
      enter="transform transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transform transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1"
    >
      <div className="absolute right-0 mt-1 w-64 origin-top-right rounded-lg bg-[#1e1e38]/80 shadow-lg backdrop-blur-md focus:outline-none z-50">
        <div className="ring-1 ring-purple-500/20 rounded-lg">
          <form onSubmit={handleSubmit} className="p-2 space-y-2">
            {/* Name Input */}
            <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded-md">
              <div className="relative">
                <SafeImage
                  src={selectedAvatar}
                  alt={name || 'Profile'}
                  width={32}
                  height={32}
                  className="rounded-md ring-1 ring-purple-500/20 shadow-sm"
                />
                <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder={fr.common.name}
                className="flex-1 px-2.5 py-1.5 bg-black/20 rounded-md text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm shadow-sm"
                disabled={isSubmitting}
              />
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-6 gap-1 p-1.5 rounded-md bg-black/20 max-h-[200px] overflow-y-auto">
              {displayedAvatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden
                    transition-all duration-150 border
                    ${
                      selectedAvatar === avatar
                        ? 'bg-purple-500/10 border-purple-500'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }
                  `}
                >
                  <SafeImage
                    src={avatar}
                    alt="Avatar option"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <CheckIcon className="w-4 h-4 text-purple-300" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && <p className="text-xs text-red-400 px-1.5">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-end gap-1 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 text-xs text-white/70 hover:text-white transition-colors"
              >
                {fr.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !user}
                className="px-2.5 py-1.5 text-xs bg-purple-500/20 text-purple-300 rounded-md hover:bg-purple-500/30 hover:text-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? fr.common.saving : fr.common.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
}
