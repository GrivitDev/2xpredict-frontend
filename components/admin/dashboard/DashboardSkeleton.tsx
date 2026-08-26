import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MetricSkeleton = ({
  count = 4,
}: {
  count?: number;
}) => (
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <Card
        key={index}
        className="rounded-lg shadow-sm"
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-2.5 w-28" />
            </div>

            <Skeleton className="size-8 rounded-md" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <Card className="rounded-lg shadow-sm">
    <CardContent className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>

      <Skeleton className="h-56 w-full rounded-md" />
    </CardContent>
  </Card>
);

const LeaderboardSkeleton = () => (
  <Card className="rounded-lg shadow-sm">
    <CardContent className="p-3">
      <Skeleton className="mb-4 h-4 w-36" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-full" />

              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>

            <Skeleton className="h-4 w-9" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SectionSkeleton = ({
  titleWidth = 'w-40',
  description = true,
  children,
}: {
  titleWidth?: string;
  description?: boolean;
  children: React.ReactNode;
}) => (
  <section className="space-y-2.5">
    <div>
      <Skeleton className={`h-4 ${titleWidth}`} />

      {description && (
        <Skeleton className="mt-1.5 h-3 w-56" />
      )}
    </div>

    {children}
  </section>
);

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-40" />
        </div>

        <div className="flex gap-1.5">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>

      {/* Overview */}
      <MetricSkeleton />

      {/* Charts */}
      <div className="grid gap-2 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Subscription Analytics */}
      <SectionSkeleton
        titleWidth="w-40"
      >
        <MetricSkeleton />
      </SectionSkeleton>

      {/* Prediction Analytics */}
      <SectionSkeleton
        titleWidth="w-40"
      >
        <MetricSkeleton count={8} />
      </SectionSkeleton>

      {/* Marketing */}
      <SectionSkeleton
        titleWidth="w-32"
      >
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-lg shadow-sm"
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-2.5 w-28" />
                  </div>

                  <Skeleton className="size-8 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionSkeleton>

      {/* Referral Program */}
      <SectionSkeleton
        titleWidth="w-36"
      >
        <div className="grid gap-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-lg shadow-sm"
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-24" />
                  </div>

                  <Skeleton className="size-8 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionSkeleton>

      {/* Leaderboards */}
      <SectionSkeleton
        titleWidth="w-40"
        description={false}
      >
        <div className="grid gap-2 lg:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <LeaderboardSkeleton key={index} />
          ))}
        </div>
      </SectionSkeleton>
    </div>
  );
}