import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import Image from 'next/image';
import { useState } from 'react';
import LinkCardMenu from './LinkCardMenu';

interface LinkCardProps {
  link: FormattedLink;
  onDelete: (id: string) => Promise<void>;
}

export default function LinkCard({ link, onDelete }: LinkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(link.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-[#1e1e38] rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {link.title || link.url}
          </h3>
          {link.description && (
            <p className="text-gray-400 mt-2">{link.description}</p>
          )}
        </div>
        <LinkCardMenu onDelete={handleDelete} />
      </div>

      {link.imageUrl && (
        <div className="relative h-48 rounded-lg overflow-hidden">
          <Image
            src={link.imageUrl}
            alt={link.title || link.url}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-400">
        <div>
          {fr.links.addedOn} {new Date(link.createdAt).toLocaleDateString()}
        </div>
        <div>
          {link.votes} {fr.links.votes}
        </div>
      </div>
    </div>
  );
}
