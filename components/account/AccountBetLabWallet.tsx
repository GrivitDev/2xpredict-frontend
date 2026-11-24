'use client';

import { FaCoins, FaRotate, FaTicket } from 'react-icons/fa6';
import { useGetLedgerQuery, useGetWalletQuery } from '@/hooks/use-bet-lab-wallet';
import type { BetLabLedgerPage, BetLabWallet } from '@/types/bet-lab';

function points(value: number | undefined): string {
  return Number(value ?? 0).toLocaleString('en-NG', { maximumFractionDigits: 2 });
}

function dateLabel(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AccountBetLabWallet() {
  const wallet = useGetWalletQuery<BetLabWallet>({ staleTime: 15_000 });
  const ledger = useGetLedgerQuery<BetLabLedgerPage>({ query: { page: 1, limit: 8 } }, { staleTime: 15_000 });
  const data = wallet.data;
  const entries = ledger.data?.items ?? [];

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="bg-gradient-to-br from-primary/[0.12] via-card to-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-accent">Bet Lab wallet</p>
              <h2 className="mt-1 text-sm font-bold">Virtual points balance</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">This balance is for the Bet Lab simulation environment.</p>
            </div>
            <button type="button" onClick={() => void Promise.all([wallet.refetch(), ledger.refetch()])} disabled={wallet.isFetching || ledger.isFetching} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"><FaRotate className={wallet.isFetching || ledger.isFetching ? 'animate-spin' : ''} /> Refresh</button>
          </div>
          {wallet.isLoading ? <div className="mt-4 h-16 w-48 animate-pulse rounded-lg bg-muted" /> : wallet.isError ? <p className="mt-4 text-xs text-destructive">Wallet balance could not be loaded. <button type="button" onClick={() => void wallet.refetch()} className="underline">Retry</button></p> : (
            <div className="mt-4 flex items-end gap-2">
              <FaCoins className="mb-1 text-xl text-brand-accent" />
              <p className="text-3xl font-extrabold tracking-tight tabular-nums">{points(data?.balance)}</p>
              <span className="mb-1 text-[10px] font-semibold text-muted-foreground">points</span>
            </div>
          )}
        </div>
        {data ? (
          <div className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 sm:grid-cols-4">
            <WalletMetric label="Welcome points" value={data.welcomeBalance} />
            <WalletMetric label="Monthly allowance" value={data.monthlyBalance} />
            <WalletMetric label="Bonus points" value={data.bonusBalance} />
            <WalletMetric label="Winnings" value={data.winningsBalance} />
          </div>
        ) : null}
      </section>

      {data ? (
        <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
          <h3 className="text-sm font-bold">Bet Lab activity</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <WalletMetric label="Tickets placed" value={data.ticketsPlaced} />
            <WalletMetric label="Tickets settled" value={data.ticketsSettled} />
            <WalletMetric label="Total staked" value={data.totalStaked} />
            <WalletMetric label="Total returns" value={data.totalReturns} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-[10px]">
            <span className="text-muted-foreground">Monthly allowance plan</span><span className="font-bold capitalize">{data.monthlyAllowancePlan}</span>
            <span className="text-muted-foreground">Allowance period</span><span className="font-semibold">{dateLabel(data.monthlyPeriodStart)} – {dateLabel(data.monthlyPeriodEnd)}</span>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-brand-accent"><FaTicket /></span><div><h3 className="text-sm font-bold">Wallet ledger</h3><p className="text-[10px] text-muted-foreground">Credits and debits recorded by the Bet Lab wallet.</p></div></div>
        {ledger.isLoading ? <div className="mt-3 space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div> : ledger.isError ? (
          <p className="mt-3 text-xs text-destructive">Wallet history could not be loaded. <button type="button" onClick={() => void ledger.refetch()} className="font-semibold underline">Retry</button></p>
        ) : entries.length === 0 ? <p className="py-7 text-center text-xs text-muted-foreground">No wallet transactions have been recorded yet.</p> : (
          <div className="mt-1 divide-y divide-border/60">
            {entries.map((entry) => (
              <article key={entry._id} className="flex flex-wrap items-center gap-2 py-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${entry.delta >= 0 ? 'bg-emerald-500/10 text-status-success' : 'bg-amber-500/10 text-status-warning'}`}><FaCoins /></span>
                <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{entry.description || entry.transactionType.replace(/[_-]/g, ' ')}</p><p className="mt-0.5 text-[9px] capitalize text-muted-foreground">{entry.bucket} · {entry.transactionType.replace(/[_-]/g, ' ')}</p></div>
                <div className="text-right"><p className={`text-xs font-bold tabular-nums ${entry.delta >= 0 ? 'text-status-success' : 'text-foreground'}`}>{entry.delta > 0 ? '+' : ''}{points(entry.delta)}</p><p className="mt-0.5 text-[9px] text-muted-foreground">Balance {points(entry.balanceAfter)}</p></div>
              </article>
            ))}
          </div>
        )}
        <div className="mt-2 border-t border-border/60 pt-2 text-[9px] text-muted-foreground">Showing the latest {entries.length} ledger records returned by the backend.</div>
      </section>
    </div>
  );
}

function WalletMetric({ label, value }: { label: string; value: number }) {
  return <div className="bg-card px-3 py-2"><p className="text-[9px] text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-bold tabular-nums">{points(value)}</p></div>;
}

