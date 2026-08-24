'use client';

import { motion } from 'framer-motion';

export function AdBadge() {

  return (

    <motion.div
      initial={{
        opacity: 0,
        x: -8,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: .3,
      }}
      className="
        inline-flex
        items-center
        rounded-full
        border
        border-border/60
        bg-background/80
        px-3
        py-1.5
        shadow-sm
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/70
      "
    >

      <span
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.28em]
          text-primary
          whitespace-nowrap
        "
      >
        Sponsored
      </span>

    </motion.div>

  );

}