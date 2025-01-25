'use client';

import { fr } from '@/app/translations/fr';
import { FormattedLink, Link } from '@/app/types/link';
import { useState } from 'react';
import UrlForm from '../forms/UrlForm';

type EditLinkModalProps = {
  link: FormattedLink;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    description?: string;
    url?: string;
  }) => Promise<void>;
}

export default function EditLinkModal({
  link,
  onClose,
  onSubmit,
}: EditLinkModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    title?: string;
    description?: string;
    url?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error editing link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e38] rounded-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          {fr.links.editLink}
        </h2>

        <UrlForm
          initialData={{
            url: link.url,
            title: link.title,
            description: link.description,
          }}
          onSubmit={handleSubmit}
          submitLabel={fr.common.edit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
