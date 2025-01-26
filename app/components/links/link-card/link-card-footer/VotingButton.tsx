'use client';

import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import { Vote } from '@prisma/client';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

type VotingButtonProps = {
  linkId: string;
  votes: Vote[];
  isVoted: boolean;
  onVoteSuccess: (vote: Vote | null) => void;
};

export default function VotingButton({
  linkId,
  votes,
  isVoted: initialIsVoted,
  onVoteSuccess,
}: VotingButtonProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticIsVoted, setOptimisticIsVoted] = useState(initialIsVoted);
  const [optimisticVoteCount, setOptimisticVoteCount] = useState(votes.length);

  const handleVoteAction = useCallback(async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('show-auth-form'));
      return;
    }

    try {
      setIsLoading(true);
      // Optimistically update the UI
      const isVoting = !optimisticIsVoted;
      setOptimisticIsVoted(isVoting);
      setOptimisticVoteCount(prev => isVoting ? prev + 1 : prev - 1);

      const response = await fetch(`/api/links/${linkId}/${isVoting ? 'vote' : 'unvote'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setOptimisticIsVoted(!isVoting);
        setOptimisticVoteCount(prev => isVoting ? prev - 1 : prev + 1);
        const error = await response.json();
        throw new Error(error.message || (isVoting ? fr.errors.failedToVote : fr.errors.failedToUnvote));
      }

      const data = await response.json();
      // Pass vote data to parent for voter list update
      onVoteSuccess(isVoting ? { id: user.id } : null);
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error(error instanceof Error ? error.message : (optimisticIsVoted ? fr.errors.failedToUnvote : fr.errors.failedToVote));
    } finally {
      setIsLoading(false);
    }
  }, [linkId, user, onVoteSuccess, optimisticIsVoted]);

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleVoteAction}
        disabled={isLoading}
        className={`group relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          optimisticIsVoted
            ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-amber-500/20 text-fuchsia-400'
            : 'hover:bg-white/5 text-gray-400 hover:text-fuchsia-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="relative"
          initial={false}
          animate={optimisticIsVoted ? { rotate: [0, 15, -15, 0] } : { rotate: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-all duration-300 ease-out ${
              optimisticIsVoted ? 'stroke-[1.5]' : 'stroke-2'
            }`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={
                optimisticIsVoted
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
          {optimisticIsVoted && (
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
        <span className="text-sm font-medium">{optimisticVoteCount}</span>
      </motion.button>
    </div>
  );
}