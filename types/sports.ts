// frontend/types/sports.ts

// ============================================================
// SPORTS TYPES
// Backend-aligned contracts for /sports
// ============================================================

// ============================================================
// ENUM-LIKE TYPES
// ============================================================

export type CompetitionType =
  | 'LEAGUE'
  | 'CUP'
  | 'PLAYOFFS'
  | 'LEAGUE_CUP'
  | string;

export type CompetitionRegion =
  | 'AFRICA'
  | 'ASIA'
  | 'EUROPE'
  | 'NORTH_AMERICA'
  | 'SOUTH_AMERICA'
  | 'OCEANIA'
  | 'WORLD'
  | string;

export type CompetitionPriority =
  | 'ELITE'
  | 'HIGH'
  | 'REGIONAL'
  | 'SELECTIVE'
  | string;

export type ActiveCompetitionStatus =
  | 'INACTIVE'
  | 'UPCOMING'
  | 'ACTIVE'
  | string;

export type EspnFixtureStatus = string;

export type SportsFixturePresentationStatus =
  | 'LIVE'
  | 'IN_PLAY'
  | 'UPCOMING'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'SUSPENDED'
  | 'UNKNOWN';

export interface EspnSportsImage {
  href?: string;
  url?: string;
  src?: string;
  alt?: string;
  rel?: string[];
  width?: number;
  height?: number;
}

export interface EspnFixtureTeam {
  id?: string | number;
  uid?: string;
  name?: string;
  displayName?: string;
  fullName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  location?: string;
  logo?: string | EspnSportsImage | null;
  logos?: Array<string | EspnSportsImage>;
  [key: string]: unknown;
}

export interface EspnFixtureCompetitor {
  id?: string | number;
  homeAway?: 'home' | 'away' | string;
  isHome?: boolean;
  isAway?: boolean;
  score?: string | number;
  team?: EspnFixtureTeam;
  competitor?: EspnFixtureTeam;
  [key: string]: unknown;
}

export interface EspnFixtureStatusType {
  id?: string | number;
  name?: string;
  state?: string;
  completed?: boolean;
  description?: string;
  detail?: string;
  shortDetail?: string;
  abbreviation?: string;
  [key: string]: unknown;
}

export interface EspnFixturePayloadCompetition {
  id?: string | number;
  name?: string;
  displayName?: string;
  shortName?: string;
  altGameNote?: string;
  status?: {
    displayClock?: string;
    displayTime?: string;
    completed?: boolean;
    state?: string;
    type?: EspnFixtureStatusType;
    [key: string]: unknown;
  };
  competitors?: EspnFixtureCompetitor[];
  league?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface EspnFixturePayload extends SportsPayload {
  name?: string;
  date?: string;
  competitions?: EspnFixturePayloadCompetition[];
  competitors?: EspnFixtureCompetitor[];
  header?: {
    date?: string;
    competitions?: EspnFixturePayloadCompetition[];
    league?: Record<string, unknown>;
    competition?: Record<string, unknown>;
    [key: string]: unknown;
  };
  event?: {
    competitions?: EspnFixturePayloadCompetition[];
    [key: string]: unknown;
  };
  summary?: SportsPayload;
  [key: string]: unknown;
}

export type EspnQueueJobType =
  | 'FIXTURE_REFRESH'
  | 'SUMMARY_REFRESH'
  | 'YOUTUBE_HIGHLIGHT'
  | string;

export type EspnQueueStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | string;

export type SportsSyncStateKind =
  | 'QUEUE'
  | 'CRON'
  | string;

export type SportsSyncStateStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PARTIAL'
  | 'SUCCESS'
  | 'FAILED'
  | string;

export type SportsSyncUnitType =
  | 'MONTH'
  | 'DATE'
  | 'STEP'
  | string;

export type SportsSyncUnitStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | string;

export type SportsSortOrder = 'asc' | 'desc';

export type YoutubeHighlightStatus =
  | 'pending'
  | 'searching'
  | 'retry'
  | 'found'
  | 'failed'
  | string;


// ============================================================
// COMMON
// ============================================================

export interface SportsTimestamps {
  createdAt?: string;
  updatedAt?: string;
}

export interface SportsPayload {
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


/**
 * JSON-compatible fragment returned by ESPN payload-field and summary-section
 * endpoints. These backend endpoints intentionally expose the stored ESPN
 * fragment without forcing one rigid shape on every ESPN response.
 */
export type SportsEndpointValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: SportsEndpointValue }
  | SportsEndpointValue[];


// ============================================================
// ACTIVE COMPETITION
// Canonical application competition registry
// ============================================================

export interface ActiveCompetition extends SportsTimestamps {
  competitionId: string;

