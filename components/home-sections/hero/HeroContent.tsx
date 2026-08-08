'use client';

import {
  motion,
} from 'framer-motion';

import HeroCTA from './HeroCTA';

import type {
  HeroSlide,
} from './hero.types';

interface HeroContentProps {
  slide: HeroSlide;

  isLoggedIn: boolean;
}

export default function HeroContent({
  slide,
  isLoggedIn,
}: HeroContentProps) {
  return (
    <div
      className="
        flex
        w-full
        flex-col
        gap-2
        text-slate-900
        dark:text-white
      "
    >
      {/* Badge */}

      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="
          w-fit
          rounded-full
          border
          border-slate-900/10
          bg-white/60
          px-4
          py-2
          text-sm
          font-semibold
          tracking-[0.25em]
          text-slate-700
          shadow-sm
          backdrop-blur-xl

          dark:border-white/20
          dark:bg-white/10
          dark:text-white/80
        "
      >
        {slide.badge}
      </motion.div>

      {/* Title */}

      <motion.h1
        initial={{
          opacity: 0,
          y: -25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 0.1,
        }}
        className="
          max-w-2xl
          text-xl
          font-black
          leading-[1.05]
          tracking-tight
          text-slate-950

          sm:text-3xl

          lg:text-5xl

          dark:text-white
        "
      >
        {slide.title}
      </motion.h1>

      {/* Subtitle */}

      <motion.p
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 0.2,
        }}
        className="
          max-w-xl
          text-sm
          leading-relaxed
          text-slate-700

          sm:text-base

          lg:text-lg

          dark:text-white/75
        "
      >
        {slide.subtitle}
      </motion.p>

      {/* Button */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
          delay: 0.3,
        }}
        className="
          pt-2
        "
      >
        <HeroCTA
          button={
            slide.button
          }
          isLoggedIn={
            isLoggedIn
          }
        />
      </motion.div>
    </div>
  );
}