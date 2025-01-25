'use client';

import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { fr } from '@/app/translations/fr';
import { motion } from 'framer-motion';
import { useState } from 'react';
import SafeImage from '../ui/SafeImage';

type UserFormProps = {
  initialData?: {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
  onSubmit: (
    id: string | undefined,
    data: { name: string; avatarUrl?: string }
  ) => void;
  onClose: () => void;
  loading?: boolean;
};

export default function UserForm({
  initialData,
  onSubmit,
  onClose,
  loading,
}: UserFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    initialData?.avatarUrl || AVATAR_OPTIONS[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(initialData?.id, {
      name: name.trim(),
      avatarUrl: selectedAvatar,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          {fr.users.name}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={fr.users.namePlaceholder}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-4">
          {fr.users.selectAvatar}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {AVATAR_OPTIONS.map((avatar) => (
            <motion.button
              key={avatar}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAvatar(avatar)}
              className={`relative p-2 rounded-lg ${
                selectedAvatar === avatar
                  ? 'bg-purple-500/20 ring-2 ring-purple-500'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <SafeImage
                src={avatar}
                alt="Avatar option"
                width={64}
                height={64}
                className="rounded-lg"
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          {fr.common.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? fr.common.loading : fr.common.save}
        </button>
      </div>
    </form>
  );
}
