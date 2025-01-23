'use client';

import { useState } from 'react';
import Image from 'next/image';
import { fr } from '@/app/translations/fr';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey2&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey3&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey4&backgroundColor=ffd5dc',
];

type UserFormProps = {
  initialData?: {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
  onSubmit: (id: string | undefined, data: { name: string; avatarUrl?: string }) => void;
  loading?: boolean;
};

export default function UserForm({ initialData, onSubmit, loading }: UserFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialData?.avatarUrl || AVATAR_OPTIONS[0]);

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
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          {fr.users.name}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-[#2a2a4e] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={fr.users.namePlaceholder}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {fr.users.selectAvatar}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => setSelectedAvatar(avatar)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedAvatar === avatar
                  ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/30'
                  : 'border-transparent hover:border-purple-500/50'
              }`}
              disabled={loading}
            >
              <Image
                src={avatar}
                alt={fr.users.avatarAlt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? fr.common.loading : initialData ? fr.common.update : fr.common.create}
        </button>
      </div>
    </form>
  );
}
