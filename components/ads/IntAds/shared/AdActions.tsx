'use client';

import Link from 'next/link';

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

  const action =
    ad.actions[0];

  const external =
    action.url.startsWith(
      'http://',
    ) ||
    action.url.startsWith(
      'https://',
    );

  return (
    <div className="w-full">
      <Button
        asChild
        size="lg"
        className="
          h-11
          w-full
          rounded-xl
          px-5
          text-sm
          font-semibold
          shadow-md
          transition-shadow
          duration-200
          hover:shadow-lg
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

          <ArrowRight
            className="
              h-4
              w-4
              shrink-0
            "
          />
        </Link>
      </Button>
    </div>
  );
}