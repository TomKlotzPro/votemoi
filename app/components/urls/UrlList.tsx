import { useUrls } from '@/app/hooks/useUrls';
import { fr } from '@/app/translations/fr';
import { useState } from 'react';

interface UrlListProps {
  onUrlSelect?: (url: { id: string; url: string; title?: string }) => void;
  selectedUrlId?: string;
}

export default function UrlList({ onUrlSelect, selectedUrlId }: UrlListProps) {
  const { urls, loading, error, addUrl } = useUrls();
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      await addUrl({ url: url.trim() });
      setUrl('');
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">{fr.urls.urlList}</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? fr.common.cancel : fr.urls.addUrl}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1e1e38] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {fr.urls.addUrl}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">
                {fr.urls.url}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input"
                placeholder="https://example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? fr.common.loading : fr.common.submit}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {urls.map((url) => (
          <div
            key={url.id}
            onClick={() => onUrlSelect?.(url)}
            className={`p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors ${
              selectedUrlId === url.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {url.title || url.url}
                </h3>
                {url.description && (
                  <p className="text-sm text-gray-400 mt-1">
                    {url.description}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {new Date(url.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
