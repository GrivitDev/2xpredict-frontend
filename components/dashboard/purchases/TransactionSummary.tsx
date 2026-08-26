'use client';

import {
  CheckCircle2,
  Clock3,
  Wallet,
} from 'lucide-react';

interface Props {
  payments: any[];
  currency: 'NGN' | 'USD';
}

const CARDS = [
  {
    title: 'Total Spent',
    description: 'Lifetime payments',
    icon: Wallet,
    iconClass: 'bg-primary/10 text-primary',
    accent: 'bg-primary',
  },
  {
    title: 'Approved',
    description: 'Successful payments',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-500/10 text-emerald-500',
    accent: 'bg-emerald-500',
  },
  {
    title: 'Pending',
    description: 'Awaiting approval',
    icon: Clock3,
    iconClass: 'bg-amber-500/10 text-amber-500',
    accent: 'bg-amber-500',
  },
] as const;

export default function TransactionSummary({
  payments = [],
  currency = 'NGN',
}: Props) {
  let total = 0;
  let approved = 0;
  let pending = 0;

  for (const payment of payments) {
    total += Number(payment.amount || 0);

    if (payment.status === 'approved') {
      approved++;
    } else if (payment.status === 'pending') {
      pending++;
    }
  }

  const formattedTotal = new Intl.NumberFormat(
    currency === 'NGN' ? 'en-NG' : 'en-US',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(total);

  const values = [
    formattedTotal,
    approved.toLocaleString(),
    pending.toLocaleString(),
  ];

  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {CARDS.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="
              relative overflow-hidden rounded-xl
              border border-border/60 bg-card
              px-3.5 py-3 transition-colors
              hover:bg-muted/10
            "
          >
            <div
              className={`
                absolute bottom-0 left-0 top-0
                w-0.5 ${card.accent}
              `}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="
                    text-[10px] font-medium uppercase
                    tracking-wide text-muted-foreground
                  "
                >
                  {card.title}
                </p>

                <p
                  className="
                    mt-0.5 truncate text-lg
                    font-bold tracking-tight
                  "
                >
                  {values[index]}
                </p>

                <p
                  className="
                    mt-0.5 truncate text-[9px]
                    text-muted-foreground
                  "
                >
                  {card.description}
                </p>
              </div>

              <div
                className={`
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg ${card.iconClass}
                `}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}