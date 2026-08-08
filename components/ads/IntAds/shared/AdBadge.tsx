'use client';

import { motion } from 'framer-motion';

export function AdBadge() {

  return (

    <motion.div
      initial={{
        opacity: 0,
        x: -12,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: .35,
      }}
      className="
        inline-flex
        items-center
        rounded-full
        border
        border-white/20
        bg-black/30
        px-4
        py-2
        backdrop-blur-md
      "
    >

      <span
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-[0.35em]
          text-primary
        "
      >
        Sponsored
      </span>

    </motion.div>

  );

}