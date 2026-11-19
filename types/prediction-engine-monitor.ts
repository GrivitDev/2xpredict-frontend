/** Wire contracts returned by the NestJS Predictions Engine monitoring routes. */

export type PredictionMarketKey =
  | 'MATCH_RESULT'
  | 'DOUBLE_CHANCE'
  | 'DRAW_NO_BET'
  | 'HALF_TIME_RESULT'
  | 'SECOND_HALF_RESULT'
  | 'HALF_TIME_FULL_TIME'
  | 'FIRST_HALF_DOUBLE_CHANCE'
  | 'FIRST_HALF_DRAW_NO_BET'
  | 'GOALS_OVER_UNDER'
  | 'EXACT_TOTAL_GOALS'
  | 'TOTAL_GOALS_RANGE'
  | 'ODD_EVEN_TOTAL_GOALS'
  | 'BOTH_TEAMS_TO_SCORE'
  | 'BOTH_TEAMS_TO_SCORE_FIRST_HALF'
  | 'BOTH_TEAMS_TO_SCORE_SECOND_HALF'
  | 'HOME_TEAM_GOALS_OVER_UNDER'
  | 'AWAY_TEAM_GOALS_OVER_UNDER'
  | 'GOAL_IN_BOTH_HALVES'
  | 'HOME_TEAM_TO_SCORE_IN_BOTH_HALVES'
  | 'AWAY_TEAM_TO_SCORE_IN_BOTH_HALVES'
  | 'CORRECT_SCORE'
  | 'HALF_TIME_CORRECT_SCORE'
  | 'ASIAN_HANDICAP'
  | 'EUROPEAN_HANDICAP'
  | 'HALF_TIME_EUROPEAN_HANDICAP'
  | 'WIN_TO_NIL'
  | 'CLEAN_SHEET'
  | 'TEAM_TO_SCORE_FIRST'
  | 'TEAM_TO_SCORE_LAST'
  | 'WIN_MARGIN'
  | 'BOTH_TEAMS_TO_SCORE_AND_RESULT'
  | 'BOTH_TEAMS_TO_SCORE_AND_TOTAL_GOALS'
  | 'HOME_WIN_EITHER_HALF'
  | 'AWAY_WIN_EITHER_HALF'
  | 'MOST_GOALS_HALF'
  | 'FIRST_HALF_GOALS_OVER_UNDER'
  | 'SECOND_HALF_GOALS_OVER_UNDER'
  | 'TOTAL_CORNERS_OVER_UNDER'
  | 'CORNER_MATCH_RESULT'
  | 'HOME_CORNERS_OVER_UNDER'
  | 'AWAY_CORNERS_OVER_UNDER'
  | 'TOTAL_CARDS_OVER_UNDER'
  | 'TOTAL_YELLOW_CARDS_OVER_UNDER'
  | 'TOTAL_RED_CARDS_OVER_UNDER'
  | 'HOME_TEAM_CARDS_OVER_UNDER'
  | 'AWAY_TEAM_CARDS_OVER_UNDER'
  | 'TOTAL_SHOTS_OVER_UNDER'
  | 'TOTAL_SHOTS_ON_TARGET_OVER_UNDER'
  | 'HOME_SHOTS_ON_TARGET_OVER_UNDER'
  | 'AWAY_SHOTS_ON_TARGET_OVER_UNDER'
  | 'TOTAL_OFFSIDES_OVER_UNDER'
  | 'TOTAL_FOULS_OVER_UNDER'
  | 'POSSESSION_OVER_UNDER'
  | 'PLAYER_ANYTIME_GOALSCORER'
  | 'PLAYER_FIRST_GOALSCORER'
  | 'PLAYER_LAST_GOALSCORER'
  | 'PLAYER_TO_SCORE_TWO_OR_MORE'
  | 'PLAYER_TO_ASSIST'
  | 'PLAYER_SHOTS_ON_TARGET'
  | 'PLAYER_TO_BE_BOOKED'
  | 'PLAYER_TO_BE_SENT_OFF'
  | 'PENALTY_AWARDED'
  | 'OWN_GOAL_SCORED'
  | 'ASIAN_TOTAL_GOALS'
  | 'HOME_TEAM_TO_SCORE'
  | 'AWAY_TEAM_TO_SCORE'
  | 'HOME_TEAM_CLEAN_SHEET'
  | 'AWAY_TEAM_CLEAN_SHEET'
  | 'HOME_TEAM_TO_WIN_TO_NIL'
  | 'AWAY_TEAM_TO_WIN_TO_NIL'
  | 'HALF_TIME_GOALS_ODD_EVEN'
  | 'HOME_TEAM_CORNERS_OVER_UNDER'
  | 'AWAY_TEAM_CORNERS_OVER_UNDER'
  | 'TOTAL_CORNERS_ODD_EVEN'
  | 'TOTAL_CARDS_ODD_EVEN'
  | 'RED_CARD'
  | 'PLAYER_SHOTS_OVER_UNDER'
  | 'PLAYER_SHOTS_ON_TARGET_OVER_UNDER';

