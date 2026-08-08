'use client';

import {
  Crown,
  CalendarDays,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import {
  StatCard,
} from '@/components/dashboard/shared/StatCard';

import {
  StatusBadge,
} from '@/components/dashboard/shared/StatusBadge';

interface Props {
  loading: boolean;

  subscription: any;

  plan:
    | 'free'
    | 'regular'
    | 'vip';
}


export default function SubscriptionOverview({
  loading,
  subscription,
  plan,
}: Props) {


  if (loading) {

    return null;

  }


  const expiresAt =
    subscription?.expiryDate

      ? new Date(
          subscription.expiryDate,
        ).toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          },
        )

      : 'No expiry';



  const status =
    subscription?.isActive
      ? 'active'
      : 'inactive';



  const planStyle =
    plan === 'vip'

      ? {
          border:
            'border-amber-500/30',

          background:
            'from-amber-500/20 via-background to-background',

          icon:
            'text-amber-500',
        }

      : plan === 'regular'

        ? {
            border:
              'border-blue-500/30',

            background:
              'from-blue-500/20 via-background to-background',

            icon:
              'text-blue-500',
          }

        : {
            border:
              'border-muted',

            background:
              'from-muted/40 via-background to-background',

            icon:
              'text-muted-foreground',
          };



  const cards = [

    {
      title:
        'Current Plan',

      value:
        plan.toUpperCase(),

      icon:
        Crown,

      description:
        'Your active membership tier',

      className:
        `${planStyle.border} bg-gradient-to-br ${planStyle.background}`,

      iconClass:
        planStyle.icon,
    },


    {
      title:
        'Current Status',

      value:
        <StatusBadge
          status={status}
        />,

      icon:
        CheckCircle2,

      description:
        'Current account access status',

      className:
        `
          border-emerald-500/20
          bg-gradient-to-br
          from-emerald-500/10
          via-background
          to-background
        `,

      iconClass:
        'text-emerald-500',
    },


    {
      title:
        'Expires',

      value:
        expiresAt,

      icon:
        CalendarDays,

      description:
        'Subscription renewal date',

      className:
        `
          border-cyan-500/20
          bg-gradient-to-br
          from-cyan-500/10
          via-background
          to-background
        `,

      iconClass:
        'text-cyan-500',
    },

  ];



  return (

    <div
      className="
        relative
        grid
        gap-5
        md:grid-cols-3
      "
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          -top-32
          h-22
          w-22
          rounded-full
          bg-primary/20
          blur-3xl
        "
      />


      {
        cards.map(
          (card) => (

            <div
              key={card.title}
              className={`
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                ${card.className}
                p-1
                transition-all
                duration-500
                hover:-translate-y-1
                hover:shadow-xl
              `}
            >

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/10
                  to-transparent
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                  dark:via-white/5
                "
              />


              {
                card.title ===
                'Current Plan' && (

                  <Sparkles
                    className="
                      absolute
                      right-5
                      top-5
                      h-5
                      w-5
                      text-primary
                      opacity-50
                    "
                  />

                )
              }


              <div className="relative ">

                <StatCard

                  title={
                    card.title
                  }

                  value={
                    card.value
                  }

                  icon={
                    card.icon
                  }

                  description={
                    card.description
                  }

                />

              </div>


            </div>

          ),
        )
      }

    </div>

  );

}