  name: string;

  /** Canonical league display fields supplied by the sports read service. */
  displayName?: string;
  leagueName?: string;
  country?: string | null;
  leagueLogo?: string | null;
  logo?: string | null;
  logos?: Array<string | EspnSportsImage>;

  type: CompetitionType;

  region: CompetitionRegion;

  priority: CompetitionPriority;

  espnLeagueSlug: string;

  footballDataCode?: string;

  oddsApiSportKey?: string;

  season?: number;

  seasonStartDate?: string;

  seasonEndDate?: string;

  lastFixtureDate?: string;

  nextFixtureDate?: string;

  status: ActiveCompetitionStatus;

  espnPayload?: SportsPayload;

  lastUpdatedAt?: string;
}


// ============================================================
// ESPN LEAGUE CATALOGUE
// ============================================================

export interface EspnLeagueRecord extends SportsTimestamps {
  leagueId: string;

  slug: string;

  name: string;

  abbreviation?: string;

  country?: string;

  logo?: string | null;
  leagueLogo?: string | null;
  logos?: Array<string | EspnSportsImage>;

  priority: CompetitionPriority;

  isPriority: boolean;

  isActive: boolean;

  season?: number;

  seasonStartDate?: string;

  seasonEndDate?: string;

  lastFixtureDate?: string;

  nextFixtureDate?: string;

  payload?: SportsPayload;

  lastSyncedAt: string;

  detailLastSyncedAt?: string;
}


// ============================================================
// ESPN FIXTURE
// ============================================================

export interface EspnFixtureRecord extends SportsTimestamps {
  eventId: string;

  leagueId: string;

  season: number;

  fixtureDate: string;

  status: EspnFixtureStatus;

  statusDetail?: string;

  statusShortDetail?: string;

  period?: number;

  completed?: boolean;

  live: boolean;

  displayClock?: string;

  homeTeamId: string;

  awayTeamId: string;

  homeScore?: number;

  awayScore?: number;

  venueId?: string;

  venueName?: string;

  payload: EspnFixturePayload;

  collectedAt: string;
}

/** Public /sports fixture read model after team and league metadata enrichment. */
export interface SportsFixture extends EspnFixtureRecord {
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  leagueName?: string | null;
  leagueLogo?: string | null;
  presentationStatus?: SportsFixturePresentationStatus;
  presentationStatusLabel?: string;
}

export type SportsFixturesResponse = SportsFixture[];


// ============================================================
// ESPN FIXTURE SUMMARY
// GET /sports/fixtures/:eventId/summary
// ============================================================

export interface SportsFixtureSummaryResponse {
  eventId: string;

  leagueId: string;

  season: number;

  fixtureDate: string;

  completed?: boolean;

  summary: SportsPayload;

  summaryCollectedAt: string | null;
}


// ============================================================
// FOOTBALL NEWS FEED
// ============================================================

export type FootballNewsFeedKind =
  | 'NEWS'
  | 'VIDEO';

export interface FootballNewsFeedItem {
  kind: FootballNewsFeedKind;

  eventId: string;

  leagueId: string;

  fixtureDate: string;

  homeTeamId?: string;

  awayTeamId?: string;

  publishedAt?: string;

  payload: SportsPayload;
}

export interface SportsFootballNewsQuery
  extends SportsListQuery {
  competitionId?: string;

  teamId?: string;
}


// ============================================================
// ESPN STANDING
// ============================================================

export interface EspnStandingRecord extends SportsTimestamps {
  leagueId: string;

  season: number;

  teamId: string;

  /** `overall` for a league table, or a stable ESPN group key for cups. */
  groupId?: string;

  groupName?: string;

  stage?: 'LEAGUE' | 'GROUP' | string;

  sourceEventId?: string;

  sourceFixtureDate?: string;

  sourceSummaryCollectedAt?: string;

  sourceType?: 'ESPN_STANDINGS' | 'MATCH_SUMMARY' | string;

  lastFiveResults?: Array<'W' | 'D' | 'L' | string>;

  rank: number;

  points?: number;

  played?: number;

  wins?: number;

  draws?: number;

  losses?: number;

  goalsFor?: number;

  goalsAgainst?: number;

