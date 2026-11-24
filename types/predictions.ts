import type { PageResult } from '@/types/common';

export type PredictionAccessPlan = 'anonymous' | 'free' | 'regular' | 'vip' | 'premium';
export type AdminPredictionAccessPlan = PredictionAccessPlan | 'admin';
export type PredictionMarketStatus = 'CALCULATED' | 'PARTIAL' | 'UNAVAILABLE' | 'FAILED';
export type PredictionOutcome = 'PENDING' | 'WON' | 'LOST' | 'VOID' | 'PUSH' | 'HALF_WON' | 'HALF_LOST';
export type CuratedPredictionStatus = 'READY' | 'PUBLISHED' | 'SETTLED' | 'CANCELLED';
export type CuratedPredictionOutcome = PredictionOutcome;
export type PredictionSettlementPhase = 'IN_PLAY' | 'HALF_TIME' | 'FULL_TIME';
export type PredictionOddsProvider = 'ESPN' | 'THE_ODDS_API';
export type PredictionOddsBasis = 'BOOKMAKER_ONLY' | 'BOOKMAKER_PLUS_HISTORY' | 'HISTORICAL_ONLY' | 'PRIOR_ONLY' | null;
export type ActiveSlipProductType = 'ODDS_10' | 'ODDS_25' | 'ODDS_50' | 'SURE_ODDS';
export type HistoricalSlipProductType = 'STANDARD' | 'MEDIUM_ODDS' | 'HIGH_ODDS' | 'EXTENDED_ODDS' | 'UNLIMITED_ODDS';
/** Stored/admin records may contain legacy IDs; new build requests must use ActiveSlipProductType. */
export type SlipProductType = ActiveSlipProductType | HistoricalSlipProductType;
export type SureOddsTier = 'VIP' | 'PREMIUM';
export type SureOddsProduct = 'SURE_2' | 'SURE_5' | 'SURE_7';
export type PredictionPriceType = 'PROVIDER' | 'ESTIMATED';
export type PredictionOddsSource = 'PROVIDER' | 'ESTIMATED';

export type PredictionMarketFamily =
  | 'RESULT'
  | 'GOALS'
  | 'PERIOD'
  | 'HANDICAP'
  | 'STATISTICS'
  | 'PLAYER'
  | 'EVENTS';
export type PredictionMarketDiversity = 'LIMITED' | 'EXPANDED' | 'FULL';
export type PredictionSlipProductId = 'ODDS_10' | 'ODDS_25' | 'ODDS_50';

export interface PredictionMarketAccessDiversity {
  level: PredictionMarketDiversity;
  strategy?: string;
  visibleFamilies: PredictionMarketFamily[];
  visibleFamilyCount: number;
  lockedFamilies: PredictionMarketFamily[];
  lockedFamilyCount: number;
  totalMarketFamilies: number;
}

/** Access metadata returned by PredictionAccessService for Pick Center/Curated responses. */
export interface PredictionMarketAccessSummary {
  mode: string;
  marketLimit: number | null;
  visibleMarketTypeCount: number;
  totalPricingEnabledMarketTypes: number;
  lockedMarketTypeCount: number;
  marketSelectionDiversity?: PredictionMarketAccessDiversity;
  visibleMarketKeys: string[];
  marketKeysAreFixtureSpecific?: boolean;
  settledOutcomesPublic?: boolean;
}

export interface PredictionDailyLeagueAccessDay {
  date: string;
  totalActiveLeagues: number;
  accessibleLeagues: number;
  lockedLeagues: number;
}
export interface PredictionDailyLeagueAccessSummary {
  mode: 'DAILY_ACTIVE_LEAGUE_ALLOCATION';
  percentage: number;
  basis: string;
  totalActiveLeagueDays: number;
  accessibleLeagueDays: number;
  days: PredictionDailyLeagueAccessDay[];
}
export interface PredictionSettledPublicAccess {
  mode: 'SETTLED_PUBLIC';
  percentage: 100;
}
export type PredictionLeagueAccessSummary =
  | PredictionDailyLeagueAccessSummary
  | PredictionSettledPublicAccess;

