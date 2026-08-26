import {
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import {
  AnalyticsDashboardResponse,
} from '@/types/analytics.types';

interface Props {
  data: AnalyticsDashboardResponse;
}

export default function AnalyticsHeader({
  data,
}: Props) {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Analytics
        </h1>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Overview of platform performance and revenue.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant="secondary"
          className="
            h-7
            gap-1.5
            rounded-md
            px-2
            text-[11px]
            font-medium
          "
        >
          <Users className="size-3.5" />
          {data.users.totalUsers.toLocaleString()}
          <span className="text-muted-foreground">
            Users
          </span>
        </Badge>

        <Badge
          variant="secondary"
          className="
            h-7
            gap-1.5
            rounded-md
            px-2
            text-[11px]
            font-medium
          "
        >
          <Wallet className="size-3.5" />
          ₦{data.revenue.totalRevenue.NGN.toLocaleString()}
        </Badge>

        <Badge
          className="
            h-7
            gap-1.5
            rounded-md
            px-2
            text-[11px]
            font-medium
          "
        >
          <TrendingUp className="size-3.5" />
          Live
        </Badge>
      </div>
    </div>
  );
}