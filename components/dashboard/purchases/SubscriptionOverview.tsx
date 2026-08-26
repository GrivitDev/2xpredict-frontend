'use client';

import {
  CalendarDays,
  CheckCircle2,
  Crown,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface Props {
  loading: boolean;
  subscription: any;
  plan: 'free' | 'regular' | 'vip';
}

const PLAN_STYLES = {
  vip: {
    border: 'border-amber-500/25',
    background: 'from-amber-500/[0.08]',
    icon: 'text-amber-500',
    iconBackground: 'bg-amber-500/10',
    value: 'text-amber-600 dark:text-amber-400',
    label: 'VIP',
  },
  regular: {
    border: 'border-primary/20',
    background: 'from-primary/[0.06]',
    icon: 'text-primary',
    iconBackground: 'bg-primary/10',
    value: 'text-primary',
    label: 'Regular',
  },
  free: {
    border: 'border-border/60',
    background: 'from-muted/30',
    icon: 'text-muted-foreground',
    iconBackground: 'bg-muted/50',
    value: 'text-foreground',
    label: 'Free',
  },
} as const;

const STATUS_STYLES = {
  active: `
    border-emerald-500/20
    bg-emerald-500/10
    text-emerald-600
    dark:text-emerald-400
  `,
  inactive: `
    border-border/60
    bg-muted/40
    text-muted-foreground
  `,
};

export default function SubscriptionOverview({
  loading,
  subscription,
  plan,
}: Props) {
  if (loading) return null;

  const isActive = Boolean(subscription?.isActive);
  const status = isActive ? 'Active' : 'Inactive';

  const expiresAt = subscription?.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      )
    : 'No expiry';

  const style = PLAN_STYLES[plan];

  const cards = [
    {
      title: 'Current Plan',
      value: style.label,
      description: 'Membership tier',
      icon: Crown,
      className: `
        ${style.border}
        bg-gradient-to-br
        ${style.background}
        via-card to-card
      `,
      iconClass: style.icon,
      iconBackground: style.iconBackground,
      valueClass: style.value,
      vip: plan === 'vip',
    },
    {
      title: 'Status',
      value: status,
      description: 'Account access',
      icon: CheckCircle2,
      className: `
        border-emerald-500/20
        bg-gradient-to-br
        from-emerald-500/[0.06]
        via-card to-card
      `,
      iconClass: 'text-emerald-500',
      iconBackground: 'bg-emerald-500/10',
      valueClass: 'text-emerald-600 dark:text-emerald-400',
      vip: false,
    },
    {
      title: 'Expires',
      value: expiresAt,
      description: 'Membership expiry',
      icon: CalendarDays,
      className: `
        border-cyan-500/20
        bg-gradient-to-br
        from-cyan-500/[0.06]
        via-card to-card
      `,
      iconClass: 'text-cyan-500',
      iconBackground: 'bg-cyan-500/10',
      valueClass: 'text-foreground',
      vip: false,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`
              group relative overflow-hidden rounded-xl
              border ${card.className}
              px-3.5 py-3 shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md
            `}
          >
            <div
              className="
                pointer-events-none absolute inset-x-0 top-0
                h-px bg-gradient-to-r
                from-transparent via-primary/30 to-transparent
              "
            />

            {card.vip && (
              <Sparkles
                className="
                  absolute right-3 top-3
                  h-3.5 w-3.5
                  text-amber-500 opacity-50
                "
              />
            )}

            <div className="flex items-center gap-3">
              <div
                className={`
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-lg border border-border/40
                  ${card.iconBackground}
                  ${card.iconClass}
                `}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </p>

                {card.title === 'Status' ? (
                  <Badge
                    variant="outline"
                    className={`
                      mt-1 rounded-full border
                      px-2 py-0.5 text-xs font-semibold
                      ${isActive
                        ? STATUS_STYLES.active
                        : STATUS_STYLES.inactive}
                    `}
                  >
                    {status}
                  </Badge>
                ) : (
                  <p
                    className={`
                      mt-0.5 truncate
                      text-sm font-semibold
                      tracking-tight
                      ${card.valueClass}
                    `}
                  >
                    {card.value}
                  </p>
                )}

                <p
                  className="
                    mt-0.5 truncate
                    text-[11px] text-muted-foreground
                  "
                >
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}