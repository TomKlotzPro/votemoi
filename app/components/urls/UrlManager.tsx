'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fr } from '@/app/translations/fr';
import { useUrls } from '@/app/hooks/useUrls';
import { useUser } from '@/app/context/user-context';
import UrlList from './UrlList';

export default function UrlManager() {
  const router = useRouter();
  const { urls, loading, error, addUrl } = useUrls();
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <UrlList />
      </div>
    </div>
  );
}
