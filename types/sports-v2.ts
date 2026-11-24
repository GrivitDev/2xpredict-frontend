/** Provider-independent, normalized Sports v2 wire contracts. Dates are ISO strings over HTTP. */
export type SportsDataProvider = 'ESPN' | 'ODDS_API';
export type SportsCompetitionType = 'LEAGUE' | 'CLUB_COMPETITION' | 'INTERNATIONAL';
export type SportsCompetitionRegion = 'NIGERIA' | 'AFRICA' | 'EUROPE' | 'SOUTH_AMERICA' | 'NORTH_AMERICA' | 'ASIA' | 'OCEANIA' | 'WORLD';
export type SportsFixtureState = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'EXTRA_TIME' | 'PENALTIES' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED' | 'ABANDONED' | 'UNKNOWN';

export interface SportsSourceMetadata {
  provider: SportsDataProvider;
  providerId?: string;
  endpoint: string;
  collectedAt: string;
  providerUpdatedAt?: string;
}

export interface SportsCompetition {
  id: string; espnId: string; slug: string; name: string; displayName?: string;
  abbreviation?: string; type: SportsCompetitionType; region: SportsCompetitionRegion;
  country?: string; logo?: string; isActive: boolean; currentSeasonId?: string;
  currentSeasonYear?: number; currentSeasonStartDate?: string; currentSeasonEndDate?: string;
  rawPayload?: Record<string, unknown>; source: SportsSourceMetadata;
  createdAt: string; updatedAt: string;
}

export interface SportsSeason {
  id: string; espnId: string; competitionId: string; year: number;
  displayName?: string; shortDisplayName?: string; startDate?: string; endDate?: string;
  isCurrent: boolean; rawPayload?: Record<string, unknown>; source: SportsSourceMetadata;
  createdAt: string; updatedAt: string;
}

export interface SportsTeam {
  id: string; espnId: string; leagueIds: string[]; name: string;
  displayName?: string; shortName?: string; abbreviation?: string; slug?: string;
  logo?: string; country?: string; location?: string; primaryColor?: string;
  alternateColor?: string; rawPayload?: Record<string, unknown>;
  source: SportsSourceMetadata; createdAt: string; updatedAt: string;
}

export interface SportsFixtureStatus {
  state: SportsFixtureState; providerState?: string; name?: string;
  description?: string; shortDescription?: string; period?: number;
  clock?: string; displayClock?: string; isFinal: boolean;
}
export interface SportsFixtureTeamIdentity {
  id: string; espnId?: string; name?: string; displayName?: string;
  shortName?: string; abbreviation?: string; logo?: string; country?: string;
  location?: string; slug?: string; primaryColor?: string; alternateColor?: string;
}
export interface SportsFixtureCompetitor {
  teamId: string; teamIdentity?: SportsFixtureTeamIdentity;
  espnCompetitorId?: string; homeAway: 'HOME' | 'AWAY';
  score?: number | null; winner?: boolean; form?: string;
  records?: Array<Record<string, unknown>>;
  statistics?: Array<Record<string, unknown>>;
  leaders?: Array<Record<string, unknown>>;
  rawPayload?: Record<string, unknown>;
}
export interface SportsFixturePeriodScore { teamId: string; period: number; score: number }
export interface SportsFixture {
  id: string; espnEventId: string; espnCompetitionId?: string; competitionId: string;
  seasonId?: string; seasonYear?: number; name?: string; shortName?: string;
  kickoffAt: string; status: SportsFixtureStatus;
  competitors: [SportsFixtureCompetitor, SportsFixtureCompetitor];
  periodScores: SportsFixturePeriodScore[]; venueId?: string; attendance?: number;
  neutralSite?: boolean; completedAt?: string; retentionExpiresAt?: string;
  retentionDurationMonths?: number; rawPayload?: Record<string, unknown>;
  source: SportsSourceMetadata; createdAt: string; updatedAt: string;
}

