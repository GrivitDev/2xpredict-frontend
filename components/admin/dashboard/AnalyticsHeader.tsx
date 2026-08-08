import Link from 'next/link';

import {
  Badge,
} from '@/components/ui/badge';

import {
  TrendingUp,
  Home,
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
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Analytics
        </h1>

        <p className="text-muted-foreground">
          Platform performance overview
        </p>
      </div>

      <div className="flex items-center gap-3">

        <Badge className="flex gap-2">
          <TrendingUp size={16} />
          Live Metrics
        </Badge>
      </div>
    </div>
  );
}