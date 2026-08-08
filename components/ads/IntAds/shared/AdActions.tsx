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
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: .45,
      }}
    >

      <Button
        asChild
        size="lg"
        className="
          h-12
          rounded-full
          px-7
          text-sm
          font-semibold
          shadow-xl
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
            gap-2
          "
        >

          {action.label}

          <motion.div
            animate={{
              x: [0, 4, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
            }}
          >

            <ArrowRight className="h-4 w-4" />

          </motion.div>

        </Link>

      </Button>

    </motion.div>

  );

}