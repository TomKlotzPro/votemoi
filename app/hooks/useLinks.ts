import { useState, useCallback } from 'react';
import { Link, Vote, Comment } from '../types/link';
import { User } from '../types/user';
import { getLinks, createLink, updateLink, deleteLink, vote, unvote, createComment } from '../actions/links';

function convertToLink(formattedLink: any): Link {
  return {
    ...formattedLink,
    createdAt: new Date(formattedLink.createdAt),
    updatedAt: new Date(formattedLink.updatedAt),
    votes: formattedLink.votes.map((v: any) => ({
      ...v,
      createdAt: new Date(v.createdAt)
    })),
    comments: formattedLink.comments.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt)
    }))
  };
}

export function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLinks();
      if (response.error) {
        setError(response.error);
        return;
      }
      setLinks((response.links || []).map(convertToLink));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const add = useCallback(async (data: { url: string; title?: string; description?: string }, user: User) => {
    setIsLoading(true);
    setError(null);
    try {
      const newLink = await createLink({
        url: data.url,
        title: data.title,
        description: data.description,
        userId: user.id
      });
      setLinks(currentLinks => [convertToLink(newLink), ...currentLinks]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const edit = useCallback(async (data: { id: string; url: string; title?: string; description?: string }, user: User) => {
    setIsLoading(true);
    setError(null);
    try {
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
      
      if (response.link) {
        setLinks(currentLinks =>
          currentLinks.map(link => (link.id === response.link!.id ? convertToLink(response.link!) : link))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit link');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string, user: User) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteLink({ id, userId: user.id });
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.success) {
        setLinks(currentLinks => currentLinks.filter(link => link.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const voteLink = useCallback(async (linkId: string, user: User) => {
    setError(null);
    try {
      const response = await vote({ linkId, userId: user.id });
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.success && response.user) {
        setLinks(currentLinks =>
          currentLinks.map(link => {
            if (link.id === linkId) {
              return {
                ...link,
                votes: [...link.votes, {
                  id: Math.random().toString(),
                  createdAt: new Date(),
                  userId: user.id,
                  linkId,
                  user: response.user!,
                  link: {
                    id: link.id,
                    url: link.url,
                    title: link.title
                  }
                }]
              };
            }
            return link;
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  }, []);

  const unvoteLink = useCallback(async (linkId: string, user: User) => {
    setError(null);
    try {
      const response = await unvote({ linkId, userId: user.id });
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.success) {
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unvote');
    }
  }, []);

  const addComment = useCallback(async (linkId: string, content: string, user: User) => {
    setError(null);
    try {
      const response = await createComment({
        linkId,
        content,
        userId: user.id
      });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      if (response.comment) {
        setLinks(currentLinks =>
          currentLinks.map(link => {
            if (link.id === linkId) {
              return {
                ...link,
                comments: [...link.comments, {
                  ...response.comment!,
                  createdAt: new Date(response.comment!.createdAt),
                  updatedAt: new Date(response.comment!.updatedAt),
                  link: {
                    id: link.id,
                    url: link.url,
                    title: link.title
                  }
                }]
              };
            }
            return link;
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  }, []);

  return {
    links,
    isLoading,
    error,
    add,
    edit,
    remove,
    voteLink,
    unvoteLink,
    addComment,
  };
}
