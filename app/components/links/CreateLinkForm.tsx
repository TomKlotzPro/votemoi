'use client';

import { fr } from '@/app/translations/fr';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';

type CreateLinkFormProps = {
  onSubmit: (data: {
    url: string;
    title?: string;
    description?: string;
  }) => Promise<void>;
}

export default function CreateLinkForm({ onSubmit }: CreateLinkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError(fr.errors.urlRequired);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        url: url.trim(),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      });

      // Reset form
      setUrl('');
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="mb-8 p-6 bg-black/80 backdrop-blur-lg rounded-lg border border-white/10"
    >
      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-white/80 mb-2"
          >
            {fr.common.url} <span className="text-rose-500">*</span>
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={fr.placeholders.enterURL}
            disabled={isSubmitting}
          />
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-white/80 mb-2"
          >
            {fr.common.title}
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={fr.placeholders.enterTitle}
            disabled={isSubmitting}
          />
        </div>

        {/* Description Input */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-white/80 mb-2"
          >
            {fr.common.description}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder={fr.placeholders.enterDescription}
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? fr.common.saving : fr.actions.share}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
