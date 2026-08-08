'use client';

import {
  motion,
} from 'framer-motion';

interface HeroStatsProps {
  stats: {
    value: string;
    label: string;
  }[];
}

export default function HeroStats({
  stats,
}: HeroStatsProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.4,
      }}
      className="
        mt-8
        grid
        grid-cols-3
        gap-4
        border-t
        border-slate-900/10
        pt-6

        dark:border-white/20
      "
    >
      {stats.map(
        (
          item,
          index,
        ) => (
          <div
            key={
              index
            }
            className="
              text-center
            "
          >
            <p
              className="
                text-xl
                font-black
                text-slate-900

                dark:text-white
              "
            >
              {
                item.value
              }
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-600

                dark:text-white/60
              "
            >
              {
                item.label
              }
            </p>
          </div>
        ),
      )}
    </motion.div>
  );
}