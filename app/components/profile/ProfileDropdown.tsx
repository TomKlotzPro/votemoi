'use client';

import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { useUser } from '@/app/context/user-context';
import { useUsers } from '@/app/hooks/useUsers';
import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import SafeImage from '../ui/SafeImage';

interface ProfileDropdownProps {
  onClose: () => void;
}

export default function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const { user, setUser } = useUser();
  const { users, updateUser } = useUsers();
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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

      const updatedUser = await updateUser(user.id, {
        name: trimmedName,
        avatarUrl: selectedAvatar,
      });

      setUser(updatedUser as FormattedUser);
      onClose();
    } catch (err) {
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
            <div className="grid grid-cols-6 gap-1 p-1.5 rounded-md bg-black/20">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`
                    group relative aspect-square rounded-lg overflow-hidden
                    transition-all duration-300 ease-out transform
                    hover:scale-105 hover:shadow-lg hover:z-10
                    ${
                      selectedAvatar === avatar
                        ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-105 rotate-3'
                        : 'ring-1 ring-white/10 hover:ring-white/30'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <SafeImage
                    src={avatar}
                    alt="Avatar option"
                    width={32}
                    height={32}
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

            {error && (
              <p className="text-red-500 text-xs px-1.5" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-1 pt-1.5 mt-1 border-t border-purple-500/10">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
              >
                {fr.common.cancel}
              </button>
              <button
                type="submit"
                className="relative px-2.5 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-md text-white font-medium shadow-sm disabled:opacity-50 transition-all duration-200 overflow-hidden group"
                disabled={isSubmitting}
              >
                <span className="relative z-10">
                  {isSubmitting ? fr.common.saving : fr.common.save}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-pink-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
}
