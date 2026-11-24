'use client';

import { useMemo, useState } from 'react';
import {
  useGetV2CompetitionSeasonsQuery,
  useGetV2CompetitionStandingsQuery,
  useGetV2CompetitionsQuery,
  useGetV2TeamFormQuery,
  useGetV2TeamsByIdentifiersQuery,
} from '@/hooks/use-sports';
import type { SportsCalculatedStanding, SportsCompetition, SportsTeam } from '@/types/sports-v2';
import LeagueSelector from '../LeagueSelector';
import { resolveLeagueLogo, resolveLeagueName, type HomeLeague } from '../league-display';

const COMPETITION_OPTIONS = {
  staleTime: 30 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

const DATA_OPTIONS = {
  staleTime: 5 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

const initials = (value?: string) =>
  (value ?? '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase() || '?';

function Logo({ src, name, size = 'h-6 w-6' }: { src?: string | null; name?: string; size?: string }) {
  return (
    <span className={`${size} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[8px] font-bold text-muted-foreground`}>
      {initials(name)}
      {typeof src === 'string' && src.trim() ? (
        <img src={src} alt="" className="absolute inset-0 h-full w-full bg-card object-contain" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
      ) : null}
    </span>
  );
}

function TeamForm({ teamId, competitionId, seasonId }: { teamId: string; competitionId: string; seasonId: string }) {
  const formQuery = useGetV2TeamFormQuery(
    { path: { teamId }, query: { competitionId, seasonId } },
    { ...DATA_OPTIONS, enabled: Boolean(teamId && competitionId && seasonId) },
  );
  const results = (formQuery.data?.results ?? []).slice(0, 5);

  if (!results.length) return <span className="block text-center text-muted-foreground">—</span>;

  return (
    <span className="flex items-center justify-center gap-0.5" aria-label={`Recent form: ${results.map((item) => item.result).join(', ')}`}>
      {results.map((item, index) => (
        <span key={`${item.fixtureId}-${index}`} className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[7px] font-bold sm:h-4 sm:w-4 sm:text-[8px] lg:h-5 lg:w-5 lg:text-[9px] ${item.result === 'W' ? 'bg-emerald-500/15 text-emerald-600' : item.result === 'D' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-600'}`}>
          {item.result}
        </span>
      ))}
    </span>
  );
}

function StandingRow({
  row,
  index,
  team,
  competitionId,
  seasonId,
}: {
  row: SportsCalculatedStanding;
  index: number;
  team?: SportsTeam;
  competitionId: string;
  seasonId: string;
}) {
  const metrics = row.metrics;
  const teamName = team?.displayName ?? team?.name ?? team?.shortName ?? 'Team name unavailable';

  return (
    <tr className="transition-colors hover:bg-muted/20">
      <td className="px-1 py-1.5 text-center font-semibold tabular-nums text-muted-foreground lg:px-2 lg:py-2">
        {row.position ?? index + 1}
      </td>
      <td className="px-1 py-1.5 lg:px-3 lg:py-2">
        <span className="flex min-w-0 items-center gap-1 font-semibold">
          <Logo src={team?.logo} name={teamName} size="h-4 w-4" />
          <span className="truncate" title={teamName}>{teamName}</span>
        </span>
      </td>
      <td className="px-1 py-1.5">
        <TeamForm teamId={row.teamId} competitionId={competitionId} seasonId={seasonId} />
      </td>
      <td className="px-0.5 py-1.5 text-center tabular-nums lg:px-2 lg:py-2">{metrics.played}</td>
      <td className="px-0.5 py-1.5 text-center tabular-nums lg:px-2 lg:py-2">{metrics.won}</td>
      <td className="px-0.5 py-1.5 text-center tabular-nums lg:px-2 lg:py-2">{metrics.drawn}</td>
      <td className="px-0.5 py-1.5 text-center tabular-nums lg:px-2 lg:py-2">{metrics.lost}</td>
      <td className="px-0.5 py-1.5 text-center tabular-nums lg:px-2 lg:py-2">{metrics.goalsFor}</td>
      <td className="px-0.5 py-1.5 text-center tabular-nums lg:px-2 lg:py-2">{metrics.goalsAgainst}</td>
      <td className="px-0.5 py-1.5 text-center tabular-nums lg:px-2 lg:py-2">{metrics.goalDifference}</td>
      <td className="px-1 py-1.5 text-center font-bold tabular-nums lg:px-2 lg:py-2">{metrics.points}</td>
    </tr>
  );
}

export default function StandingsSection() {
  const [competitionId, setCompetitionId] = useState('');
  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: true, limit: 1000 } },
    COMPETITION_OPTIONS,
  );

  const competitions: SportsCompetition[] = competitionsQuery.data ?? [];
  const standingsLeagues = useMemo<HomeLeague[]>(() => competitions.map((competition) => ({
    id: competition.id,
    name: resolveLeagueName(competition.slug || competition.id, [competition.displayName, competition.name]),
    logo: resolveLeagueLogo(competition.logo),
    country: competition.country ?? null,
  })), [competitions]);

  const selected = competitionId || competitions[0]?.id || '';
  const selectedCompetition = competitions.find((competition) => competition.id === selected);
  const seasonsQuery = useGetV2CompetitionSeasonsQuery(
    { path: { competitionId: selected } },
    { ...COMPETITION_OPTIONS, enabled: Boolean(selected && !selectedCompetition?.currentSeasonId) },
  );

  const seasons = seasonsQuery.data ?? [];
  const fallbackSeason = seasons.find((season) => season.isCurrent)
    ?? [...seasons].sort((a, b) => b.year - a.year)[0];
  const seasonId = selectedCompetition?.currentSeasonId || fallbackSeason?.id || '';

  const standingsQuery = useGetV2CompetitionStandingsQuery(
    { path: { competitionId: selected }, query: { seasonId } },
    { ...DATA_OPTIONS, enabled: Boolean(selected && seasonId) },
  );
  const standings = standingsQuery.data ?? [];
  const standingTeamIds = useMemo(
    () => [...new Set(standings.map((row) => String(row.teamId ?? '').trim()).filter(Boolean))].sort(),
    [standings],
  );
  const teamsQuery = useGetV2TeamsByIdentifiersQuery(
    { body: { ids: standingTeamIds } },
    { ...COMPETITION_OPTIONS, enabled: standingTeamIds.length > 0 },
  );

  const teamsById = useMemo(() => {
    const map = new Map<string, SportsTeam>();
    for (const team of teamsQuery.data ?? []) {
      for (const identifier of [team.id, team.espnId]) {
        const key = String(identifier ?? '').trim().toLowerCase();
        if (!key) continue;
        const sourceId = key.replace(/^team:/, '');
        map.set(key, team);
        map.set(sourceId, team);
        map.set(`team:${sourceId}`, team);
      }
    }
    return map;
  }, [teamsQuery.data]);

  const selectedName = selectedCompetition?.displayName ?? selectedCompetition?.name ?? 'League Table';
  // Team identity enrichment is non-blocking; render the table as soon as standings arrive.
  const loading = competitionsQuery.isLoading || seasonsQuery.isLoading || standingsQuery.isLoading;
  const failed = competitionsQuery.isError || standingsQuery.isError;

  return (
    <section className="px-2 py-3 sm:px-4 sm:py-5 lg:py-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-3 text-center">
          <h2 className="mt-0.5 font-serif text-2xl font-semibold italic leading-tight tracking-tight text-foreground sm:text-3xl">
            Standings
          </h2>
          <p className="mx-auto mt-1 max-w-xs text-[10px] leading-4 text-muted-foreground sm:text-xs">
            League positions, group tables and tournament stages.
          </p>
        </header>

        <LeagueSelector
          leagues={standingsLeagues}
          selected={selected}
          onSelect={setCompetitionId}
          showAll={false}
          className="mb-0.5"
        />

        {!selected ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">No competitions available.</div>
        ) : loading ? (
          <div className="rounded-lg border border-border bg-card p-4 text-center text-xs text-muted-foreground">Loading standings…</div>
        ) : failed ? (
          <div className="rounded-lg border border-border bg-card p-4 text-center text-xs">Standings are temporarily unavailable.</div>
        ) : !seasonId || standings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">No standings have been published for this competition.</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
            <div className="border-b border-border/70 bg-muted/40 px-2 py-1.5 text-center text-[10px] font-semibold tracking-wide text-foreground sm:text-[11px] lg:text-xs">
              {selectedName}
            </div>
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[452px] table-fixed border-collapse text-left text-[10px] leading-none sm:min-w-0 sm:text-[11px] lg:text-xs">
                <colgroup>
                  <col className="w-[28px] lg:w-[42px]" />
                  <col className="w-[98px] sm:w-auto" />
                  <col className="w-[78px] lg:w-[126px]" />
                  <col className="w-[17px] lg:w-[42px]" />
                  <col className="w-[17px] lg:w-[42px]" />
                  <col className="w-[17px] lg:w-[42px]" />
                  <col className="w-[17px] lg:w-[42px]" />
                  <col className="w-[20px] lg:w-[48px]" />
                  <col className="w-[20px] lg:w-[48px]" />
                  <col className="w-[20px] lg:w-[48px]" />
                  <col className="w-[25px] lg:w-[58px]" />
                </colgroup>
                <thead className="bg-muted/25 text-[8px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[9px] lg:text-[10px]">
                  <tr>
                    <th className="px-1 py-1.5 text-center">Pos</th>
                    <th className="px-1 py-1.5">Team</th>
                    <th className="px-4 py-1.5 text-center lg:px-2 lg:py-2">Form</th>
                    <th className="px-0.5 py-1.5 text-center lg:px-2 lg:py-2">P</th>
                    <th className="px-0.5 py-1.5 text-center lg:px-2 lg:py-2">W</th>
                    <th className="px-0.5 py-1.5 text-center lg:px-2 lg:py-2">D</th>
                    <th className="px-0.5 py-1.5 text-center lg:px-2 lg:py-2">L</th>
                    <th className="px-0.5 py-1.5 text-center lg:px-2 lg:py-2">GF</th>
                    <th className="px-0.5 py-1.5 text-center lg:px-2 lg:py-2">GA</th>
                    <th className="px-0.5 py-1.5 text-center lg:px-2 lg:py-2">GD</th>
                    <th className="px-1 py-1.5 text-center lg:px-2 lg:py-2">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {standings.map((row, index) => (
                    <StandingRow
                      key={row.id}
                      row={row}
                      index={index}
                      team={teamsById.get(row.teamId)}
                      competitionId={selected}
                      seasonId={seasonId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

