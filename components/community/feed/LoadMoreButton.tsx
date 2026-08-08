'use client';

import {
  motion,
} from 'framer-motion';

import {
  ChevronDown,
  LoaderCircle,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onClick: () => void;
}

export default function LoadMoreButton({
  loading,
  hasMore,
  onClick,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

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
        duration: 0.25,
      }}
      className="
        flex
        justify-center
        px-4
        pt-6
        sm:pt-8
      "
    >
      <Button
        type="button"
        onClick={onClick}
        disabled={loading}
        variant="outline"
        className="
          h-11
          gap-2
          rounded-full
          border-border
          bg-background/60
          px-5
          text-sm
          font-medium
          shadow-sm
          transition-colors
          hover:bg-muted
          disabled:opacity-60
          sm:h-12
          sm:px-6
          sm:text-base
        "
      >
        {loading ? (
          <>
            <LoaderCircle
              className="
                size-4
                animate-spin
                sm:size-[18px]
              "
              aria-hidden="true"
            />

            <span>
              Loading more...
            </span>
          </>
        ) : (
          <>
            <span>
              Load more discussions
            </span>

            <ChevronDown
              className="
                size-4
                transition-transform
                group-hover:translate-y-0.5
              "
              aria-hidden="true"
            />
          </>
        )}
      </Button>
    </motion.div>
  );
}