export interface PredictionAccessTierRule {
  settledPredictionHistory?: boolean;
  browseFixturesAndLeagues?: boolean;
  activePickCenter?: {
    leagueAccessPercentage?: number;
    allocationBasis?: string;
    mode?: string;
    predictionVisibility?: 'FULL' | 'LIMITED' | string;
    marketAccess?: PredictionMarketAccessSummary;
    [key: string]: unknown;
  };
  curatedPredictionCenter?: {
    allowed?: boolean;
    settledPublic?: boolean;
    leagueAccessPercentage?: number;
    mode?: string;
    marketAccess?: PredictionMarketAccessSummary;
    [key: string]: unknown;
  };
  slipProducts?: PredictionSlipProductId[];
  sureOdds?: SureOddsProduct[];
  marketAccess?: PredictionMarketAccessSummary;
  [key: string]: unknown;
}

export interface PredictionSlipProductPolicy {
  minOdds: number;
  maxOdds: number;
  requiredPlan: Exclude<PredictionAccessPlan, 'anonymous' | 'free'>;
}
export interface SureOddsProductPolicy {
  minOdds: number;
  maxOdds: number;
  requiredPlan: Exclude<PredictionAccessPlan, 'anonymous' | 'free'>;
  dailyTarget?: number;
  [key: string]: unknown;
}
export interface PredictionSureOddsPolicy {
  vipDailyTarget?: number;
  premiumDailyTarget?: number;
  products?: Partial<Record<SureOddsProduct, SureOddsProductPolicy>>;
  minimumProbability?: number;
  minimumConfidence?: number;
  [key: string]: unknown;
}

export interface PredictionAccessPolicy {
  anonymousActivePredictions?: string[];
  freeActivePredictions?: string[];
  regularActivePredictions?: string[];
  vipActivePredictions?: string[];
  premiumActivePredictions?: string[];
  publicSettledPredictions?: boolean;
  marketPageSize?: number;
  maximumMarketPageSize?: number;
  maximumPickCenterMatches?: number;
  marketVisibility?: Partial<Record<PredictionAccessPlan, { limit: number | null; diversity: PredictionMarketDiversity }>>;
  curatedMarketVisibility?: Partial<Record<PredictionAccessPlan, {
    limit: number | null;
    marketKeys: string[];
    families: PredictionMarketFamily[];
    diversity: PredictionMarketDiversity;
  }>>;
  leagueVisibility?: Partial<Record<PredictionAccessPlan, number>>;
  curatedLeagueVisibility?: Partial<Record<PredictionAccessPlan, number>>;
  enabledMarketCount?: number;
  enabledMarketFamilyCount?: number;
  slipProducts?: Partial<Record<PredictionSlipProductId, PredictionSlipProductPolicy>>;
  sureOdds?: PredictionSureOddsPolicy;
  planRank?: Partial<Record<PredictionAccessPlan, number>>;
  rules?: Partial<Record<PredictionAccessPlan, PredictionAccessTierRule>> & Record<string, unknown>;
  [key: string]: unknown;
}

export interface PredictionAccessMeta {
  allowed?: boolean;
  published?: boolean;
  plan?: PredictionAccessPlan;
  priority?: string;
  mode?: string;
  marketLimit?: number | null;
  requiredPlan?: PredictionAccessPlan | null;
  reason?: string;
  leagueId?: string;
  visiblePickCenterMarketCount?: number;
  predictionVisibility?: 'FULL' | 'LIMITED' | string;
  leagueAccessPercentage?: number;
  marketSelectionDiversity?: PredictionMarketAccessDiversity;
  settledOutcomesPublic?: boolean;
  allSettledMarketsPublic?: boolean;
}

