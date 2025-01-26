'use client';

import { LinkIcon } from '@heroicons/react/24/outline';
import React from 'react';
import SafeImage from '../../ui/SafeImage';

type LinkCardContentProps = {
  url: string;
  title: string;
  description?: string;
  previewImage?: string;
  previewTitle?: string;
};

export default function LinkCardContent({
  url,
  title,
  description,
  previewImage,
  previewTitle,
}: LinkCardContentProps) {
  return (
    <>
      {/* Title and Description */}
      <div className="mb-3">
        <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <span className="line-clamp-2">{title || url}</span>
            <LinkIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
          </a>
        </h3>
        {description && (
          <p className="mt-1 text-gray-400 text-sm line-clamp-2 sm:line-clamp-3">
            {description}
          </p>
        )}
      </div>

      {/* Preview Image */}
      {previewImage && (
        <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-800 flex justify-center items-center">
          <SafeImage
            src={previewImage}
            alt={previewTitle || title || url}
            width={300}
            height={150}
            className="w-full h-full object-cover"
            fallbackSrc="/images/default-preview.png"
          />
        </div>
      )}
    </>
  );
}