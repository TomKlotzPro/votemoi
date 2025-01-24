'use client';

import {
  createComment,
  createLink,
  vote,
  deleteLink,
  getLinks,
  unvote,
  updateLink,
} from '@/app/actions/links';
import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useLinks() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<FormattedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getLinks();
      if (response.error) {
        setError(response.error);
        return;
      }
      
      // Transform the response to include required fields
      const formattedLinks = (response.links || []).map(link => ({
        ...link,
        comments: link.comments.map(comment => ({
          ...comment,
          userId: comment.user.id, // Add userId from the user object
          linkId: link.id, // Add linkId from the parent link
        }))
      }));
      
      setLinks(formattedLinks);
    } catch {
      setError(fr.errors.failedToFetchLinks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddLink = useCallback(async (data: { url: string; title?: string; description?: string }) => {
    try {
      if (!session?.user?.id) {
        setError('You must be logged in to add a link');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      const { link: newLink, error } = await createLink({ ...data, userId: session.user.id });
      if (error) {
        setError(error);
        return;
      }
      // Ensure the newLink matches FormattedLink type
      const formattedLink: FormattedLink = {
        ...newLink,
        createdAt: new Date(newLink.createdAt).toISOString(),
        updatedAt: new Date(newLink.updatedAt).toISOString(),
        votes: [],
        comments: (newLink.comments || []).map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt).toISOString(),
          updatedAt: new Date(comment.updatedAt).toISOString(),
        })),
        createdBy: {
          id: newLink.createdBy.id,
          name: newLink.createdBy.name,
          avatarUrl: newLink.createdBy.avatarUrl,
        },
        hasVoted: false
      };
      setLinks(prev => [...prev, formattedLink]);
    } catch {
      setError(fr.errors.failedToAddLink);
      throw new Error(fr.errors.failedToAddLink);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleUpdateLink = useCallback(
    async (id: string, data: { url: string; title?: string; description?: string }) => {
      try {
        if (!session?.user?.id) {
          setError('You must be logged in to update a link');
          return;
        }
        
        setIsLoading(true);
        setError(null);
        const result = await updateLink({
          id,
          userId: session?.user?.id as string,
          url: data.url,
          title: data.title || '', // Ensure title is always a string
          ...(data.description && { description: data.description }) // Only include description if it exists
        });
        
        if (result.error) {
          setError(result.error);
          throw new Error(result.error);
        }
        
        // Ensure the updated link matches FormattedLink type
        const formattedLink: FormattedLink = {
          ...result.link,
          createdAt: new Date(result.link.createdAt).toISOString(),
          updatedAt: new Date(result.link.updatedAt).toISOString(),
          votes: result.link.votes || [],
          comments: (result.link.comments || []).map(comment => ({
            ...comment,
            userId: comment.user.id,
            linkId: result.link.id,
          })),
          createdBy: {
            id: result.link.createdBy.id,
            name: result.link.createdBy.name,
            avatarUrl: result.link.createdBy.avatarUrl,
          },
          hasVoted: false
        };
        setLinks(prev => prev.map(link => (link.id === id ? formattedLink : link)));
      } catch {
        setError(fr.errors.failedToUpdateLink);
        throw new Error(fr.errors.failedToUpdateLink);
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const handleDeleteLink = useCallback(async (id: string) => {
    if (!session?.user?.id) {
      setError(fr.errors.unauthorized);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await deleteLink({ id, userId: session.user.id });
      setLinks(prev => prev.filter(link => link.id !== id));
    } catch {
      setError(fr.errors.failedToDeleteLink);
      throw new Error(fr.errors.failedToDeleteLink);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleVote = useCallback(async (linkId: string, userId: string) => {
    try {
      if (!session?.user?.id) {
        setError('You must be logged in to vote');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      const result = await vote({ linkId, userId });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.success && result.user) {
        setLinks(prev => prev.map(link => {
          if (link.id === linkId) {
            return {
              ...link,
              votes: [...link.votes, {
                userId: result.user!.id,
                userName: result.user!.name,
                createdAt: new Date().toISOString(),
                user: result.user!,
              }],
              hasVoted: true
            };
          }
          return link;
        }));
      }
    } catch {
      setError(fr.errors.failedToVote);
      throw new Error(fr.errors.failedToVote);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleUnvote = useCallback(async (linkId: string, userId: string) => {
    try {
      if (!session?.user?.id) {
        setError('You must be logged in to unvote');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      const result = await unvote({ linkId, userId });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.success) {
        setLinks(prev => prev.map(link => {
          if (link.id === linkId) {
            return {
              ...link,
              votes: link.votes.filter(vote => vote.userId !== userId),
              hasVoted: false
            };
          }
          return link;
        }));
      }
    } catch {
      setError(fr.errors.failedToUnvote);
      throw new Error(fr.errors.failedToUnvote);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleAddComment = useCallback(async (linkId: string, userId: string, content: string) => {
    try {
      if (!session?.user?.id) {
        setError('You must be logged in to add a comment');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      const response = await createComment({ linkId, userId, content });
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (!response.link) {
        setError(fr.errors.failedToAddComment);
        return;
      }

      // Update the links state with the new link
      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === response.link.id
            ? {
                ...link,
                ...response.link,
                comments: response.link.comments.map(comment => ({
                  ...comment,
                  userId: comment.user.id,
                  linkId: response.link.id,
                  createdAt: comment.createdAt || new Date().toISOString(),
                  updatedAt: comment.updatedAt || new Date().toISOString()
                }))
              }
            : link
        )
      );
    } catch {
      setError(fr.errors.failedToAddComment);
      throw new Error(fr.errors.failedToAddComment);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  return {
    links,
    isLoading,
    error,
    refreshLinks,
    addLink: handleAddLink,
    updateLink: handleUpdateLink,
    deleteLink: handleDeleteLink,
    vote: handleVote,
    unvote: handleUnvote,
    addComment: handleAddComment,
  };
}
