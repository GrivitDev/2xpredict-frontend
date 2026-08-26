'use client';

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
    <div
      className="
        flex
        justify-center
        px-3
        pt-4
        sm:pt-5
      "
    >
      <Button
        type="button"
        onClick={onClick}
        disabled={loading}
        variant="outline"
        className="
          h-9
          gap-1.5
          rounded-full
          border-border
          bg-background/70
          px-4
          text-xs
          font-medium
          shadow-sm
          transition-colors
          hover:bg-muted
          disabled:opacity-60
          sm:h-10
          sm:px-5
          sm:text-sm
        "
      >
        {loading ? (
          <>
            <LoaderCircle
              className="
                size-3.5
                animate-spin
                sm:size-4
              "
              aria-hidden="true"
            />

            <span>
              Loading...
            </span>
          </>
        ) : (
          <>
            <span>
              Load more
            </span>

            <ChevronDown
              className="
                size-3.5
                sm:size-4
              "
              aria-hidden="true"
            />
          </>
        )}
      </Button>
    </div>
  );
}