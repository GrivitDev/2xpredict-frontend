'use client';

import { useEffect, useMemo, useState } from 'react';

import GatewayModal from './GatewayModal';
import PricingCard from './PricingCard';

import { getPlanConfig } from '@/lib/plan-config';
import type { PlanConfig } from '@/types/plan-config';
import type { PaymentCurrency } from '@/services/payment-gateway.service';
import { useAuth } from '@/providers/auth-provider';
import { useGetStatusQuery, useGetUpgradePriceQuery } from '@/hooks/use-subscriptions';
import type { SubscriptionPlan } from '@/types/subscriptions';

type SelectedPlan = 'regular' | 'vip' | 'premium' | null;

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  free: 0,
  regular: 1,
  vip: 2,
  premium: 3,
};

export default function PricingSection() {
  const { user } = useAuth();
  const subscriptionStatusQuery = useGetStatusQuery({ enabled: Boolean(user) });
  const upgradePriceQuery = useGetUpgradePriceQuery({ enabled: Boolean(user) });
  const currentPlan: SubscriptionPlan = subscriptionStatusQuery.data?.plan ?? 'free';
  const currentPlanResolved = !user || Boolean(subscriptionStatusQuery.data);

  const [config, setConfig] = useState<PlanConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>(null);
  const [currency, setCurrency] = useState<PaymentCurrency>('NGN');

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      try {
        const data = await getPlanConfig();
        if (active) setConfig(data);
      } catch (error) {
        console.error('Failed loading plans', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCurrency('NGN');
      return;
    }

    setCurrency(user.currency === 'USD' ? 'USD' : 'NGN');
  }, [user]);

  const prices = useMemo(() => {
    if (!config) {
      return { regular: 0, vip: 0, premium: 0 };
    }

    return {
      regular:
        currency === 'USD' ? config.regularPriceUSD : config.regularPrice,
      vip: currency === 'USD' ? config.vipPriceUSD : config.vipPrice,
      premium:
        currency === 'USD' ? config.premiumPriceUSD : config.premiumPrice,
    };
  }, [config, currency]);

  if (loading) {
    return (
      <section className="px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-6 w-44 rounded-lg bg-muted" />
          <div className="mt-2 h-3.5 w-64 max-w-full rounded bg-muted" />
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!config) {
    return (
      <section className="px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl rounded-xl border p-4 text-sm text-muted-foreground">
          Failed loading plans.
        </div>
      </section>
    );
  }

  const plans = [
    {
      id: 'regular' as const,
      name: config.planLabels.regular,
      price: prices.regular,
      description: 'More prediction access every day.',
      features: [
        'Everything in Free',
        'Regular predictions',
        'More prediction markets',
        'Reduced advertisements',
        'Priority prediction releases',
      ],
    },
    {
      id: 'premium' as const,
      name: config.planLabels.premium,
      price: prices.premium,
      description: 'Maximum platform access.',
      features: [
        'Everything in VIP',
        'Premium prediction access',
        'All available premium benefits',
        'Priority access',
        'Premium support',
        `${config.subscriptionDurationDays}-day membership`,
      ],
    },
    {
      id: 'vip' as const,
      name: config.planLabels.vip,
      price: prices.vip,
      description: 'Expanded access and VIP benefits.',
      features: [
        'Everything in Regular',
        'VIP predictions',
        'Highest confidence selections',
        'VIP Telegram access',
        'Zero advertisements',
        'Priority support',
      ],
    },
  ];

  function handlePlanSelect(id: 'free' | 'regular' | 'vip' | 'premium') {
    if (id === 'free') {
      window.location.href = '/register';
      return;
    }

    if (!user) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    setSelectedPlan(id);
  }

  return (
    <section className="w-full px-3 py-6 sm:px-6 sm:py-9">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Subscription Plans
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Choose the level of access you need.
            </p>
          </div>

          <div className="w-fit rounded-full border bg-card px-3 py-1.5 text-[11px] text-muted-foreground">
            Prices in{' '}
            <span className="font-semibold text-foreground">
              {currency === 'NGN'
                ? 'Nigerian Naira (₦)'
                : 'US Dollars ($)'}
            </span>
          </div>
        </div>

        {/* A single vertical page scroll on mobile; no nested horizontal carousel. */}
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {plans.map((plan) => {
            const planId = plan.id as SubscriptionPlan;
            const isCurrentPlan = currentPlan === planId;
            const isLowerPlan = PLAN_RANK[planId] < PLAN_RANK[currentPlan];
            const isHigherPlan = PLAN_RANK[planId] > PLAN_RANK[currentPlan];
            const upgradeQuote =
              planId === 'vip'
                ? upgradePriceQuery.data?.vipUpgrade
                : planId === 'premium'
                  ? upgradePriceQuery.data?.premiumUpgrade
                  : undefined;
            const hasUpgradeQuote = Boolean(
              user &&
              currentPlan !== 'free' &&
              isHigherPlan &&
              upgradeQuote?.canUpgrade &&
              upgradeQuote.targetPlan === planId,
            );
            const quoteLoading = Boolean(
              user && currentPlan !== 'free' && isHigherPlan && upgradePriceQuery.isLoading,
            );
            const quoteUnavailable = Boolean(
              user && currentPlan !== 'free' && isHigherPlan && upgradePriceQuery.isError,
            );

            return (
              <PricingCard
                key={plan.id}
                plan={plan}
                currency={currency}
                subscriptionDurationDays={config.subscriptionDurationDays}
                currentPlan={currentPlan}
                displayPrice={hasUpgradeQuote ? upgradeQuote!.amount : plan.price}
                priceLabel={hasUpgradeQuote ? 'Upgrade price' : '30-day subscription'}
                upgradeQuote={hasUpgradeQuote ? upgradeQuote : undefined}
                quoteLoading={quoteLoading}
                quoteUnavailable={quoteUnavailable}
                actionLabel={
                  !currentPlanResolved
                    ? 'Checking subscription…'
                    : isCurrentPlan
                      ? 'Current plan'
                      : isLowerPlan
                        ? 'Included in current plan'
                        : hasUpgradeQuote
                          ? 'Upgrade now'
                          : 'Subscribe'
                }
                actionDisabled={
                  !currentPlanResolved ||
                  isCurrentPlan ||
                  isLowerPlan ||
                  quoteLoading ||
                  quoteUnavailable
                }
                onSelect={handlePlanSelect}
              />
            );
          })}
        </div>
      </div>

      {selectedPlan && (
        <GatewayModal
          type="subscription"
          target={selectedPlan}
          amount={prices[selectedPlan]}
          currency={currency}
          config={config}
          title={`Complete ${config.planLabels[selectedPlan]} Subscription`}
          description="Choose your preferred payment method."
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </section>
  );
}