export interface SportsTimelineAthleteInvolvement {
  athleteId?: string; name?: string; shortName?: string; jersey?: string;
  teamId?: string; position?: string; positionId?: string; statisticsRef?: string;
  order?: number; role?: string;
}
export interface SportsTimelineScore { home: number; away: number }
export interface SportsMatchTimelineEvent {
  id: string; espnPlayId?: string; fixtureId: string; sequence: number;
  period?: number; clock?: string; clockSeconds?: number; addedClock?: string;
  type: string; typeId?: string; typeKey?: string; description?: string; teamId?: string;
  athleteId?: string; relatedAthleteId?: string;
  involvedAthletes?: SportsTimelineAthleteInvolvement[]; scoreAfter?: SportsTimelineScore;
  homeScore?: number; awayScore?: number; scoreValue?: number; scoringPlay?: boolean;
  shootingPlay?: boolean; priority?: boolean; valid?: boolean; substitution?: boolean;
  redCard?: boolean; yellowCard?: boolean; penaltyKick?: boolean; ownGoal?: boolean;
  shootout?: boolean; hasVideoTagging?: boolean; sourceId?: string;
  sourceDescription?: string; statYardage?: number; coordinateX?: number;
  coordinateY?: number; fieldPositionX?: number; fieldPositionY?: number;
  fieldPosition2X?: number; fieldPosition2Y?: number; periodDisplayValue?: string;
  wallclock?: string; shortText?: string; modifiedAt?: string; modifiedDate?: string;
  probabilityRef?: string; rawPayload?: Record<string, unknown>;
  source: SportsSourceMetadata; createdAt: string; updatedAt: string;
}

export interface SportsOddsOutcome { selection: string; price: number; point?: number | null; isSuspended?: boolean }
export interface SportsOddsMarket { marketId?: string; marketKey: string; marketName: string; outcomes: SportsOddsOutcome[]; providerUpdatedAt?: string }
export interface SportsOddsBookmaker { bookmakerId?: string; bookmakerName: string; priority?: number; markets: SportsOddsMarket[] }
export interface SportsMatchOddsSnapshot {
  id: string; fixtureId: string; provider: 'ESPN' | 'ESPN_SUMMARY' | 'ODDS_API';
  isFallback: boolean; collectedAt: string; bookmakers: SportsOddsBookmaker[];
  rawPayload?: Record<string, unknown>; source: SportsSourceMetadata; createdAt: string;
}

export interface SportsFixturePage { items: SportsFixture[]; nextCursor?: string; total?: number }
export interface SportsMatchReadModel {
  fixture: SportsFixture; competition: SportsCompetition | null; season: SportsSeason | null;
  homeTeam: SportsTeam | null; awayTeam: SportsTeam | null;
  timeline: SportsMatchTimelineEvent[]; latestOdds: SportsMatchOddsSnapshot | null;
  matchFacts?: SportsMatchFacts | null; matchSummary?: SportsMatchSummaryMetadata | null;
}
export interface SportsMatchSummaryMetadata {
  fixtureId: string; espnEventId: string; payloadHash: string; revision: number;
  endpoint: string; firstCollectedAt?: string; lastCollectedAt?: string;
}

export type SportsMatchFactSectionStatus = 'COMPLETE' | 'PARTIAL' | 'AVAILABLE' | 'NOT_PROVIDED' | 'INVALID';
export type SportsMatchFactUnit = 'COUNT' | 'PERCENT' | 'RATIO' | 'MINUTES' | 'UNKNOWN';
export interface SportsNormalizedStatistic {
  canonicalKey: string | null; providerKey: string; providerLabel?: string;
  value: number | null; displayValue?: string; unit: SportsMatchFactUnit;
}
export interface SportsNormalizedTeamStatistics {
  teamId: string; espnTeamId: string; side: 'HOME' | 'AWAY' | 'UNKNOWN';
  statistics: SportsNormalizedStatistic[];
}
export interface SportsNormalizedPlayerAppearance {
  playerId: string; espnPlayerId: string; teamId?: string; name?: string;
  shortName?: string; jersey?: string; position?: string; positionId?: string;
  starter?: boolean; subbedIn?: boolean; subbedOut?: boolean; active?: boolean;
  appearances: number | null; appearanceBasis: 'PROVIDER_STATISTIC' | 'LINEUP_PARTICIPATION' | 'UNKNOWN';
  statistics: SportsNormalizedStatistic[];
}
export interface SportsNormalizedPeriodScore { teamId: string; period: number; score: number }
export interface SportsMatchResultFacts {
  homeTeamId?: string; awayTeamId?: string; homeScore: number | null; awayScore: number | null;
  isFinal: boolean; available: boolean;
  scoreSource: 'ESPN_SUMMARY' | 'MIXED' | 'FIXTURE_FALLBACK' | 'UNAVAILABLE';
}
export interface SportsMatchFactSectionStatuses {
  matchResult: SportsMatchFactSectionStatus; periodScores: SportsMatchFactSectionStatus;
  teamStatistics: SportsMatchFactSectionStatus; playerAppearances: SportsMatchFactSectionStatus;
  playerStatistics: SportsMatchFactSectionStatus; leaders: SportsMatchFactSectionStatus;
  summaryEvents: SportsMatchFactSectionStatus;
}
export interface SportsMatchFactLeader {
  categoryKey?: string; categoryName?: string; athleteId?: string; teamId?: string;
  name?: string; value: number | null; displayValue?: string; rank?: number;
}
export interface SportsMatchSummaryEvent {
  eventId?: string; type?: string; description?: string; clock?: string; period?: number;
  teamId?: string; athleteIds: string[]; homeScore?: number; awayScore?: number;
  sourceCoverage: 'PARTIAL';
}
export interface SportsMatchFacts {
  fixtureId: string; espnEventId: string; competitionId: string; seasonId?: string;
  seasonYear?: number; provider: 'ESPN'; endpoint: string; sourcePayloadHash: string;
  sourceRevision: number; sourceCollectedAt: string; normalizationVersion: string;
  normalizationHash: string; normalizedAt: string; matchResult: SportsMatchResultFacts;
  periodScores: SportsNormalizedPeriodScore[]; teamStatistics: SportsNormalizedTeamStatistics[];
  playerAppearances: SportsNormalizedPlayerAppearance[]; leaders: SportsMatchFactLeader[];
  summaryEvents: SportsMatchSummaryEvent[]; sectionStatus: SportsMatchFactSectionStatuses;
  diagnostics: string[]; revision: number;
}

