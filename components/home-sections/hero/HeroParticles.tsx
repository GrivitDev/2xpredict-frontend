'use client';

import {
  motion,
} from 'framer-motion';

const particles = Array.from(
  {
    length: 40,
  },
  (_, index) => ({
    id: index,

    left:
      `${(index * 37) % 100}%`,

    top:
      `${(index * 53) % 100}%`,

    delay:
      (index % 10) * 0.2,
  }),
);

export default function HeroParticles() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-20
        overflow-hidden
      "
    >
      {particles.map(
        (
          particle,
        ) => (
          <motion.span
            key={
              particle.id
            }
            className="
              absolute
              h-1
              w-1
              rounded-full
              bg-slate-700/30
              blur-[1px]

              dark:bg-white/60
            "
            style={{
              left:
                particle.left,

              top:
                particle.top,
            }}
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: [
                0,
                1,
                0,
              ],

              y: [
                50,
                -50,
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay:
                particle.delay,
              ease:
                'easeInOut',
            }}
          />
        ),
      )}
    </div>
  );
}