  goalDifference?: number;

  form?: string;

  description?: string;

  payload: SportsPayload;

  collectedAt: string;
}




// ============================================================
// ESPN TEAM
// ============================================================

export interface EspnTeamRecord extends SportsTimestamps {
  leagueId?: string;

  teamId: string;

  season?: number;

  name?: string;

  displayName?: string;

  shortName?: string;

  abbreviation?: string;

  location?: string;

  slug?: string;

  logo?: string;

  logos?: unknown[];

  color?: string;

  alternateColor?: string;

  payload?: SportsPayload;

  collectedAt?: string;

  [key: string]: unknown;
}


// ============================================================
// ESPN NEWS
// Backend schema uses articleId / headline / imageUrl.
// ============================================================

export interface EspnNewsRecord extends SportsTimestamps {
  articleId: string;

  contentId?: string;

  normalizedHeadline?: string;

  leagueId: string;

  leagueIds?: string[];

  eventIds?: string[];

  teamIds?: string[];

  eventId?: string;

  homeTeamId?: string;

  awayTeamId?: string;

  fixtureDate?: string;

  kind: FootballNewsFeedKind;

  headline?: string;

  description?: string;

  published?: string;

  lastModified?: string;

  feedPublishedAt: string;

  link?: string;

  imageUrl?: string;

  type?: string;

  author?: string;

  sourceArticleId?: string;

  payload: SportsPayload;

  collectedAt: string;
}


// ============================================================
// ESPN QUEUE
// ============================================================

export interface EspnQueueRecord extends SportsTimestamps {
  jobKey: string;

  type: EspnQueueJobType;

  leagueId: string;

  season?: number;

  eventId?: string;

  competitionId?: string;

  triggerEventId?: string;

  priority: number;

  status: EspnQueueStatus;

  attempts: number;

  maxAttempts: number;

  scheduledFor: string;

  nextAttemptAt?: string;

  startedAt?: string;

  completedAt?: string;

  failedAt?: string;

  lastError?: string;
}


// ============================================================
// ESPN QUEUE SUMMARY
// ============================================================

export interface EspnQueueSummary {
  total: number;

  status: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };

  type: {
    fixtureRefresh: number;
    summaryRefresh: number;
    youtubeHighlight?: number;
  };
}


// ============================================================
// FOOTBALL-DATA
// ============================================================

export interface FootballDataCompetitionRecord
  extends SportsTimestamps {
  competitionCode?: string;

  name?: string;

  area?: unknown;

  type?: string;

  emblem?: string;

  currentSeason?: unknown;

  [key: string]: unknown;
}

export interface FootballDataMatchRecord
  extends SportsTimestamps {
  competitionCode?: string;

  utcDate?: string;

  status?: string;

  matchday?: number;

  homeTeam?: unknown;

  awayTeam?: unknown;

  score?: unknown;

  lastUpdated?: string;

  [key: string]: unknown;
}

export interface FootballDataStandingRecord
  extends SportsTimestamps {
  competitionCode?: string;

  seasonId?: number;

  table?: unknown[];

  [key: string]: unknown;
}

export interface FootballDataTeamRecord
  extends SportsTimestamps {
  competitionCode?: string;

  teamId?: number;

  name?: string;

  shortName?: string;

  tla?: string;

  crest?: string;

  [key: string]: unknown;
}


// ============================================================
// ODDS API SPORTS
// ============================================================

export interface OddsApiSportRecord extends SportsTimestamps {
  sportKey: string;

  title: string;

  active: boolean;

  hasOutrights: boolean;

  payload: SportsPayload;

  collectedAt: string;
}


// ============================================================
// ODDS SNAPSHOT
// Backend schema:
// eventId
// sportKey
// homeTeam
// awayTeam
// commenceTime
// payload
// collectedAt
// ============================================================

export interface SportsOddsSnapshotRecord
  extends SportsTimestamps {
  eventId: string;

  sportKey: string;

  homeTeam: string;

  awayTeam: string;

  commenceTime: string;

  payload: SportsPayload;

  collectedAt: string;
}


// ============================================================
// PROVIDER RATE LIMIT
// These are Mongo document fields.
// Provider limits themselves come from backend config,
// not this document.
// ============================================================

export interface SportsProviderRateLimitRecord
  extends SportsTimestamps {
  provider: string;

  endpoint: string;

  lockedUntil?: string;

  lastRequestAt?: string;

  dailyPeriod: string;

  dailyRequests: number;

  monthlyPeriod: string;

  monthlyRequests: number;
}


