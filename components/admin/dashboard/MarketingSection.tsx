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
    <section className="space-y-6">

      <div>

        <h2 className="text-xl font-semibold">
          Marketing
        </h2>

        <p className="text-sm text-muted-foreground">
          Ads and promotional campaign performance
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        <AnalyticsCard
          title="Total Ads"
          value={ads.totalAds}
          description="Created advertisements"
          icon={Megaphone}
        />

        <AnalyticsCard
          title="Active Ads"
          value={ads.activeAds}
          description="Currently running"
          icon={Megaphone}
          highlight
        />

        <AnalyticsCard
          title="Impressions"
          value={ads.impressions.toLocaleString()}
          description="Total views"
          icon={Eye}
        />

        <AnalyticsCard
          title="Clicks"
          value={ads.clicks.toLocaleString()}
          description="User clicks"
          icon={MousePointerClick}
        />

        <AnalyticsCard
          title="CTR"
          value={`${ads.ctr}%`}
          description="Click-through rate"
          icon={MousePointerClick}
          highlight
        />

        <AnalyticsCard
          title="Total Promos"
          value={promos.totalPromos}
          description="Created promotions"
          icon={Gift}
        />

        <AnalyticsCard
          title="Active Promos"
          value={promos.activePromos}
          description="Currently active"
          icon={CheckCircle}
          highlight
        />

        <AnalyticsCard
          title="Expired Promos"
          value={promos.expiredPromos}
          description="Completed campaigns"
          icon={Clock}
        />

      </div>

    </section>
  );
}