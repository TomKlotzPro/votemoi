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
import { showToast } from '../components/ui/Toast';

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
          setError('You must be logged in to update a link');
          return;
        }

        setIsLoading(true);
        setError(null);
        const result = await updateLink({
          id,
          userId: user.id,
          url: data.url,
          title: data.title || '', // Ensure title is always a string
          ...(data.description && { description: data.description }), // Only include description if it exists
        });

        if (result.error) {
          setError(result.error);
          throw new Error(result.error);
        }

        if (!result.link) {
          setError('Failed to update link');
          return;
        }

        const link = result.link;
        // Ensure the updated link matches FormattedLink type
        const formattedLink: FormattedLink = {
          id: link.id,
          url: link.url,
          title: link.title,
          description: link.description,
          previewImage: link.previewImage,
          previewTitle: link.previewTitle,
          previewDescription: link.previewDescription,
          previewFavicon: link.previewFavicon,
          previewSiteName: link.previewSiteName,
          createdAt: new Date(link.createdAt).toISOString(),
          updatedAt: new Date(link.updatedAt).toISOString(),
          votes: link.votes || [],
          comments: (link.comments || []).map((comment) => ({
            ...comment,
            userId: comment.user.id,
            linkId: link.id,
          })),
          createdBy: {
            id: link.createdBy.id,
            name: link.createdBy.name,
            avatarUrl: link.createdBy.avatarUrl,
          },
          createdById: link.createdById,
          hasVoted: false,
        };
        setLinks((prev) =>
          prev.map((link) => (link.id === id ? formattedLink : link))
        );
      } catch {
        setError(fr.errors.failedToUpdateLink);
        throw new Error(fr.errors.failedToUpdateLink);
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

  const handleVote = useCallback(
    async (linkId: string, userId: string) => {
      try {
        if (!user?.id) {
          showToast(fr.errors.loginRequired, 'error');
          return;
        }

        const result = await vote({ linkId, userId });
        if (result.error) {
          showToast(result.error, 'error');
          return;
        }

        if (result.success) {
          setLinks((prev) =>
            prev.map((link) =>
              link.id === linkId
                ? {
                    ...link,
                    votes: link.votes + 1,
                    hasVoted: true,
                  }
                : link
            )
          );
          showToast(fr.common.voteAdded, 'success');
        }
      } catch (error) {
        showToast(fr.errors.failedToVote, 'error');
      }
    },
    [user]
  );

  const handleUnvote = useCallback(
    async (linkId: string, userId: string) => {
      try {
        if (!user?.id) {
          showToast(fr.errors.loginRequired, 'error');
          return;
        }

        const result = await unvote({ linkId, userId });
        if (result.error) {
          showToast(result.error, 'error');
          return;
        }

        if (result.success) {
          setLinks((prev) =>
            prev.map((link) =>
              link.id === linkId
                ? {
                    ...link,
                    votes: Math.max(0, link.votes - 1),
                    hasVoted: false,
                  }
                : link
            )
          );
          showToast(fr.common.voteRemoved, 'success');
        }
      } catch (error) {
        showToast(fr.errors.failedToUnvote, 'error');
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
      } catch {
        setError(fr.errors.failedToAddComment);
        throw new Error(fr.errors.failedToAddComment);
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
