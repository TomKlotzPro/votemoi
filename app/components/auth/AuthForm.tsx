'use client';

import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { useUsersQuery } from '@/app/hooks/useUsersClient';
import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import Image from 'next/image';
import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import AvatarPreloader from '../ui/AvatarPreloader';
import UserListSkeleton from '../ui/UserListSkeleton';
import AvatarSelection from './AvatarSelection';

type AuthFormProps = {
  onSuccess(user: FormattedUser): void;
  onClose(): void;
};

type AuthMode = 'select' | 'create';

export default function AuthForm({ onSuccess, onClose }: AuthFormProps) {
  const { users, addUser, loading } = useUsersQuery();
  const [mode, setMode] = useState<AuthMode>('select');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();

      if (!trimmedName) {
        setError(fr.errors.nameRequired);
        setIsSubmitting(false);
        return;
      }

      if (
        users.some(
          (user) => user.name.toLowerCase() === trimmedName.toLowerCase()
        )
      ) {
        setError(fr.errors.nameExists);
        setIsSubmitting(false);
        return;
      }

      const response = await addUser({
        name: trimmedName,
        image: selectedAvatar,
      });

      const newUser = {
        ...response,
        links: [],
        votes: [],
        comments: [],
        createdAt: new Date(response.createdAt).toISOString(),
        updatedAt: new Date(response.updatedAt).toISOString(),
      };

      onSuccess(newUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
      setIsSubmitting(false);
    }
  };

  const handleUserSelect = (user: FormattedUser) => {
    onSuccess(user);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-4">
        <div className="bg-[#1e1e38]/80 backdrop-blur-md rounded-lg shadow-xl ring-1 ring-purple-500/20 overflow-hidden">
          <div className="flex flex-col p-4 sm:p-6 animate-slideDown">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {fr.common.welcome}
              </h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
                aria-label={fr.common.close}
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 sm:gap-4 mb-6">
              <button
                onClick={() => handleModeChange('select')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  mode === 'select'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {fr.auth.selectExisting}
              </button>
              <button
                onClick={() => handleModeChange('create')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  mode === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {fr.auth.createNew}
              </button>
            </div>

            {error && <ErrorMessage message={error} className="mb-4" />}

            {mode === 'select' ? (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {loading ? (
                  <UserListSkeleton />
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-black/20 text-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {fr.auth.noUsers}
                    </h3>
                    <p className="text-white/60">{fr.auth.createFirstUser}</p>
                    <button
                      onClick={() => handleModeChange('create')}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-105"
                    >
                      {fr.auth.createNew}
                    </button>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 group mb-3"
                      >
                        <Image
                          src={user.avatarUrl || ''}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <span className="text-white group-hover:text-purple-400 transition-colors">
                          {user.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder={fr.common.enterName}
                    className="w-full px-4 py-2 bg-black/20 rounded-lg border border-purple-500/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {fr.common.avatar}
                  </label>
                  <div className="bg-[#1a1a38]/50 rounded-xl overflow-hidden">
                    <AvatarSelection
                      onSelect={setSelectedAvatar}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-white/60 hover:text-white bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {fr.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? fr.common.connecting : fr.common.connect}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <AvatarPreloader />
    </div>
  );
}
