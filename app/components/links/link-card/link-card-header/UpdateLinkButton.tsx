'use client';

import { fr } from '@/app/translations/fr';
import { PencilIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';

type UpdateLinkButtonProps = {
  onUpdate: () => void;
};

export default function UpdateLinkButton({ onUpdate }: UpdateLinkButtonProps) {
  return (
    <motion.button
      onClick={onUpdate}
      className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
      title={fr.common.edit}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <PencilIcon className="w-4 h-4" />
    </motion.button>
  );
}