'use client';

import {
  Crown,
  ShoppingBag,
  UserCheck,
  Users,
} from 'lucide-react';

import { useReferralStats } from '@/hooks/use-referrals';

export function ReferralStatsCards() {
  const {
    data,
    isLoading,
    isError,
  } = useReferralStats();

  if (isLoading) {
    return (
      <div
        className="
          grid
          grid-cols-2
          gap-2.5
          lg:grid-cols-6
        "
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="
              animate-pulse
              rounded-xl
              border
              border-border/50
              bg-card/80
              p-3
              sm:p-3.5
            "
          >
            <div className="h-8 w-8 rounded-lg bg-muted/40" />

            <div className="mt-2.5 h-2.5 w-20 rounded bg-muted/40" />

            <div className="mt-1.5 h-5 w-12 rounded bg-muted/40" />

            <div className="mt-1 h-2 w-24 rounded bg-muted/30" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="
          col-span-full
          rounded-xl
          border
          border-dashed
          border-destructive/30
          bg-destructive/5
          px-3
          py-4
          text-center
        "
      >
        <p className="text-xs font-semibold">
          Unable to load referral statistics
        </p>

        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Please try again later.
        </p>
      </div>
    );
  }

  const regularSubscribers =
    data?.regularSubscribers ?? 0;

  const vipSubscribers =
    data?.vipSubscribers ?? 0;

  const stats = [
    {
      title: 'Total Referrals',
      value: data?.total ?? 0,
      icon: Users,
      description: 'People invited',
    },
    {
      title: 'Registered',
      value: data?.registered ?? 0,
      icon: UserCheck,
      description: 'Successful signups',
    },
    {
      title: 'Regular Subscribers',
      value: regularSubscribers,
      icon: Crown,
      description: 'Regular conversions',
    },
    {
      title: 'VIP Subscribers',
      value: vipSubscribers,
      icon: Crown,
      description: 'VIP conversions',
    },
    {
      title: 'Total Subscribers',
      value: regularSubscribers + vipSubscribers,
      icon: Crown,
      description: 'Combined subscriptions',
    },
    {
      title: 'Predictions Purchased',
      value: data?.predictionPurchases ?? 0,
      icon: ShoppingBag,
      description: 'Referral sales',
    },
  ];

  return (
    <div
      className="
        grid
        grid-cols-2
        gap-2.5
        lg:grid-cols-6
      "
    >
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="
              group
              relative
              overflow-hidden
              rounded-xl
              border
              border-border/50
              bg-card/80
              p-3
              shadow-sm
              transition-colors
              hover:border-primary/20
              hover:bg-card
              sm:p-3.5
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-primary/40
                to-transparent
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -right-6
                -top-6
                h-16
                w-16
                rounded-full
                bg-primary/10
                blur-2xl
              "
            />

            <div
              className="
                relative
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-primary/10
                bg-primary/10
                text-primary
                sm:h-9
                sm:w-9
              "
            >
              <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>

            <div className="relative mt-2.5">
              <p
                className="
                  truncate
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.06em]
                  text-muted-foreground
                  sm:text-[10px]
                "
              >
                {item.title}
              </p>

              <p
                className="
                  mt-0.5
                  text-lg
                  font-bold
                  tracking-tight
                  tabular-nums
                  sm:text-xl
                "
              >
                {item.value}
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[9px]
                  text-muted-foreground
                "
              >
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}