// ============================================================
// YOUTUBE HIGHLIGHT
// ============================================================

export interface YouTubeHighlightRecord
  extends SportsTimestamps {
  fixtureId: string;

  competitionId?: string;

  homeTeam: string;

  awayTeam: string;

  status: YoutubeHighlightStatus;

  retryCount: number;

  searchedAt?: string;

  nextRetryAt?: string;

  videoId?: string;

  videoUrl?: string;

  title?: string;

  channelId?: string;

  channelTitle?: string;

  publishedAt?: string;

  thumbnailUrl?: string;

  payload?: SportsPayload;

  error?: string;
}


// ============================================================
// SPORTS SYNC STATE
// ============================================================

export interface SportsSyncUnit {
  key: string;

  type: SportsSyncUnitType;

  monthKey?: string;

  dateKey?: string;

  stepKey?: string;

  status: SportsSyncUnitStatus;

  attempts: number;

  startedAt?: string;

  completedAt?: string;

  nextAttemptAt?: string;

  lastError?: string;
}

export interface SportsSyncState
  extends SportsTimestamps {
  stateKey: string;

  kind: SportsSyncStateKind;

  jobType?: string;

  taskKey?: string;

  leagueId?: string;

  season?: number;

  eventId?: string;

  priority?: number;

  status: SportsSyncStateStatus;

  trackingMode: 'WINDOW' | 'HISTORY' | string;

  dateFrom?: string;

  dateTo?: string;

  units: SportsSyncUnit[];

  cronExpression?: string;

  timeZone?: string;

  lastStartedAt?: string;

  lastSuccessfulAt?: string;

  nextRunAt?: string;

  consecutiveFailures: number;

  lastError?: string;

  lastQueueJobKey?: string;

  lastCompletedAt?: string;
}


// ============================================================
// SYNC STATE SUMMARY
// ============================================================

export interface SportsSyncStateSummary {
  total: number;

  queue: number;

  cron: number;

  status: {
    pending: number;
    processing: number;
    partial: number;
    success: number;
    failed: number;
  };

  current?: SportsSyncState | null;
}


// ============================================================
// DATE / QUERY TYPES
// ============================================================

export type SportsQueryDate = string | Date;

export interface SportsListQuery {
  page?: number;

  limit?: number;

  sortBy?: string;

  sortOrder?: SportsSortOrder;
}

export interface SportsFixtureQuery {
  /**
   * Single UTC calendar date.
   *
   * The backend interprets this as the full UTC day.
   */
  date?: SportsQueryDate;

  from?: SportsQueryDate;

  to?: SportsQueryDate;

  competitionId?: string;

  teamId?: string;
}


// ============================================================
// ADMIN QUERIES
// ============================================================

export interface SportsAdminCompetitionQuery
  extends SportsListQuery {
  status?: string;

  competitionId?: string;

  season?: number;
}

export interface SportsAdminEspnLeagueQuery
  extends SportsListQuery {
  leagueId?: string;

  status?: string;
}

export interface SportsAdminEspnLiveMatchQuery
  extends SportsListQuery {
  leagueId?: string;

  eventId?: string;
}

export interface SportsAdminNewsQuery
  extends SportsListQuery {
  from?: SportsQueryDate;

  to?: SportsQueryDate;
}

export interface SportsAdminStandingQuery
  extends SportsListQuery {
  leagueId?: string;

  teamId?: string;

  season?: number;
}

export interface SportsAdminTeamQuery
  extends SportsListQuery {
  leagueId?: string;

  teamId?: string;
}

export interface SportsAdminQueueQuery
  extends SportsListQuery {
  type?: string;

  status?: string;

  leagueId?: string;

  eventId?: string;

  competitionId?: string;

  season?: number;

  from?: SportsQueryDate;

  to?: SportsQueryDate;
}

export interface SportsAdminFixtureQuery
  extends SportsListQuery {
  leagueId?: string;

  eventId?: string;

  season?: number;

  teamId?: string;

  status?: string;

  from?: SportsQueryDate;

  to?: SportsQueryDate;
}

export interface SportsAdminFootballDataMatchQuery
  extends SportsListQuery {
  competitionId?: string;

  status?: string;

  from?: SportsQueryDate;

  to?: SportsQueryDate;
}

export interface SportsAdminFootballDataStandingQuery
  extends SportsListQuery {
  competitionId?: string;

  season?: number;
}

