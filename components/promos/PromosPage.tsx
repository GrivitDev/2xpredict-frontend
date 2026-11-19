'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FaArrowRight, FaGift } from 'react-icons/fa6';
import { useActivePromos } from '@/hooks/use-promos';
import type { Promo } from '@/types/promos';
import StatePanel from '@/components/shared/StatePanel';

function promoRows(value: unknown): Promo[] {
  if (Array.isArray(value)) return value as Promo[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['items', 'promos', 'results', 'data']) {
      if (Array.isArray(record[key])) return record[key] as Promo[];
    }
  }
  return [];
}

function dateLabel(value?: string): string {
  if (!value) return 'Dates not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Dates not specified'
    : new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function promoRewardLabel(promo: Promo): string {
  if (promo.rewardType === 'bet_lab_points' && Number(promo.pointsAmount) > 0) {
    return `${Number(promo.pointsAmount).toLocaleString('en-NG')} Bet Lab points`;
  }
  if (promo.rewardType === 'subscription' && promo.rewardPlan) {
    return `${promo.rewardPlan.toUpperCase()} subscription${promo.rewardDurationDays ? ` · ${promo.rewardDurationDays} days` : ''}`;
  }
  if (promo.promotionKind === 'discount' && Number(promo.discountValue) > 0) {
    return promo.discountType === 'percentage'
      ? `${Number(promo.discountValue)}% discount`
      : `${promo.amountCurrency === 'USD' ? '$' : '₦'}${Number(promo.discountValue).toLocaleString('en-NG')} discount`;
  }
  return 'See campaign details';
}

export default function PromosPage() {
  const promosQuery = useActivePromos({ staleTime: 30_000 });
  const [requestedPromoId, setRequestedPromoId] = useState('');
  const promos = useMemo(() => promoRows(promosQuery.data), [promosQuery.data]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequestedPromoId((params.get('promoId') ?? '').trim());
  }, []);

  useEffect(() => {
    if (!requestedPromoId || !promos.length) return;
    const target = document.getElementById(`promo-${requestedPromoId}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [requestedPromoId, promos]);

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-6 pb-28 sm:px-5 sm:py-8 lg:px-6">
      <header className="mb-5 rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2 text-primary"><FaGift className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.16em]">2xPredict campaigns</span></div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Promotions</h1>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">Browse active campaigns and review their rewards, dates and eligibility requirements.</p>
      </header>

      {promosQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl bg-muted/70" />)}</div>
      ) : promosQuery.isError ? (
        <StatePanel title="Promotions could not be loaded" message="Active campaigns are temporarily unavailable. Refresh the page to try again." action={<button type="button" onClick={() => void promosQuery.refetch()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry</button>} />
      ) : promos.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {promos.map((promo, index) => {
            const id = String(promo._id ?? `promo-${index}`);
            const highlighted = Boolean(requestedPromoId && id === requestedPromoId);
            const campaignHref = promo.campaignType === 'referral'
              ? '/profile#referrals'
              : promo.rewardType === 'bet_lab_points'
                ? '/bet-lab'
                : '/pricing';
            const actionLabel = promo.campaignType === 'referral'
              ? 'View referrals'
              : promo.rewardType === 'bet_lab_points'
                ? 'Explore Bet Lab'
                : 'View plans';
            return (
              <article id={`promo-${id}`} key={id} className={`rounded-xl border bg-card p-4 transition-colors ${highlighted ? 'border-primary ring-2 ring-primary/15' : 'border-border/70'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-primary">{String(promo.campaignType ?? 'campaign').replaceAll('_', ' ')}</span>
                  <span className="text-[9px] text-muted-foreground">{dateLabel(promo.startDate)} – {dateLabel(promo.endDate)}</span>
                </div>
                <h2 className="mt-3 text-sm font-bold text-foreground">{promo.name}</h2>
                {promo.description ? <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{promo.description}</p> : null}
                <div className="mt-3 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Campaign benefit</p>
                  <p className="mt-0.5 text-xs font-bold text-foreground">{promoRewardLabel(promo)}</p>
                  {promo.promoCode ? <p className="mt-1 text-[10px] text-muted-foreground">Code: <span className="font-bold text-foreground">{promo.promoCode}</span></p> : null}
                </div>
                {promo.eligiblePlans?.length ? <p className="mt-2 text-[10px] text-muted-foreground">Eligible plans: {promo.eligiblePlans.map((plan) => plan.toUpperCase()).join(', ')}</p> : null}
                <Link href={campaignHref} className="mt-3 inline-flex min-h-8 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-primary-foreground transition hover:opacity-90">{actionLabel}<FaArrowRight className="h-3 w-3" /></Link>
              </article>
            );
          })}
        </div>
      ) : (
        <StatePanel title="No active promotions" message="There are no active campaigns available at the moment. Check back later for new 2xPredict offers." action={<Link href="/pricing" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">View plans</Link>} />
      )}
    </main>
  );
}
