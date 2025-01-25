'use client';

import { fr } from '@/app/translations/fr';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOADING_ITEMS = 6;

export default function UserListSkeleton() {
  const [message, setMessage] = useState(fr.loading.messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(
        fr.loading.messages[
          Math.floor(Math.random() * fr.loading.messages.length)
        ]
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {[...Array(LOADING_ITEMS)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-lg bg-black/20 space-y-4"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"
              />
              <motion.div
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-4 w-24 rounded bg-gradient-to-r from-purple-500/20 to-pink-500/20"
              />
            </div>
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-4 w-full rounded bg-gradient-to-r from-purple-500/20 to-pink-500/20"
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="text-center mt-4 text-[var(--text-secondary)]">
        {message}
      </div>
    </div>
  );
}
