import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/components/providers/StoreProvider';
import { addLink, editLink, removeLink, vote as voteForLink, unvote as unvoteForLink, addComment as addCommentToLink } from '@/app/actions/url-actions';
import { FormattedUser } from '@/app/types/user';

type FormattedLink = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  previewDescription: string | null;
  previewFavicon: string | null;
  previewImage: string | null;
  previewSiteName: string | null;
  previewTitle: string | null;
  hasVoted?: boolean;
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
      const links = await addLink({ url: '', title: '', description: '' }, user);
      setLinks(links);
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
      const newLink = await addLink(data, user);
      setLinks(prev => [newLink, ...prev]);
      return newLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
      throw err;
    }
  }

  async function deleteLink(linkId: string) {
    if (!user) throw new Error('User must be logged in to delete a link');
    
    try {
      await removeLink(linkId, user);
      setLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
      throw err;
    }
  }

  async function voteLink(linkId: string) {
    if (!user) throw new Error('User must be logged in to vote');
    
    try {
      await voteForLink(linkId, user);
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
                  user: {
                    id: user.id,
                    name: user.name,
                    avatarUrl: user.avatarUrl || ''
                  }
                }
              ],
              hasVoted: true
            };
          }
          return link;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote link');
      throw err;
    }
  }

  async function unvoteLink(linkId: string) {
    if (!user) throw new Error('User must be logged in to unvote');
    
    try {
      await unvoteForLink(linkId, user);
      setLinks(prev =>
        prev.map(link => {
          if (link.id === linkId) {
            return {
              ...link,
              votes: link.votes.filter(vote => vote.userId !== user.id),
              hasVoted: false
            };
          }
          return link;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unvote link');
      throw err;
    }
  }

  async function addComment(linkId: string, content: string) {
    if (!user) throw new Error('User must be logged in to comment');
    
    try {
      const updatedLink = await addCommentToLink(linkId, content, user);
      setLinks(prev =>
        prev.map(link => {
          if (link.id === linkId) {
            return updatedLink;
          }
          return link;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
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
    addComment
  };
}
