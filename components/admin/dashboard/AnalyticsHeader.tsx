

import {
  Badge,
} from '@/components/ui/badge';


import {
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Analytics
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="gap-2 px-3 py-1"
        >
          <Users size={14} />
          {data.users.totalUsers.toLocaleString()} Users
        </Badge>

        <Badge
          variant="secondary"
          className="gap-2 px-3 py-1"
        >
          <Wallet size={14} />
          ₦{data.revenue.totalRevenue.NGN.toLocaleString()}
        </Badge>

        <Badge className="gap-2 px-3 py-1">
          <TrendingUp size={14} />
          Live Metrics
        </Badge>
      </div>
    </div>
  );
}