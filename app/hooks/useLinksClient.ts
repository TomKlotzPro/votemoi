'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/components/providers/StoreProvider';
import * as linkActions from '@/app/actions/links';
import { Link } from '@prisma/client';

type FormattedLink = Link & {
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  votes: Array<{
    userId: string;
    userName: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    }
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    }
  }>;
};

export function useLinks() {
  const [links, setLinks] = useState<FormattedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore(state => state.user);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    try {
      setLoading(true);
      const result = await linkActions.getLinks();
      if (result.error) throw new Error(result.error);
      if (result.links) setLinks(result.links);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setLoading(false);
    }
  }

  async function addLink(data: { url: string; title?: string; description?: string }) {
    if (!user) throw new Error('User must be logged in to create a link');
    
    try {
      const result = await linkActions.createLink({
        ...data,
        userId: user.id,
      });
      
      if (result.error) throw new Error(result.error);
      if (result.link) {
        setLinks(prev => [result.link, ...prev]);
        return result.link;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
      throw err;
    }
  }

  async function deleteLink(linkId: string) {
    if (!user) throw new Error('User must be logged in to delete a link');
    
    try {
      const result = await linkActions.deleteLink({
        id: linkId,
        userId: user.id,
      });
      
      if (result.error) throw new Error(result.error);
      if (result.success) {
        setLinks(prev => prev.filter(link => link.id !== linkId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
      throw err;
    }
  }

  async function voteLink(linkId: string) {
    if (!user) throw new Error('User must be logged in to vote');
    
    try {
      const result = await linkActions.vote({
        linkId,
        userId: user.id,
      });
      
      if (result.error) throw new Error(result.error);
      if (result.success && result.user) {
        setLinks(prev =>
          prev.map(link => {
            if (link.id === linkId) {
              return {
                ...link,
                votes: [
                  ...link.votes,
                  {
                    userId: user.id,
                    userName: user.name,
                    createdAt: new Date().toISOString(),
                    user: result.user,
                  },
                ],
              };
            }
            return link;
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote link');
      throw err;
    }
  }

  async function unvoteLink(linkId: string) {
    if (!user) throw new Error('User must be logged in to unvote');
    
    try {
      const result = await linkActions.unvote({
        linkId,
        userId: user.id,
      });
      
      if (result.error) throw new Error(result.error);
      if (result.success) {
        setLinks(prev =>
          prev.map(link => {
            if (link.id === linkId) {
              return {
                ...link,
                votes: link.votes.filter(vote => vote.userId !== user.id),
              };
            }
            return link;
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unvote link');
      throw err;
    }
  }

  return {
    links,
    loading,
    error,
    addLink,
    deleteLink,
    voteLink,
    unvoteLink,
  };
}
