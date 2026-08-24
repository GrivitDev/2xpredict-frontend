'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { InternalAd } from '@/types/internal-ad';

interface Props {
  ad: InternalAd;
}

export function AdActions({
  ad,
}: Props) {

  if (!ad.actions.length) {
    return null;
  }

  const action = ad.actions[0];

  const external =
    action.url.startsWith('http://') ||
    action.url.startsWith('https://');

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: .35,
        delay: .35,
      }}
      className="w-full"
    >

      <Button
        asChild
        size="lg"
        className="
          h-11
          rounded-xl
          px-5
          text-sm
          font-semibold
          shadow-md
          transition-all
          duration-300
          hover:shadow-xl
          hover:scale-[1.02]
          active:scale-[0.98]
          w-full
          sm:w-auto
        "
      >

        <Link
          href={action.url}
          target={
            external
              ? '_blank'
              : undefined
          }
          rel={
            external
              ? 'noopener noreferrer'
              : undefined
          }
          className="
            flex
            items-center
            justify-center
            gap-2
            whitespace-nowrap
          "
        >

          <span className="truncate">
            {action.label}
          </span>

          <motion.span
            animate={{
              x: [0, 4, 0],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >

            <ArrowRight className="h-4 w-4 shrink-0" />

          </motion.span>

        </Link>

      </Button>

    </motion.div>

  );

}