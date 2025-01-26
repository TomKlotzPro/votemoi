'use client';

import { fr } from '@/app/translations/fr';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import SafeImage from '../../../ui/SafeImage';

type VoterType = {
  id: string;
  name: string;
  avatarUrl: string;
};

type VoterListProps = {
  voters: VoterType[];
  voteCount: number;
};

export default function VoterList({ voters, voteCount }: VoterListProps) {
  if (voteCount === 0 || !voters || voters.length === 0) {
    return null;
  }

  return (
    <div className="flex -space-x-2 overflow-visible group">
      <div className="flex relative">
        <AnimatePresence mode="wait">
          {voters.slice(0, 3).map((voter) => (
            <motion.div
              key={voter.id}
              className="relative"
              style={{
                zIndex:
                  voters.indexOf(voter) === 0
                    ? 3
                    : voters.indexOf(voter) === 1
                    ? 2
                    : 1,
              }}
              initial={{
                opacity: 0,
                scale: 0.5,
                x: -20,
                marginLeft: voters.indexOf(voter) === 0 ? '0' : '-8px',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                marginLeft: voters.indexOf(voter) === 0 ? '0' : '-8px',
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
                x: 20,
                transition: { duration: 0.2 },
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: voters.indexOf(voter) * 0.1,
              }}
            >
              <SafeImage
                src={voter.avatarUrl || '/default-avatar.png'}
                alt={voter.name || 'User'}
                width={24}
                height={24}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1e1e38] transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:ring-purple-500/30"
              />
            </motion.div>
          ))}
          {voters.length > 3 && (
            <motion.div
              key="more-voters"
              className="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 ring-2 ring-[#1e1e38] transition-all duration-300 ease-out group-hover:ring-purple-500/30"
              style={{ zIndex: 0, marginLeft: '-8px' }}
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: 0.3,
              }}
            >
              <span className="text-xs text-purple-400">
                +{voters.length - 3}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voters tooltip */}
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#1e1e38]/95 backdrop-blur-sm rounded-lg shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none z-50">
          <div className="flex items-center justify-between p-3 text-xs text-gray-300 border-b border-purple-500/10">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4 text-purple-400" />
              <span>{fr.common.voters}</span>
            </div>
            <span className="text-purple-400">{voters.length}</span>
          </div>
          <div className="py-1 max-h-48 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {voters.map((voter) => (
                <motion.div
                  key={voter.id}
                  className="flex items-center gap-2 mx-1 px-2 py-1.5 rounded-md hover:bg-purple-500/10 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    delay: voters.indexOf(voter) * 0.05,
                  }}
                >
                  <SafeImage
                    src={voter.avatarUrl || '/default-avatar.png'}
                    alt={voter.name || 'User'}
                    width={20}
                    height={20}
                    className="rounded-full ring-1 ring-purple-500/20"
                  />
                  <span className="text-xs text-gray-300 font-medium">
                    {voter.name}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}