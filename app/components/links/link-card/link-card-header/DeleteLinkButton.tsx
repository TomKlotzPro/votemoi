'use client';

import { fr } from '@/app/translations/fr';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';

type DeleteLinkButtonProps = {
  onDelete: () => void;
};

export default function DeleteLinkButton({ onDelete }: DeleteLinkButtonProps) {
  return (
    <motion.button
      onClick={onDelete}
      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      title={fr.common.delete}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <TrashIcon className="w-4 h-4" />
    </motion.button>
  );
}