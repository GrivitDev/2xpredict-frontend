'use client';

import {
  Users,
  UserPlus,
  Crown,
  CreditCard,
  Target,
  TrendingUp,
} from 'lucide-react';

import {
  ReferralAdminStats,
} from '@/types/referral';

interface ReferralStatsProps {
  stats: ReferralAdminStats;
}

const STAT_ITEMS = [
  {
    title: 'Total Referrals',
    key: 'total',
    icon: Users,
  },
  {
    title: 'Active Referrers',
    key: 'totalReferrers',
    icon: UserPlus,
  },
  {
    title: 'Registered Users',
    key: 'registered',
    icon: Users,
  },
  {
    title: 'Regular Subscribers',
    key: 'regularSubscribers',
    icon: CreditCard,
  },
  {
    title: 'VIP Subscribers',
    key: 'vipSubscribers',
    icon: Crown,
  },
  {
    title: 'Prediction Purchases',
    key: 'predictionPurchases',
    icon: Target,
  },
  {
    title: 'Conversion Rate',
    key: 'conversionRate',
    icon: TrendingUp,
  },
] as const;

export default function ReferralStats({
  stats,
}: ReferralStatsProps) {
  return (
    <section
      aria-label="Referral statistics"
      className="
        grid
        grid-cols-2
        gap-2
        sm:grid-cols-3
        lg:grid-cols-4
      "
    >
      {STAT_ITEMS.map(({ title, key, icon: Icon }) => {
        const value =
          key === 'conversionRate'
            ? `${stats[key]}%`
            : stats[key];

        return (
          <div
            key={key}
            className="
              rounded-lg
              border
              border-border/60
              bg-card
              px-3
              py-2.5
              shadow-[0_1px_2px_rgba(0,0,0,0.04)]
            "
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {title}
              </p>

              <Icon
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
              />
            </div>

            <p className="mt-1 text-lg font-semibold leading-none tracking-tight text-foreground">
              {value}
            </p>
          </div>
        );
      })}
    </section>
  );
}