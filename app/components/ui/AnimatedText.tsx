'use client';

import { AnimatePresence, motion } from 'framer-motion';

type AnimatedTextProps = {
  text: string;
  className?: string;
}

export default function AnimatedText({ text, className }: AnimatedTextProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={className}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}
