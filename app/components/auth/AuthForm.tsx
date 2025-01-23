'use client';

import { useState } from 'react';
import { fr } from '@/app/translations/fr';
import { User } from '@/app/types/user';
import { useUsers } from '@/app/hooks/useUsersClient';
import ErrorMessage from '../common/ErrorMessage';
import SafeImage from '../ui/SafeImage';
import { AVATAR_OPTIONS } from '@/app/constants/avatars';

interface AuthFormProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

type AuthMode = 'select' | 'create';

export default function AuthForm({ onSuccess, onClose }: AuthFormProps) {
  const { users, loading, error: usersError, addUser } = useUsers();
  const [mode, setMode] = useState<AuthMode>('select');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState(usersError);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (users.some(user => user.name.toLowerCase() === trimmedName.toLowerCase())) {
        setError(fr.errors.nameExists);
        setIsSubmitting(false);
        return;
      }

      const newUser = await addUser({
        name: trimmedName,
        avatarUrl: selectedAvatar,
      });

      onSuccess(newUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
      setIsSubmitting(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onSuccess(user);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setName('');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-lg rounded-lg border border-white/10 p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-lg rounded-lg border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {fr.auth.welcome}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label={fr.common.close}
          >
            ✕
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            className={`flex-1 p-2 rounded-lg transition-colors ${
              mode === 'select'
                ? 'button-gradient'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => handleModeChange('select')}
          >
            {fr.auth.selectExisting}
          </button>
          <button
            className={`flex-1 p-2 rounded-lg transition-colors ${
              mode === 'create'
                ? 'button-gradient'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => handleModeChange('create')}
          >
            {fr.auth.createNew}
          </button>
        </div>

        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}

        {mode === 'select' ? (
          <div className="grid gap-4">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <SafeImage
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 object-cover"
                  />
                </div>
                <span className="text-white">{user.name}</span>
              </button>
            ))}
            {users.length === 0 && (
              <p className="text-center text-white/60 py-4">
                {fr.auth.noUsers}
              </p>
            )}
          </div>
        ) : (
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
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {fr.common.avatar}
              </label>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto p-2">
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="button-secondary"
                disabled={isSubmitting}
              >
                {fr.common.cancel}
              </button>
              <button
                type="submit"
                className="button-gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? fr.common.loading : fr.common.continue}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
