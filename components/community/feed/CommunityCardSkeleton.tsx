'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityCardSkeleton() {
  return (
    <div
      className="
        rounded-lg
        border
        border-border
        bg-card
        p-3
        shadow-sm
        sm:p-4
      "
      aria-hidden="true"
    >
      {/* USER */}

      <div className="flex items-center gap-2.5">
        <Skeleton
          className="
            size-9
            shrink-0
            rounded-full
            sm:size-10
          "
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton
            className="
              h-3.5
              w-28
              max-w-full
            "
          />

          <Skeleton
            className="
              h-2.5
              w-20
            "
          />
        </div>
      </div>

      {/* TITLE */}

      <Skeleton
        className="
          mt-3.5
          h-4
          w-2/3
          max-w-xs
        "
      />

      {/* MESSAGE */}

      <div className="mt-2.5 space-y-1.5">
        <Skeleton
          className="
            h-3.5
            w-full
          "
        />

        <Skeleton
          className="
            h-3.5
            w-11/12
          "
        />

        <Skeleton
          className="
            h-3.5
            w-2/3
          "
        />
      </div>

      {/* ACTIONS */}

      <div className="mt-3.5 flex gap-2">
        <Skeleton
          className="
            h-7
            w-14
            rounded-full
          "
        />

        <Skeleton
          className="
            h-7
            w-16
            rounded-full
          "
        />
      </div>
    </div>
  );
}