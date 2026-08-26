'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Crown,
  Gift,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import PricingCard from './PricingCard';
import GatewayModal from './GatewayModal';

import { getPlanConfig } from '@/lib/plan-config';

import type { PlanConfig } from '@/types/plan-config';
import type { PaymentCurrency } from '@/services/payment-gateway.service';

import { useAuth } from '@/providers/auth-provider';

type SelectedPlan =
  | 'regular'
  | 'vip'
  | null;

export default function PricingSection() {
  const { user } = useAuth();

  const [config, setConfig] =
    useState<PlanConfig | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedPlan, setSelectedPlan] =
    useState<SelectedPlan>(null);

  /*
   * NGN is intentionally the default.
   *
   * This means there is no USD flash while
   * country detection is taking place.
   */
  const [currency, setCurrency] =
    useState<PaymentCurrency>('NGN');


  /*
   * ============================================================
   * LOAD PLAN CONFIG
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    getPlanConfig()
      .then((data) => {
        if (mounted) {
          setConfig(data);
        }
      })
      .catch((error) => {
        console.error(
          'Failed loading plans',
          error,
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);


  /*
   * ============================================================
   * CURRENCY
   *
   * Authenticated user's saved currency has priority.
   *
   * Otherwise detect country:
   *
   * Nigeria -> NGN
   * Everything else -> USD
   * ============================================================
   */

  useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
      return;
    }

    let cancelled = false;

    const detectCurrency = async () => {
      try {
        /*
         * Lightweight country detection.
         *
         * The API response is only used to determine
         * whether the visitor is in Nigeria.
         */
        const response = await fetch(
          'https://ipapi.co/country/',
          {
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          return;
        }

        const country =
          (
            await response.text()
          )
            .trim()
            .toUpperCase();

        if (cancelled) {
          return;
        }

        setCurrency(
          country === 'NG'
            ? 'NGN'
            : 'USD',
        );
      } catch {
        /*
         * NGN remains the fallback.
         */
        if (!cancelled) {
          setCurrency('NGN');
        }
      }
    };

    detectCurrency();

    return () => {
      cancelled = true;
    };
  }, [user?.currency]);


  /*
   * ============================================================
   * PRICES
   * ============================================================
   */

  const prices = useMemo(() => {
    if (!config) {
      return {
        regular: 0,
        vip: 0,
      };
    }

    return {
      regular:
        currency === 'USD'
          ? config.regularPriceUSD
          : config.regularPrice,

      vip:
        currency === 'USD'
          ? config.vipPriceUSD
          : config.vipPrice,
    };
  }, [config, currency]);


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <section
        className="
          px-4
          py-10
          sm:px-6
        "
      >
        <div
          className="
            mx-auto
            max-w-5xl
            rounded-2xl
            border
            border-border/50
            bg-card/40
            p-8
          "
        >
          <div
            className="
              mx-auto
              h-5
              w-32
              animate-pulse
              rounded
              bg-muted
            "
          />

          <div
            className="
              mx-auto
              mt-3
              h-8
              w-64
              animate-pulse
              rounded
              bg-muted
            "
          />

          <div
            className="
              mt-8
              grid
              gap-4
              md:grid-cols-3
            "
          >
            <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
            <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
            <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
          </div>
        </div>
      </section>
    );
  }


  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (!config) {
    return (
      <section
        className="
          px-4
          py-10
          text-center
        "
      >
        <p className="text-s text-muted-foreground">
          Unable to load pricing.
        </p>
      </section>
    );
  }


  /*
   * ============================================================
   * PLANS
   * ============================================================
   */

  const plans = [
    {
      id: 'free' as const,
      name: config.planLabels.free,
      price: 0,
      description: 'Get started',
      features: [
        'Daily free predictions',
        'Match analysis',
        'Community access',
      ],
    },

    {
      id: 'regular' as const,
      name: config.planLabels.regular,
      price: prices.regular,
      description: 'More winning opportunities',
      popular: true,
      features: [
        'More predictions',
        'More prediction markets',
        'Reduced ads',
        'Priority releases',
      ],
    },

    {
      id: 'vip' as const,
      name: config.planLabels.vip,
      price: prices.vip,
      description: 'The complete experience',
      features: [
        'Unlimited predictions',
        'Zero advertisements',
        'Priority support',
        'Early premium tips',
        'VIP rewards',
      ],
    },
  ];


  /*
   * ============================================================
   * BENEFITS
   * ============================================================
   */

  const benefits = [
    {
      icon: TrendingUp,
      label: 'Premium Predictions',
    },
    {
      icon: ShieldCheck,
      label: 'Reduced Ads',
    },
    {
      icon: Gift,
      label: 'VIP Rewards',
    },
  ];


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      <section
        className="
          px-4
          py-8
          sm:px-6
          sm:py-10
          lg:py-12
        "
      >
        <div
          className="
            mx-auto
            max-w-5xl
          "
        >

          {/* HEADER */}

          <div className="text-center">

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-primary/20
                bg-primary/10
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              <Crown className="h-3.5 w-3.5" />

              Premium Membership
            </div>

            <h1
              className="
                mt-3
                text-2xl
                font-black
                tracking-tight
                sm:text-3xl
              "
            >
              Choose Your Plan
            </h1>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-s
                text-muted-foreground
              "
            >
              More predictions. Fewer ads. Better access.
            </p>

            <div
              className="
                mt-4
                flex
                flex-wrap
                justify-center
                gap-2
              "
            >
              {benefits.map(
                ({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-border/60
                      bg-card/60
                      px-2.5
                      py-1
                      text-[10px]
                      font-medium
                      text-muted-foreground
                    "
                  >
                    <Icon
                      className="
                        h-3
                        w-3
                        text-primary
                      "
                    />

                    {label}
                  </div>
                ),
              )}
            </div>
          </div>


          {/* CURRENCY */}

          <div
            className="
              mt-5
              flex
              justify-center
            "
          >
            <div
              className="
                rounded-full
                border
                border-border/60
                bg-muted/30
                px-3
                py-1
                text-[10px]
                text-muted-foreground
              "
            >
              Prices in{' '}

              <span
                className="
                  font-bold
                  text-foreground
                "
              >
                {currency === 'NGN'
                  ? '₦ NGN'
                  : '$ USD'}
              </span>
            </div>
          </div>


          {/* PRICING CARDS */}

          <div
            className="
              mt-6
              grid
              gap-4
              md:grid-cols-3
              md:items-center
            "
          >
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                currency={currency}
                subscriptionDurationDays={
                  config.subscriptionDurationDays
                }
                onSelect={(id) => {
                  if (
                    id !== 'regular' &&
                    id !== 'vip'
                  ) {
                    return;
                  }

                  if (!user) {
                    window.location.href =
                      '/login?redirect=/pricing';

                    return;
                  }

                  setSelectedPlan(id);
                }}
              />
            ))}
          </div>
        </div>
      </section>


      {/* PAYMENT */}

      {selectedPlan && (
        <GatewayModal
          type="subscription"
          target={selectedPlan}
          amount={
            selectedPlan === 'regular'
              ? prices.regular
              : prices.vip
          }
          currency={currency}
          config={config}
          title={
            `Complete ${selectedPlan.toUpperCase()} Subscription`
          }
          description="Choose your preferred payment gateway."
          onClose={() =>
            setSelectedPlan(null)
          }
        />
      )}
    </>
  );
}