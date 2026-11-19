'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaClockRotateLeft, FaGift, FaTicket, FaWallet } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import { useGetCurrentUserQuery } from '@/hooks/use-auth';
import { useGetLedgerQuery } from '@/hooks/use-bet-lab-wallet';
import {
  asRecord,
  firstValue,
  formatDate,
  formatPoints,
  numeric,
  text,
  type ApiRecord,
} from '@/lib/api-shapes';
import StatePanel from '@/components/shared/StatePanel';
import { arrayFrom, transactionLabel } from './bet-lab.utils';

const PAGE_SIZE = 50;

function transactionIcon(entry: ApiRecord) {
  const type = text(firstValue(entry, ['transactionType', 'type', 'bucket'])).toLowerCase();
  if (/bonus|welcome|monthly/.test(type)) return <FaGift className="h-3.5 w-3.5" />;
  if (/stake|ticket|winn|settle/.test(type)) return <FaTicket className="h-3.5 w-3.5" />;
  return <FaWallet className="h-3.5 w-3.5" />;
}

export default function BetLabHistoryPage() {
  const { token, user } = useAuth();
  const authenticated = Boolean(token || user);
  const [page, setPage] = useState(1);

  const userQuery = useGetCurrentUserQuery<unknown>({ enabled: authenticated, staleTime: 30_000 });
  const ledgerQuery = useGetLedgerQuery<unknown>(
    { query: { page, limit: PAGE_SIZE } },
    {
      enabled: authenticated,
      staleTime: 15_000,
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
    },
  );

  const entries = useMemo(
    () => arrayFrom(ledgerQuery.data, ['items', 'entries', 'ledger', 'results', 'data']),
    [ledgerQuery.data],
  );
  const hasNextPage = entries.length >= PAGE_SIZE;

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-4xl px-3 py-6">
        <StatePanel title="Sign in to view your history" message="Your Bet Lab wallet transactions are available after you sign in." action={<Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>} />
      </main>
    );
  }

  if (userQuery.isLoading) {
    return <main className="mx-auto max-w-5xl px-3 py-6 text-[11px] text-muted-foreground">Checking account access…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-2.5 py-2.5 sm:px-3">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><FaClockRotateLeft className="h-3.5 w-3.5" /></span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">History</h1>
            <p className="mt-0.5 text-[8px] text-muted-foreground">A complete record of your Bet Lab wallet transactions.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/bet-lab" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[9px] font-bold transition hover:bg-muted"><FaArrowLeft className="h-3 w-3" /> Bet Lab</Link>
          <Link href="/bet-lab/tickets" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[9px] font-bold transition hover:bg-muted"><FaTicket className="h-3 w-3 text-primary" /> My Tickets</Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-2.5 py-2">
          <div>
            <h2 className="text-[11px] font-extrabold">Wallet activity</h2>
            <p className="mt-0.5 text-[8px] text-muted-foreground">Bonuses, stakes, winnings, refunds and other wallet entries.</p>
          </div>
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[8px] font-extrabold text-primary">{entries.length} transactions</span>
        </div>

        {ledgerQuery.isLoading ? (
          <div className="space-y-2 p-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-muted/70" />)}</div>
        ) : ledgerQuery.isError ? (
          <div className="p-3"><StatePanel title="Unable to load wallet history" message="Your transaction history could not be retrieved. Refresh the page to try again." action={<button type="button" onClick={() => ledgerQuery.refetch()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry</button>} /></div>
        ) : entries.length ? (
          <div className="divide-y divide-border/70">
            {entries.map((entry, index) => {
              const delta = numeric(firstValue(entry, ['delta', 'amount', 'points']), 0);
              const positive = delta >= 0;
              const amount = Math.abs(delta);
              const type = text(firstValue(entry, ['transactionType', 'type', 'bucket']), 'Transaction').replace(/_/g, ' ');
              const metadata = asRecord(entry.metadata) ?? {};
              const reference = text(firstValue(entry, ['reference', 'ticketNumber', 'ticketId']), text(firstValue(metadata, ['ticketNumber', 'ticketId', 'reference'])));
              const balanceAfter = firstValue(entry, ['balanceAfter', 'availableBalanceAfter']);
              return (
                <article key={text(firstValue(entry, ['_id', 'id']), `${page}-${index}`)} className="flex items-start gap-2 px-2.5 py-2 sm:items-center transition hover:bg-muted/20 sm:px-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${positive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                    {transactionIcon(entry)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold leading-4">{transactionLabel(entry)}</p>
                    <p className="mt-0.5 text-[8px] capitalize text-muted-foreground">{type} · {formatDate(firstValue(entry, ['createdAt', 'occurredAt', 'timestamp', 'date']))}</p>
                    {reference ? <p className="mt-0.5 truncate text-[8px] text-muted-foreground/80">Reference: {reference}</p> : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-[10px] font-black tabular-nums ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{positive ? '+' : '−'}{formatPoints(amount)}</p>
                    {balanceAfter !== undefined ? <p className="mt-0.5 text-[8px] text-muted-foreground">Balance {formatPoints(numeric(balanceAfter, 0))}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-3"><StatePanel title="No transactions yet" message="Wallet bonuses, ticket stakes, winnings and refunds will appear here as they occur." action={<Link href="/bet-lab" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to Bet Lab</Link>} /></div>
        )}
      </section>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[9px] font-bold disabled:cursor-not-allowed disabled:opacity-40"><FaArrowLeft className="h-3 w-3" /> Previous</button>
        <span className="text-[8px] text-muted-foreground">Page {page}</span>
        <button type="button" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[9px] font-bold disabled:cursor-not-allowed disabled:opacity-40">Next <FaArrowRight className="h-3 w-3" /></button>
      </div>
    </main>
  );
}


