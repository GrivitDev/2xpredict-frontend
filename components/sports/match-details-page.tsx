'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  FaArrowLeft,
  FaCalendarDays,
  FaClock,
  FaFutbol,
  FaLocationDot,
} from 'react-icons/fa6';
import { useGetV2FixtureQuery } from '@/hooks/use-sports';
import type { SportsMatchReadModel, SportsNormalizedStatistic } from '@/types/sports-v2';

function dateTime(value?: string): string {
  if (!value) return 'Kickoff time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Kickoff time unavailable';
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function TeamBadge({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className="relative grid size-16 place-items-center overflow-hidden rounded-2xl border border-border/70 bg-card p-2 sm:size-20">
        <span className="text-sm font-bold text-muted-foreground">{name.slice(0, 2).toUpperCase()}</span>
        {logo ? <img src={logo} alt="" className="absolute inset-0 h-full w-full bg-card object-contain p-2" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
      </div>
      <p className="mt-2 max-w-32 break-words text-xs font-semibold text-foreground sm:text-sm">{name}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function statValue(statistic: SportsNormalizedStatistic): string {
  if (statistic.displayValue) return statistic.displayValue;
  return statistic.value === null ? '—' : `${statistic.value}${statistic.unit === 'PERCENT' ? '%' : ''}`;
}

export default function MatchDetailsPage({ fixtureId }: { fixtureId: string }) {
  const matchQuery = useGetV2FixtureQuery(
    { path: { fixtureId } },
    { enabled: Boolean(fixtureId), staleTime: 30_000, retry: 1 },
  );
  const match: SportsMatchReadModel | null = matchQuery.data ?? null;

  const statistics = useMemo(() => {
    const rows = match?.matchFacts?.teamStatistics ?? [];
    const home = rows.find((item) => item.side === 'HOME')?.statistics ?? [];
    const away = rows.find((item) => item.side === 'AWAY')?.statistics ?? [];
    const awayByKey = new Map(away.map((item) => [item.canonicalKey ?? item.providerKey, item]));
    return home.map((item) => ({
      key: item.canonicalKey ?? item.providerKey,
      label: item.providerLabel ?? item.canonicalKey ?? item.providerKey,
      home: statValue(item),
      away: statValue(awayByKey.get(item.canonicalKey ?? item.providerKey) ?? { ...item, value: null, displayValue: undefined }),
    }));
  }, [match?.matchFacts?.teamStatistics]);

  if (matchQuery.isLoading) {
    return <main className="mx-auto min-h-[65vh] max-w-6xl px-3 py-8 sm:px-5"><div className="h-52 animate-pulse rounded-2xl bg-muted" /><div className="mt-4 h-40 animate-pulse rounded-xl bg-muted" /></main>;
  }

  if (matchQuery.isError || !match) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <FaFutbol className="size-8 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-semibold">Match details unavailable</h1>
        <p className="mt-1 text-sm text-muted-foreground">This fixture could not be found in the normalized Sports database.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"><FaArrowLeft /> Back to home</Link>
      </main>
    );
  }

  const { fixture, competition, season, homeTeam, awayTeam } = match;
  const homeName = homeTeam?.displayName ?? homeTeam?.name ?? fixture.competitors.find((item) => item.homeAway === 'HOME')?.teamId ?? 'Home';
  const awayName = awayTeam?.displayName ?? awayTeam?.name ?? fixture.competitors.find((item) => item.homeAway === 'AWAY')?.teamId ?? 'Away';
  const homeScore = fixture.competitors.find((item) => item.homeAway === 'HOME')?.score;
  const awayScore = fixture.competitors.find((item) => item.homeAway === 'AWAY')?.score;
  const isFinal = fixture.status.isFinal || fixture.status.state === 'COMPLETED';
  const hasScore = homeScore !== undefined && homeScore !== null && awayScore !== undefined && awayScore !== null;
  const status = fixture.status.shortDescription ?? fixture.status.description ?? fixture.status.state.replace(/_/g, ' ');
  const venue = fixture.rawPayload && typeof fixture.rawPayload === 'object'
    ? String((fixture.rawPayload as Record<string, unknown>).venueName ?? '')
    : '';

  return (
    <main className="min-h-screen bg-[#f8f5ef] pb-8 dark:bg-background">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        <Link href="/" className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"><FaArrowLeft className="size-3" /> Back to 2xPredict</Link>

        <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex min-w-0 items-center gap-2">
              {competition?.logo ? <img src={competition.logo} alt="" className="size-6 object-contain" /> : null}
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{competition?.displayName ?? competition?.name ?? 'Football'}</p>
                {season ? <p className="mt-0.5 text-[9px] text-muted-foreground">{season.displayName ?? season.year}</p> : null}
              </div>
            </div>
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{status}</span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 py-6 sm:gap-6 sm:py-8">
            <TeamBadge name={homeName} logo={homeTeam?.logo} />
            <div className="min-w-0 text-center">
              <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground sm:text-4xl">
                {hasScore ? `${homeScore} : ${awayScore}` : '— : —'}
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{isFinal ? 'Full time' : fixture.status.state === 'SCHEDULED' ? 'Kickoff' : status}</p>
            </div>
            <TeamBadge name={awayName} logo={awayTeam?.logo} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><FaCalendarDays /> {dateTime(fixture.kickoffAt)}</span>
            {venue ? <span className="inline-flex items-center gap-1.5"><FaLocationDot /> {venue}</span> : null}
            {fixture.status.displayClock || fixture.status.clock ? <span className="inline-flex items-center gap-1.5"><FaClock /> {fixture.status.displayClock ?? fixture.status.clock}</span> : null}
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Section title="Match timeline">
            {match.timeline.length ? (
              <div className="space-y-2">
                {[...match.timeline].sort((left, right) => left.sequence - right.sequence).slice(0, 30).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="w-10 shrink-0 pt-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">{event.clock ?? event.periodDisplayValue ?? (event.period ? `P${event.period}` : '—')}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">{event.shortText ?? event.type.replace(/_/g, ' ')}</p>
                      {event.description ? <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{event.description}</p> : null}
                    </div>
                    {event.scoreAfter ? <span className="ml-auto shrink-0 text-[10px] font-bold tabular-nums">{event.scoreAfter.home}-{event.scoreAfter.away}</span> : null}
                  </div>
                ))}
              </div>
            ) : <p className="text-[10px] text-muted-foreground">No timeline events are available for this match.</p>}
          </Section>

          <Section title="Team statistics">
            {statistics.length ? (
              <div className="space-y-3">
                {statistics.slice(0, 14).map((row) => (
                  <div key={row.key}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-[10px]">
                      <span className="font-semibold tabular-nums text-foreground">{row.home}</span>
                      <span className="min-w-0 truncate text-center text-muted-foreground">{row.label}</span>
                      <span className="font-semibold tabular-nums text-foreground">{row.away}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-[10px] text-muted-foreground">Normalized match statistics have not been collected for this fixture.</p>}
            {match.matchFacts?.sectionStatus ? <p className="mt-3 border-t border-border/50 pt-2 text-[9px] text-muted-foreground">Statistics coverage: {match.matchFacts.sectionStatus.teamStatistics.toLowerCase().replace(/_/g, ' ')}.</p> : null}
          </Section>
        </div>

        {match.latestOdds?.bookmakers?.length ? (
          <div className="mt-4">
            <Section title="Latest collected odds">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {match.latestOdds.bookmakers.slice(0, 6).map((bookmaker) => (
                  <div key={`${bookmaker.bookmakerId ?? bookmaker.bookmakerName}`} className="rounded-lg border border-border/60 p-3">
                    <p className="text-[10px] font-semibold text-foreground">{bookmaker.bookmakerName}</p>
                    {bookmaker.markets.slice(0, 3).map((market) => (
                      <div key={market.marketKey} className="mt-2">
                        <p className="text-[9px] text-muted-foreground">{market.marketName}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {market.outcomes.slice(0, 3).map((outcome) => (
                            <span key={`${outcome.selection}:${outcome.point ?? ''}`} className="rounded-md bg-muted px-2 py-1 text-[9px] font-semibold text-foreground">{outcome.selection}: {outcome.price.toFixed(2)}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
