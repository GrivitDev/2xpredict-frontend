'use client';

import Link from 'next/link';

import {
  motion,
} from 'framer-motion';

import {
  ArrowRight,
} from 'lucide-react';

import type {
  HeroButton,
} from './hero.types';

interface HeroCTAProps {
  button: HeroButton;

  isLoggedIn: boolean;
}

export default function HeroCTA({
  button,
  isLoggedIn,
}: HeroCTAProps) {
  const href =
    isLoggedIn
      ? '/pricing'
      : button.href === '/pricing'
        ? '/register'
        : button.href;

  const label =
    isLoggedIn && button.href === '/pricing'
      ? 'View Premium Plans'
      : button.label;

  return (
    <Link
      href={href}
      className="
        inline-flex
        w-fit
        items-center
        gap-3
      "
    >
      <motion.div
        whileHover={{
          scale: 1.06,
        }}
        whileTap={{
          scale: 0.96,
        }}
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          bg-primary
          px-7
          py-3.5
          font-bold
          text-primary-foreground
          shadow-xl
          shadow-primary/20
          transition
          duration-300

          hover:shadow-2xl
          hover:shadow-primary/30

          dark:shadow-primary/30
          dark:hover:shadow-primary/40
        "
      >
        {/* Animated glow */}

        <motion.div
          animate={{
            x: [
              '-120%',
              '120%',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-transparent
            via-white/30
            to-transparent
            dark:via-white/25
          "
        />

        <span
          className="
            relative
            z-10
            flex
            items-center
            gap-3
          "
        >
          {label}

          <ArrowRight
            size={18}
            className="
              transition
              duration-300
              group-hover:translate-x-1
            "
          />
        </span>
      </motion.div>
    </Link>
  );
}