export interface SportsAdminFootballDataTeamQuery
  extends SportsListQuery {
  competitionId?: string;

  teamId?: string;
}

export interface SportsAdminOddsSportsQuery
  extends SportsListQuery {
  provider?: string;
}

export interface SportsAdminOddsSnapshotQuery
  extends SportsListQuery {
  eventId?: string;

  provider?: string;

  from?: SportsQueryDate;

  to?: SportsQueryDate;
}

export interface SportsAdminProviderRateLimitQuery
  extends SportsListQuery {
  provider?: string;
}

export interface SportsAdminYoutubeQuery
  extends SportsListQuery {
  status?: string;

  competitionId?: string;

  eventId?: string;

  from?: SportsQueryDate;

  to?: SportsQueryDate;
}

export interface SportsAdminSyncStateQuery
  extends SportsListQuery {
  kind?: SportsSyncStateKind | string;

  type?: string;

  status?: SportsSyncStateStatus | string;

  stateKey?: string;

  leagueId?: string;

  season?: number;

  eventId?: string;
}


// ============================================================
// SYSTEM MONITOR
// ============================================================

export interface SportsSystemMonitorQuery {
  leagueId?: string;
}

export interface MonitorFixtureSummary {
  total: number;
  upcoming: number;
  live: number;
  finished: number;
  withSummary: number;
  missingSummary: number;
  summaryCoveragePercent: number;
  latestCollectedAt?: string;
  latestSummaryCollectedAt?: string;
  storedSeasons: number;
}

export interface MonitorTeamSummary {
  documents: number;
  distinctTeams: number;
  expectedCurrentSeasonTeams: number;
  missingCurrentSeasonTeams: number;
  coveragePercent: number;
  latestCollectedAt?: string;
}

export interface MonitorQueueItem {
  type: string;
  status: string;
  count: number;
}

export interface MonitorQueueSummary {
  total: number;
  pending: number;
  processing: number;
  completedRetained: number;
  failed: number;
  staleProcessing: number;
  completedRetentionDays: number;
  byType: Record<string, number>;
  byTypeAndStatus: MonitorQueueItem[];
  latestFailureAt?: string;
  latestFailure?: string;
  latestCompletedAt?: string;
}

export interface MonitorSyncStageSummary {
  jobType?: string;
  stage: string;
  unitType: string;
  status: string;
  count: number;
}

export interface MonitorSyncFailure {
  stateKey: string;
  jobType?: string;
  leagueId?: string;
  season?: number;
  eventId?: string;
  error?: string;
  at?: string;
  consecutiveFailures: number;
}

export interface MonitorCronState {
  stateKey: string;
  taskKey?: string;
  status: string;
  cronExpression?: string;
  timeZone?: string;
  lastStartedAt?: string;
  lastSuccessfulAt?: string;
}

export type MonitorSyncStateDetail = SportsSyncState;

export interface MonitorSyncSummary {
  stateCounts: Record<string, number>;
  queueStates: number;
  cronStates: number;

  unitProgress: {
    total: number;
    monthUnits: number;
    success: number;
    processing: number;
    pending: number;
    failed: number;
  };

  currentStages: MonitorSyncStageSummary[];

  failures: MonitorSyncFailure[];

  cron: MonitorCronState[];

  states: MonitorSyncStateDetail[];

  latestSuccessfulAt?: string;

  latestCompletedAt?: string;

  nextRunAt?: string;
}

export interface MonitorUpcomingFixture {
  fixtureId: string;
  leagueId: string;
  competitionId?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
}

export interface MonitorUpcomingSummary {
  total: number;
  fixtures: MonitorUpcomingFixture[];
}

export interface MonitorExpectedWork {
  [key: string]: unknown;
}

export interface MonitorProviderSummary {
  provider: string;

  limits: {
    minIntervalSeconds: number;
    dailyRequestLimit: number | null;
    monthlyRequestLimit: number | null;
  };

  usage: {
    dailyRequests: number;
    monthlyRequests: number;
    remainingDailyRequests: number | null;
    remainingMonthlyRequests: number | null;
    dailyPeriod?: string;
    monthlyPeriod?: string;
    lastRequestAt?: string;
    activeLocks: number;
  };

  endpoints: Array<{
    endpoint: string;
    dailyRequests: number;
    monthlyRequests: number;
    lastRequestAt?: string;
    lockedUntil?: string;
  }>;

