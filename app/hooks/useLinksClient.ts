import { FormattedLink } from '@/app/types/link';
import { useState } from 'react';

type UseLinksClientReturn = {
  links: FormattedLink[];
  loading: boolean;
  error: string | null;
  addLink: (data: {
    url: string;
    title?: string;
    description?: string;
  }) => Promise<FormattedLink>;
  updateLink: (
    id: string,
    data: { url: string; title?: string; description?: string }
  ) => Promise<FormattedLink>;
  deleteLink: (id: string) => Promise<void>;
  voteForLink: (linkId: string) => Promise<void>;
  unvoteForLink: (linkId: string) => Promise<void>;
}

export function useLinksClient(): UseLinksClientReturn {
  const [links, setLinks] = useState<FormattedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLink = async (data: {
    url: string;
    title?: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add link');
      }

      const newLink = await response.json();
      setLinks((prevLinks) => [...prevLinks, newLink]);
      setError(null);
      return newLink;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add link';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateLink = async (
    id: string,
    data: { url: string; title?: string; description?: string }
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update link');
      }

      const updatedLink = await response.json();
      setLinks((prevLinks) =>
        prevLinks.map((link) => (link.id === id ? updatedLink : link))
      );
      setError(null);
      return updatedLink;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update link';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete link';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const voteForLink = async (linkId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${linkId}/vote`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to vote for link');
      }

      const updatedLink = await response.json();
      setLinks((prevLinks) =>
        prevLinks.map((link) => (link.id === linkId ? updatedLink : link))
      );
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to vote for link';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const unvoteForLink = async (linkId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${linkId}/unvote`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to unvote for link');
      }

      const updatedLink = await response.json();
      setLinks((prevLinks) =>
        prevLinks.map((link) => (link.id === linkId ? updatedLink : link))
      );
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to unvote for link';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    links,
    loading,
    error,
    addLink,
    updateLink,
    deleteLink,
    voteForLink,
    unvoteForLink,
  };
}
