'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaReceipt } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import { useGetTicketQuery } from '@/hooks/use-bet-lab';
import { useMatchPresentation } from '@/hooks/use-match-presentation';
import { asRecord, firstValue, rowsFrom, text } from '@/lib/api-shapes';
import StatePanel from '@/components/shared/StatePanel';
import BetLabTicketCard from './BetLabTicketCard';
import { ticketLegEventId, ticketLegFixtureDate } from './bet-lab.utils';
import type { ApiRecord } from '@/lib/api-shapes';

export default function BetLabTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = typeof params?.ticketId === 'string' ? params.ticketId : '';
  const { token, user } = useAuth();
  const authenticated = Boolean(token || user);
  const ticketQuery = useGetTicketQuery<unknown>(
    { path: { ticketId } },
    { enabled: authenticated && Boolean(ticketId), staleTime: 10_000, refetchInterval: 20_000, refetchIntervalInBackground: false },
  );

  const ticket = useMemo(() => {
    const response = asRecord(ticketQuery.data);
    if (!response) return null;
    return asRecord(firstValue(response, ['ticket', 'item', 'data'])) ?? response;
  }, [ticketQuery.data]);

  const presentationRefs = useMemo(() => {
    if (!ticket) return [];
    const refs = new Map<string, Record<string, unknown>>();
    for (const rawLeg of rowsFrom(ticket.legs)) {
      const leg = asRecord(rawLeg);
      if (!leg) continue;
      const eventId = ticketLegEventId(leg);
      if (eventId) refs.set(eventId, {
        eventId, fixtureDate: ticketLegFixtureDate(leg),
        leagueId: firstValue(leg, ['leagueId', 'competitionId']) as string | undefined,
        leagueName: firstValue(leg, ['leagueName', 'competitionName']) as string | undefined,
        leagueCountry: firstValue(leg, ['country', 'leagueCountry', 'countryName']) as string | undefined,
        homeTeamId: firstValue(leg, ['homeTeamId', 'homeId']) as string | undefined,
        awayTeamId: firstValue(leg, ['awayTeamId', 'awayId']) as string | undefined,
        homeTeamName: firstValue(leg, ['homeTeamName', 'homeName']) as string | undefined,
        awayTeamName: firstValue(leg, ['awayTeamName', 'awayName']) as string | undefined,
        homeTeamLogo: firstValue(leg, ['homeTeamLogo']) as string | undefined,
        awayTeamLogo: firstValue(leg, ['awayTeamLogo']) as string | undefined,
        fixtureRecord: leg,
      });
    }
    return [...refs.values()];
  }, [ticket]);
  const presentations = useMatchPresentation(presentationRefs);

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-4xl px-3 py-6">
        <StatePanel title="Sign in to view this ticket" message="Your Bet Lab ticket details are available after you sign in." action={<Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><FaReceipt className="h-4 w-4" /></span>
          <div><h1 className="text-lg font-extrabold tracking-tight">Ticket details</h1><p className="mt-0.5 text-[10px] text-muted-foreground">Ticket reference: {ticketId}</p></div>
        </div>
        <Link href="/bet-lab/tickets" className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[10px] font-bold hover:bg-muted"><FaArrowLeft className="h-3 w-3" /> All tickets</Link>
      </header>

      {ticketQuery.isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted/70" />
      ) : ticketQuery.isError || !ticket ? (
        <StatePanel title="Ticket could not be loaded" message="The ticket may no longer be available, or it may not belong to this account. Return to your tickets and try again." action={<Link href="/bet-lab/tickets" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to tickets</Link>} />
      ) : (
        <BetLabTicketCard ticket={ticket as ApiRecord} index={0} presentations={presentations} defaultExpanded />
      )}
    </main>
  );
}

