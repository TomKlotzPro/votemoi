'use client';

import {
  createComment,
  createLink,
  deleteLink,
  getLinks,
  unvote,
  updateLink,
  vote,
} from '@/app/actions/links';
import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import { useCallback, useEffect, useState } from 'react';

export function useLinks() {
  const { user } = useUser();
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
      const formattedLinks = (response.links || []).map((link) => ({
        ...link,
        votes: link.votes || [],
        comments: (link.comments || []).map((comment) => ({
          ...comment,
          userId: comment.user.id,
          linkId: link.id,
        })),
      }));

      setLinks(formattedLinks);
    } catch {
      setError(fr.errors.failedToFetchLinks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLinks();
  }, [refreshLinks]);

  const handleVote = useCallback(
    async (linkId: string, userId: string) => {
      try {
        if (!user?.id) {
          setError(fr.errors.unauthorized);
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
          setLinks((prev) =>
            prev.map((link) => {
              if (link.id === linkId) {
                return {
                  ...link,
                  votes: [
                    ...(link.votes || []),
                    {
                      userId: result.user!.id,
                      userName: result.user!.name,
                      createdAt: new Date().toISOString(),
                      user: result.user!,
                    },
                  ],
                  hasVoted: true,
                };
              }
              return link;
            })
          );
        }
      } catch {
        setError(fr.errors.failedToVote);
        throw new Error(fr.errors.failedToVote);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const handleUnvote = useCallback(
    async (linkId: string, userId: string) => {
      try {
        if (!user?.id) {
          setError(fr.errors.unauthorized);
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
          setLinks((prev) =>
            prev.map((link) => {
              if (link.id === linkId) {
                return {
                  ...link,
                  votes: (link.votes || []).filter((vote) => vote.userId !== userId),
                  hasVoted: false,
                };
              }
              return link;
            })
          );
        }
      } catch {
        setError(fr.errors.failedToUnvote);
        throw new Error(fr.errors.failedToUnvote);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const handleAddComment = useCallback(
    async (linkId: string, userId: string, content: string) => {
      try {
        if (!user?.id) {
          setError(fr.errors.unauthorized);
          return;
        }

        setIsLoading(true);
        setError(null);
        const result = await createComment({ linkId, userId, content });
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.link) {
          setLinks((prev) =>
            prev.map((link) => (link.id === linkId ? result.link! : link))
          );
        }
      } catch {
        setError(fr.errors.failedToAddComment);
        throw new Error(fr.errors.failedToAddComment);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const handleDeleteLink = useCallback(
    async (id: string) => {
      if (!user?.id) {
        setError(fr.errors.unauthorized);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        await deleteLink({ id, userId: user.id });
        setLinks((prev) => prev.filter((link) => link.id !== id));
      } catch {
        setError(fr.errors.failedToDeleteLink);
        throw new Error(fr.errors.failedToDeleteLink);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const handleUpdateLink = useCallback(
    async (id: string, data: { url: string; title?: string; description?: string }) => {
      try {
        if (!user?.id) {
          setError(fr.errors.unauthorized);
          return;
        }

        setIsLoading(true);
        setError(null);
        const result = await updateLink({
          id,
          userId: user.id,
          url: data.url,
          title: data.title || '',
          ...(data.description && { description: data.description }),
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.link) {
          setLinks((prev) =>
            prev.map((link) => (link.id === id ? result.link! : link))
          );
        }
      } catch {
        setError(fr.errors.failedToUpdateLink);
        throw new Error(fr.errors.failedToUpdateLink);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const handleAddLink = useCallback(
    async (data: { url: string; title?: string; description?: string }) => {
      try {
        if (!user?.id) {
          setError(fr.errors.unauthorized);
          return;
        }

        setIsLoading(true);
        setError(null);
        const { link: newLink, error } = await createLink({
          ...data,
          userId: user.id,
        });
        if (error) {
          setError(error);
          return;
        }
        if (!newLink) {
          setError(fr.errors.failedToAddLink);
          return;
        }

        // Refresh the links list instead of adding to state
        await refreshLinks();
      } catch {
        setError(fr.errors.failedToAddLink);
        throw new Error(fr.errors.failedToAddLink);
      } finally {
        setIsLoading(false);
      }
    },
    [user, refreshLinks]
  );

  return {
    links,
    error,
    isLoading,
    vote: handleVote,
    unvote: handleUnvote,
    addLink: handleAddLink,
    deleteLink: handleDeleteLink,
    updateLink: handleUpdateLink,
    addComment: handleAddComment,
  };
}
