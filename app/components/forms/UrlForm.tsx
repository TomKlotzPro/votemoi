'use client';

import { useState } from 'react';
import Image from 'next/image';
import { fr } from '@/app/translations/fr';
import ErrorMessage from '../common/ErrorMessage';

type UrlFormProps = {
  initialData?: {
    id?: string;
    url: string;
    title: string;
    description: string;
    imageUrl?: string;
  };
  onSubmit: (id: string, data: { url: string; title: string; description: string; imageUrl?: string }) => Promise<void>;
  onError: (error: string) => void;
  onCancel?: () => void;
};

export default function UrlForm({ initialData, onSubmit, onError, onCancel }: UrlFormProps) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(initialData?.url ?? '');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    setLoading(true);
    try {
      await onSubmit(initialData?.id ?? '', {
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      // Only clear form if it's a new submission
      if (!initialData) {
        setUrl('');
        setTitle('');
        setDescription('');
        setImageUrl('');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      onError(error instanceof Error ? error.message : fr.errors.failedToSaveUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
            {fr.form.url}
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 bg-[#2a2a4e] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={fr.form.urlPlaceholder}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            {fr.form.title}
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-[#2a2a4e] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={fr.form.titlePlaceholder}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          {fr.form.description}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 bg-[#2a2a4e] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={fr.form.descriptionPlaceholder}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">
          {fr.form.imageUrl}
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-4 py-2 bg-[#2a2a4e] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={fr.form.imageUrlPlaceholder}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            {fr.common.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={!url.trim() || !title.trim() || loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? fr.common.loading : initialData ? fr.common.update : fr.common.create}
        </button>
      </div>
    </form>
  );
}
