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
        comments: link.comments.map((comment) => ({
          ...comment,
          userId: comment.user.id, // Add userId from the user object
          linkId: link.id, // Add linkId from the parent link
        })),
      }));

      setLinks(formattedLinks);
    } catch {
      setError(fr.errors.failedToFetchLinks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch links on mount
  useEffect(() => {
    refreshLinks();
  }, [refreshLinks]);

  const handleAddLink = useCallback(
    async (data: { url: string; title?: string; description?: string }) => {
      try {
        if (!user?.id) {
          setError(fr.errors.loginRequired);
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

  const handleUpdateLink = useCallback(
    async (
      id: string,
      data: { url: string; title?: string; description?: string }
    ) => {
      try {
        if (!user?.id) {
          setError(fr.errors.loginRequired);
          throw new Error(fr.errors.loginRequired);
        }

        setIsLoading(true);
        setError(null);

        const result = await updateLink({
          id,
          userId: user.id,
          url: data.url,
          title: data.title || data.url, // Use URL as fallback for title
          description: data.description,
        });

        if (result.error) {
          if (result.error === 'Link not found') {
            setError(fr.errors.linkNotFound);
            throw new Error(fr.errors.linkNotFound);
          } else if (result.error === 'Not authorized') {
            setError(fr.errors.unauthorized);
            throw new Error(fr.errors.unauthorized);
          } else {
            setError(fr.errors.failedToUpdateLink);
            throw new Error(fr.errors.failedToUpdateLink);
          }
        }

        if (!result.link) {
          setError(fr.errors.failedToUpdateLink);
          throw new Error(fr.errors.failedToUpdateLink);
        }

        // Update links state with the new data
        setLinks((prev) =>
          prev.map((link) => (link.id === id ? result.link! : link))
        );

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(fr.errors.failedToUpdateLink);
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, setLinks]
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
      } catch (err) {
        console.error('Error deleting link:', err);
        setError(fr.errors.failedToDeleteLink);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const handleVote = useCallback(
    async (linkId: string, userId: string) => {
      try {
        if (!user?.id) {
          setError(fr.errors.loginRequired);
          return;
        }

        // Optimistically update the UI
        setLinks((prev: FormattedLink[]) =>
          prev.map((link) =>
            link.id === linkId
              ? {
                  ...link,
                  voteCount: link.voteCount + 1,
                  hasVoted: true,
                  voters: [
                    ...link.voters,
                    {
                      id: user.id,
                      name: user.name || null,
                      avatarUrl: user.avatarUrl || null,
                    },
                  ],
                }
              : link
          )
        );

        // Make the API call
        const result = await vote({ linkId, userId });
        if (result.error) {
          // Revert the optimistic update on error
          setLinks((prev: FormattedLink[]) =>
            prev.map((link) =>
              link.id === linkId
                ? {
                    ...link,
                    voteCount: link.voteCount - 1,
                    hasVoted: false,
                    voters: link.voters.filter((voter) => voter.id !== user.id),
                  }
                : link
            )
          );
          setError(result.error);
          return;
        }
      } catch {
        // Revert the optimistic update on error
        setLinks((prev: FormattedLink[]) =>
          prev.map((link) =>
            link.id === linkId
              ? {
                  ...link,
                  voteCount: link.voteCount - 1,
                  hasVoted: false,
                  voters: link.voters.filter((voter) => voter.id !== user.id),
                }
              : link
          )
        );
        setError(fr.errors.failedToVote);
      }
    },
    [user]
  );

  const handleUnvote = useCallback(
    async (linkId: string, userId: string) => {
      try {
        if (!user?.id) {
          setError(fr.errors.loginRequired);
          return;
        }

        // Optimistically update the UI
        setLinks((prev: FormattedLink[]) =>
          prev.map((link) =>
            link.id === linkId
              ? {
                  ...link,
                  voteCount: link.voteCount - 1,
                  hasVoted: false,
                  voters: link.voters.filter((voter) => voter.id !== user.id),
                }
              : link
          )
        );

        // Make the API call
        const result = await unvote({ linkId, userId });
        if (result.error) {
          // Revert the optimistic update on error
          setLinks((prev: FormattedLink[]) =>
            prev.map((link) =>
              link.id === linkId
                ? {
                    ...link,
                    voteCount: link.voteCount + 1,
                    hasVoted: true,
                    voters: [
                      ...link.voters,
                      {
                        id: user.id,
                        name: user.name || null,
                        avatarUrl: user.avatarUrl || null,
                      },
                    ],
                  }
                : link
            )
          );
          setError(result.error);
          return;
        }
      } catch {
        // Revert the optimistic update on error
        setLinks((prev: FormattedLink[]) =>
          prev.map((link) =>
            link.id === linkId
              ? {
                  ...link,
                  voteCount: link.voteCount + 1,
                  hasVoted: true,
                  voters: [
                    ...link.voters,
                    {
                      id: user.id,
                      name: user.name || null,
                      avatarUrl: user.avatarUrl || null,
                    },
                  ],
                }
              : link
          )
        );
        setError(fr.errors.failedToUnvote);
      }
    },
    [user]
  );

  const handleAddComment = useCallback(
    async (linkId: string, userId: string, content: string) => {
      try {
        if (!user?.id) {
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
          setError('Failed to add comment');
          return;
        }

        // Update the links state with the new link
        setLinks((prevLinks) =>
          prevLinks.map((link) => {
            const responseLink = response.link;
            if (link.id === responseLink?.id && responseLink) {
              return {
                ...link,
                ...responseLink,
                comments: responseLink.comments.map((comment) => ({
                  ...comment,
                  userId: comment.user.id,
                  linkId: responseLink.id,
                  createdAt: comment.createdAt || new Date().toISOString(),
                  updatedAt: comment.updatedAt || new Date().toISOString(),
                })),
              };
            }
            return link;
          })
        );
      } catch (err) {
        console.error('Error adding comment:', err);
        setError(fr.errors.failedToAddComment);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    links,
    error,
    isLoading,
    addLink: handleAddLink,
    updateLink: handleUpdateLink,
    deleteLink: handleDeleteLink,
    vote: handleVote,
    unvote: handleUnvote,
    addComment: handleAddComment,
  };
}
