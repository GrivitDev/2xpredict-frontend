import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';

import {
  Skeleton,
} from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div className="space-y-2">

          <Skeleton className="h-9 w-72" />

          <Skeleton className="h-4 w-56" />

        </div>

        <Skeleton className="h-10 w-32 rounded-full" />

      </div>

      {/* Hero Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {Array.from({ length: 4 }).map((_, index) => (

          <Card key={index}>

            <CardHeader className="flex flex-row items-center justify-between">

              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-10 w-10 rounded-lg" />

            </CardHeader>

            <CardContent className="space-y-3">

              <Skeleton className="h-9 w-32" />

              <Skeleton className="h-4 w-40" />

            </CardContent>

          </Card>

        ))}

      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">

        {Array.from({ length: 2 }).map((_, index) => (

          <Card key={index}>

            <CardHeader>

              <Skeleton className="h-5 w-40" />

            </CardHeader>

            <CardContent>

              <Skeleton className="h-72 w-full rounded-xl" />

            </CardContent>

          </Card>

        ))}

      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 lg:grid-cols-2">

        {Array.from({ length: 4 }).map((_, index) => (

          <Card key={index}>

            <CardHeader>

              <Skeleton className="h-5 w-40" />

            </CardHeader>

            <CardContent className="space-y-5">

              {Array.from({ length: 4 }).map((__, row) => (

                <div
                  key={row}
                  className="space-y-2"
                >

                  <div className="flex items-center justify-between">

                    <Skeleton className="h-4 w-28" />

                    <Skeleton className="h-4 w-10" />

                  </div>

                  <Skeleton className="h-2 w-full rounded-full" />

                </div>

              ))}

            </CardContent>

          </Card>

        ))}

      </div>

      {/* Leaderboards */}
      <div className="grid gap-6 lg:grid-cols-2">

        {Array.from({ length: 4 }).map((_, index) => (

          <Card key={index}>

            <CardHeader>

              <Skeleton className="h-5 w-48" />

            </CardHeader>

            <CardContent className="space-y-4">

              {Array.from({ length: 5 }).map((__, row) => (

                <div
                  key={row}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-3">

                    <Skeleton className="h-8 w-8 rounded-full" />

                    <div className="space-y-2">

                      <Skeleton className="h-4 w-32" />

                      <Skeleton className="h-3 w-24" />

                    </div>

                  </div>

                  <Skeleton className="h-4 w-10" />

                </div>

              ))}

            </CardContent>

          </Card>

        ))}

      </div>

    </div>
  );
}