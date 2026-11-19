'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaCalendarDays,
  FaFutbol,
  FaLocationDot,
  FaTrophy,
} from 'react-icons/fa6';
import {
  useGetV2CompetitionSeasonsQuery,
  useGetV2CompetitionsQuery,
  useGetV2FixturesQuery,
  useGetV2TeamFormQuery,
  useGetV2TeamQuery,
  useGetV2TeamScoringQuery,
  useGetV2TeamStatisticsQuery,
  useGetV2TeamsQuery,
} from '@/hooks/use-sports';
import type { SportsFixture, SportsTeam } from '@/types/sports-v2';

function dateLabel(value?: string): string {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function teamScore(fixture: SportsFixture, teamId: string): number | null {
  const competitor = fixture.competitors.find((item) => item.teamId === teamId);
  return competitor?.score === undefined || competitor.score === null
    ? null
    : Number(competitor.score);
}

function opponentId(fixture: SportsFixture, teamId: string): string | undefined {
  return fixture.competitors.find((item) => item.teamId !== teamId)?.teamId;
}

function resultFor(fixture: SportsFixture, teamId: string): 'W' | 'D' | 'L' | null {
  if (fixture.status.state !== 'COMPLETED' && !fixture.status.isFinal) return null;
  const own = teamScore(fixture, teamId);
  const otherId = opponentId(fixture, teamId);
  const other = otherId ? teamScore(fixture, otherId) : null;
  if (own === null || other === null) return null;
  return own > other ? 'W' : own < other ? 'L' : 'D';
}

function resultTone(result: 'W' | 'D' | 'L' | null): string {
  if (result === 'W') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600';
  if (result === 'L') return 'border-rose-500/20 bg-rose-500/10 text-rose-600';
  if (result === 'D') return 'border-amber-500/20 bg-amber-500/10 text-amber-700';
  return 'border-border bg-muted text-muted-foreground';
}

function TeamMark({ team, size = 'size-20' }: { team: SportsTeam; size?: string }) {
  return (
    <div className={`${size} relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 shadow-sm`}>
      <span className="text-xl font-bold text-white/80">
        {(team.abbreviation || team.shortName || team.name).slice(0, 3).toUpperCase()}
      </span>
      {team.logo ? (
        <img
          src={team.logo}
          alt={`${team.displayName ?? team.name} crest`}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full bg-white/95 object-contain p-2"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-3 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export default function TeamProfilePage({ teamId }: { teamId: string }) {
  const teamQuery = useGetV2TeamQuery(
    { path: { teamId } },
    { enabled: Boolean(teamId), staleTime: 30 * 60_000, retry: 1 },
  );
  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: false, limit: 1000 } },
    { staleTime: 30 * 60_000, retry: 1 },
  );
  const fixturesQuery = useGetV2FixturesQuery(
    { query: { teamId, limit: 20 } },
    { enabled: Boolean(teamId), staleTime: 2 * 60_000, retry: 1 },
  );

  const team = teamQuery.data ?? null;
  const competitions = competitionsQuery.data ?? [];
  const teamCompetitions = useMemo(() => {
    if (!team) return [];
    const references = new Set((team.leagueIds ?? []).map((value) => value.toLowerCase()));
    return competitions.filter((competition) =>
      references.has(competition.id.toLowerCase())
      || references.has(competition.espnId.toLowerCase())
      || references.has(competition.slug.toLowerCase())
      || references.has(`competition:${competition.slug}`.toLowerCase()),
    );
  }, [team, competitions]);

  const primaryCompetition = teamCompetitions.find((item) => item.currentSeasonId)
    ?? teamCompetitions[0]
    ?? null;
  const seasonsQuery = useGetV2CompetitionSeasonsQuery(
    { path: { competitionId: primaryCompetition?.id ?? '' } },
    { enabled: Boolean(primaryCompetition?.id), staleTime: 30 * 60_000, retry: 1 },
  );
  const activeSeason = seasonsQuery.data?.find((season) => season.isCurrent)
    ?? seasonsQuery.data?.find((season) => season.id === primaryCompetition?.currentSeasonId)
    ?? seasonsQuery.data?.[0]
    ?? null;
  const projectionEnabled = Boolean(team?.id && primaryCompetition?.id && activeSeason?.id);
  const projectionArgs = {
    path: { teamId: team?.id ?? teamId },
    query: {
      competitionId: primaryCompetition?.id ?? '',
      seasonId: activeSeason?.id ?? '',
    },
  };
  const formQuery = useGetV2TeamFormQuery(projectionArgs, {
    enabled: projectionEnabled,
    staleTime: 10 * 60_000,
    retry: 1,
  });
  const scoringQuery = useGetV2TeamScoringQuery(projectionArgs, {
    enabled: projectionEnabled,
    staleTime: 10 * 60_000,
    retry: 1,
  });
  const statisticsQuery = useGetV2TeamStatisticsQuery(projectionArgs, {
    enabled: projectionEnabled,
    staleTime: 10 * 60_000,
    retry: 1,
  });
  const competitionTeamsQuery = useGetV2TeamsQuery(
    { query: { leagueId: primaryCompetition?.id, limit: 1000 } },
    { enabled: Boolean(primaryCompetition?.id), staleTime: 30 * 60_000, retry: 1 },
  );

  const opponentMap = useMemo(() => {
    const map = new Map<string, SportsTeam>();
    for (const item of competitionTeamsQuery.data ?? []) {
      map.set(item.id, item);
      map.set(item.espnId, item);
    }
    return map;
  }, [competitionTeamsQuery.data]);
  const recentFixtures = useMemo(
    () => [...(fixturesQuery.data?.items ?? [])]
      .sort((left, right) => new Date(right.kickoffAt).getTime() - new Date(left.kickoffAt).getTime()),
    [fixturesQuery.data?.items],
  );
  const recentForm = useMemo(
    () => [...(formQuery.data?.results ?? [])]
      .sort((left, right) => new Date(right.kickoffAt).getTime() - new Date(left.kickoffAt).getTime())
      .slice(0, 10),
    [formQuery.data?.results],
  );
  const seasonStats = scoringQuery.data;
  const topStatistics = (statisticsQuery.data?.statistics ?? []).slice(0, 6);

  if (teamQuery.isLoading) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-6xl px-3 py-8 sm:px-5">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </main>
    );
  }

  if (teamQuery.isError || !team) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <FaFutbol className="size-8 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-semibold">Team not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">This team is not available in the normalized Sports catalogue.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
          <FaArrowLeft /> Back to home
        </Link>
      </main>
    );
  }

  const teamName = team.displayName ?? team.name;
  const venueLocation = [team.location, team.country].filter(Boolean).join(', ');
  const record = seasonStats;

  return (
    <main className="min-h-screen bg-[#f8f5ef] pb-8 dark:bg-background">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        <Link href="/" className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground">
          <FaArrowLeft className="size-3" /> Back to 2xPredict
        </Link>

        <section className="overflow-hidden rounded-2xl border border-[#542331]/20 bg-gradient-to-br from-[#702b3d] via-[#542331] to-[#263241] p-4 text-white shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <TeamMark team={team} />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/65">Team profile</p>
              <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{teamName}</h1>
              {team.shortName && team.shortName !== teamName ? <p className="mt-1 text-sm text-white/75">{team.shortName}</p> : null}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-white/75">
                {venueLocation ? <span className="inline-flex items-center gap-1.5"><FaLocationDot /> {venueLocation}</span> : null}
                {team.abbreviation ? <span className="rounded-md border border-white/20 px-2 py-1 font-bold tracking-wider">{team.abbreviation}</span> : null}
                {primaryCompetition ? <span className="inline-flex items-center gap-1.5"><FaTrophy /> {primaryCompetition.displayName ?? primaryCompetition.name}</span> : null}
              </div>
            </div>
            {team.primaryColor ? <span className="hidden h-12 w-12 rounded-full border-4 border-white/20 sm:block" style={{ backgroundColor: team.primaryColor.startsWith('#') ? team.primaryColor : `#${team.primaryColor}` }} aria-hidden="true" /> : null}
          </div>
        </section>

        {teamCompetitions.length ? (
          <section className="mt-4 rounded-xl border border-border/70 bg-card p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              <FaTrophy className="size-3" /> Competitions
            </div>
            <div className="flex flex-wrap gap-2">
              {teamCompetitions.map((competition) => (
                <span key={competition.id} className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[10px] font-semibold text-foreground">
                  {competition.logo ? <img src={competition.logo} alt="" className="size-4 object-contain" /> : null}
                  {competition.displayName ?? competition.name}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Played" value={record?.fixturesPlayed ?? '—'} />
          <StatCard label="Goals scored" value={record?.goalsFor ?? '—'} />
          <StatCard label="Goals conceded" value={record?.goalsAgainst ?? '—'} />
          <StatCard label="Clean sheets" value={record?.cleanSheets ?? '—'} />
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <section className="min-w-0 rounded-xl border border-border/70 bg-card p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">Recent matches</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Latest fixtures in the normalized Sports database.</p>
              </div>
              <FaCalendarDays className="size-4 text-muted-foreground" />
            </div>

            {fixturesQuery.isLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
            ) : recentFixtures.length ? (
              <div className="space-y-2">
                {recentFixtures.slice(0, 12).map((fixture) => {
                  const otherId = opponentId(fixture, team.id);
                  const opponent = otherId ? opponentMap.get(otherId) : undefined;
                  const result = resultFor(fixture, team.id);
                  const homeCompetitor = fixture.competitors.find((item) => item.homeAway === 'HOME');
                  const awayCompetitor = fixture.competitors.find((item) => item.homeAway === 'AWAY');
                  const homeScore = homeCompetitor?.score ?? null;
                  const awayScore = awayCompetitor?.score ?? null;
                  const opponentName = opponent?.displayName ?? opponent?.name ?? 'Opponent';
                  const fixtureTitle = homeCompetitor?.teamId === team.id
                    ? `${teamName} vs ${opponentName}`
                    : `${opponentName} vs ${teamName}`;
                  const status = fixture.status.shortDescription ?? fixture.status.description ?? fixture.status.state.replace(/_/g, ' ');
                  return (
                    <div key={fixture.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-border/60 px-2.5 py-2">
                      <span className={`grid size-7 shrink-0 place-items-center rounded-md border text-[10px] font-bold ${resultTone(result)}`}>{result ?? '—'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-foreground">
                          {fixture.name ?? fixture.shortName ?? fixtureTitle}
                        </p>
                        <p className="mt-0.5 text-[9px] text-muted-foreground">{dateLabel(fixture.kickoffAt)} · {status}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">
                        {homeScore === null || awayScore === null ? '—' : `${homeScore} - ${awayScore}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">No recent fixtures are available for this team.</p>
            )}
          </section>

          <div className="space-y-4">
            <section className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
              <h2 className="text-sm font-semibold">Recent form</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Most recent recorded results in {primaryCompetition?.displayName ?? primaryCompetition?.name ?? 'the current competition'}.</p>
              {formQuery.isLoading ? <div className="mt-3 h-8 animate-pulse rounded-md bg-muted" /> : recentForm.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {recentForm.map((item) => (
                    <span key={item.fixtureId} title={`${dateLabel(item.kickoffAt)} · ${item.goalsFor}-${item.goalsAgainst}`} className={`grid size-8 place-items-center rounded-md border text-[10px] font-bold ${resultTone(item.result)}`}>{item.result}</span>
                  ))}
                </div>
              ) : <p className="mt-3 text-[10px] text-muted-foreground">Form data is not available for this season yet.</p>}
            </section>

            <section className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
              <h2 className="text-sm font-semibold">Team statistics</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{activeSeason?.displayName ?? activeSeason?.year ?? 'Current season'}</p>
              {statisticsQuery.isLoading ? <div className="mt-3 h-20 animate-pulse rounded-md bg-muted" /> : topStatistics.length ? (
                <div className="mt-3 space-y-2">
                  {topStatistics.map((statistic) => (
                    <div key={statistic.key} className="flex items-center justify-between gap-3 border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-[10px] text-muted-foreground">{statistic.name}</span>
                      <span className="text-[10px] font-semibold tabular-nums text-foreground">{Number.isFinite(statistic.average) ? statistic.average.toFixed(2) : '—'}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-3 text-[10px] text-muted-foreground">Statistics will appear when enough match data has been collected.</p>}
              {scoringQuery.isError || statisticsQuery.isError ? <p className="mt-2 text-[9px] text-muted-foreground">Some season projections are currently unavailable.</p> : null}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
