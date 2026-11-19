import type {
  SportsCompetitionRegion,
  SportsCompetitionType,
  SportsFixtureState,
  SportsNewsScope,
} from '../sports-v2';


/* Request contracts for sports endpoints. */

export interface GetCompetitionsQuery {
  activeOnly?: string;
  predictionEnabled?: string;
}

export interface GetCompetitionStandingsQuery {
  teamId?: string;
  groupId?: string;
}

export interface GetCompetitionTeamsQuery {
  teamId?: string;
}

export interface GetUpcomingFixturesQuery {
  date?: string;
  from?: string;
  to?: string;
  competitionId?: string;
  teamId?: string;
}

export interface GetLiveFixturesQuery {
  date?: string;
  from?: string;
  to?: string;
  competitionId?: string;
  teamId?: string;
}

export interface StreamFootballNewsQuery {
  competitionId?: string;
  teamId?: string;
}

export interface GetFootballNewsQuery {
  competitionId?: string;
  teamId?: string;
  page?: string;
  limit?: string;
}

export interface GetFinishedFixturesQuery {
  date?: string;
  from?: string;
  to?: string;
  competitionId?: string;
  teamId?: string;
}

export interface GetAdminSystemMonitorQuery {
  refresh?: boolean | string;
}

export interface GetAdminActiveCompetitionsQuery {
  page?: string;
  limit?: string;
  status?: string;
  competitionId?: string;
  season?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminEspnLeaguesQuery {
  page?: string;
  limit?: string;
  leagueId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminEspnLiveMatchesQuery {
  page?: string;
  limit?: string;
  leagueId?: string;
  eventId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminEspnNewsQuery {
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminEspnStandingsQuery {
  page?: string;
  limit?: string;
  leagueId?: string;
  teamId?: string;
  season?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminEspnTeamsQuery {
  page?: string;
  limit?: string;
  leagueId?: string;
  teamId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminEspnQueuesQuery {
  page?: string;
  limit?: string;
  type?: string;
  status?: string;
  leagueId?: string;
  eventId?: string;
  competitionId?: string;
  season?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminEspnFixturesQuery {
  page?: string;
  limit?: string;
  leagueId?: string;
  eventId?: string;
  season?: string;
  teamId?: string;
  status?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminFootballDataCompetitionsQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminFootballDataMatchesQuery {
  page?: string;
  limit?: string;
  competitionId?: string;
  status?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminFootballDataStandingsQuery {
  page?: string;
  limit?: string;
  competitionId?: string;
  season?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminFootballDataTeamsQuery {
  page?: string;
  limit?: string;
  competitionId?: string;
  teamId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminOddsApiSportsQuery {
  provider?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminSportsOddsSnapshotsQuery {
  page?: string;
  limit?: string;
  eventId?: string;
  provider?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminProviderRateLimitsQuery {
  provider?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminYoutubeHighlightsQuery {
  page?: string;
  limit?: string;
  status?: string;
  competitionId?: string;
  eventId?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetAdminSportsSyncStatesQuery {
  page?: string;
  limit?: string;
  kind?: string;
  type?: string;
  status?: string;
  stateKey?: string;
  leagueId?: string;
  season?: string;
  eventId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetCompetitionsArgs {
  query?: GetCompetitionsQuery;
}

export interface GetCompetitionArgs {
  path: { competitionId: string };
}

export interface GetCompetitionStandingsArgs {
  path: { competitionId: string };
  query?: GetCompetitionStandingsQuery;
}

export interface GetCompetitionTeamsArgs {
  path: { competitionId: string };
  query?: GetCompetitionTeamsQuery;
}

export interface GetUpcomingFixturesArgs {
  query?: GetUpcomingFixturesQuery;
}

export interface GetLiveFixturesArgs {
  query?: GetLiveFixturesQuery;
}

export interface StreamFootballNewsArgs {
  query?: StreamFootballNewsQuery;
}

export interface GetFootballNewsArgs {
  query?: GetFootballNewsQuery;
}

export interface GetFinishedFixturesArgs {
  query?: GetFinishedFixturesQuery;
}

export interface GetFixtureIdArgs {
  path: { eventId: string };
}

export interface GetFixtureUidArgs {
  path: { eventId: string };
}

export interface GetFixtureDateArgs {
  path: { eventId: string };
}

export interface GetFixtureNameArgs {
  path: { eventId: string };
}

export interface GetFixtureShortNameArgs {
  path: { eventId: string };
}

export interface GetFixtureTimeValidArgs {
  path: { eventId: string };
}

export interface GetFixtureSeasonArgs {
  path: { eventId: string };
}

export interface GetFixtureSeasonTypeArgs {
  path: { eventId: string };
}

export interface GetFixtureCompetitionsArgs {
  path: { eventId: string };
}

export interface GetFixtureLinksArgs {
  path: { eventId: string };
}

export interface GetFixtureLeagueArgs {
  path: { eventId: string };
}

export interface GetFixtureStatusArgs {
  path: { eventId: string };
}

export interface GetFixtureVenueArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryBoxscoreArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryFormatArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryGameInfoArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryLastFiveGamesArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryBroadcastsArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryPickcenterArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryOddsArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryHasOddsArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryRostersArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryNewsArgs {
  path: { eventId: string };
}

export interface GetFixtureSummarySeasonSeriesArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryVideosArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryHeaderArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryKeyEventsArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryCommentaryArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryWallclockAvailableArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryMetaArgs {
  path: { eventId: string };
}

export interface GetFixtureSummaryStandingsArgs {
  path: { eventId: string };
}

export interface GetOddsForEventArgs {
  path: { eventId: string };
}

export interface GetYoutubeHighlightArgs {
  path: { fixtureId: string };
}

export interface GetAdminSystemMonitorArgs {
  query?: GetAdminSystemMonitorQuery;
}

export interface GetAdminActiveCompetitionsArgs {
  query?: GetAdminActiveCompetitionsQuery;
}

export interface GetAdminEspnLeaguesArgs {
  query?: GetAdminEspnLeaguesQuery;
}

export interface GetAdminEspnLiveMatchesArgs {
  query?: GetAdminEspnLiveMatchesQuery;
}

export interface GetAdminEspnNewsArgs {
  query?: GetAdminEspnNewsQuery;
}

export interface GetAdminEspnStandingsArgs {
  query?: GetAdminEspnStandingsQuery;
}

export interface GetAdminEspnTeamsArgs {
  query?: GetAdminEspnTeamsQuery;
}

export interface GetAdminEspnQueuesArgs {
  query?: GetAdminEspnQueuesQuery;
}

export interface GetAdminEspnFixturesArgs {
  query?: GetAdminEspnFixturesQuery;
}

export interface GetAdminFootballDataCompetitionsArgs {
  query?: GetAdminFootballDataCompetitionsQuery;
}

export interface GetAdminFootballDataMatchesArgs {
  query?: GetAdminFootballDataMatchesQuery;
}

export interface GetAdminFootballDataStandingsArgs {
  query?: GetAdminFootballDataStandingsQuery;
}

export interface GetAdminFootballDataTeamsArgs {
  query?: GetAdminFootballDataTeamsQuery;
}

export interface GetAdminOddsApiSportsArgs {
  query?: GetAdminOddsApiSportsQuery;
}

export interface GetAdminSportsOddsSnapshotsArgs {
  query?: GetAdminSportsOddsSnapshotsQuery;
}

export interface GetAdminProviderRateLimitsArgs {
  query?: GetAdminProviderRateLimitsQuery;
}

export interface GetAdminYoutubeHighlightsArgs {
  query?: GetAdminYoutubeHighlightsQuery;
}

export interface GetAdminSportsSyncStatesArgs {
  query?: GetAdminSportsSyncStatesQuery;
}

export interface GetAdminSportsSyncStateArgs {
  path: { stateKey: string };
}

// Normalized provider-independent /sports/v2 read API.
export type SportsV2CompetitionRegion = 'NIGERIA' | 'AFRICA' | 'EUROPE' | 'SOUTH_AMERICA' | 'NORTH_AMERICA' | 'ASIA' | 'OCEANIA' | 'WORLD';
export type SportsV2CompetitionType = 'LEAGUE' | 'CLUB_COMPETITION' | 'INTERNATIONAL';
export type SportsV2FixtureState = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'EXTRA_TIME' | 'PENALTIES' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED' | 'ABANDONED' | 'UNKNOWN';
export interface GetSportsV2CompetitionsQuery { activeOnly?: boolean; region?: SportsV2CompetitionRegion; type?: SportsV2CompetitionType; search?: string; limit?: number }
export interface GetSportsV2TeamsQuery { leagueId?: string; country?: string; search?: string; limit?: number }
export interface GetSportsV2FixturesQuery { competitionId?: string; seasonId?: string; teamId?: string; state?: SportsV2FixtureState; from?: string; to?: string; limit?: number; cursor?: string }
export interface GetSportsV2FixtureOddsQuery { history?: boolean; limit?: number }
export interface GetSportsV2CompetitionsArgs { query?: GetSportsV2CompetitionsQuery }
export interface GetSportsV2CompetitionArgs { path: { competitionId: string } }
export interface GetSportsV2TeamsArgs { query?: GetSportsV2TeamsQuery }
export interface GetSportsV2TeamArgs { path: { teamId: string } }
export interface GetSportsV2SeasonArgs { path: { seasonId: string } }
export interface GetSportsV2FixturesArgs { query?: GetSportsV2FixturesQuery }
export interface GetSportsV2FixtureArgs { path: { fixtureId: string } }
export interface GetSportsV2FixtureOddsArgs { path: { fixtureId: string }; query?: GetSportsV2FixtureOddsQuery }
export interface GetSportsV2FixtureTimelineArgs { path: { fixtureId: string } }
export interface GetSportsV2CompetitionSeasonArgs { path: { competitionId: string } }
export interface GetSportsV2CompetitionDerivedArgs { path: { competitionId: string }; query: { seasonId: string } }
export interface GetSportsV2TeamDerivedArgs { path: { teamId: string }; query: { competitionId: string; seasonId: string } }
export interface GetSportsV2HeadToHeadArgs { query: { teamAId: string; teamBId: string; competitionId: string } }
export interface GetSportsV2PlayerEventTotalsArgs { path: { playerId: string }; query: { competitionId: string; seasonId: string } }

/* Normalized Sports v2 read contracts. These mirror the v2 controller DTOs. */
export interface GetV2CompetitionsQuery {
  activeOnly?: boolean;
  region?: SportsCompetitionRegion;
  type?: SportsCompetitionType;
  search?: string;
  limit?: number;
}
export interface GetV2TeamsQuery {
  leagueId?: string;
  country?: string;
  search?: string;
  limit?: number;
}
export interface GetV2FixturesQuery {
  competitionId?: string;
  seasonId?: string;
  teamId?: string;
  state?: SportsFixtureState;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}
export interface GetV2FixtureOddsQuery {
  history?: boolean;
  limit?: number;
}
export interface GetV2CompetitionStandingsQuery {
  seasonId: string;
}
export interface GetV2TeamProjectionQuery {
  competitionId: string;
  seasonId: string;
}
export interface GetV2HeadToHeadQuery {
  teamAId: string;
  teamBId: string;
  competitionId: string;
}
export interface GetV2SportsNewsQuery {
  competitionId?: string;
  teamId?: string;
  scope?: SportsNewsScope;
  limit?: number;
  before?: string;
}

export interface GetV2CompetitionsArgs { query?: GetV2CompetitionsQuery }
export interface GetV2CompetitionArgs { path: { competitionId: string } }
export interface GetV2CompetitionSeasonsArgs { path: { competitionId: string } }
export interface GetV2TeamsArgs { query?: GetV2TeamsQuery }
export interface GetV2TeamArgs { path: { teamId: string } }
export interface GetV2SeasonArgs { path: { seasonId: string } }
export interface GetV2FixturesArgs { query?: GetV2FixturesQuery }
export interface GetV2FixtureArgs { path: { fixtureId: string } }
export interface GetV2FixtureTimelineArgs { path: { fixtureId: string } }
export interface GetV2FixtureOddsArgs {
  path: { fixtureId: string };
  query?: GetV2FixtureOddsQuery;
}
export interface GetV2CompetitionStandingsArgs {
  path: { competitionId: string };
  query: GetV2CompetitionStandingsQuery;
}
export interface GetV2CompetitionScoringArgs {
  path: { competitionId: string };
  query: GetV2CompetitionStandingsQuery;
}
export interface GetV2TeamFormArgs {
  path: { teamId: string };
  query: GetV2TeamProjectionQuery;
}
export interface GetV2TeamHomeAwayArgs {
  path: { teamId: string };
  query: GetV2TeamProjectionQuery;
}
export interface GetV2TeamScoringArgs {
  path: { teamId: string };
  query: GetV2TeamProjectionQuery;
}
export interface GetV2TeamStatisticsArgs {
  path: { teamId: string };
  query: GetV2TeamProjectionQuery;
}
export interface GetV2HeadToHeadArgs { query: GetV2HeadToHeadQuery }
export interface GetV2PlayerEventTotalsArgs {
  path: { playerId: string };
  query: GetV2TeamProjectionQuery;
}
export interface GetV2SportsNewsArgs { query?: GetV2SportsNewsQuery }
export interface GetV2SportsNewsArticleArgs { path: { articleId: string } }

/** Query contract for the public normalized YouTube highlight read endpoint. */
export interface GetV2HighlightsQuery {
  page?: number;
  limit?: number;
  competitionId?: string;
  from?: string;
  to?: string;
  sortBy?: 'publishedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetV2HighlightsArgs { query?: GetV2HighlightsQuery }
