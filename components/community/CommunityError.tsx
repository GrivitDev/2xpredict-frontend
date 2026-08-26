'use client';

import {
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

interface CommunityErrorProps {
  message: string;
  onRetry: () => void;
}

export default function CommunityError({
  message,
  onRetry,
}: CommunityErrorProps) {
  return (
    <div
      className="
        w-full
        px-3
        py-4
        sm:px-4
        sm:py-5
      "
    >
      <div
        className="
          mx-auto
          max-w-lg
          rounded-xl
          border
          border-destructive/20
          bg-destructive/5
          px-4
          py-4
          text-center
          sm:px-5
          sm:py-5
        "
        role="alert"
      >
        <div
          className="
            mx-auto
            flex
            size-8
            items-center
            justify-center
            rounded-full
            bg-destructive/10
            text-destructive
          "
        >
          <AlertTriangle
            className="size-4"
            aria-hidden="true"
          />
        </div>

        <h3
          className="
            mt-2.5
            text-sm
            font-semibold
            leading-tight
            text-foreground
            sm:text-base
          "
        >
          Unable to load community
        </h3>

        <p
          className="
            mx-auto
            mt-1
            max-w-md
            text-xs
            leading-5
            text-muted-foreground
            sm:text-sm
          "
        >
          {message}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="
            mt-3
            h-8
            gap-1.5
            rounded-lg
            bg-background
            px-3
            text-xs
            shadow-none
            transition-colors
            active:scale-[0.98]
            sm:h-9
            sm:text-sm
          "
        >
          <RefreshCcw
            className="size-3.5"
            aria-hidden="true"
          />

          Try again
        </Button>
      </div>
    </div>
  );
}