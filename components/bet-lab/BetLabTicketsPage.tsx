'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FaArrowLeft, FaClockRotateLeft, FaReceipt } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import { useGetCurrentUserQuery } from '@/hooks/use-auth';
import { useGetTicketsQuery } from '@/hooks/use-bet-lab';
import { useMatchPresentation } from '@/hooks/use-match-presentation';
import { rowsFrom, asRecord, firstValue, text } from '@/lib/api-shapes';
import StatePanel from '@/components/shared/StatePanel';
import BetLabTicketCard from './BetLabTicketCard';
import { arrayFrom, ticketLegEventId, ticketLegFixtureDate } from './bet-lab.utils';
import type { ApiRecord } from '@/lib/api-shapes';

const PAGE_SIZE = 20;

export default function BetLabTicketsPage() {
  const { token, user } = useAuth();
  const authenticated = Boolean(token || user);
  const [page, setPage] = useState(1);

  const userQuery = useGetCurrentUserQuery<unknown>({ enabled: authenticated, staleTime: 30_000 });
  const ticketsQuery = useGetTicketsQuery<unknown>(
    { query: { page, limit: PAGE_SIZE } },
    {
      enabled: authenticated,
      staleTime: 10_000,
      refetchInterval: 20_000,
      refetchIntervalInBackground: false,
    },
  );

  const tickets = useMemo(
    () => arrayFrom(ticketsQuery.data, ['items', 'tickets', 'results', 'data']),
    [ticketsQuery.data],
  );
  const presentationRefs = useMemo(() => {
    const refs = new Map<string, string>();
    for (const ticket of tickets) {
      for (const rawLeg of rowsFrom(ticket.legs)) {
        const leg = asRecord(rawLeg);
        if (!leg) continue;
        const eventId = ticketLegEventId(leg);
        if (eventId) refs.set(eventId, ticketLegFixtureDate(leg));
      }
    }
    return [...refs.entries()].map(([eventId, fixtureDate]) => ({ eventId, fixtureDate }));
  }, [tickets]);
  const presentations = useMatchPresentation(presentationRefs);
  const hasNextPage = tickets.length >= PAGE_SIZE;

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-4xl px-3 py-6">
        <StatePanel title="Sign in to view your tickets" message="Your active and settled Bet Lab tickets are available after you sign in." action={<Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>} />
      </main>
    );
  }

  if (userQuery.isLoading) {
    return <main className="mx-auto max-w-5xl px-3 py-6 text-[11px] text-muted-foreground">Checking account access…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-2.5 py-2.5 sm:px-3">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><FaReceipt className="h-3.5 w-3.5" /></span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">My Tickets</h1>
            <p className="mt-0.5 text-[9px] text-muted-foreground">Follow every match and selection until settlement.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/bet-lab" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[9px] font-bold transition hover:bg-muted"><FaArrowLeft className="h-3 w-3" /> Bet Lab</Link>
          <Link href="/bet-lab/history" aria-label="History" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-primary transition hover:bg-muted"><FaClockRotateLeft className="h-3.5 w-3.5" /></Link>
        </div>
      </header>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-card/55 px-2.5 py-2">
        <div>
          <p className="text-[10px] font-extrabold">Ticket tracking</p>
          <p className="mt-0.5 text-[8px] text-muted-foreground">Settlement status refreshes automatically while this page is open.</p>
        </div>
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[8px] font-extrabold text-primary">{tickets.length} shown</span>
      </div>

      {ticketsQuery.isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-muted/70" />)}</div>
      ) : ticketsQuery.isError ? (
        <StatePanel title="Unable to load tickets" message="Your tickets could not be retrieved. Refresh the page to try again." action={<button type="button" onClick={() => ticketsQuery.refetch()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry</button>} />
      ) : tickets.length ? (
        <div className="space-y-1.5">
          {tickets.map((ticket, index) => <BetLabTicketCard key={text(firstValue(ticket, ['_id', 'ticketId', 'id']), `ticket-${index}`)} ticket={ticket as ApiRecord} index={(page - 1) * PAGE_SIZE + index} presentations={presentations} />)}
        </div>
      ) : (
        <StatePanel title="No tickets yet" message="Selections you place in Bet Lab will appear here, with match scores and settlement progress." action={<Link href="/bet-lab" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Explore matches</Link>} />
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-2.5">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="h-7 rounded-md border border-border bg-card px-2 text-[9px] font-extrabold disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
        <span className="text-[8px] text-muted-foreground">Page {page}</span>
        <button type="button" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)} className="h-7 rounded-md border border-border bg-card px-2 text-[9px] font-extrabold disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </div>
    </main>
  );
}


