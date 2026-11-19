'use client';

import { useMemo } from 'react';
import {
  useGetV2CompetitionsQuery,
  useGetV2FixturesQuery,
  useGetV2TeamsQuery,
} from '@/hooks/use-sports';
import type { SportsCompetition, SportsFixture, SportsTeam } from '@/types/sports-v2';

export type MatchPresentation = {
  eventId: string;
  leagueId?: string | null;
  leagueName?: string | null;
  leagueCountry?: string | null;
  status: 'LIVE' | 'IN_PLAY' | 'UPCOMING' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'SUSPENDED' | 'UNKNOWN';
  statusLabel: string;
  fixtureDate?: string | null;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  leagueLogo?: string | null;
  displayClock?: string | null;
};

type FixtureRef = {
  eventId?: string | null;
  fixtureDate?: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

function firstText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function score(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function logo(value: unknown, depth = 0): string | null {
  if (depth > 4 || value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/^http:\/\//i, 'https://');
    if (normalized.startsWith('//')) return `https:${normalized}`;
    return /^(https?:\/\/|\/|data:image\/)/i.test(normalized) ? normalized : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logo(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const record = object(value);
  for (const key of ['href', 'url', 'src', 'logo', 'logos', 'image', 'images', 'crest', 'emblem']) {
    const found = logo(record[key], depth + 1);
    if (found) return found;
  }
  return null;
}

function mapStatus(fixture: SportsFixture): MatchPresentation['status'] {
  const providerState = String(fixture.status.providerState ?? '').toUpperCase();
  if (/SUSPEND|INTERRUPT/.test(providerState)) return 'SUSPENDED';
  switch (fixture.status.state) {
    case 'LIVE':
    case 'HALFTIME':
    case 'EXTRA_TIME':
    case 'PENALTIES': return 'LIVE';
    case 'SCHEDULED': return 'UPCOMING';
    case 'COMPLETED': return 'FINISHED';
    case 'POSTPONED': return 'POSTPONED';
    case 'CANCELLED':
    case 'ABANDONED': return 'CANCELLED';
    default: return 'UNKNOWN';
  }
}

function toPresentation(
  fixture: SportsFixture,
  teamsById: Map<string, SportsTeam>,
  competitionsById: Map<string, SportsCompetition>,
  eventId: string,
): MatchPresentation {
  const home = fixture.competitors.find((competitor) => competitor.homeAway === 'HOME');
  const away = fixture.competitors.find((competitor) => competitor.homeAway === 'AWAY');
  const homeTeam = home ? teamsById.get(home.teamId) : undefined;
  const awayTeam = away ? teamsById.get(away.teamId) : undefined;
  const homeRaw = object(home?.rawPayload);
  const awayRaw = object(away?.rawPayload);
  const rawHomeTeam = object(homeRaw.team ?? homeRaw.competitor ?? homeRaw);
  const rawAwayTeam = object(awayRaw.team ?? awayRaw.competitor ?? awayRaw);
  const competition = competitionsById.get(fixture.competitionId)
    ?? competitionsById.get(fixture.espnCompetitionId ?? '');
  const status = mapStatus(fixture);
  const statusLabel = status === 'LIVE'
    ? fixture.status.state === 'HALFTIME' ? 'Half-time'
      : fixture.status.state === 'EXTRA_TIME' ? 'Extra time'
        : fixture.status.state === 'PENALTIES' ? 'Penalties' : 'Live'
    : status === 'UPCOMING' ? 'Upcoming'
      : status === 'FINISHED' ? 'Finished'
        : status === 'POSTPONED' ? 'Postponed'
          : status === 'CANCELLED' ? 'Canceled'
            : status === 'SUSPENDED' ? 'Suspended' : 'Status unavailable';
  const showScore = status === 'LIVE' || status === 'FINISHED';

  return {
    eventId,
    leagueId: fixture.competitionId || fixture.espnCompetitionId || null,
    leagueName: competition?.displayName ?? competition?.name ?? null,
    leagueCountry: competition?.country ?? null,
    status,
    statusLabel,
    fixtureDate: fixture.kickoffAt ?? null,
    homeTeamName: firstText(homeTeam?.displayName, homeTeam?.name, rawHomeTeam.displayName, rawHomeTeam.fullName, rawHomeTeam.name) ?? 'Home',
    awayTeamName: firstText(awayTeam?.displayName, awayTeam?.name, rawAwayTeam.displayName, rawAwayTeam.fullName, rawAwayTeam.name) ?? 'Away',
    homeScore: showScore ? score(home?.score) : null,
    awayScore: showScore ? score(away?.score) : null,
    homeTeamLogo: homeTeam?.logo ?? logo(rawHomeTeam.logo ?? rawHomeTeam.logos ?? rawHomeTeam.crest),
    awayTeamLogo: awayTeam?.logo ?? logo(rawAwayTeam.logo ?? rawAwayTeam.logos ?? rawAwayTeam.crest),
    leagueLogo: competition?.logo ?? null,
    displayClock: fixture.status.displayClock ?? fixture.status.clock ?? null,
  };
}

export function useMatchPresentation(
  fixtures: FixtureRef[],
  source?: { fixtures?: SportsFixture[]; competitions?: SportsCompetition[] },
) {
  const fixtureRefs = useMemo(() => {
    const unique = new Map<string, string>();
    for (const fixture of fixtures) {
      const eventId = String(fixture.eventId ?? '').trim();
      if (eventId) unique.set(eventId, String(fixture.fixtureDate ?? ''));
    }
    return [...unique.entries()].map(([eventId, fixtureDate]) => ({ eventId, fixtureDate }));
  }, [fixtures]);

  const bounds = fixtureRefs.map((fixture) => new Date(fixture.fixtureDate).getTime()).filter(Number.isFinite);
  const from = bounds.length ? new Date(Math.min(...bounds) - DAY_MS).toISOString() : '';
  const to = bounds.length ? new Date(Math.max(...bounds) + DAY_MS).toISOString() : '';
  const enabled = Boolean(from && to && fixtureRefs.length);

  const fixturesQuery = useGetV2FixturesQuery(
    { query: { from, to, limit: 1000 } },
    {
      enabled: enabled && source?.fixtures === undefined,
      staleTime: 3 * 60_000,
      retry: 1,
      refetchInterval: 3 * 60_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    },
  );
  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: true, limit: 1000 } },
    { enabled: enabled && source?.competitions === undefined, staleTime: 30 * 60_000, retry: 1, refetchOnWindowFocus: false },
  );
  const teamsQuery = useGetV2TeamsQuery(
    { query: { limit: 1000 } },
    { enabled, staleTime: 30 * 60_000, retry: 1, refetchOnWindowFocus: false },
  );

  const normalizedRows = useMemo(() => {
    const teamsById = new Map<string, SportsTeam>();
    for (const team of teamsQuery.data ?? []) {
      teamsById.set(team.id, team);
      teamsById.set(team.espnId, team);
    }
    const competitionsById = new Map<string, SportsCompetition>();
    for (const competition of source?.competitions ?? competitionsQuery.data ?? []) {
      competitionsById.set(competition.id, competition);
      competitionsById.set(competition.espnId, competition);
      competitionsById.set(competition.slug, competition);
    }
    const output = new Map<string, MatchPresentation>();
    for (const fixture of source?.fixtures ?? fixturesQuery.data?.items ?? []) {
      for (const id of [fixture.id, fixture.espnEventId]) {
        if (id) output.set(id, toPresentation(fixture, teamsById, competitionsById, id));
      }
    }
    return output;
  }, [source?.fixtures, source?.competitions, fixturesQuery.data?.items, teamsQuery.data, competitionsQuery.data]);

  return useMemo(() => {
    const result = new Map<string, MatchPresentation>();
    for (const fixture of fixtureRefs) {
      const presentation = normalizedRows.get(fixture.eventId);
      if (presentation) result.set(fixture.eventId, presentation);
    }
    return result;
  }, [fixtureRefs, normalizedRows]);
}
