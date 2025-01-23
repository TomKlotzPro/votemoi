'use client';

import { useState, useEffect } from 'react';
import { Url } from '@/app/types/url';
import { useUser } from '@/app/context/user-context';

const STORAGE_KEY = 'votemoi_urls';

export function useUrls() {
  const { user } = useUser();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const storedUrls = localStorage.getItem(STORAGE_KEY);
      setUrls(storedUrls ? JSON.parse(storedUrls) : []);
    } catch (err) {
      setError('Failed to load URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  const addUrl = async ({ url }: { url: string }) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch URL');
      
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const title = doc.querySelector('title')?.textContent || url;

      const newUrl: Url = {
        id: Math.random().toString(36).substring(7),
        url,
        title,
        votes: [],
      };

      const newUrls = [...urls, newUrl];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUrls));
      setUrls(newUrls);
      return newUrl;
    } catch (err) {
      setError('Failed to add URL');
      throw err;
    }
  };

  const voteForUrl = (urlId: string) => {
    if (!user) return;

    try {
      const newUrls = urls.map(url => {
        if (url.id !== urlId) return url;

        const existingVote = url.votes.find(vote => vote.userId === user.id);
        if (existingVote) return url;

        const newVote = {
          id: Math.random().toString(36).substring(7),
          userId: user.id,
          urlId,
          user,
        };

        return {
          ...url,
          votes: [...url.votes, newVote],
        };
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUrls));
      setUrls(newUrls);
    } catch (err) {
      setError('Failed to vote');
      throw err;
    }
  };

  return {
    urls,
    loading,
    error,
    addUrl,
    voteForUrl,
  };
}
