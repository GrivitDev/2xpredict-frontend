'use client';

import {
  Skeleton,
} from '@/components/ui/skeleton';

export default function CommunityCardSkeleton() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
        sm:p-5
      "
      aria-hidden="true"
    >
      {/* USER */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <Skeleton
          className="
            size-10
            shrink-0
            rounded-full
            sm:size-11
          "
        />

        <div
          className="
            flex-1
            space-y-2
          "
        >
          <Skeleton
            className="
              h-4
              w-32
              max-w-full
            "
          />

          <Skeleton
            className="
              h-3
              w-24
            "
          />
        </div>
      </div>

      {/* TITLE */}

      <Skeleton
        className="
          mt-5
          h-5
          w-3/4
          max-w-sm
        "
      />

      {/* MESSAGE */}

      <div
        className="
          mt-4
          space-y-2
        "
      >
        <Skeleton
          className="
            h-4
            w-full
          "
        />

        <Skeleton
          className="
            h-4
            w-11/12
          "
        />

        <Skeleton
          className="
            h-4
            w-2/3
          "
        />
      </div>

      {/* ACTIONS */}

      <div
        className="
          mt-5
          flex
          gap-3
        "
      >
        <Skeleton
          className="
            h-8
            w-16
            rounded-full
          "
        />

        <Skeleton
          className="
            h-8
            w-20
            rounded-full
          "
        />
      </div>
    </div>
  );
}