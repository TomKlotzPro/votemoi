'use client';

import { fr } from '@/app/translations/fr';
import { LinkIcon } from '@heroicons/react/24/outline';

export default function EmptyLinkList() {
  return (
    <div className="bg-[#1e1e38]/80 rounded-lg p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
        <LinkIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-medium text-white/90">
        {fr.common.noUrls}
      </h3>
      <p className="mt-2 text-sm text-white/60">{fr.common.noUrlsDesc}</p>
    </div>
  );
}
