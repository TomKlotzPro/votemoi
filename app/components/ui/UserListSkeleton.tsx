'use client';

import { motion } from 'framer-motion';

const LOADING_ITEMS = 4;

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent`;

export default function UserListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {[...Array(LOADING_ITEMS)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: i * 0.1,
              ease: [0.25, 0.4, 0.3, 1.1], // Custom spring animation
            }}
            className="flex items-center gap-3 p-3 rounded-lg bg-black/20"
          >
            {/* Avatar skeleton */}
            <div
              className={`${shimmer} w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10`}
            />
            {/* Name skeleton */}
            <div
              className={`${shimmer} h-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10`}
              style={{ width: `${Math.random() * 30 + 50}%` }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