export interface MarketSelection {
  key: string;
  jsonVariable?: string;
  fullName?: string;
  abbreviation?: string;
  line?: number;
  handicap?: number;
  subjectId?: string;
  subjectName?: string;
  probability?: number | null;
  probabilityPercent?: number | null;
  confidence?: number | null;
  evidenceConfidence?: number | null;
  fairOdds?: number | null;
  bookmakerOdds?: number | null;
  decimalOdds?: number | null;
  priceType?: PredictionPriceType;
  oddsPredictionReady?: boolean;
  oddsUpdatedAt?: string | null;
  oddsBasis?: Exclude<PredictionOddsBasis, null>;
  oddsCalculationMethod?: string;
  oddsProvider?: PredictionOddsProvider;
  bookmaker?: string;
  expectedValue?: number | null;
  expectedValuePercent?: number | null;
  dataQuality?: number | null;
  rawProbability?: number | null;
  calibrationReliability?: number;
  calibrationSampleSize?: number;
  calibrationApplied?: boolean;
  safetyScore?: number;
  status?: PredictionMarketStatus;
  sources?: string[];
  calculationMethod?: string;
  settlementProfile?: { fullWin?: number; halfWin?: number; push?: number; halfLoss?: number; fullLoss?: number };
  actualOutcome?: PredictionOutcome | null;
  settlementPhase?: PredictionSettlementPhase;
  settledAt?: string | null;
  diagnostics?: string[];
  [key: string]: unknown;
}

export interface MarketPrediction {
  _id: string;
  eventId: string;
  leagueId: string;
  fixtureDate: string;
  homeTeamName: string;
  awayTeamName: string;
  marketKey: string;
  marketName: string;
  marketAbbreviation?: string;
  family?: string;
  period?: string;
  model?: string;
  status: PredictionMarketStatus;
  selections: MarketSelection[];
  sources?: string[];
  calculationMethod?: string;
  unavailableReason?: string;
  diagnostics?: string[];
  dataQuality?: number;
  access?: PredictionAccessMeta;
  settled?: boolean;
  source?: string;
  [key: string]: unknown;
}

export interface PickCenterSelection {
  marketPredictionId: string;
  marketKey: string;
  marketName: string;
  marketAbbreviation: string;
  selectionKey: string;
  selectionName: string;
  selectionAbbreviation: string;
  line?: number;
  subjectId?: string;
  subjectName?: string;
  probability: number;
  probabilityPercent: number;
  fairOdds: number;
  decimalOdds?: number;
  bookmakerOdds?: number;
  priceType?: PredictionPriceType;
  oddsPredictionReady?: boolean;
  oddsUpdatedAt?: string;
  oddsBasis?: Exclude<PredictionOddsBasis, null>;
  oddsCalculationMethod?: string;
  oddsProvider?: PredictionOddsProvider;
  bookmaker?: string;
  expectedValue?: number;
  expectedValuePercent?: number;
  dataQuality?: number;
  calibrationReliability?: number;
  calibrationSampleSize?: number;
  safetyScore?: number;
  valueRatio?: number;
  marketPriority?: number;
  recommendationEligible?: boolean;
  confidence: number;
  /** Separate engine evidence score; confidence remains the published 0–98 value. */
  evidenceConfidence?: number;
  rankingScore: number;
  rank?: number;
  isMatchResult: boolean;
  reasons: string[];
  settlementStatus?: PredictionOutcome;
  actualOutcome?: PredictionOutcome | null;
  settlementPhase?: PredictionSettlementPhase;
  settledAt?: string;
}

export interface PickCenterRecord {
  _id?: string;
  eventId: string;
  leagueId: string;
  leagueName?: string;
  leagueLogo?: string | null;
  leaguePriority?: string;
  isPriorityLeague?: boolean;
  fixtureDate: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  status: string;
  selectedMarkets: PickCenterSelection[];
  eligibleMarketCount: number;
  selectedMarketCount: number;
  visibleMarketCount?: number;
  generalConfidence?: number;
  published?: boolean;
  publishedAt?: string;
  exclusionReason?: string;
  modelVersion: string;
  access?: PredictionAccessMeta;
  createdAt?: string;
  updatedAt?: string;
}

