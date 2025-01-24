'use client';

import { updateUser } from '@/app/actions/user-actions';
import { useUserStore } from '@/app/components/providers/StoreProvider';
import { AVATAR_OPTIONS } from '@/app/constants/avatars';
import { useUsers } from '@/app/hooks/useUsersClient';
import { fr } from '@/app/translations/fr';
import { useEffect, useRef, useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import SafeImage from '../ui/SafeImage';

export default function UserMenu() {
  const { users } = useUsers();
  const user = useUserStore((state) => state.user);
  const updateStoreUser = useUserStore((state) => state.updateUser);
  const logout = useUserStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatarUrl || AVATAR_OPTIONS[0]
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setSelectedAvatar(user.avatarUrl);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // Update user in the database
      await updateUser(user.id, {
        name: trimmedName,
        avatarUrl: selectedAvatar,
      });

      // Update store
      updateStoreUser({
        name: trimmedName,
        avatarUrl: selectedAvatar,
      });

      setIsEditing(false);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <SafeImage
          src={user.avatarUrl}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium text-white">{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg border border-white/10">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={fr.common.enterName}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {fr.common.selectAvatar}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedAvatar === avatar
                          ? 'border-primary scale-95'
                          : 'border-transparent hover:border-white/20'
                      }`}
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

              {error && <ErrorMessage message={error} />}

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
          ) : (
            <div>
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-3 py-2 text-sm text-left text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {fr.actions.editProfile}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-sm text-left text-rose-500 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {fr.actions.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
