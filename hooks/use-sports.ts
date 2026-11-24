'use client';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { sportsService } from '../services/sports.service';
import type {
  SportsBootstrapRetryResult,
  SportsCalculatedStanding,
  SportsCompetition,
  SportsCompetitionScoringTotals,
  SportsHeadToHeadRecord,
  SportsMatchOddsSnapshot,
  SportsMatchReadModel,
  SportsMatchTimelineEvent,
  SportsNewsArticle,
  SportsOperationalMonitor,
  SportsPlayerEventTotals,
  SportsSeason,
  SportsTeam,
  SportsTeamFormRecord,
  SportsTeamHomeAwayRecord,
  SportsTeamScoringRecord,
  SportsTeamStatisticsAggregate,
  SportsFixturePage,
  SportsYoutubeHighlightsPage,
} from '../types/sports-v2';
import type {
  GetAdminSystemMonitorArgs,
  GetV2CompetitionArgs,
  GetV2CompetitionScoringArgs,
  GetV2CompetitionSeasonsArgs,
  GetV2CompetitionStandingsArgs,
  GetV2CompetitionsArgs,
  GetV2FixtureArgs,
  GetV2FixtureOddsArgs,
  GetV2FixturesArgs,
  GetV2FixtureTimelineArgs,
  GetV2HeadToHeadArgs,
  GetV2HighlightsArgs,
  GetV2PlayerEventTotalsArgs,
  GetV2SeasonArgs,
  GetV2SportsNewsArgs,
  GetV2SportsNewsArticleArgs,
  GetV2TeamArgs,
  GetV2TeamFormArgs,
  GetV2TeamHomeAwayArgs,
  GetV2TeamScoringArgs,
  GetV2TeamStatisticsArgs,
  GetV2TeamsArgs,
  GetV2TeamsByIdentifiersArgs,
} from '../types/endpoint-args/sports';

/** Sports module operational monitor; route is /admin/sports/monitor. */
export const sportsMonitorQueryKey = (query: GetAdminSystemMonitorArgs['query'] = {}) => ['sports', 'admin', 'system-monitor', query] as const;
export function useSportsMonitor(query: GetAdminSystemMonitorArgs['query'] = {}, options?: ApiQueryHookOptions<SportsOperationalMonitor>) {
  return useQuery<SportsOperationalMonitor>({
    queryKey: sportsMonitorQueryKey(query),
    queryFn: () => sportsService.getAdminSystemMonitor({ query }),
    staleTime: 15_000,
    refetchInterval: 30_000,
    ...options,
  });
}


/** Public read hook for successfully collected YouTube highlights. */
export function useGetV2HighlightsQuery(
  args?: GetV2HighlightsArgs,
  options?: ApiQueryHookOptions<SportsYoutubeHighlightsPage>,
) {
  return useQuery({
    queryKey: ['sports', 'v2', 'highlights', args?.query ?? null],
    queryFn: () => sportsService.getV2Highlights(args),
    ...options,
  });
}

/** Admin action for retrying only jobs failed by the latest partial bootstrap. */
export function useRetryFailedSportsBootstrapMutation(
  options?: ApiMutationHookOptions<SportsBootstrapRetryResult, void>,
) {
  return useMutation({
    mutationFn: () => sportsService.retryFailedBootstrapJobs(),
    ...options,
  });
}

/* Sports v2 query hooks. Each hook calls exactly one normalized service method. */
export function useGetV2CompetitionsQuery(args?: GetV2CompetitionsArgs, options?: ApiQueryHookOptions<SportsCompetition[]>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'competitions', args?.query ?? null],
    queryFn: () => sportsService.getV2Competitions(args),
    ...options,
  });
}

export function useGetV2CompetitionQuery(args: GetV2CompetitionArgs, options?: ApiQueryHookOptions<SportsCompetition | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'competition', args.path.competitionId],
    queryFn: () => sportsService.getV2Competition(args),
    ...options,
  });
}

export function useGetV2CompetitionSeasonsQuery(args: GetV2CompetitionSeasonsArgs, options?: ApiQueryHookOptions<SportsSeason[]>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'competition-seasons', args.path.competitionId],
    queryFn: () => sportsService.getV2CompetitionSeasons(args),
    ...options,
  });
}

export function useGetV2TeamsQuery(args?: GetV2TeamsArgs, options?: ApiQueryHookOptions<SportsTeam[]>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'teams', args?.query ?? null],
    queryFn: () => sportsService.getV2Teams(args),
    ...options,
  });
}

/** Batch-resolve canonical or ESPN team IDs without depending on league membership. */
export function useGetV2TeamsByIdentifiersQuery(
  args: GetV2TeamsByIdentifiersArgs,
  options?: ApiQueryHookOptions<SportsTeam[]>,
) {
  const identifiers = [...new Set(args.body.ids.map((id) => String(id).trim()).filter(Boolean))].sort();
  return useQuery({
    queryKey: ['sports', 'v2', 'teams-by-identifiers', identifiers],
    queryFn: () => sportsService.getV2TeamsByIdentifiers({ body: { ids: identifiers } }),
    ...options,
    enabled: identifiers.length > 0 && options?.enabled !== false,
  });
}

export function useGetV2TeamQuery(args: GetV2TeamArgs, options?: ApiQueryHookOptions<SportsTeam | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'team', args.path.teamId],
    queryFn: () => sportsService.getV2Team(args),
    ...options,
  });
}

