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
    <section
      className="
        space-y-4
      "
    >
      <div>
        <h2
          className="
            text-xl
            font-semibold
          "
        >
          Revenue Analytics
        </h2>

        <p
          className="
            text-s
            text-muted-foreground
          "
        >
          Payment performance overview
        </p>

        {!loading && !error && (
          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            Exchange Rate: $1 ≈ ₦
            {rate.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
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
              <div className="space-y-3">
                <div className="flex items-center justify-between text-s">
                  <span className="text-muted-foreground">
                    USD Revenue
                  </span>

                  <span className="font-semibold">
                    {formatDollar(card.revenue.USD)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-s">
                  <span className="text-muted-foreground">
                    NGN Revenue
                  </span>

                  <span className="font-semibold">
                    {formatNaira(card.revenue.NGN)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Total (₦ Equivalent)
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {loading || error
                      ? '--'
                      : formatNaira(
                          getEquivalent(card.revenue),
                        )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-s">
                  <span className="text-muted-foreground">
                    NGN Revenue
                  </span>

                  <span className="font-semibold">
                    {formatNaira(card.revenue.NGN)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Total Revenue
                  </p>

                  <p className="mt-1 text-2xl font-bold">
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