import {
  DollarSign,
  Crown,
  CreditCard,
  Target,
} from 'lucide-react';

import AnalyticsCard from './AnalyticsCard';

import {
  AnalyticsRevenue,
  RevenueBreakdown,
} from '@/types/analytics.types';

import { useExchangeRate } from '@/hooks/useExchangeRate';

interface Props {
  revenue: AnalyticsRevenue;
}

export default function RevenueSection({
  revenue,
}: Props) {
  const {
    rate,
    loading,
    error,
  } = useExchangeRate();

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString()}`;

  const formatDollar = (amount: number) =>
    `$${amount.toLocaleString()}`;

  const getEquivalent = (
    value: RevenueBreakdown,
  ) => value.NGN + value.USD * rate;

  const cards = [
    {
      title: 'Total Revenue',
      revenue: revenue.totalRevenue,
      description: 'Approved payments',
      icon: DollarSign,
      highlight: true,
      hasDollar: true,
    },
    {
      title: 'VIP Revenue',
      revenue: revenue.vipRevenue,
      description: 'VIP subscriptions',
      icon: Crown,
      highlight: true,
      hasDollar: true,
    },
    {
      title: 'Regular Revenue',
      revenue: revenue.regularRevenue,
      description: 'Regular subscriptions',
      icon: CreditCard,
      hasDollar: true,
    },
    {
      title: 'Prediction Revenue',
      revenue: revenue.predictionRevenue,
      description: 'Prediction purchases',
      icon: Target,
      hasDollar: false,
    },
  ];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Revenue Analytics
        </h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Payment performance overview.
        </p>

        {!loading && !error && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            $1 ≈ ₦
            {rate.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-2
          lg:grid-cols-4
        "
      >
        {cards.map((card) => (
          <AnalyticsCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
            highlight={card.highlight}
          >
            {card.hasDollar ? (
              <div className="space-y-2">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                    text-[11px]
                  "
                >
                  <span className="text-muted-foreground">
                    USD
                  </span>

                  <span className="font-medium tabular-nums">
                    {formatDollar(card.revenue.USD)}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                    text-[11px]
                  "
                >
                  <span className="text-muted-foreground">
                    NGN
                  </span>

                  <span className="font-medium tabular-nums">
                    {formatNaira(card.revenue.NGN)}
                  </span>
                </div>

                <div className="border-t pt-2">
                  <p className="text-[10px] text-muted-foreground">
                    NGN Equivalent
                  </p>

                  <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">
                    {loading || error
                      ? '--'
                      : formatNaira(
                          getEquivalent(card.revenue),
                        )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                    text-[11px]
                  "
                >
                  <span className="text-muted-foreground">
                    NGN
                  </span>

                  <span className="font-medium tabular-nums">
                    {formatNaira(card.revenue.NGN)}
                  </span>
                </div>

                <div className="border-t pt-2">
                  <p className="text-[10px] text-muted-foreground">
                    Total Revenue
                  </p>

                  <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">
                    {formatNaira(card.revenue.NGN)}
                  </p>
                </div>
              </div>
            )}
          </AnalyticsCard>
        ))}
      </div>
    </section>
  );
}