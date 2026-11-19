'use client';

import { useMemo } from 'react';
import {
  useGetV2CompetitionStandingsQuery,
  useGetV2FixtureQuery,
  useGetV2FixturesQuery,
  useGetV2HeadToHeadQuery,
} from '@/hooks/use-sports';
import { resolveStatus } from '../bet-lab.utils';
import type { MatchPresentation } from '@/hooks/use-match-presentation';
import type { ApiRecord } from '@/lib/api-shapes';
import type { SportsTeam } from '@/types/sports-v2';
import { buildFixtureStatsModelFromV2 } from './fixture-stats-v2.adapter';

const CACHE_OPTIONS = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

const asText = (value: unknown): string => String(value ?? '').trim();

type Options = {
  open: boolean;
  fixture: ApiRecord;
  presentation?: MatchPresentation;
};

function stateStatus(value: unknown): string {
  const state = asText(value).toUpperCase();
  if (['LIVE', 'HALFTIME', 'EXTRA_TIME', 'PENALTIES'].includes(state)) return 'LIVE';
  if (state === 'COMPLETED') return 'FINISHED';
  if (state === 'POSTPONED') return 'POSTPONED';
  if (['CANCELLED', 'ABANDONED'].includes(state)) return 'CANCELLED';
  if (state === 'SCHEDULED') return 'UPCOMING';
  return '';
}

export function useFixtureStats({ open, fixture, presentation }: Options) {
  const eventId = asText(fixture.eventId ?? fixture.fixtureId ?? fixture.id ?? fixture._id);
  const matchQuery = useGetV2FixtureQuery(
    { path: { fixtureId: eventId } },
    { ...CACHE_OPTIONS, enabled: open && Boolean(eventId) },
  );

  const match = matchQuery.data ?? null;
  const normalizedFixture = match?.fixture;
  const homeTeamId = asText(normalizedFixture?.competitors.find((item) => item.homeAway === 'HOME')?.teamId
    ?? fixture.homeTeamId ?? fixture.homeId);
  const awayTeamId = asText(normalizedFixture?.competitors.find((item) => item.homeAway === 'AWAY')?.teamId
    ?? fixture.awayTeamId ?? fixture.awayId);
  const competitionId = asText(normalizedFixture?.competitionId ?? fixture.competitionId ?? fixture.leagueId);
  const seasonId = asText(normalizedFixture?.seasonId ?? fixture.seasonId);
  const fixtureId = asText(normalizedFixture?.id ?? eventId);

  const homeHistoryQuery = useGetV2FixturesQuery(
    { query: { teamId: homeTeamId, competitionId, state: 'COMPLETED', limit: 10 } },
    { ...CACHE_OPTIONS, enabled: open && Boolean(homeTeamId && competitionId) },
  );
  const awayHistoryQuery = useGetV2FixturesQuery(
    { query: { teamId: awayTeamId, competitionId, state: 'COMPLETED', limit: 10 } },
    { ...CACHE_OPTIONS, enabled: open && Boolean(awayTeamId && competitionId) },
  );
  const standingsQuery = useGetV2CompetitionStandingsQuery(
    { path: { competitionId }, query: { seasonId } },
    { ...CACHE_OPTIONS, enabled: open && Boolean(competitionId && seasonId) },
  );
  const headToHeadQuery = useGetV2HeadToHeadQuery(
    { query: { teamAId: homeTeamId, teamBId: awayTeamId, competitionId } },
    { ...CACHE_OPTIONS, enabled: open && Boolean(homeTeamId && awayTeamId && competitionId) },
  );

  const status = stateStatus(normalizedFixture?.status.state) || resolveStatus(fixture, presentation);
  const matchStarted = ['LIVE', 'FINISHED'].includes(status)
    || ['HALFTIME', 'EXTRA_TIME', 'PENALTIES'].includes(asText(normalizedFixture?.status.state).toUpperCase());

  const model = useMemo(() => buildFixtureStatsModelFromV2({
    fallbackFixture: fixture,
    presentation,
    match,
    standings: standingsQuery.data,
    homeHistory: homeHistoryQuery.data,
    awayHistory: awayHistoryQuery.data,
    headToHead: headToHeadQuery.data,
    teams: [match?.homeTeam, match?.awayTeam].filter((team): team is SportsTeam => team !== null && team !== undefined),
  }), [
    fixture,
    presentation,
    match,
    standingsQuery.data,
    homeHistoryQuery.data,
    awayHistoryQuery.data,
    headToHeadQuery.data,
  ]);

  const queries = [matchQuery, homeHistoryQuery, awayHistoryQuery, standingsQuery, headToHeadQuery];
  const activeQueries = queries.filter((query) => query.fetchStatus !== 'idle' || query.isFetched);
  const isLoading = open && activeQueries.some((query) => query.isLoading);
  const isFetching = open && activeQueries.some((query) => query.isFetching);
  const hasError = activeQueries.some((query) => query.isError);

  async function refetch() {
    await Promise.all(activeQueries.map((query) => query.refetch()));
  }

  return { model, isLoading, isFetching, hasError, refetch, status, matchStarted, match, fixtureId };
}
