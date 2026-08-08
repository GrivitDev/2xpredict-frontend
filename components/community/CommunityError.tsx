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
        px-4
        py-8
        sm:px-6
        sm:py-10
      "
    >
      <div
        className="
          mx-auto
          max-w-xl
          rounded-2xl
          border
          border-destructive/20
          bg-destructive/5
          p-6
          text-center
          sm:p-8
        "
        role="alert"
      >
        <div
          className="
            mx-auto
            flex
            size-10
            items-center
            justify-center
            rounded-full
            bg-destructive/10
            text-destructive
          "
        >
          <AlertTriangle
            className="size-5"
            aria-hidden="true"
          />
        </div>

        <h3
          className="
            mt-4
            text-lg
            font-semibold
            tracking-tight
            text-foreground
          "
        >
          Unable to load community
        </h3>

        <p
          className="
            mx-auto
            mt-2
            max-w-md
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          {message}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="
            mt-5
            gap-2
            rounded-xl
            bg-background
            shadow-sm
            transition-all
            active:scale-[0.98]
          "
        >
          <RefreshCcw
            className="size-4"
            aria-hidden="true"
          />

          Try again
        </Button>
      </div>
    </div>
  );
}