export interface CuratedPredictionSelection {
  eventId: string;
  leagueId: string;
  leagueName: string;
  fixtureDate: string;
  homeTeamName: string;
  awayTeamName: string;
  marketPredictionId: string;
  marketKey: string;
  marketName: string;
  selectionKey: string;
  selectionName: string;
  probability: number;
  /** Published confidence score, in the backend's 0–98 range. */
  confidence: number;
  priceType?: PredictionPriceType;
  predictionReady?: boolean;
  decimalOdds?: number;
  fairOdds?: number;
  oddsUpdatedAt?: string;
  oddsBasis?: Exclude<PredictionOddsBasis, null>;
  oddsCalculationMethod?: string;
  oddsProvider?: PredictionOddsProvider;
  bookmaker?: string;
  bookmakerOdds?: number;
  expectedValue?: number;
  expectedValuePercent?: number;
  dataQuality?: number;
  modelVersion?: string;
  settlementProfile?: { fullWin?: number; halfWin?: number; push?: number; halfLoss?: number; fullLoss?: number };
  rankingScore?: number;
  settlementOutcome: CuratedPredictionOutcome;
  matchSettlementStatus: CuratedPredictionOutcome;
  settledAt?: string;
  settlementPhase?: PredictionSettlementPhase;
}

export interface CuratedPrediction {
  _id: string;
  predictionCode: string;
  generatedDateKey: string;
  title: string;
  status: CuratedPredictionStatus;
  selections: CuratedPredictionSelection[];
  selectionCount: number;
  combinedProbability: number;
  combinedOdds: number;
  confidence: number;
  combinedProbabilityMethod: string;
  settlementStatus: CuratedPredictionOutcome;
  live?: boolean;
  completed?: boolean;
  retentionExpiresAt?: string | null;
  fixtureDateFrom?: string;
  fixtureDateTo?: string;
  publishedAt?: string;
  settledAt?: string;
  diagnostics: string[];
  createdAt?: string;
  updatedAt?: string;
  accessPlan?: PredictionAccessPlan;
  [key: string]: unknown;
}

export interface PredictionSlipLeg {
  eventId: string;
  leagueId?: string;
  homeTeamName: string;
  awayTeamName: string;
  fixtureDate: string;
  marketPredictionId: string;
  marketKey: string;
  marketName: string;
  selectionKey: string;
  selectionName: string;
  probability: number;
  confidence: number;
  fairOdds: number;
  decimalOdds: number;
  bookmakerOdds?: number;
  priceType: PredictionPriceType;
  oddsPredictionReady?: boolean;
  oddsUpdatedAt?: string;
  oddsBasis?: Exclude<PredictionOddsBasis, null>;
  oddsCalculationMethod?: string;
  oddsProvider?: PredictionOddsProvider;
  bookmaker?: string;
  expectedValue?: number;
  expectedValuePercent?: number;
  dataQuality?: number;
  modelVersion?: string;
  settlementProfile?: { fullWin?: number; halfWin?: number; push?: number; halfLoss?: number; fullLoss?: number };
  line?: number;
  subjectId?: string;
  subjectName?: string;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  leagueLogo?: string | null;
  leagueName?: string;
  leagueCountry?: string | null;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  /** Optional provider summary retained for fixture presentation fallbacks. */
  summary?: unknown;
  country?: string | null;
  settlementOutcome?: PredictionOutcome;
  matchSettlementStatus?: PredictionOutcome;
  settledAt?: string;
  settlementPhase?: PredictionSettlementPhase;
}

