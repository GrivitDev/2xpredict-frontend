'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaCheck, FaCrown, FaShieldHalved, FaStar, FaTrophy } from 'react-icons/fa6';

import { usePlanConfigQuery } from '@/hooks/use-plan-config';
import { useAuth } from '@/providers/auth-provider';
import type { PlanConfig } from '@/types/plan-config';
import type { Currency } from '@/types/payments';

type PlanId = 'free' | 'regular' | 'vip' | 'premium';

const planCards: Array<{
  id: PlanId;
  description: string;
  features: string[];
}> = [
  {
    id: 'free',
    description: 'Start exploring the game.',
    features: ['Selective-league predictions', 'Curated predictions after registration', '1,000 monthly Bet Lab points'],
  },
  {
    id: 'regular',
    description: 'Broader football coverage.',
    features: ['Predictions across supported leagues', '10 odds slips', '3,000 monthly Bet Lab points'],
  },
  {
    id: 'vip',
    description: 'More ways to explore odds.',
    features: ['Everything in Regular', '2 odds slips and 25 odds slips', '5,000 monthly Bet Lab points'],
  },
  {
    id: 'premium',
    description: 'The complete access tier.',
    features: ['Everything in VIP', '5, 7 and 50 odds slips', '10,000 monthly Bet Lab points'],
  },
];

const planIcons = {
  free: FaShieldHalved,
  regular: FaTrophy,
  vip: FaCrown,
  premium: FaStar,
} satisfies Record<PlanId, typeof FaShieldHalved>;

function getPlanPrice(config: PlanConfig, plan: PlanId, currency: Currency): number {
  if (plan === 'free') return 0;
  const key = `${plan}Price${currency === 'USD' ? 'USD' : ''}` as
    | 'regularPrice'
    | 'regularPriceUSD'
    | 'vipPrice'
    | 'vipPriceUSD'
    | 'premiumPrice'
    | 'premiumPriceUSD';
  return Number(config[key] ?? 0);
}

function formatPrice(value: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'NGN' ? 0 : 2,
  }).format(value);
}

export default function HomePricingPreview() {
  const { user } = useAuth();
  const configQuery = usePlanConfigQuery();
  const config = configQuery.data ?? null;
  const loading = configQuery.isLoading;
  const [currency, setCurrency] = useState<Currency>('NGN');


  useEffect(() => {
    if (user?.currency === 'NGN' || user?.currency === 'USD') {
      setCurrency(user.currency);
      return;
    }

    if (user) return;

    let cancelled = false;
    fetch('https://ipapi.co/country/', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const country = (await response.text()).trim().toUpperCase();
        if (!cancelled) setCurrency(country === 'NG' ? 'NGN' : 'USD');
      })
      .catch(() => {
        if (!cancelled) setCurrency('NGN');
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <section className="px-1 py-1 sm:px-1 sm:py-1 lg:py-1">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-burgundy sm:text-xs">
              Our Subscriptions
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Choose how you enjoy 2xPredict
            </h2>
          </div>
          <Link
            href="/pricing"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-brand-burgundy px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy focus-visible:ring-offset-2 sm:self-auto"
          >
            Compare all benefits <FaArrowRight aria-hidden="true" className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {planCards.map((plan) => (
              <div key={plan.id} className="h-56 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
            ))}
          </div>
        ) : !config ? (
          <p className="mt-2 rounded-xl border border-border/70 bg-card/50 p-4 text-xs text-muted-foreground">
            Membership prices are temporarily unavailable. Visit the pricing page to try again.
          </p>
        ) : (
          <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {planCards.map((plan) => {
              const Icon = planIcons[plan.id];
              const isPremium = plan.id === 'premium';
              const isVip = plan.id === 'vip';
              const price = getPlanPrice(config, plan.id, currency);

              return (
                <article
                  key={plan.id}
                  className={`relative flex min-w-0 flex-col rounded-2xl border p-4 transition-colors sm:p-5 ${
                    isPremium
                      ? 'border-brand-burgundy/35 bg-gradient-to-b from-brand-burgundy/[0.07] to-card/70'
                      : isVip
                        ? 'border-brand-champagne/50 bg-gradient-to-b from-brand-champagne/[0.12] to-card/70'
                        : 'border-border/70 bg-card/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isPremium ? 'bg-brand-burgundy text-white' : isVip ? 'bg-brand-champagne/30 text-foreground' : 'bg-brand-burgundy/10 text-brand-burgundy'}`}>
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-foreground">{config.planLabels[plan.id]}</h3>
                      <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mt-1">
                    {plan.id === 'free' ? (
                      <p className="text-2xl font-black text-foreground">Free</p>
                    ) : (
                      <p className="text-2xl font-black tracking-tight text-foreground">
                        {formatPrice(price, currency)}
                        <span className="ml-1 text-[10px] font-medium text-muted-foreground">/ {config.subscriptionDurationDays} days</span>
                      </p>
                    )}
                  </div>

                  <ul className="mt-1 flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                        <FaCheck aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/pricing"
                    className={`mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy focus-visible:ring-offset-2 ${
                      isPremium
                        ? 'bg-brand-burgundy text-white hover:brightness-160'
                        : isVip
                          ? 'bg-brand-champagne text-burgundy hover:brightness-50'
                          : 'border border-border bg-background/70 text-foreground hover:border-brand-burgundy/30 hover:text-brand-burgundy'
                    }`}
                  >
                    {plan.id === 'free' ? 'Get started' : 'View plan'}
                    <FaArrowRight aria-hidden="true" className="h-3 w-3" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        <p className="text-center text-[11px] leading-5 text-muted-foreground">
          Bet Lab points are virtual and have no cash value. Football predictions are not guarantees. 18+ only.
        </p>
      </div>
    </section>
  );
}