  telemetry: {
    historicalRequestEventsAvailable: boolean;
    historicalRateByHourAvailable: boolean;
    historicalRateByLeagueAvailable: boolean;
    note: string;
  };
}

export interface MonitorPipelineDefinition {
  stages: string[];

  operations: Record<
    string,
    {
      source:
        | 'ESPN'
        | 'ODDS_API'
        | 'YOUTUBE'
        | 'QUEUE'
        | 'APPLICATION';

      operation: string;

      conditional?: boolean;

      note?: string;
    }
  >;

  stateCounts: Record<string, number>;
}

export interface MonitorInventory {
  activeCompetitions: number;
  espnCatalogue: number;
  espnFixtures: number;
  espnTeams: number;
  espnStandings: number;
  espnNews: number;
  espnQueue: number;
  sportsSyncStates: number;
  footballDataCompetitions: number;
  footballDataMatches: number;
  footballDataStandings: number;
  footballDataTeams: number;
  oddsApiSports: number;
  sportsOddsSnapshots: number;
  youtubeHighlights: number;
}

export interface MonitorLeagueSummary {
  competitionId: string;
  espnLeagueSlug: string;
  name: string;
  type: string;
  region: string;
  priority: string;
  status: string;
  season?: number;
  seasonStartDate?: string;
  seasonEndDate?: string;
  nextFixtureDate?: string;
  lastFixtureDate?: string;

  catalogue: {
    exists: boolean;
    name?: string;
    country?: string;
    isActive?: boolean;
    isPriority?: boolean;
    lastSyncedAt?: string;
    detailLastSyncedAt?: string;
  };

  fixtures: MonitorFixtureSummary;
  teams: MonitorTeamSummary;
  upcoming: MonitorUpcomingSummary;
  queue: MonitorQueueSummary;
  sync: MonitorSyncSummary;
  expectedWork: MonitorExpectedWork;
}

export interface SportsSystemMonitorResponse {
  generatedAt: string;

  scope: {
    activeLeagueFilter?: string;
    activeCompetitions: number;
    catalogueCompetitions: number;
    operationalSeasonScope: boolean;
  };

  inventory: MonitorInventory;

  queue: MonitorQueueSummary;

  sync: MonitorSyncSummary;

  pipeline: Record<string, MonitorPipelineDefinition>;

  providers: MonitorProviderSummary[];

  expectedWork: MonitorExpectedWork;

  leagues: MonitorLeagueSummary[];

  architectureNotes: {
    activeCompetitionSourceOfTruth: string;
    catalogueRole: string;
    fixtureStorageModel: string;
    summaryStorageModel: string;
    fixtureRefreshModel: string;
    summaryRefreshModel: string;
    queueHistoryWindow: string;
    syncProgressSource: string;
    providerTelemetryLimit: string;
    oddsMatchingLimit: string;
  };
}


// ============================================================
// MATCH CLOCK
// ============================================================

export type MatchClockPhase =
  | 'NOT_STARTED'
  | 'FIRST_HALF'
  | 'HALFTIME'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_HALFTIME'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES'
  | 'FULL_TIME';

export interface MatchClock {
  minute: number;
  seconds: number;
  display: string;
  phase: MatchClockPhase;
}



// Lightweight display aliases consumed by shared sports UI components.
export interface League {
  id?: string;
  _id?: string;
  code?: string;
  competitionId?: string;
  leagueId?: string;
  name: string;
  country?: string;
  emblem?: string;
  logo?: string;
  leagueLogo?: string | null;
  logos?: EspnSportsImage[];
  priority?: CompetitionPriority;
  [key: string]: unknown;
}

export interface Match {
  id?: string;
  _id?: string;
  eventId?: string;
  leagueId?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  date?: string;
  matchDate?: string;
  fixtureDate?: string;
  status?: string;
  presentationStatus?: SportsFixturePresentationStatus;
  presentationStatusLabel?: string;
  statusDetail?: string;
  statusShortDetail?: string;
  displayClock?: string;
  venue?: string;
  league?: League | string;
  [key: string]: unknown;
}
export interface Standing { team?: string; teamName?: string; position?: number; points?: number; [key: string]: unknown; }
export interface CompetitionStandingsResponse { competition?: League; standings?: Standing[]; data?: Standing[]; [key: string]: unknown; }
export interface KnockoutMatch extends Match { homeScore?: number; awayScore?: number; }
export interface KnockoutStage { name?: string; matches?: KnockoutMatch[]; [key: string]: unknown; }
