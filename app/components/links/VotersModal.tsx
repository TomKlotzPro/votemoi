'use client';

import { Vote } from '@/app/types/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import SafeImage from '../ui/SafeImage';

interface VotersModalProps {
  isOpen: boolean;
  onClose: () => void;
  votes: Vote[];
}

export default function VotersModal({
  isOpen,
  onClose,
  votes,
}: VotersModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black/80 backdrop-blur-md rounded-xl p-6 z-50 border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {votes.length} {votes.length === 1 ? 'vote' : 'votes'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Voters List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {votes.map((vote, index) => (
                <motion.div
                  key={vote.user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <SafeImage
                      src={vote.user.avatarUrl}
                      alt={vote.user.name}
                      className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-white/20 transition-colors"
                    />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {vote.user.name}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {new Date(vote.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
