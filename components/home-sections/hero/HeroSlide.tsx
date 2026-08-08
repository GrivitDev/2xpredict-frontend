'use client';

import {
  motion,
} from 'framer-motion';

import HeroBackground from './HeroBackground';

import HeroPlayers from './HeroPlayers';

import HeroContent from './HeroContent';

import HeroGlow from './HeroGlow';

import HeroParticles from './HeroParticles';

import HeroStats from './HeroStats';

import type {
  HeroSlide,
} from './hero.types';

interface HeroSlideProps {
  slide: HeroSlide;

  isLoggedIn: boolean;
}

export default function HeroSlideComponent({
  slide,
  isLoggedIn,
}: HeroSlideProps) {
  return (
    <section
      className="
        relative
        min-h-[420px]
        w-full
        overflow-hidden

        bg-white
        text-slate-900

        dark:bg-slate-950
        dark:text-white

        sm:min-h-[580px]

        lg:min-h-[500px]
      "
    >
      {/* Stadium background */}

      <HeroBackground
        background={
          slide.background
        }
        overlay={
          slide.overlay
        }
      />

      {/* Ambient glow */}

      <HeroGlow
        type={
          slide.overlay
        }
      />

      {/* Moving particles */}

      <HeroParticles />

      {/* Football players */}

      <div
        className="
          opacity-30

          sm:opacity-60

          lg:opacity-100
        "
      >
        <HeroPlayers
          players={
            slide.players
          }
        />
      </div>

      {/* Main content */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="
          relative
          z-30
          flex
          min-h-[420px]
          w-full
          items-start
          justify-start

          px-4
          pt-8
          pb-20

          sm:min-h-[580px]
          sm:px-8
          sm:pt-4
          sm:pb-24

          lg:min-h-[500px]
          lg:px-20
          lg:pt-4
          lg:pb-40
        "
      >
        <div
          className="
            w-full
            max-w-xl

            rounded-2xl

            border
            border-slate-900/10

            bg-white/70

            p-5

            text-left

            shadow-2xl
            shadow-slate-900/10

            backdrop-blur-xl

            dark:border-white/20
            dark:bg-black/20
            dark:text-white
            dark:shadow-black/30

            sm:p-6

            lg:rounded-3xl
            lg:p-8
          "
        >
          <HeroContent
            slide={
              slide
            }
            isLoggedIn={
              isLoggedIn
            }
          />

          {slide.stats && (
            <HeroStats
              stats={
                slide.stats
              }
            />
          )}
        </div>
      </motion.div>
    </section>
  );
}