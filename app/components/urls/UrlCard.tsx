'use client';

import { useUser } from '@/app/context/user-context';
import { useUrls } from '@/app/hooks/useUrls';
import { fr } from '@/app/translations/fr';
import { Url } from '@/app/types/url';
import Image from 'next/image';
import { Tooltip } from '../common/Tooltip';

type UrlCardProps = {
  url: Url;
}

export default function UrlCard({ url }: UrlCardProps) {
  const { user } = useUser();
  const { voteForUrl } = useUrls();

  return (
    <div className="card p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg break-words">{url.title}</h3>
          <a
            href={url.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors break-words"
          >
            {url.url}
          </a>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => voteForUrl(url.id)}
              className="button-secondary text-sm"
              disabled={
                !user || url.votes.some((vote) => vote.userId === user.id)
              }
            >
              {url.votes.length} {fr.urls.votes}
            </button>
            <div className="flex -space-x-2">
              {url.votes.slice(0, 3).map((vote) => (
                <Tooltip key={vote.id} content={vote.user.name}>
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={vote.user.avatarUrl}
                      alt={vote.user.name}
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                </Tooltip>
              ))}
              {url.votes.length > 3 && (
                <Tooltip content={`${url.votes.length - 3} more`}>
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-medium">
                    +{url.votes.length - 3}
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
