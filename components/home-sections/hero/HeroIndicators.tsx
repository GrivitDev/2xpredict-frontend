'use client';

import {
  motion,
} from 'framer-motion';

interface HeroIndicatorsProps {
  total: number;

  active: number;
}

export default function HeroIndicators({
  total,
  active,
}: HeroIndicatorsProps) {
  return (
    <div
      className="
        absolute
        bottom-6
        left-1/2
        z-50
        flex
        -translate-x-1/2
        items-center
        gap-2
        rounded-full
        border
        border-slate-900/10
        bg-white/60
        px-4
        py-3
        shadow-lg
        shadow-slate-900/5
        backdrop-blur-xl

        dark:border-white/20
        dark:bg-black/20
        dark:shadow-black/20
      "
    >
      {Array.from({
        length: total,
      }).map(
        (
          _,
          index,
        ) => (
          <motion.div
            key={
              index
            }
            initial={false}
            animate={{
              width:
                active === index
                  ? 42
                  : 8,

              opacity:
                active === index
                  ? 1
                  : 0.4,
            }}
            transition={{
              duration: 0.35,
            }}
            className="
              h-2
              rounded-full
              bg-slate-800

              dark:bg-white
            "
          />
        ),
      )}
    </div>
  );
}