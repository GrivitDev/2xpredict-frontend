'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaCoins, FaCopy, FaCrown, FaGift, FaUsers } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import { useGetMyBonusesQuery } from '@/hooks/use-bonuses';
import { useGetMyReferralLinkQuery, useGetMyReferralsQuery, useGetStatsQuery } from '@/hooks/use-referrals';
import type { BonusGrant, BonusGrantPage } from '@/types/bonuses';
import type { MyReferralLink, Referral, ReferralStats } from '@/types/referrals';

function dateLabel(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(date);
}

function referredUserLabel(value: Referral['referredUserId']): string {
  if (typeof value === 'string') return value.length > 8 ? `User · ${value.slice(-6)}` : 'Referred user';
  return value?.fullName || value?.username || 'Referred user';
}

function bonusLabel(item: BonusGrant): string {
  if (item.type === 'BET_LAB_POINTS') return `${Number(item.points ?? 0).toLocaleString('en-NG')} Bet Lab points`;
  return `${String(item.plan ?? 'Subscription').toUpperCase()} subscription${item.durationDays ? ` · ${item.durationDays} days` : ''}`;
}

export default function AccountRewardsReferrals() {
  const { user } = useAuth();
  const [bonusPage, setBonusPage] = useState(1);
  const bonuses = useGetMyBonusesQuery<BonusGrantPage>(
    { query: { page: String(bonusPage), limit: '6' } },
    { enabled: Boolean(user), staleTime: 15_000 },
  );
  const referralLink = useGetMyReferralLinkQuery<MyReferralLink>({ enabled: Boolean(user), staleTime: 60_000 });
  const referralStats = useGetStatsQuery<ReferralStats>({ enabled: Boolean(user), staleTime: 30_000 });
  const referrals = useGetMyReferralsQuery<Referral[]>({ enabled: Boolean(user), staleTime: 30_000 });
  const [copied, setCopied] = useState(false);

  async function copyReferralLink() {
    const value = referralLink.data?.referralUrl;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Referral link copied.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Unable to copy the referral link on this device.');
    }
  }

  const stats = referralStats.data;
  const referralRows = referrals.data ?? [];

  return (
    <div id="rewards" className="space-y-3">
      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FaUsers /></span>
          <div><h2 className="text-sm font-bold">Referral activity</h2><p className="text-[10px] text-muted-foreground">Your referral link and the activity recorded against it.</p></div>
        </div>

        {referralLink.isLoading ? <div className="mt-3 h-14 animate-pulse rounded-lg bg-muted" /> : referralLink.isError ? (
          <p className="mt-3 text-xs text-destructive">Your referral link could not be loaded. <button type="button" onClick={() => void referralLink.refetch()} className="font-semibold underline">Retry</button></p>
        ) : referralLink.data?.referralUrl ? (
          <div className="mt-3 rounded-lg border border-border/60 bg-background p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Your referral link</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="min-w-0 flex-1 break-all text-xs font-semibold text-foreground">{referralLink.data.referralUrl}</p>
              <button type="button" onClick={() => void copyReferralLink()} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-semibold text-primary-foreground"><FaCopy /> {copied ? 'Copied' : 'Copy link'}</button>
            </div>
            {referralLink.data.referralCode ? <p className="mt-1 text-[10px] text-muted-foreground">Referral code: <span className="font-semibold text-foreground">{referralLink.data.referralCode}</span></p> : null}
          </div>
        ) : <p className="mt-3 text-xs text-muted-foreground">No referral link is currently available for this account.</p>}

        {stats ? (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Total referrals" value={stats.total} />
            <Metric label="Registered" value={stats.registered} />
            <Metric label="Regular subscribers" value={stats.regularSubscribers} />
            <Metric label="VIP subscribers" value={stats.vipSubscribers} />
          </div>
        ) : referralStats.isLoading ? <div className="mt-3 h-16 animate-pulse rounded-lg bg-muted" /> : referralStats.isError ? <p className="mt-3 text-[10px] text-muted-foreground">Referral statistics are temporarily unavailable.</p> : null}

        <div id="referrals" className="mt-4 scroll-mt-24">
          <div className="flex items-center justify-between gap-2"><h3 className="text-xs font-bold">Recent referrals</h3><span className="text-[10px] text-muted-foreground">{referralRows.length} records</span></div>
          {referrals.isLoading ? <p className="py-4 text-xs text-muted-foreground">Loading referral activity…</p> : referrals.isError ? (
            <p className="py-3 text-xs text-destructive">Referral activity could not be loaded. <button type="button" onClick={() => void referrals.refetch()} className="font-semibold underline">Retry</button></p>
          ) : referralRows.length === 0 ? (
            <p className="mt-2 rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">No referrals have been recorded yet.</p>
          ) : (
            <div className="mt-2 divide-y divide-border/60 rounded-lg border border-border/60">
              {referralRows.slice(0, 8).map((item) => {
                const subscribed = item.premiumSubscription || item.vipSubscription || item.regularSubscription;
                return (
                  <div key={item._id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                    <div className="min-w-0"><p className="truncate text-xs font-semibold">{referredUserLabel(item.referredUserId)}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{item.registered ? 'Registered' : 'Registration pending'}{item.rewardClaimed ? ` · Reward claimed ${dateLabel(item.rewardClaimedAt)}` : ''}</p></div>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${subscribed ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{item.premiumSubscription ? 'PREMIUM' : item.vipSubscription ? 'VIP' : item.regularSubscription ? 'REGULAR' : 'NOT SUBSCRIBED'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FaGift /></span>
          <div><h2 className="text-sm font-bold">Bonus history</h2><p className="text-[10px] text-muted-foreground">Subscription bonuses and Bet Lab points granted to your account.</p></div>
        </div>
        {bonuses.isLoading ? <div className="mt-3 space-y-2">{[0, 1, 2].map((key) => <div key={key} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div> : bonuses.isError ? (
          <p className="mt-3 text-xs text-destructive">Bonus history could not be loaded. <button type="button" onClick={() => void bonuses.refetch()} className="font-semibold underline">Retry</button></p>
        ) : (bonuses.data?.items.length ?? 0) === 0 ? (
          <div className="py-7 text-center"><FaGift className="mx-auto text-lg text-muted-foreground" /><p className="mt-2 text-xs font-semibold">No bonuses yet</p><p className="mt-1 text-[10px] text-muted-foreground">Bonuses granted to your account will appear here.</p></div>
        ) : (
          <>
            <div className="mt-2 divide-y divide-border/60">
              {(bonuses.data?.items ?? []).map((item) => (
                <article key={item._id} className="flex items-start gap-3 py-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.type === 'BET_LAB_POINTS' ? 'bg-sky-500/10 text-sky-600' : 'bg-primary/10 text-primary'}`}>{item.type === 'BET_LAB_POINTS' ? <FaCoins /> : <FaCrown />}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold">{bonusLabel(item)}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${item.status === 'GRANTED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>{item.status}</span></div>
                    {item.reason ? <p className="mt-0.5 text-[10px] text-muted-foreground">{item.reason}</p> : null}
                    <p className="mt-1 text-[9px] text-muted-foreground">Granted {dateLabel(item.startsAt)} · Expires {dateLabel(item.expiresAt)}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[10px] text-muted-foreground">Page {bonuses.data?.page ?? bonusPage} of {Math.max(1, bonuses.data?.pages ?? 1)}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setBonusPage((page) => Math.max(1, page - 1))} disabled={bonusPage <= 1 || bonuses.isFetching} className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold disabled:opacity-40">Previous</button>
                <button type="button" onClick={() => setBonusPage((page) => page + 1)} disabled={bonusPage >= (bonuses.data?.pages ?? 1) || bonuses.isFetching} className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-border/60 bg-background px-3 py-2"><p className="text-[9px] text-muted-foreground">{label}</p><p className="mt-0.5 text-base font-bold tabular-nums">{Number(value ?? 0).toLocaleString('en-NG')}</p></div>;
}