export interface SportsTeamFormRecord {
  teamId: string; competitionId?: string; seasonId?: string; lastN: number;
  results: Array<{ fixtureId: string; kickoffAt: string; result: 'W' | 'D' | 'L'; goalsFor: number; goalsAgainst: number; homeAway: 'HOME' | 'AWAY' }>;
  computedAt: string; sourceRevision: number;
}
export interface SportsTeamHomeAwayRecord {
  teamId: string; competitionId: string; seasonId: string;
  home: SportsTeamRecord; away: SportsTeamRecord;
  last5Home?: SportsTeamRecord | null; last10Home?: SportsTeamRecord | null;
  last5Away?: SportsTeamRecord | null; last10Away?: SportsTeamRecord | null;
  metrics?: Record<string, unknown>; computedAt: string; sourceRevision: number;
}
export interface SportsTeamRecord { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number }
export interface SportsHeadToHeadRecord {
  teamAId: string; teamBId: string; competitionId?: string;
  matches: Array<{ fixtureId: string; kickoffAt: string; homeTeamId: string; awayTeamId: string; homeScore: number; awayScore: number; recencyRank?: number; recencyWeight?: number }>;
  metrics?: Record<string, unknown>; computedAt: string; sourceRevision: number;
}
export interface SportsCompetitionScoringTotals {
  id: string; competitionId: string; seasonId: string; fixturesPlayed: number;
  totalGoals: number; homeGoals: number; awayGoals: number; averageGoalsPerFixture: number;
  computedAt: string; sourceRevision: number; bttsRate?: number | null;
  over15Rate?: number | null; over25Rate?: number | null; over35Rate?: number | null;
  under25Rate?: number | null; cleanSheetRate?: number | null;
  eventMetrics?: Record<string, unknown>; metrics?: Record<string, unknown>;
}
export interface SportsPlayerEventTotals {
  id: string; athleteId: string; competitionId?: string; seasonId?: string;
  fixturesWithEvents: number; goals: number; assists: number; ownGoals: number;
  yellowCards: number; redCards: number; penaltiesScored: number; penaltiesMissed: number;
  computedAt: string; sourceRevision: number;
}
export interface SportsNumericStatisticAggregate {
  key: string; name: string; category?: string; unit?: string; sampleSize: number;
  total: number; average: number; variance?: number | null; minimum?: number | null; maximum?: number | null;
}
export interface SportsTeamStatisticsAggregate {
  id: string; teamId: string; competitionId: string; seasonId: string;
  fixturesWithStatistics: number; statistics: SportsNumericStatisticAggregate[];
  computedAt: string; sourceRevision: number; scope?: 'SEASON' | 'HOME' | 'AWAY' | 'LAST5' | 'LAST10';
  scopeMetrics?: Record<string, unknown>; metrics?: Record<string, unknown>;
}
export interface SportsTeamScoringRecord {
  id: string; teamId: string; competitionId: string; seasonId: string;
  fixturesPlayed: number; goalsFor: number; goalsAgainst: number;
  averageGoalsFor: number; averageGoalsAgainst: number; cleanSheets: number;
  failedToScore: number; computedAt: string; sourceRevision: number;
  metrics?: Record<string, unknown>;
}

