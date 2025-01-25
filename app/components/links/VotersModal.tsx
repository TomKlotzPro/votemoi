'use client';

import { Vote } from '@/app/types/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedBackground from '../ui/AnimatedBackground';
import SafeImage from '../ui/SafeImage';

type VotersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  votes: Vote[];
};

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          >
            <AnimatedBackground />
          </motion.div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gradient-to-br from-[#1e1e38]/90 to-[#2d1b69]/90 backdrop-blur-md rounded-xl shadow-2xl border border-purple-500/20 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
              <h2 className="text-xl font-semibold text-white">
                {votes.length} {votes.length === 1 ? 'vote' : 'votes'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-white/60 hover:text-white" />
              </button>
            </div>

            {/* Voters List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
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
