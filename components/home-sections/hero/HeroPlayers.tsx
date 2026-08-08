'use client';

import Image from 'next/image';

import {
  motion,
} from 'framer-motion';

import type {
  HeroPlayer,
} from './hero.types';

interface HeroPlayersProps {
  players: HeroPlayer[];
}

export default function HeroPlayers({
  players,
}: HeroPlayersProps) {
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
      {players.map(
        (
          player,
          index,
        ) => (
          <motion.div
            key={
              player.id
            }
            initial={{
              opacity: 0,
              y: 80,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration:
                0.9 + index * 0.15,
              ease:
                'easeOut',
            }}
            className={`
              absolute
              ${player.className ?? ''}
            `}
          >
            {/* Player aura */}

            <motion.div
              animate={{
                scale: [
                  1,
                  1.15,
                  1,
                ],

                opacity: [
                  0.25,
                  0.5,
                  0.25,
                ],
              }}
              transition={{
                duration: 4,
                repeat:
                  Infinity,
                ease:
                  'easeInOut',
              }}
              className="
                absolute
                inset-10
                rounded-full
                bg-primary/20
                blur-3xl

                dark:bg-primary/40
              "
            />

            {/* Floating player */}

            <motion.div
              animate={{
                y: [
                  0,
                  -12,
                  0,
                ],

                rotate: [
                  0,
                  index % 2 === 0
                    ? 1
                    : -1,
                  0,
                ],
              }}
              transition={{
                duration:
                  5 + index,
                repeat:
                  Infinity,
                ease:
                  'easeInOut',
              }}
            >
              <Image
                src={
                  player.image
                }
                alt={
                  player.alt
                }
                width={
                  player.width
                }
                height={
                  player.height
                }
                priority={
                  player.priority
                }
                className="
                  relative
                  h-auto
                  w-full
                  object-contain
                  drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]

                  dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]
                "
              />
            </motion.div>
          </motion.div>
        ),
      )}
    </div>
  );
}