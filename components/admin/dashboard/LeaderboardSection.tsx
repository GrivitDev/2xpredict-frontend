'use client';

import { useMemo, useState } from 'react';

import LeaderboardTable from './LeaderboardTable';

import {
  AnalyticsLeaderboards,
} from '@/types/analytics.types';

interface Props {
  leaderboards: AnalyticsLeaderboards;
}

type LeaderboardType =
  | 'subscribers'
  | 'vip'
  | 'regular'
  | 'buyers'
  | 'referrals';

export default function LeaderboardSection({
  leaderboards,
}: Props) {
  const [
    activeLeaderboard,
    setActiveLeaderboard,
  ] = useState<LeaderboardType>('subscribers');

  const tabs = [
    {
      label: 'Subscribers',
      value: 'subscribers',
    },
    {
      label: 'VIP',
      value: 'vip',
    },
    {
      label: 'Regular',
      value: 'regular',
    },
    {
      label: 'Buyers',
      value: 'buyers',
    },
    {
      label: 'Referrals',
      value: 'referrals',
    },
  ] as const;

  const table = useMemo(() => {
    switch (activeLeaderboard) {
      case 'vip':
        return {
          title: 'Top VIP Subscribers',
          users: leaderboards.topVipSubscribers,
          metric: 'totalVipSubscriptions' as const,
        };

      case 'regular':
        return {
          title: 'Top Regular Subscribers',
          users: leaderboards.topRegularSubscribers,
          metric: 'totalRegularSubscriptions' as const,
        };

      case 'buyers':
        return {
          title: 'Top Prediction Buyers',
          users: leaderboards.topPredictionBuyers,
          metric: 'totalPurchases' as const,
        };

      case 'referrals':
        return {
          title: 'Top Referrers',
          users: leaderboards.topReferrers,
          metric: 'successfulReferrals' as const,
        };

      default:
        return {
          title: 'Top Subscribers',
          users: leaderboards.topSubscribers,
          metric: 'totalSubscriptions' as const,
        };
    }
  }, [activeLeaderboard, leaderboards]);

  return (
    <section className="space-y-1">

<div
  className="
    flex
    w-full
    flex-wrap
    items-center
    rounded-lg
    border
    bg-muted/50
    p-1
    gap-1
  "
>
  {tabs.map((tab) => (
    <button
      key={tab.value}
      onClick={() => setActiveLeaderboard(tab.value)}
      className={`
        flex-1
        min-w-[120px]
        rounded-md
        px-4
        py-1
        text-s
        font-medium
        text-center
        transition-all
        duration-200
        ${
          activeLeaderboard === tab.value
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-background hover:text-foreground'
        }
      `}
    >
      {tab.label}
    </button>
  ))}
</div>

      <LeaderboardTable
        title={table.title}
        users={table.users}
        metric={table.metric}
      />
    </section>
  );
}