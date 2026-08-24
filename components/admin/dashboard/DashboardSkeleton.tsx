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

          <Skeleton className="h-8 w-72" />

          <Skeleton className="h-4 w-56" />

        </div>

        <Skeleton className="h-10 w-32 rounded-full" />

      </div>

      {/* Overview */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {Array.from({ length: 4 }).map((_, index) => (

          <Card key={index}>

            <CardHeader className="flex flex-row items-center justify-between pb-3">

              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-5 w-5 rounded-md" />

            </CardHeader>

            <CardContent className="space-y-3">

              <Skeleton className="h-8 w-28" />

              <Skeleton className="h-3 w-36" />

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

      {/* Subscription Analytics */}
      <section className="space-y-4">

        <Skeleton className="h-6 w-56" />

        <Skeleton className="h-4 w-72" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {Array.from({ length: 4 }).map((_, index) => (

            <Card key={index}>

              <CardHeader className="flex flex-row items-center justify-between pb-3">

                <Skeleton className="h-4 w-28" />

                <Skeleton className="h-5 w-5 rounded-md" />

              </CardHeader>

              <CardContent className="space-y-3">

                <Skeleton className="h-8 w-24" />

                <Skeleton className="h-3 w-32" />

              </CardContent>

            </Card>

          ))}

        </div>

      </section>

      {/* Prediction Analytics */}
      <section className="space-y-4">

        <Skeleton className="h-6 w-56" />

        <Skeleton className="h-4 w-72" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {Array.from({ length: 8 }).map((_, index) => (

            <Card key={index}>

              <CardHeader className="flex flex-row items-center justify-between pb-3">

                <Skeleton className="h-4 w-28" />

                <Skeleton className="h-5 w-5 rounded-md" />

              </CardHeader>

              <CardContent className="space-y-3">

                <Skeleton className="h-8 w-24" />

              </CardContent>

            </Card>

          ))}

        </div>

      </section>

      {/* Marketing */}
      <section className="space-y-4">

        <Skeleton className="h-6 w-40" />

        <Skeleton className="h-4 w-72" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {Array.from({ length: 8 }).map((_, index) => (

            <Card key={index}>

              <CardHeader className="flex flex-row items-center justify-between pb-3">

                <Skeleton className="h-4 w-24" />

                <Skeleton className="h-5 w-5 rounded-md" />

              </CardHeader>

              <CardContent className="space-y-3">

                <Skeleton className="h-8 w-24" />

                <Skeleton className="h-3 w-32" />

              </CardContent>

            </Card>

          ))}

        </div>

      </section>

      {/* Referral Program */}
      <section className="space-y-4">

        <Skeleton className="h-6 w-44" />

        <Skeleton className="h-4 w-72" />

        <div className="grid gap-5 md:grid-cols-3">

          {Array.from({ length: 3 }).map((_, index) => (

            <Card key={index}>

              <CardHeader className="flex flex-row items-center justify-between pb-3">

                <Skeleton className="h-4 w-24" />

                <Skeleton className="h-5 w-5 rounded-md" />

              </CardHeader>

              <CardContent className="space-y-3">

                <Skeleton className="h-8 w-24" />

              </CardContent>

            </Card>

          ))}

        </div>

      </section>

      {/* Leaderboards */}
      <section className="space-y-4">

        <Skeleton className="h-6 w-48" />

        <div className="grid gap-6 lg:grid-cols-2">

          {Array.from({ length: 5 }).map((_, index) => (

            <Card key={index}>

              <CardHeader>

                <Skeleton className="h-5 w-44" />

              </CardHeader>

              <CardContent className="space-y-4">

                {Array.from({ length: 5 }).map((__, row) => (

                  <div
                    key={row}
                    className="flex items-center justify-between"
                  >

                    <div className="flex items-center gap-3">

                      <Skeleton className="h-9 w-9 rounded-full" />

                      <div className="space-y-2">

                        <Skeleton className="h-4 w-28" />

                        <Skeleton className="h-3 w-20" />

                      </div>

                    </div>

                    <Skeleton className="h-5 w-10" />

                  </div>

                ))}

              </CardContent>

            </Card>

          ))}

        </div>

      </section>

    </div>
  );
}