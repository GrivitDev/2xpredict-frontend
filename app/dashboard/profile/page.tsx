'use client';

import ProfileHero from '@/components/dashboard/profile/ProfileHero';

import { useProfile } from '@/hooks/useProfile';
import { usePurchases } from '@/hooks/usePurchases';


// ============================================================
// PROFILE PAGE
// ============================================================

export default function ProfilePage() {
  const { user, loading } = useProfile();
  const { plan } = usePurchases();

  if (loading || !user) {
    return <ProfileLoading />;
  }

  return (
    <main className="w-full">
      <ProfileHero
        user={user}
        plan={plan}
      />
    </main>
  );
}


// ============================================================
// LOADING SKELETON
// ============================================================

function ProfileLoading() {
  return (
    <main className="w-full animate-pulse">
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-border/60
          bg-card
          shadow-sm
        "
      >

        {/* Top bar */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border/50
            px-4
            py-3
            sm:px-5
          "
        >
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>


        {/* Profile */}

        <div className="p-4 sm:p-5">

          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
            "
          >
            <Skeleton
              className="
                mx-auto
                h-[76px]
                w-[76px]
                shrink-0
                rounded-2xl
                sm:mx-0
              "
            />

            <div
              className="
                flex-1
                space-y-2.5
                text-center
                sm:text-left
              "
            >
              <Skeleton
                className="
                  mx-auto
                  h-7
                  w-48
                  rounded-md
                  sm:mx-0
                "
              />

              <Skeleton
                className="
                  mx-auto
                  h-4
                  w-28
                  rounded-md
                  sm:mx-0
                "
              />

              <Skeleton
                className="
                  mx-auto
                  h-4
                  w-64
                  max-w-full
                  rounded-md
                  sm:mx-0
                "
              />
            </div>
          </div>


          {/* Account information */}

          <SkeletonSection
            titleWidth="w-36"
            className="mt-5"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              <LoadingItem />
              <LoadingItem />
              <LoadingItem />
            </div>
          </SkeletonSection>


          {/* Stats */}

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <LoadingItem />
            <LoadingItem />
            <LoadingItem />
          </div>


          {/* Actions */}

          <SkeletonSection
            titleWidth="w-28"
            className="mt-4"
          >
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </SkeletonSection>

        </div>
      </div>
    </main>
  );
}


// ============================================================
// SKELETON HELPERS
// ============================================================

function Skeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`bg-muted ${className}`}
    />
  );
}


function SkeletonSection({
  titleWidth,
  className = '',
  children,
}: {
  titleWidth: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`
        border-t
        border-border/50
        pt-4
        ${className}
      `}
    >
      <Skeleton
        className={`
          mb-2.5
          h-3
          rounded
          ${titleWidth}
        `}
      />

      {children}
    </div>
  );
}


// ============================================================
// LOADING ITEM
// ============================================================

function LoadingItem() {
  return (
    <div
      className="
        flex
        h-[60px]
        items-center
        gap-3
        rounded-xl
        border
        border-border/50
        bg-muted/[0.12]
        px-3
      "
    >
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />

      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-20 rounded" />
        <Skeleton className="h-3.5 w-28 max-w-full rounded" />
      </div>
    </div>
  );
}