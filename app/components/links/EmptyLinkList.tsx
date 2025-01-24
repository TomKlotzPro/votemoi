'use client';

import { fr } from '@/app/translations/fr';
import { LinkIcon } from '@heroicons/react/24/outline';

export default function EmptyLinkList() {
  return (
    <div className="rounded-lg bg-zinc-900/50 p-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
          <LinkIcon className="h-6 w-6 text-zinc-400" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-medium text-zinc-200">
          {fr.common.noUrls}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">{fr.common.noUrlsDesc}</p>
      </div>
    </div>
  );
}
