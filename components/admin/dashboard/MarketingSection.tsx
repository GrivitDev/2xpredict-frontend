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
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnalyticsCard
          title="Total Ads"
          description="Created advertisements"
          icon={Megaphone}
        >
          <p className="text-3xl font-bold">
            {ads.totalAds.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Active Ads"
          description="Currently running"
          icon={Megaphone}
          highlight
        >
          <p className="text-3xl font-bold">
            {ads.activeAds.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Impressions"
          description="Total views"
          icon={Eye}
        >
          <p className="text-3xl font-bold">
            {ads.impressions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Clicks"
          description="User clicks"
          icon={MousePointerClick}
        >
          <p className="text-3xl font-bold">
            {ads.clicks.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="CTR"
          description="Click-through rate"
          icon={MousePointerClick}
          highlight
        >
          <p className="text-3xl font-bold">
            {ads.ctr.toFixed(2)}%
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Total Promos"
          description="Created promotions"
          icon={Gift}
        >
          <p className="text-3xl font-bold">
            {promos.totalPromos.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Active Promos"
          description="Currently active"
          icon={CheckCircle}
          highlight
        >
          <p className="text-3xl font-bold">
            {promos.activePromos.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Expired Promos"
          description="Completed campaigns"
          icon={Clock}
        >
          <p className="text-3xl font-bold">
            {promos.expiredPromos.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}