export type PredictionQueueStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'RETRY'
  | 'WAITING_FOR_ODDS'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export type PredictionRunStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export type PredictionEventLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export type PredictionEngineEventType =
  | 'ENGINE_STARTED'
  | 'ENGINE_STOPPED'
  | 'QUEUE_SYNCED'
  | 'QUEUE_CLAIMED'
  | 'PREDICTION_STARTED'
  | 'PREDICTION_COMPLETED'
  | 'PREDICTION_PARTIAL'
  | 'PREDICTION_FAILED'
  | 'PREDICTION_SKIPPED'
  | 'MARKET_UNAVAILABLE'
  | 'PICK_CENTER_UPDATED'
  | 'SLIP_CREATED'
  | 'CURATED_REFRESHED'
  | 'SLIP_REFRESHED'
  | 'PRODUCT_REFRESH_FAILED'
  | 'RETRY_SCHEDULED'
  | 'DATA_QUALITY_WARNING'
  | 'CALIBRATION_UPDATED'
  | 'ADMIN_ACTION';

export type PredictionOperationStatus = 'RUNNING' | 'HEALTHY' | 'DEGRADED' | 'UNKNOWN';

export interface PredictionOperationRuntime {
  name: string;
  status: PredictionOperationStatus;
  activeRuns: number;
  runs: number;
  failures: number;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastSuccessAt?: string;
  lastDurationMs?: number;
  lastError?: string;
  lastDetails?: Record<string, unknown>;
}

export interface PredictionEngineAlert {
  code: string;
  severity: 'WARNING' | 'ERROR';
  message: string;
  operation?: string;
}

