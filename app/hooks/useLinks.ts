'use client';

import { useState, useEffect } from 'react';
import { Link } from '../types/link';
import { User } from '../types/user';
import { getLinks, createLink, updateLink, deleteLink, vote, unvote, createComment } from '../actions/links';

export function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getLinks();
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setLinks(response.links || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const addLink = async (data: { url: string; title?: string; description?: string }, user: User) => {
    try {
      setError(null);
      const response = await createLink({
        url: data.url,
        title: data.title,
        description: data.description,
        userId: user.id
      });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  const editLink = async (data: { id: string; url: string; title?: string; description?: string }, user: User) => {
    try {
      setError(null);
      const response = await updateLink({
        id: data.id,
        url: data.url,
        title: data.title || '',
        description: data.description,
        userId: user.id
      });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  const removeLink = async (id: string, user: User) => {
    try {
      setError(null);
      
      // Store the current links state for potential rollback
      const previousLinks = links;
      
      // Optimistically remove the link
      setLinks(currentLinks => currentLinks.filter(link => link.id !== id));

      const response = await deleteLink({ id, userId: user.id });
      
      if (response.error) {
        setError(response.error);
        // Revert optimistic update on error
        setLinks(previousLinks);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
      // Revert optimistic update on error
      setLinks(previousLinks);
    }
  };

  const handleVote = async (linkId: string, user: User) => {
    try {
      setError(null);
      
      // Optimistically update the UI with complete user data
      setLinks(currentLinks => 
        currentLinks.map(link => {
          if (link.id === linkId) {
            return {
              ...link,
              votes: [...link.votes, {
                userId: user.id,
                userName: user.name,
                createdAt: new Date().toISOString(),
                user: {
                  id: user.id,
                  name: user.name,
                  avatarUrl: user.avatarUrl,
                }
              }]
            };
          }
          return link;
        })
      );

      const response = await vote({ linkId, userId: user.id });
      
      if (response.error) {
        // Revert optimistic update on error
        setError(response.error);
        await fetchLinks();
        return;
      }
    } catch (err) {
      // Revert optimistic update on error
      setError(err instanceof Error ? err.message : 'Failed to vote');
      await fetchLinks();
    }
  };

  const handleUnvote = async (linkId: string, user: User) => {
    try {
      setError(null);

      // Optimistically update the UI
      setLinks(currentLinks => 
        currentLinks.map(link => {
          if (link.id === linkId) {
            return {
              ...link,
              votes: link.votes.filter(vote => vote.userId !== user.id)
            };
          }
          return link;
        })
      );

      const response = await unvote({ linkId, userId: user.id });
      
      if (response.error) {
        // Revert optimistic update on error
        setError(response.error);
        await fetchLinks();
        return;
      }
    } catch (err) {
      // Revert optimistic update on error
      setError(err instanceof Error ? err.message : 'Failed to unvote');
      await fetchLinks();
    }
  };

  const addComment = async (linkId: string, content: string, user: User) => {
    try {
      setError(null);
      const response = await createComment({
        linkId,
        content,
        userId: user.id
      });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      // Optimistically update UI
      const updatedLinks = links.map(link => {
        if (link.id === linkId) {
          return {
            ...link,
            comments: [...link.comments, {
              id: 'temp-' + Date.now(),
              content,
              createdAt: new Date().toISOString(),
              userId: user.id,
              linkId,
              user: {
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
              }
            }]
          };
        }
        return link;
      });
      setLinks(updatedLinks);
      
      // Fetch fresh data to ensure consistency
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  return {
    links,
    isLoading,
    error,
    addLink,
    editLink,
    removeLink,
    handleVote,
    handleUnvote,
    addComment,
  };
}
