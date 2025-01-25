import { fr } from '@/app/translations/fr';
import { Url } from '@/app/types/url';
import { useState } from 'react';

type UseUrlsReturn = {
  urls: Url[];
  loading: boolean;
  error: string | null;
  addUrl: (data: { url: string }) => Promise<Url>;
  updateUrl: (id: string, data: { url: string }) => Promise<Url>;
  deleteUrl: (id: string) => Promise<void>;
  voteForUrl: (id: string) => Promise<void>;
}

export function useUrls(): UseUrlsReturn {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUrl = async (data: { url: string }) => {
    try {
      setLoading(true);
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(fr.errors.failedToAddUser);
      }

      const newUrl = await response.json();
      setUrls((prevUrls) => [...prevUrls, newUrl]);
      setError(null);
      return newUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : fr.errors.failedToAddUser;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUrl = async (id: string, data: { url: string }) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/urls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(fr.errors.failedToUpdateUser);
      }

      const updatedUrl = await response.json();
      setUrls((prevUrls) =>
        prevUrls.map((url) => (url.id === id ? updatedUrl : url))
      );
      setError(null);
      return updatedUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : fr.errors.failedToUpdateUser;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(fr.errors.failedToDeleteUser);
      }

      setUrls((prevUrls) => prevUrls.filter((url) => url.id !== id));
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : fr.errors.failedToDeleteUser;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const voteForUrl = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/urls/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(fr.errors.failedToVote);
      }

      const updatedUrl = await response.json();
      setUrls((prevUrls) =>
        prevUrls.map((url) => (url.id === id ? updatedUrl : url))
      );
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : fr.errors.failedToVote;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    urls,
    loading,
    error,
    addUrl,
    updateUrl,
    deleteUrl,
    voteForUrl,
  };
}
