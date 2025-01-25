'use client';

import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { useUser } from '@/app/context/user-context';
import { useUsers } from '@/app/hooks/useUsers';
import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { useState } from 'react';
import SafeImage from '../ui/SafeImage';

interface ProfilePanelProps {
  onClose: () => void;
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
  const { user, setUser } = useUser();
  const { users, updateUser } = useUsers();
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);

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

      // Check for duplicate names, excluding the current user
      const nameExists = users.some(
        (u) =>
          u.id !== user.id && u.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (nameExists) {
        setError(fr.errors.nameExists);
        setIsSubmitting(false);
        return;
      }

      // Update user
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
    <div className="fixed right-0 top-0 h-full w-96 bg-[#1e1e38]/95 backdrop-blur-lg border-l border-purple-500/10 shadow-xl p-6 z-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{fr.common.profile}</h2>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
          aria-label={fr.common.close}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Selection */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="relative group cursor-pointer"
            onClick={() => setShowAvatars(!showAvatars)}
          >
            <SafeImage
              src={selectedAvatar}
              alt={name || 'Profile'}
              width={96}
              height={96}
              className="rounded-full ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm">{fr.common.change}</span>
            </div>
          </div>
          
          {showAvatars && (
            <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2 rounded-lg bg-black/20 w-full">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setShowAvatars(false);
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden ring-2 transition-all ${
                    selectedAvatar === avatar
                      ? 'ring-purple-500'
                      : 'ring-transparent hover:ring-purple-500/50'
                  }`}
                >
                  <SafeImage
                    src={avatar}
                    alt="Avatar option"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white/80 mb-2"
          >
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
            className="w-full px-4 py-2 bg-black/20 border border-purple-500/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 button-gradient rounded-lg text-white font-medium disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? fr.common.saving : fr.common.save}
        </button>
      </form>
    </div>
  );
}
