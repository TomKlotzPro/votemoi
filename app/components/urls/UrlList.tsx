'use client';

import { useState } from 'react';
import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import { useUrls } from '@/app/hooks/useUrls';
import ErrorMessage from '../common/ErrorMessage';
import UrlCard from './UrlCard';

export default function UrlList() {
  const { user } = useUser();
  const { urls, addUrl } = useUrls();
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!url.trim()) {
        throw new Error(fr.errors.urlRequired);
      }

      await addUrl({
        url: url.trim(),
      });

      setUrl('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="button-primary"
        >
          {showForm ? fr.common.cancel : fr.urls.addUrl}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-semibold">
            {fr.urls.addUrl}
          </h2>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">
                URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                className="input"
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? fr.common.saving : fr.common.submit}
              </button>
            </div>
          </form>
        </div>
      )}

      {!urls?.length ? (
        <div className="text-center py-8">
          <p className="text-[var(--text-secondary)]">
            {fr.urls.noUrls}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {urls.map((url) => (
            <UrlCard key={url.id} url={url} />
          ))}
        </div>
      )}
    </div>
  );
}
