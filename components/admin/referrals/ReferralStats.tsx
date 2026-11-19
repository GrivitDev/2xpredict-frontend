'use client';

import { Users, UserPlus, Crown, CreditCard, TrendingUp } from 'lucide-react';
import type { ReferralAdminStats } from '@/types/referrals';

interface ReferralStatsProps {
  stats: ReferralAdminStats;
}

const STAT_ITEMS = [
  { title: 'Total Referrals', key: 'total', icon: Users },
  { title: 'Active Referrers', key: 'totalReferrers', icon: UserPlus },
  { title: 'Registered Users', key: 'registered', icon: Users },
  { title: 'Regular Subscribers', key: 'regularSubscribers', icon: CreditCard },
  { title: 'VIP Subscribers', key: 'vipSubscribers', icon: Crown },
  { title: 'Premium Subscribers', key: 'premiumSubscribers', icon: Crown },
  { title: 'Conversion Rate', key: 'conversionRate', icon: TrendingUp },
] as const satisfies ReadonlyArray<{
  title: string;
  key: keyof ReferralAdminStats;
  icon: typeof Users;
}>;

export default function ReferralStats({ stats }: ReferralStatsProps) {
  return (
    <section aria-label="Referral statistics" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {STAT_ITEMS.map(({ title, key, icon: Icon }) => {
        const rawValue = stats[key];
        const value = key === 'conversionRate'
          ? `${Number(rawValue ?? 0)}%`
          : Number(rawValue ?? 0).toLocaleString();

        return (
          <div key={key} className="rounded-lg border border-border/60 bg-card px-3 py-2.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[11px] font-medium text-muted-foreground">{title}</p>
              <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            </div>
            <p className="mt-1 text-lg font-semibold leading-none tracking-tight text-foreground">{value}</p>
          </div>
        );
      })}
    </section>
  );
}