export interface PredictionEngineQueueRecord {
  _id?: string;
  __v?: number;
  eventId: string;
  leagueId: string;
  fixtureDate: string;
  status: PredictionQueueStatus;
  priority: number;
  lockToken?: string;
  attempts: number;
  availableAt: string;
  lockedAt?: string;
  completedAt?: string;
  retentionExpiresAt?: string | null;
  summaryCollectedAt?: string;
  lastProcessedSummaryAt?: string;
  fixtureSourceRevision?: number;
  lastProcessedFixtureSourceRevision?: number;
  oddsUpdatedAt?: string;
  lastProcessedOddsAt?: string;
  modelVersion?: string;
  scoreSnapshot?: string;
  lastProcessedScoreSnapshot?: string;
  reason: string;
  errorMessage?: string;
  processingDurationMs?: number;
  refreshCount: number;
  refreshRequestedAt?: string;
  refreshRequestedReason?: string;
  sourceChangeEventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PredictionEngineRunRecord {
  _id?: string;
  __v?: number;
  runId: string;
  eventId: string;
  leagueId: string;
  fixtureDate: string;
  retentionExpiresAt?: string | null;
  status: PredictionRunStatus;
  modelVersion: string;
  fixtureSourceRevision: number;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  totalMarkets: number;
  calculatedMarkets: number;
  partialMarkets: number;
  unavailableMarkets: number;
  failedMarkets: number;
  totalSelections: number;
  calculatedSelections: number;
  persistedMarketDocuments: number;
  preservedMarketDocuments: number;
  persistenceBatches: number;
  generalConfidence?: number;
  expectedHomeGoals?: number;
  expectedAwayGoals?: number;
  oddsCoverage?: number;
  dataQuality?: number;
  diagnostics: string[];
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PredictionEngineEventRecord {
  _id?: string;
  __v?: number;
  level: PredictionEventLevel;
  type: PredictionEngineEventType;
  eventId?: string;
  runId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketCalibrationRecord {
  _id?: string;
  __v?: number;
  marketKey: string;
  modelVersion: string;
  sampleSize: number;
  averagePredictedProbability?: number;
  observedSuccessRate?: number;
  brierScore?: number;
  calibrationError?: number;
  logLoss?: number;
  probabilityAdjustment: number;
  calibrationIntercept: number;
  calibrationSlope: number;
  reliabilityScore: number;
  active: boolean;
  lastCalculatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketCalibrationRebuildResult {
  marketKey: string;
  modelVersion: string;
  sampleSize: number;
  averagePredictedProbability?: number;
  observedSuccessRate?: number;
  brierScore?: number;
  expectedCalibrationError?: number;
  logLoss?: number;
  reliabilityScore: number;
  calibrationIntercept: number;
  calibrationSlope: number;
  active: boolean;
  probabilityAdjustment: number;
  note: string;
  saved?: MarketCalibrationRecord | null;
}

export type RebuildCalibrationResult =
  | MarketCalibrationRebuildResult
  | MarketCalibrationRebuildResult[];

export interface PredictionQueueSyncResult {
  scannedFixtures: number;
  eligibleFixtures: number;
  enqueued: number;
  refreshed: number;
  missingSummary: number;
  oddsNotReady?: number;
}

export interface PredictionQueueRecoveryResult {
  recovered: number;
}

export interface PredictionQueueRunNextResult {
  processed: boolean;
  eventId?: string;
}

export interface AutomaticSlipRefreshResult {
  createdOrUpdated: number;
  skipped: number;
  inProgress?: boolean;
}

export interface MarketSelectionCatalogDefinition {
  key: string;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
}

export type MarketSelectionMode =
  | 'STATIC'
  | 'OVER_UNDER'
  | 'EXACT_TOTAL'
  | 'CORRECT_SCORE'
  | 'ASIAN_HANDICAP'
  | 'EUROPEAN_HANDICAP'
  | 'BTTS_TOTAL'
  | 'POSSESSION'
  | 'PLAYER';

export interface MarketSelectionTemplate {
  keyPatterns: string[];
  jsonVariablePatterns: string[];
  fullNamePatterns: string[];
  abbreviationPatterns: string[];
  condition?: string;
}

export interface MarketCatalogDefinition {
  key: PredictionMarketKey;
  jsonVariable: string;
  fullName: string;
  abbreviation: string;
  family: 'RESULT' | 'GOALS' | 'PERIOD' | 'HANDICAP' | 'STATISTICS' | 'PLAYER' | 'COMBINATIONS' | 'SPECIAL' | 'EVENTS';
  model: 'SCORE_MATRIX' | 'PERIOD_MATRIX' | 'COUNT_MODEL' | 'PLAYER_MODEL' | 'PLAYER_EVENT_MODEL' | 'EVENT_RATE';
  selectionMode: MarketSelectionMode;
  period: 'FULL_TIME' | 'FIRST_HALF' | 'SECOND_HALF';
  selections: MarketSelectionCatalogDefinition[];
  selectionTemplates?: MarketSelectionTemplate[];
  lines?: number[];
  notes?: string;
  entityType?: 'ATHLETE';
  pricingEnabled?: boolean;
  requiredData?: string[];
  minimumSampleSize?: number;
}

export interface PredictionEngineMarketSummary {
  marketKey: string;
  marketName: string;
  documents: number;
  calculated: number;
  unavailable: number;
  selections: number;
  calculatedSelections: number;
  unavailableSelections: number;
  finalSelections: number;
  oddsReadySelections: number;
  providerPricedSelections: number;
  estimatedPricedSelections: number;
  averageProbability: number | null;
  averageConfidence: number | null;
  averageFinalProbability: number | null;
  averageFinalConfidence: number | null;
  averageFinalDataQuality: number | null;
  averageFinalSafetyScore: number | null;
  averageFinalCalibrationReliability: number | null;
  averageFinalDecimalOdds: number | null;
  averageFinalExpectedValuePercent: number | null;
}

export interface PredictionEngineDashboard {
  generatedAt: string;
  runtime?: {
    operations: PredictionOperationRuntime[];
    alerts: PredictionEngineAlert[];
  };
  engine: {
    enabled: boolean;
    workerRunning: boolean;
    modelVersion: string;
    timingGate: 'ODDS_READINESS';
    lastQueueSyncAt?: string;
    lastSuccessfulRunAt?: string;
    lastFailedRunAt?: string;
    lastError?: string;
    lastProductRefreshAt?: string;
    lastCuratedRefreshAt?: string;
    lastSlipRefreshAt?: string;
    lastCalibrationRefreshAt?: string;
    productRefreshIntervalMs: number;
  };
  fixtures: {
    upcoming: number;
    eligibleWithSummary: number;
    upcomingMissingSummary: number;
    live: number;
    completed: number;
  };
  predictions: {
    marketDocuments: number;
    calculatedMarketDocuments: number;
    partialMarketDocuments: number;
    unavailableMarketDocuments: number;
    failedMarketDocuments: number;
    selections: number;
    calculatedSelections: number;
    eligibleRecommendations: number;
    modelVersion: string;
    selectedPickCenterMarkets: number;
    rankedPickCenterMarkets: number;
    /** @deprecated Backend compatibility alias; reports ranked records, not publication. */
    publishedPickCenterMarkets: number;
  };
  queue: {
    pending: number;
    processing: number;
    retry: number;
    waitingForOdds: number;
    completed: number;
    failed: number;
    skipped: number;
    oldestPendingAt?: string;
  };
  runs: {
    total: number;
    completed: number;
    partial: number;
    failed: number;
    averageDurationMs: number;
    last24Hours: number;
  };
  curatedPredictions: {
    total: number;
    ready: number;
    published: number;
    settled: number;
    cancelled: number;
    upcomingWithin48Hours: number;
    live: number;
    missingForEligiblePickCenterFixtures: number;
    lastRefresh: {
      matchesScanned: number;
      eligibleFixtures: number;
      created: number;
      updated: number;
      skipped: number;
      riskRejected: number;
      oneSelectionMatches: number;
      twoSelectionMatches: number;
      threeSelectionMatches: number;
      publishedRecordsSupplemented?: number;
      publishedRecordsReconciled?: number;
      skipReasonCounts?: Record<string, number>;
      status?: string;
      durationMs?: number;
      minimumProbability?: number;
      minimumConfidence?: number;
      minimumDataQuality?: number;
      minimumSafetyScore?: number;
      error?: string;
    };
  };
  slips: {
    total: number;
    ready: number;
    published: number;
    automaticActive: number;
    sureOddsPublished: number;
    generatedToday: number;
    lastRefresh: {
      createdOrUpdated: number;
      skipped: number;
      fixtureCandidates: number;
      eligibleFixtures: number;
      eligibleFixtureDays?: number;
      eligibleEvents?: number;
      pickCenterEventsWithoutEligibleSelections?: number;
      pickCenterEventIdsWithoutEligibleSelections?: string[];
      coveredEvents?: number;
      coverageEventsRequired?: number;
      coverageEventsSatisfied?: number;
      coverageEventIdsMissing?: string[];
      coverageDatesRequired?: number;
      coverageDatesSatisfied?: number;
      coverageDatesMissing?: string[];
      coverageSlipsCreated?: number;
      sameDayFixtureCombinationProhibited?: boolean;
      sameDayFixturesAllowed?: boolean;
      crossDateCombinationsAllowed?: boolean;
      maximumSelectionsPerMatch?: number;
      publishedProductsToday?: number;
      publishedProductsTomorrow?: number;
      targetDateTodayKey?: string;
      targetDateTomorrowKey?: string;
      todayTarget?: number;
      tomorrowTarget?: number;
      todayRemaining?: number;
      tomorrowRemaining?: number;
      status?: string;
      durationMs?: number;
      minimumProbability?: number;
      minimumConfidence?: number;
      minimumDataQuality?: number;
      minimumSafetyScore?: number;
      error?: string;
    };
    withSportyBetCode: number;
    withoutSportyBetCode: number;
  };
  marketEngineWindow: {
    coverageScope: 'ALL_RETAINED_UPCOMING_FIXTURES';
    fixtures: number;
    withSummary: number;
    missingSummary: number;
    waitingForOdds: number;
  };
  calibration: {
    lastCycleStatus?: string;
    lastRefreshAt?: string;
    lastError?: string;
    marketsRefreshedLastCycle: number;
    activeMarketsLastCycle: number;
    markets: Array<{
      marketKey: string;
      sampleSize: number;
      active: boolean;
      reliabilityScore: number | null;
      brierScore: number | null;
      calibrationError: number | null;
      logLoss: number | null;
    }>;
  };
  generationWindows: {
    marketEnginesCoverageScope: 'ALL_RETAINED_UPCOMING_FIXTURES';
    curatedAndSlipForwardHours: number;
    includeLiveFixtures: boolean;
    oddsModuleReadinessRequired: boolean;
    pickCenterUsesFixtureTimeWindow: false;
  };
  quality: {
    averageConfidence: number | null;
    averageProbability: number | null;
    averageExpectedValuePercent: number | null;
    averageDataQuality: number | null;
    averageSafetyScore: number | null;
    averageCalibrationReliability: number | null;
    providerPricedSelections: number;
    estimatedPricedSelections: number;
    oddsReadySelections: number;
    calibrationAppliedSelections: number;
    recommendationEligibleSelections: number;
    missingOddsFixtures: number;
    missingHistoricalEvidenceFixtures: number;
    staleSummaries: number;
    calibrationMarkets: number;
    calibratedMarkets: number;
    calibrationSettledSelections: number;
    meanBrierScore: number | null;
    meanCalibrationError: number | null;
    meanCalibrationReliability: number | null;
    meanLogLoss: number | null;
  };
  markets: PredictionEngineMarketSummary[];
  recentEvents: PredictionEngineEventRecord[];
}

/** @deprecated Kept for legacy table/payload renderers; use the concrete records above. */
export type MonitorRecord = Record<string, unknown>;
