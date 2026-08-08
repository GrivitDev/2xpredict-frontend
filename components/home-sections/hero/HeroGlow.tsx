'use client';

import {
  motion,
} from 'framer-motion';

interface HeroGlowProps {
  type:
    | 'green'
    | 'blue'
    | 'purple'
    | 'gold'
    | 'mixed';
}

const glowColors = {
  green:
    'bg-green-500/20 dark:bg-green-500/30',

  blue:
    'bg-blue-500/20 dark:bg-blue-500/30',

  purple:
    'bg-purple-500/20 dark:bg-purple-500/30',

  gold:
    'bg-yellow-500/20 dark:bg-yellow-500/30',

  mixed:
    'bg-purple-500/15 dark:bg-purple-500/20',
};

export default function HeroGlow({
  type,
}: HeroGlowProps) {
  return (
    <motion.div
      animate={{
        scale: [
          1,
          1.2,
          1,
        ],

        opacity: [
          0.3,
          0.55,
          0.3,
        ],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`
        absolute
        left-1/2
        top-1/2
        z-10
        h-[450px]
        w-[450px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        blur-[140px]
        ${glowColors[type]}
      `}
    />
  );
}