export interface PredictionSlip {
  _id: string;
  slipCode: string;
  name: string;
  status: 'DRAFT' | 'READY' | 'PUBLISHED' | 'CANCELLED';
  settlementStatus: PredictionOutcome;
  settledAt?: string;
  legs: PredictionSlipLeg[];
  legCount: number;
  combinedProbability: number;
  combinedFairOdds: number;
  combinedProbabilityMethod?: string;
  combinedOdds?: number;
  odds?: number | null;
  productType: SlipProductType;
  requiredPlan: 'regular' | 'vip' | 'premium';
  sureOddsTier?: SureOddsTier;
  sureOdds?: boolean;
  automatic: boolean;
  fixtureDateFrom?: string;
  fixtureDateTo?: string;
  publishedAt?: string;
  sportyBetSlipCode?: string;
  sportyBetSlipLink?: string;
  averageConfidence: number;
  generalConfidence?: number;
  retentionExpiresAt?: string | null;
  targetDateKey?: string;
  generatedDateKey?: string;
  sureOddsProduct?: SureOddsProduct;
  targetOddsMinimum?: number;
  targetOddsMaximum?: number;
  minimumLegProbability?: number;
  diagnostics?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Restricted slips are returned as metadata-only previews by the access API.
 * They deliberately do not include legs, prices or selection details.
 */
export interface LockedPredictionSlipPreview {
  _id: string;
  slipId: string;
  productType?: SlipProductType | string;
  sureOdds?: boolean;
  sureOddsProduct?: SureOddsProduct | null;
  sureOddsTier?: SureOddsTier | null;
  fixtureDateFrom?: string | null;
  generatedDateKey?: string | null;
  createdAt?: string | null;
  status: 'DRAFT' | 'READY' | 'PUBLISHED' | 'CANCELLED' | string;
  locked: true;
  accessAllowed: false;
  requiredPlan: Exclude<PredictionAccessPlan, 'anonymous' | 'free'>;
  access: {
    allowed: false;
    plan: PredictionAccessPlan;
    requiredPlan: Exclude<PredictionAccessPlan, 'anonymous' | 'free'>;
    reason: string;
  };
  /** These optional fields are absent from backend locked previews. */
  name?: string;
  settlementStatus?: PredictionOutcome;
  legs?: PredictionSlipLeg[];
  legCount?: number;
  combinedProbability?: number;
  combinedFairOdds?: number;
  combinedOdds?: number;
  odds?: number | null;
  averageConfidence?: number;
  generalConfidence?: number;
  [key: string]: unknown;
}

export type PredictionSlipListItem = PredictionSlip | LockedPredictionSlipPreview;

export interface PredictionLeagueSummaryLeague {
  id: string;
  name: string;
  logo?: string | null;
  count: number;
  accessiblePredictionCount?: number;
  lockedPredictionCount?: number;
  dateCount?: number;
  locked: boolean;
  partiallyLocked?: boolean;
  lockedCount?: number;
  requiredPlan?: PredictionAccessPlan | null;
  priority?: string;
}

export interface PredictionLeagueSummaryCountry {
  name: string;
  count: number;
  predictionLeagueCount: number;
  locked: boolean;
  lockedLeagueCount: number;
  requiredPlan?: PredictionAccessPlan | null;
  leagues: PredictionLeagueSummaryLeague[];
}

export interface PredictionLeagueSummary {
  countries: PredictionLeagueSummaryCountry[];
  totalLeagues?: number;
  totalPredictions?: number;
  access?: PredictionLeagueAccessSummary | Record<string, unknown>;
}

export interface PredictionPagination {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

/** Exact shared response envelope returned by the public Prediction Access endpoints. */
export type PredictionPage<T> = Omit<PageResult<T>, 'pagination'> & {
  pagination: PredictionPagination;
  accessPlan?: PredictionAccessPlan;
  locked?: boolean;
  message?: string;
  leagueSummary?: PredictionLeagueSummary | null;
  marketAccess?: PredictionMarketAccessSummary | Record<string, unknown>;
  leagueAccess?: PredictionLeagueAccessSummary | Record<string, unknown>;
  activePredictionsPartiallyLocked?: boolean;
  requestedMarketUnavailable?: boolean;
  requestedMarketLocked?: boolean;
  lockedCount?: number;
  sureOddsPolicy?: PredictionSureOddsPolicy;
  dailySelectionTargets?: {
    regular?: number;
    vipAdditional?: number;
    premiumTotal?: number;
  };
};

/** UI collection assembled from the backend's paginated access-controlled response. */
export type PredictionCollection<T> = PredictionPage<T> & {
  total: number;
  pages: number;
  truncated: boolean;
};

export interface MarketListQuery {
  eventId?: string;
  leagueId?: string;
  marketKey?: string;
  status?: string;
  from?: string;
  to?: string;
  selectionKey?: string;
  minimumProbability?: number;
  minimumConfidence?: number;
  page?: number;
  pageSize?: number;
  includePast?: boolean;
}

export interface PickCenterQuery {
  eventId?: string;
  leagueId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  includePast?: boolean;
}

export interface CuratedPredictionQuery {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
export interface AdminCuratedPredictionQuery { page?: number; pageSize?: number; status?: CuratedPredictionStatus | string }

export interface SlipListQuery {
  from?: string;
  to?: string;
  productType?: SlipProductType;
  automatic?: boolean;
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface SureOddsQuery { from?: string; to?: string; page?: number; pageSize?: number }
export type AdminSlipListResponse = AdminPredictionPage<PredictionSlip>;
export type AdminPickCenterResponse = AdminPredictionPage<PickCenterRecord>;
export type AdminCuratedPredictionResponse = AdminPredictionPage<CuratedPrediction>;
export interface SlipRefreshResult {
  createdOrUpdated: number;
  skipped: number;
  durationMs?: number;
  fixtureCandidates?: number;
  eligibleFixtures?: number;
  eligibleEvents?: number;
  coveredEvents?: number;
  coverageEventsRequired?: number;
  coverageEventsSatisfied?: number;
  targetDateProgress?: Array<{
    dateKey: string;
    eligibleFixtures: number;
    createdThisRun: number;
    allocated: number;
    target: number;
    remaining: number;
  }>;
}

export interface CuratedPredictionRefreshResult {
  created?: boolean;
  skipped?: boolean;
  reason?: string;
  prediction?: CuratedPrediction;
  requiredSelections?: { minimum: number; maximum: number };
  rules?: { minimumProbability: number; maximumConfidence: number; minimumOdds: number; maximumOdds: number };
  qualifyingSelections?: number;
}

export interface BuildPredictionSlipPayload {
  eventIds?: string[];
  name?: string;
  selectionCount?: number;
  minimumProbability?: number;
  minimumConfidence?: number;
  fixtureFrom?: string;
  fixtureTo?: string;
  createdBy?: string;
  publish?: boolean;
  productType?: ActiveSlipProductType;
  sureOddsTier?: SureOddsTier;
  sureOddsProduct?: SureOddsProduct;
}

export interface UpdatePredictionSlipLegsPayload {
  legs: Array<{ eventId: string; marketPredictionId: string; marketKey: string; selectionKey: string }>;
}

export interface UpdateSportyBetSlipPayload {
  sportyBetSlipCode?: string | null;
  sportyBetSlipLink?: string | null;
  adminId?: string;
}

export type { PredictionEngineDashboard } from './prediction-engine-monitor';

export type AdminPredictionPage<T> = Omit<PredictionPage<T>, 'accessPlan'> & { accessPlan?: AdminPredictionAccessPlan };

/** Complete admin-side collection assembled from the paginated management endpoints. */
export type AdminPredictionCollection<T> = AdminPredictionPage<T> & {
  total: number;
  pages: number;
  truncated: boolean;
};