export type SportsReadinessState = 'READY' | 'INSUFFICIENT' | 'MISSING' | 'UNSUPPORTED';
export interface SportsReadinessMeasure {
  state: SportsReadinessState; ready: boolean; sampleSize: number; minimumSampleSize: number;
  quality: number | null; minimumQuality: number; coverageRate?: number | null;
  minimumCoverageRate?: number; reason?: string;
}
export interface SportsStatisticReadiness extends SportsReadinessMeasure {
  key: string; homeSampleSize: number; awaySampleSize: number;
  homeAverage: number | null; awayAverage: number | null;
}
export interface SportsEventReadiness extends SportsReadinessMeasure { eventMatches: number | null }
export interface SportsFixtureReadiness {
  fixtureId: string; competitionId: string; seasonId?: string; checkedAt: string;
  fixtureEligible: boolean; fixtureIneligibleReason?: string;
  scoreMatrix: SportsReadinessMeasure & { homeSampleSize: number; awaySampleSize: number; hasHomeGoalInputs: boolean; hasAwayGoalInputs: boolean; venueProjectionAvailable: boolean; competitionProjectionAvailable: boolean; headToHeadSampleSize: number; recentFormSampleSize: number };
  periodMatrix: SportsReadinessMeasure & { homePeriodObservations: number; awayPeriodObservations: number; observedPeriodSplit: boolean };
  goalOrderMarkets: SportsReadinessMeasure & { firstGoalEmpiricalAdjustmentReady: boolean; lastGoalEmpiricalAdjustmentReady: boolean; homeTimelineSamples: number; awayTimelineSamples: number };
  teamStatistics: Record<string, SportsStatisticReadiness>;
  timeline: SportsReadinessMeasure & { coveredFixtures: number; completedFixtures: number };
  eventMarkets: { redCard: SportsEventReadiness; penaltyAwarded: SportsEventReadiness; ownGoal: SportsEventReadiness };
  playerMarkets: SportsReadinessMeasure & { pricingSupported: false };
  sourceComputedAt: Record<string, string | null>;
}

/** Derived standings row persisted by the Sports projection worker. */
export interface SportsCalculatedStandingMetrics {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  goalDifference: number;
  pointsPerMatch: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
}

export interface SportsCalculatedStanding {
  id: string;
  competitionId: string;
  seasonId: string;
  teamId: string;
  position: number;
  calculatedAt: string;
  sourceFixtureCount: number;
  metrics: SportsCalculatedStandingMetrics;
}

export type SportsNewsScope = 'SOCCER' | 'LEAGUE' | 'SUMMARY';

export interface SportsNewsImage {
  id?: number | string;
  type?: string;
  name?: string;
  caption?: string;
  alt?: string;
  credit?: string;
  width?: number;
  height?: number;
  url: string;
}

/** Normalized article response from GET /sports/v2/news. */
export interface SportsNewsArticle {
  id: string;
  espnArticleId?: number;
  nowId?: string;
  contentKey?: string;
  headline: string;
  description?: string;
  type?: string;
  publishedAt?: string;
  lastModifiedAt?: string;
  expiresAt?: string;
  byline?: string;
  images: SportsNewsImage[];
  categories: Array<Record<string, unknown>>;
  canonicalUrl?: string;
  apiUrl?: string;
  mobileUrl?: string;
  premium: boolean;
  collectionScope: SportsNewsScope;
  collectionScopes: SportsNewsScope[];
  competitionId?: string;
  competitionIds: string[];
  teamIds: string[];
  athleteIds: string[];
  fixtureIds: string[];
  source?: Record<string, unknown>;
  rawPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}


/** Public projection returned by GET /sports/v2/highlights. */
export interface SportsYoutubeHighlightSummary {
  fixtureId: string;
  competitionId?: string;
  homeTeam: string;
  awayTeam: string;
  videoId?: string;
  videoUrl?: string;
  title?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnailUrl?: string;
  searchedAt?: string;
  createdAt?: string;
}

