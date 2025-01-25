'use client';

import { AnimatePresence, motion } from 'framer-motion';
import SafeImage from './SafeImage';

type AnimatedAvatarProps = {
  src: string;
  alt: string;
  className?: string;
}

export default function AnimatedAvatar({
  src,
  alt,
  className,
}: AnimatedAvatarProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={src}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative"
      >
        <SafeImage src={src} alt={alt} className={className} />
      </motion.div>
    </AnimatePresence>
  );
}
