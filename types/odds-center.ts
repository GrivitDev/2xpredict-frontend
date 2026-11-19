import type { SportsCompetitionRegion, SportsFixtureStatus } from './sports-v2';

export type OddsPriceType = 'PROVIDER' | 'ESTIMATED';
export type OddsPricingSource = 'GRIVIT_MODEL';
export type OddsProvider = 'ESPN';
export type OddsExternalValidationStatus =
  | 'VALIDATED'
  | 'NO_EXTERNAL_REFERENCE'
  | 'REFERENCE_AVAILABLE_NO_CONSENSUS';

/** One stored Grivit price returned by GET /odds/admin/center. */
export interface OddsCenterSelection {
  key: string;
  name: string;
  line?: number;
  odds: number;
  source: OddsPriceType;
  pricingSource?: OddsPricingSource | null;
  provider?: OddsProvider | null;
  bookmaker?: string | null;
  fairOdds?: number | null;
  fairProbability?: number | null;
  marketFairOdds?: number | null;
  externalBookmakerCount: number;
  externalConsensusFairOdds?: number | null;
  externalConsensusProbability?: number | null;
  externalDeviationPercent?: number | null;
  externalValidatedAt?: string | null;
  externalValidationStatus: OddsExternalValidationStatus;
  impliedProbability?: number | null;
  valuePercent?: number | null;
  predictionReady: boolean;
  dataQuality: number;
  sampleSize: number;
  providerUpdatedAt?: string | null;
  oddsCapturedAt: string | null;
  oddsFreshUntil: string | null;
  isFresh: boolean;
  calculationVersion?: string | null;
}

export interface OddsCenterMarket {
  id: string;
  name: string;
  abbreviation: string;
  family: string;
  model: string;
  selections: OddsCenterSelection[];
}

/** Normalized fixture + competition/team names + calculated market prices. */
export interface OddsCenterFixture {
  eventId: string;
  fixtureId: string;
  kickoffAt: string;
  status: SportsFixtureStatus;
  competitionId: string;
  competitionName: string;
  competitionRegion: SportsCompetitionRegion | null;
  homeTeam: string;
  awayTeam: string;
  markets: OddsCenterMarket[];
  pricedSelectionCount: number;
  predictionReadySelectionCount: number;
}

export interface OddsCenterDateRange {
  from: string;
  to: string;
}

export interface OddsCenterResponse {
  items: OddsCenterFixture[];
  count: number;
  from: string;
  to: string;
  readOnly: true;
  dataSource: 'SPORTS_MODULE';
  externalApiCalls: 0;
  catalogueMarketCount: number;
  truncated: boolean;
}

export interface OddsMonitorCheck {
  name: string;
  status: string;
  message?: string;
  value?: unknown;
  [key: string]: unknown;
}

export interface OddsMonitorAlert {
  code: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  count?: number;
  details?: Record<string, unknown>;
}

export interface OddsMonitorWorker extends Record<string, unknown> {
  initialized?: boolean;
  running?: boolean;
  busy?: boolean;
  stopping?: boolean;
  laneCount?: number;
  passCount?: number;
  jobsClaimed?: number;
  jobsCompleted?: number;
  jobsRetried?: number;
  jobsQuarantined?: number;
  consecutiveCycleFailures?: number;
  lastCycleCompletedAt?: string | null;
}

export interface OddsMonitorInventory extends Record<string, unknown> {
  totalSelections?: number;
  predictionReadySelections?: number;
  providerSelections?: number;
  estimatedSelections?: number;
  marketInventory?: Array<Record<string, unknown>>;
  freshnessAndIntegrity?: Record<string, unknown>;
}

export interface OddsMonitorPricingQueue extends Record<string, unknown> {
  duePendingCount?: number;
  failedCount?: number;
  quarantinedCount?: number;
  staleProcessingCount?: number;
}

/** Operational snapshot returned by OddsMonitorService.getOverview(). */
export interface OddsMonitorResponse {
  generatedAt: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'UNKNOWN';
  message: string;
  monitor?: Record<string, unknown>;
  checks?: OddsMonitorCheck[];
  alerts?: OddsMonitorAlert[];
  worker?: OddsMonitorWorker;
  inventorySweep?: Record<string, unknown>;
  pricingQueue?: OddsMonitorPricingQueue;
  inventory?: OddsMonitorInventory;
  sportsDependency?: Record<string, unknown> & {
    sampleFixtureCount?: number;
    predictionReadyCoveragePercent?: number | null;
  };
  configuration?: Record<string, unknown>;
  catalogue?: Record<string, unknown>;
  indexes?: Record<string, unknown>;
  externalApiCalls?: 0;
  dataSource?: 'SPORTS_MODULE';
  cached?: boolean;
  refreshInProgress?: boolean;
}