export interface SportsYoutubeHighlightsPage {
  data: SportsYoutubeHighlightSummary[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SportsBootstrapRetryResult {
  queued: number;
  skipped: number;
  runId?: string;
}

/** Exact top-level shape returned by GET /admin/sports/monitor. */
export type SportsOperationalStatus = 'FAILED' | 'DEGRADED' | 'UNKNOWN' | 'HEALTHY';
export type SportsOperationalAlertSeverity = 'WARNING' | 'CRITICAL';

export interface SportsOperationalAlert {
  code: string;
  severity: SportsOperationalAlertSeverity;
  message: string;
  count?: number;
  details?: Record<string, unknown>;
}

export interface SportsOperationalCoverage {
  sampleSize: number;
  sampleLimit?: number;
  covered?: number;
  missing?: number;
  missingOrStale?: number;
  freshSnapshots?: number;
  eligibleFixtureSampleSize?: number;
  coveragePercent: number | null;
  freshnessWindowMs?: number;
  gracePeriodMs?: number;
  failedCollections?: number;
}

export interface SportsOperationalMonitor {
  generatedAt: string;
  status: SportsOperationalStatus;
  message: string;
  cached?: boolean;
  refreshInProgress?: boolean;
  monitor: {
    intervalMs: number;
    cacheTtlMs: number;
    startedAt?: string;
    lastCheckAt?: string;
    lastSuccessfulCheckAt?: string;
    lastCheckError?: string;
  };
  provider: {
    espn: {
      health: SportsOperationalStatus | 'HEALTHY' | 'UNKNOWN';
      requestAttempts?: number;
      consecutiveFailures?: number;
      lastFailedAt?: string;
      cooldownUntil?: string;
      lastFailure?: string;
      [key: string]: unknown;
    };
  };
  worker: {
    workerId?: string;
    initialized?: boolean;
    stopped?: boolean;
    running?: boolean;
    startedAt?: string;
    laneCount?: number;
    laneConcurrency?: number;
    passCount?: number;
    jobsClaimed?: number;
    jobsCompleted?: number;
    jobsRetried?: number;
    jobsQuarantined?: number;
    failedPassCount?: number;
    jobsOwnershipLost?: number;
    recoveredExpiredLeases?: number;
    lastPassStartedAt?: string;
    lastPassCompletedAt?: string;
    lastJob?: Record<string, unknown>;
    lanes?: Record<string, Record<string, unknown>>;
    [key: string]: unknown;
  };
  queue: {
    totalTracked: number;
    byStatus: Record<string, number>;
    duePendingJobs: number;
    oldestDueAt?: string;
    oldestDueAgeMs?: number;
    staleProcessingJobs: number;
    terminalFailuresUpdatedLast24Hours: number;
    latestFailure?: Record<string, unknown> | null;
    dueJobsByType: Record<string, number>;
    derivedRecalculation: {
      pendingDue: number;
      pendingOrProcessing: number;
      failedOrQuarantined: number;
    };
  };
  collection: {
    byStatus: Record<string, number>;
    recentFailuresLast24Hours: number;
    staleProcessingStates: number;
    overdueRecurringStates: number;
    latest: Record<string, unknown>;
    recentFailureSamples: Record<string, unknown>[];
    latestMilestones: Record<string, string | undefined>;
  };
  bootstrap: {
    state: {
      status: string;
      runId?: string;
      currentPhase?: string;
      startedAt?: string;
      completedAt?: string;
      ageMs?: number;
      lastError?: string;
    } | null;
    phaseProgress?: Record<string, unknown>;
    currentSeasons: {
      total: number;
      monthlyBootstrapCompleted: number;
      monthlyBootstrapMissing: number;
      monthlyBootstrapMissingOver24Hours: number;
      missingDateRanges: number;
      incompleteDailyValidationsLast14Days: number;
    };
  };
  fixtures: {
    competitions: number;
    total: number;
    upcomingWithin60Hours: number;
    live: number;
    completedLast14Days: number;
    latestCompletedAt?: string;
    latestFixtureUpdatedAt?: string;
  };
  timeline: {
    totalEvents: number;
    recentCompletedFixtureCoverage: SportsOperationalCoverage;
  };
  oddsSnapshots: {
    total: number;
    latestCollectedAt?: string;
    latestProvider?: string;
    latestFixtureId?: string;
    upcomingCoverage: SportsOperationalCoverage;
  };
  derivedData: {
    latestCalculatedAt?: string;
    latestCompletedFixtureAt?: string;
    lagMs: number | null;
    stale: boolean;
    projections: Record<string, Record<string, unknown> | null>;
    freshness: {
      requiredStores: number;
      missingStores: number;
      missing: string[];
      staleStores: number;
      stale: string[];
      oldestCalculatedAt?: string;
      latestCompletedFixtureAt?: string;
    };
    pendingOrProcessingJobs: number;
    failedOrQuarantinedJobs: number;
  };
  sourceOutbox: {
    byStatus: Record<string, number>;
    expiredProcessingLeases: number;
    failedEvents: number;
    oldestPendingEvent?: Record<string, unknown> | null;
  };
  downstream: Record<string, unknown>;
  alerts: SportsOperationalAlert[];
  summary: {
    criticalAlerts: number;
    warningAlerts: number;
    totalAlerts: number;
    queuePending: number;
    queueProcessing: number;
    queueQuarantined: number;
    collectionFailures: number;
    outboxPending: number;
  };
}

