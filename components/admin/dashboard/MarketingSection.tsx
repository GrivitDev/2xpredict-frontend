import AnalyticsCard from './AnalyticsCard';

import {
  Megaphone,
  MousePointerClick,
  Eye,
  Gift,
  CheckCircle,
  Clock,
} from 'lucide-react';

import {
  AnalyticsAds,
  AnalyticsPromos,
} from '@/types/analytics.types';

interface Props {
  ads: AnalyticsAds;
  promos: AnalyticsPromos;
}

export default function MarketingSection({
  ads,
  promos,
}: Props) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Marketing
        </h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Advertising and promotion performance.
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-2
          lg:grid-cols-3
        "
      >
        <AnalyticsCard
          title="Total Ads"
          description="Created"
          icon={Megaphone}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {ads.totalAds.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Active Ads"
          description="Currently running"
          icon={Megaphone}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight">
            {ads.activeAds.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Impressions"
          description="Total views"
          icon={Eye}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {ads.impressions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Clicks"
          description="User clicks"
          icon={MousePointerClick}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {ads.clicks.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="CTR"
          description="Click-through rate"
          icon={MousePointerClick}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight">
            {ads.ctr.toFixed(2)}%
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Total Promos"
          description="Created"
          icon={Gift}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {promos.totalPromos.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Active Promos"
          description="Currently active"
          icon={CheckCircle}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight">
            {promos.activePromos.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Expired Promos"
          description="Completed"
          icon={Clock}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {promos.expiredPromos.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}