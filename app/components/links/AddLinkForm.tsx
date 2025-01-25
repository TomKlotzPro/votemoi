'use client';

import { fr } from '@/app/translations/fr';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState } from 'react';

type AddLinkFormProps = {
  onSubmit: (data: {
    url: string;
    title?: string;
    description?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export default function AddLinkForm({ onSubmit, onClose }: AddLinkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError(fr.errors.urlRequired);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-lg border border-purple-500/20 bg-[#1e1e38] p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-white">
          {fr.links.addLink}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-300"
            >
              URL *
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-[#2a2a4e] px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="https://example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              {fr.links.title}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-[#2a2a4e] px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder={fr.links.titlePlaceholder}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              {fr.links.description}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-[#2a2a4e] px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder={fr.links.descriptionPlaceholder}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-all hover:bg-gray-700 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/30"
              disabled={isSubmitting}
            >
              {fr.common.cancel}
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isSubmitting}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-white transition-all hover:from-purple-500 hover:to-pink-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? fr.common.loading : fr.common.create}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