export function useGetV2SeasonQuery(args: GetV2SeasonArgs, options?: ApiQueryHookOptions<SportsSeason | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'season', args.path.seasonId],
    queryFn: () => sportsService.getV2Season(args),
    ...options,
  });
}

export function useGetV2FixturesQuery(args?: GetV2FixturesArgs, options?: ApiQueryHookOptions<SportsFixturePage>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'fixtures', args?.query ?? null],
    queryFn: () => sportsService.getV2Fixtures(args),
    ...options,
  });
}


export interface V2FixturesInfiniteQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

/** Cursor-aware read for callers that need to traverse every fixture page. */
export function useGetV2FixturesInfiniteQuery(
  args?: GetV2FixturesArgs,
  options?: V2FixturesInfiniteQueryOptions,
) {
  return useInfiniteQuery({
    queryKey: ['sports', 'v2', 'fixtures', 'infinite', args?.query ?? null],
    initialPageParam: args?.query?.cursor ?? undefined,
    queryFn: ({ pageParam }) => sportsService.getV2Fixtures({
      query: { ...args?.query, cursor: pageParam as string | undefined },
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useGetV2FixtureQuery(args: GetV2FixtureArgs, options?: ApiQueryHookOptions<SportsMatchReadModel | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'fixture', args.path.fixtureId],
    queryFn: () => sportsService.getV2Fixture(args),
    ...options,
  });
}

export function useGetV2FixtureTimelineQuery(args: GetV2FixtureTimelineArgs, options?: ApiQueryHookOptions<SportsMatchTimelineEvent[]>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'fixture-timeline', args.path.fixtureId],
    queryFn: () => sportsService.getV2FixtureTimeline(args),
    ...options,
  });
}

export function useGetV2FixtureOddsQuery(args: GetV2FixtureOddsArgs, options?: ApiQueryHookOptions<SportsMatchOddsSnapshot | SportsMatchOddsSnapshot[] | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'fixture-odds', args.path.fixtureId, args.query ?? null],
    queryFn: () => sportsService.getV2FixtureOdds(args),
    ...options,
  });
}

export function useGetV2CompetitionStandingsQuery(args: GetV2CompetitionStandingsArgs, options?: ApiQueryHookOptions<SportsCalculatedStanding[]>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'competition-standings', args.path.competitionId, args.query.seasonId],
    queryFn: () => sportsService.getV2CompetitionStandings(args),
    ...options,
  });
}

export function useGetV2CompetitionScoringQuery(args: GetV2CompetitionScoringArgs, options?: ApiQueryHookOptions<SportsCompetitionScoringTotals | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'competition-scoring', args.path.competitionId, args.query.seasonId],
    queryFn: () => sportsService.getV2CompetitionScoring(args),
    ...options,
  });
}

export function useGetV2TeamFormQuery(args: GetV2TeamFormArgs, options?: ApiQueryHookOptions<SportsTeamFormRecord | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'team-form', args.path.teamId, args.query],
    queryFn: () => sportsService.getV2TeamForm(args),
    ...options,
  });
}

export function useGetV2TeamHomeAwayQuery(args: GetV2TeamHomeAwayArgs, options?: ApiQueryHookOptions<SportsTeamHomeAwayRecord | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'team-home-away', args.path.teamId, args.query],
    queryFn: () => sportsService.getV2TeamHomeAway(args),
    ...options,
  });
}

export function useGetV2TeamScoringQuery(args: GetV2TeamScoringArgs, options?: ApiQueryHookOptions<SportsTeamScoringRecord | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'team-scoring', args.path.teamId, args.query],
    queryFn: () => sportsService.getV2TeamScoring(args),
    ...options,
  });
}

export function useGetV2TeamStatisticsQuery(args: GetV2TeamStatisticsArgs, options?: ApiQueryHookOptions<SportsTeamStatisticsAggregate | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'team-statistics', args.path.teamId, args.query],
    queryFn: () => sportsService.getV2TeamStatistics(args),
    ...options,
  });
}

export function useGetV2HeadToHeadQuery(args: GetV2HeadToHeadArgs, options?: ApiQueryHookOptions<SportsHeadToHeadRecord | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'head-to-head', args.query],
    queryFn: () => sportsService.getV2HeadToHead(args),
    ...options,
  });
}

export function useGetV2PlayerEventTotalsQuery(args: GetV2PlayerEventTotalsArgs, options?: ApiQueryHookOptions<SportsPlayerEventTotals | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'player-event-totals', args.path.playerId, args.query],
    queryFn: () => sportsService.getV2PlayerEventTotals(args),
    ...options,
  });
}

export function useGetV2SportsNewsQuery(args?: GetV2SportsNewsArgs, options?: ApiQueryHookOptions<SportsNewsArticle[]>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'news', args?.query ?? null],
    queryFn: () => sportsService.getV2News(args),
    ...options,
  });
}

export function useGetV2SportsNewsArticleQuery(args: GetV2SportsNewsArticleArgs, options?: ApiQueryHookOptions<SportsNewsArticle | null>) {
  return useQuery({
    queryKey: ['sports', 'v2', 'news-article', args.path.articleId],
    queryFn: () => sportsService.getV2NewsArticle(args),
    ...options,
  });
}
