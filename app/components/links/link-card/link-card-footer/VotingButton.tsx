'use client';

import { useUser } from '@/app/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import SafeImage from '../../../ui/SafeImage';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { fr } from '@/app/translations/fr';

type VoterType = {
  id: string;
  name: string;
  avatarUrl: string;
};

type VotingButtonProps = {
  isVoted: boolean;
  voteCount: number;
  voters: VoterType[];
  onVoteClick: () => Promise<void>;
  setShowAuthForm: (show: boolean) => void;
};

export default function VotingButton({
  isVoted,
  voteCount,
  voters,
  onVoteClick,
  setShowAuthForm,
}: VotingButtonProps) {
  const { user } = useUser();

  const handleVoteClick = async (_: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }
    await onVoteClick();
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleVoteClick}
        className={`group relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          isVoted
            ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-amber-500/20 text-fuchsia-400'
            : 'hover:bg-white/5 text-gray-400 hover:text-fuchsia-400'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="relative"
          initial={false}
          animate={isVoted ? { rotate: [0, 15, -15, 0] } : { rotate: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-all duration-300 ease-out ${
              isVoted ? 'stroke-[1.5]' : 'stroke-2'
            }`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              initial={false}
              animate={
                isVoted
                  ? {
                      fill: ['rgba(0,0,0,0)', 'rgba(217,70,219,0.2)'],
                      stroke: ['currentColor', '#d946db'],
                      scale: [1, 1.2, 1],
                    }
                  : {
                      fill: 'rgba(0,0,0,0)',
                      stroke: 'currentColor',
                      scale: 1,
                    }
              }
              transition={{ duration: 0.3 }}
            />
          </svg>
          {isVoted && (
            <>
              <motion.div
                className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-400"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              <motion.div
                className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-amber-400"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <motion.div
                className="absolute -top-2 -left-1 h-1.5 w-1.5 rounded-full bg-indigo-400"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </>
          )}
        </motion.div>
        <motion.div className="relative">
          <motion.span
            key={`count-${voteCount}`}
            className="block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {voteCount}
          </motion.span>
        </motion.div>
      </motion.button>

      {/* Voters list */}
      {voteCount > 0 && voters && voters.length > 0 && (
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
      )}
    </div>
  );
}