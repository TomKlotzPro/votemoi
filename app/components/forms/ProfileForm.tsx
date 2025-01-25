'use client';

import { useUser } from '@/app/context/user-context';
import { useUsers } from '@/app/hooks/useUsers';
import { fr } from '@/app/translations/fr';
import { useState } from 'react';

interface ProfileFormProps {
  onClose: () => void;
}

export default function ProfileForm({ onClose }: ProfileFormProps) {
  const { user, setUser } = useUser();
  const { users } = useUsers();
  const [name, setName] = useState(user?.name || '');
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
        return;
      }

      // Check for duplicate names, excluding the current user
      const nameExists = users.some(
        (u) =>
          u.id !== user.id && u.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (nameExists) {
        setError(fr.errors.nameExists);
        return;
      }

      // Update user
      const updatedUser = {
        ...user,
        name: trimmedName,
      };

      setUser(updatedUser);
      onClose();
    } catch (err) {
      setError(fr.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {fr.common.name}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-[#1e1e38] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end space-x-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          disabled={isSubmitting}
        >
          {fr.common.cancel}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? fr.common.saving : fr.common.save}
        </button>
      </div>
    </form>
  );
}
