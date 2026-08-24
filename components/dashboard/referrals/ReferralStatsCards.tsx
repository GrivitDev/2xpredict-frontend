'use client';

import {
  Crown,
  ShoppingBag,
  UserCheck,
  Users,
} from 'lucide-react';

import { useReferralStats } from '@/hooks/use-referrals';


// ============================================================
// COMPONENT
// ============================================================

export function ReferralStatsCards() {

  const {
    data,
    isLoading,
    isError,
  } = useReferralStats();


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {

    return (
      <div
        className="
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-6
        "
      >

        {[1, 2, 3, 4, 5, 6].map((item) => (

          <div
            key={item}
            className="
              animate-pulse
              rounded-xl
              border
              border-border/50
              bg-card/80
              p-3
              sm:p-4
            "
          >

            <div
              className="
                h-9
                w-9
                rounded-lg
                bg-muted/40
                sm:h-10
                sm:w-10
                sm:rounded-xl
              "
            />

            <div
              className="
                mt-3
                h-2.5
                w-20
                rounded
                bg-muted/40
              "
            />

            <div
              className="
                mt-2
                h-6
                w-12
                rounded
                bg-muted/40
              "
            />

            <div
              className="
                mt-1.5
                h-2
                w-24
                rounded
                bg-muted/30
              "
            />

          </div>

        ))}

      </div>
    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

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

        <p
          className="
            text-xs
            font-semibold
          "
        >
          Unable to load referral statistics
        </p>

        <p
          className="
            mt-0.5
            text-[10px]
            text-muted-foreground
          "
        >
          Please try again later.
        </p>

      </div>
    );

  }


  // ==========================================================
  // STATS
  // ==========================================================

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
      value: data?.regularSubscribers ?? 0,
      icon: Crown,
      description: 'Regular conversions',
    },

    {
      title: 'VIP Subscribers',
      value: data?.vipSubscribers ?? 0,
      icon: Crown,
      description: 'VIP conversions',
    },

    {
      title: 'Total Subscribers',
      value:
        (data?.regularSubscribers ?? 0) +
        (data?.vipSubscribers ?? 0),
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


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        grid
        grid-cols-2
        gap-3
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
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-primary/20
              hover:shadow-md
              sm:p-4
            "
          >

            {/* Premium accent */}

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


            {/* Decorative glow */}

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
                transition-transform
                duration-500
                group-hover:scale-125
              "
            />


            {/* Icon */}

            <div
              className="
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-primary/10
                bg-primary/10
                text-primary
                sm:h-10
                sm:w-10
                sm:rounded-xl
              "
            >

              <Icon
                className="
                  h-4
                  w-4
                  sm:h-5
                  sm:w-5
                "
              />

            </div>


            {/* Content */}

            <div
              className="
                relative
                mt-3
              "
            >

              <p
                className="
                  truncate
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-muted-foreground
                  sm:text-[10px]
                "
              >
                {item.title}
              </p>


              <p
                className="
                  mt-1
                  text-xl
                  font-black
                  tracking-tight
                  tabular-nums
                  sm:text-2xl
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
                  sm:text-[10px]
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