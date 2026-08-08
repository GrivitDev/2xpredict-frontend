'use client';

import {
  Crown,
  ShoppingBag,
  UserCheck,
  Users,
  Sparkles,
} from 'lucide-react';

import {
  useQuery,
} from '@tanstack/react-query';

import {
  DashboardGrid,
} from '@/components/dashboard/shared/DashboardGrid';

import {
  StatCard,
} from '@/components/dashboard/shared/StatCard';

import {
  getReferralStats,
} from '@/services/referrals.service';



export function ReferralStatsCards() {


  const {
    data,
    isLoading,
  } = useQuery({

    queryKey:[
      'referral-stats',
    ],

    queryFn:
      getReferralStats,

  });





  const stats = [

    {
      title:
        'Total Referrals',

      value:
        data?.total ?? 0,

      icon:
        Users,

      description:
        'People invited through your link',

      glow:
        'from-primary/20',

    },



    {
      title:
        'Registered',

      value:
        data?.registered ?? 0,

      icon:
        UserCheck,

      description:
        'Successful signups',

      glow:
        'from-emerald-500/20',

    },



    {
      title:
        'Regular Subscribers',

      value:
        data?.regularSubscribers ?? 0,

      icon:
        Crown,

      description:
        'Regular subscription conversions',

      glow:
        'from-blue-500/20',

    },



    {
      title:
        'VIP Subscribers',

      value:
        data?.vipSubscribers ?? 0,

      icon:
        Crown,

      description:
        'VIP subscription conversions',

      glow:
        'from-yellow-500/20',

      premium:
        true,

    },



    {
      title:
        'Total Subscribers',

      value:
        (
          data?.regularSubscribers ?? 0
        )
        +
        (
          data?.vipSubscribers ?? 0
        ),

      icon:
        Crown,

      description:
        'Combined subscription growth',

      glow:
        'from-purple-500/20',

    },



    {
      title:
        'Predictions Purchased',

      value:
        data?.predictionPurchases ?? 0,

      icon:
        ShoppingBag,

      description:
        'Referral generated sales',

      glow:
        'from-cyan-500/20',

    },

  ];





  return (

    <DashboardGrid
      cols={3}
    >

      {
        stats.map((item)=>(

          <div

            key={item.title}

            className={`
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-border/50
              bg-gradient-to-br
              ${item.glow}
              via-background
              to-background
              p-1
              transition-all
              duration-500
              hover:-translate-y-1
              hover:shadow-2xl
            `}

          >



            <div

              className="
                pointer-events-none
                absolute
                -right-10
                -top-10
                h-32
                w-32
                rounded-full
                bg-primary/10
                blur-3xl
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "

            />





            {
              item.premium && (

                <Sparkles

                  className="
                    absolute
                    right-5
                    top-5
                    h-5
                    w-5
                    text-yellow-500
                    opacity-70
                  "

                />

              )
            }





            <StatCard

              title={item.title}

              value={
                isLoading
                  ? 0
                  : item.value
              }

              icon={item.icon}

              description={item.description}

            />


          </div>

        ))
      }


    </DashboardGrid>

  );

}