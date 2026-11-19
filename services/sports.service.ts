import { apiRequest } from '../lib/axios';

import type {
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
  SportsBootstrapRetryResult,
} from '../types/sports-v2';
import type {
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
  GetAdminSystemMonitorArgs,
} from '../types/endpoint-args/sports';

/** HTTP client for the current normalized Sports read and operational APIs. */
export const sportsService = {
  getV2Competitions: (args?: GetV2CompetitionsArgs) =>
    apiRequest<SportsCompetition[], NonNullable<GetV2CompetitionsArgs['query']>>({
      method: 'GET', path: '/sports/v2/competitions', query: args?.query,
    }),
  getV2Competition: (args: GetV2CompetitionArgs) =>
    apiRequest<SportsCompetition | null>({
      method: 'GET', path: '/sports/v2/competitions/:competitionId', pathParams: args.path,
    }),
  getV2CompetitionSeasons: (args: GetV2CompetitionSeasonsArgs) =>
    apiRequest<SportsSeason[]>({
      method: 'GET', path: '/sports/v2/competitions/:competitionId/seasons', pathParams: args.path,
    }),
  getV2Teams: (args?: GetV2TeamsArgs) =>
    apiRequest<SportsTeam[], NonNullable<GetV2TeamsArgs['query']>>({
      method: 'GET', path: '/sports/v2/teams', query: args?.query,
    }),
  getV2Team: (args: GetV2TeamArgs) =>
    apiRequest<SportsTeam | null>({
      method: 'GET', path: '/sports/v2/teams/:teamId', pathParams: args.path,
    }),
  getV2Season: (args: GetV2SeasonArgs) =>
    apiRequest<SportsSeason | null>({
      method: 'GET', path: '/sports/v2/seasons/:seasonId', pathParams: args.path,
    }),
  getV2Fixtures: (args?: GetV2FixturesArgs) =>
    apiRequest<SportsFixturePage, NonNullable<GetV2FixturesArgs['query']>>({
      method: 'GET', path: '/sports/v2/fixtures', query: args?.query,
    }),
  getV2Fixture: (args: GetV2FixtureArgs) =>
    apiRequest<SportsMatchReadModel | null>({
      method: 'GET', path: '/sports/v2/fixtures/:fixtureId', pathParams: args.path,
    }),
  getV2FixtureTimeline: (args: GetV2FixtureTimelineArgs) =>
    apiRequest<SportsMatchTimelineEvent[]>({
      method: 'GET', path: '/sports/v2/fixtures/:fixtureId/timeline', pathParams: args.path,
    }),
  getV2FixtureOdds: (args: GetV2FixtureOddsArgs) =>
    apiRequest<SportsMatchOddsSnapshot | SportsMatchOddsSnapshot[] | null, NonNullable<GetV2FixtureOddsArgs['query']>>({
      method: 'GET', path: '/sports/v2/fixtures/:fixtureId/odds', pathParams: args.path, query: args.query,
    }),
  getV2CompetitionStandings: (args: GetV2CompetitionStandingsArgs) =>
    apiRequest<SportsCalculatedStanding[]>({
      method: 'GET', path: '/sports/v2/competitions/:competitionId/standings', pathParams: args.path, query: args.query,
    }),
  getV2CompetitionScoring: (args: GetV2CompetitionScoringArgs) =>
    apiRequest<SportsCompetitionScoringTotals | null>({
      method: 'GET', path: '/sports/v2/competitions/:competitionId/scoring', pathParams: args.path, query: args.query,
    }),
  getV2TeamForm: (args: GetV2TeamFormArgs) =>
    apiRequest<SportsTeamFormRecord | null>({
      method: 'GET', path: '/sports/v2/teams/:teamId/form', pathParams: args.path, query: args.query,
    }),
  getV2TeamHomeAway: (args: GetV2TeamHomeAwayArgs) =>
    apiRequest<SportsTeamHomeAwayRecord | null>({
      method: 'GET', path: '/sports/v2/teams/:teamId/home-away', pathParams: args.path, query: args.query,
    }),
  getV2TeamScoring: (args: GetV2TeamScoringArgs) =>
    apiRequest<SportsTeamScoringRecord | null>({
      method: 'GET', path: '/sports/v2/teams/:teamId/scoring', pathParams: args.path, query: args.query,
    }),
  getV2TeamStatistics: (args: GetV2TeamStatisticsArgs) =>
    apiRequest<SportsTeamStatisticsAggregate | null>({
      method: 'GET', path: '/sports/v2/teams/:teamId/statistics', pathParams: args.path, query: args.query,
    }),
  getV2HeadToHead: (args: GetV2HeadToHeadArgs) =>
    apiRequest<SportsHeadToHeadRecord | null, GetV2HeadToHeadArgs['query']>({
      method: 'GET', path: '/sports/v2/head-to-head', query: args.query,
    }),
  getV2PlayerEventTotals: (args: GetV2PlayerEventTotalsArgs) =>
    apiRequest<SportsPlayerEventTotals | null>({
      method: 'GET', path: '/sports/v2/players/:playerId/event-totals', pathParams: args.path, query: args.query,
    }),
  getV2News: (args?: GetV2SportsNewsArgs) =>
    apiRequest<SportsNewsArticle[], NonNullable<GetV2SportsNewsArgs['query']>>({
      method: 'GET', path: '/sports/v2/news', query: args?.query,
    }),
  getV2NewsArticle: (args: GetV2SportsNewsArticleArgs) =>
    apiRequest<SportsNewsArticle | null>({
      method: 'GET', path: '/sports/v2/news/:articleId', pathParams: args.path,
    }),
  getV2Highlights: (args?: GetV2HighlightsArgs) =>
    apiRequest<SportsYoutubeHighlightsPage, NonNullable<GetV2HighlightsArgs['query']>>({
      method: 'GET', path: '/sports/v2/highlights', query: args?.query,
    }),
  getAdminSystemMonitor: (args?: GetAdminSystemMonitorArgs) =>
    apiRequest<SportsOperationalMonitor, NonNullable<GetAdminSystemMonitorArgs['query']>>({
      method: 'GET', path: '/admin/sports/monitor', query: args?.query,
    }),
  retryFailedBootstrapJobs: () =>
    apiRequest<SportsBootstrapRetryResult>({
      method: 'POST', path: '/admin/sports/bootstrap/retry-failed', body: {},
    }),
} as const;
