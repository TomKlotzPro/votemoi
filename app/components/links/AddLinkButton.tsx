'use client';

import { fr } from '@/app/translations/fr';
import { PlusIcon } from '@heroicons/react/24/outline';

interface AddLinkButtonProps {
  onAdd: (data: {
    url: string;
    title?: string;
    description?: string;
  }) => Promise<void> | null;
}

export default function AddLinkButton({ onAdd }: AddLinkButtonProps) {
  const handleClick = () => {
    // For now, just pass some dummy data
    onAdd({ url: 'https://example.com' });
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30"
    >
      <PlusIcon className="h-5 w-5" />
      <span>{fr.links.addLink}</span>
    </button>
  );
}
