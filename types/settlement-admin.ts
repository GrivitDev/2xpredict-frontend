/** Contracts aligned with backend/src/settlement/controllers/settlement-admin.controller.ts
 * and backend/src/settlement/services/settlement-monitor.service.ts.
 */
import type { SettlementEventLevel, SettlementJobStatus } from './monitoring';
export type { SettlementEventLevel, SettlementJobStatus } from './monitoring';
export type { SettlementEventQuery, SettlementJobQuery, SettlementRunQuery } from './monitoring';
export type SettlementOutcome =
  | 'WON'
  | 'LOST'
  | 'VOID'
  | 'PUSH'
  | 'HALF_WON'
  | 'HALF_LOST'
  | 'UNRESOLVED';
export type PredictionSettlementOutcome = Exclude<SettlementOutcome, 'UNRESOLVED'>;

export interface SettlementPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SettlementJob {
  _id?: string;
  jobKey: string;
  eventId: string;
  leagueId: string;
  sourceFingerprint: string;
  sourceSummaryCollectedAt: string;
  status: SettlementJobStatus;
  attempts: number;
  maximumAttempts: number;
  priority: number;
  nextRunAt: string;
  lockedAt?: string;
  lockedBy?: string;
  startedAt?: string;
  completedAt?: string;
  resultCounts?: Record<string, number>;
  unresolvedReasons: string[];
  lastError?: string;
  lastDurationMs?: number;
  triggerReason: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettlementRun {
  _id?: string;
  eventId: string;
  leagueId: string;
  sourceFingerprint: string;
  sourceSummaryCollectedAt: string;
  status: SettlementJobStatus;
  counts: Record<string, number>;
  unresolvedReasons: string[];
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettlementEvent {
  _id?: string;
  level: SettlementEventLevel;
  action: string;
  message: string;
  eventId?: string;
  jobKey?: string;
  runId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettlementPage<T> {
  items: T[];
  pagination: SettlementPagination;
}

export interface SettlementEventsResponse {
  items: SettlementEvent[];
  limit: number;
}

export interface SettlementMonitorOverview {
  generatedAt: string;
  architecture: {
    trigger: string;
    execution: string;
    cronJobs: boolean;
    settlementOwner: string;
  };
  queue: {
    total: number;
    byStatus: Record<string, number>;
    queued: number;
    processing: number;
    retrying: number;
    partial: number;
    failed: number;
    completed: number;
  };
  runs: {
    total: number;
    byStatus: Record<string, number>;
  };
  predictionEngine: {
    marketDocuments: number;
    selectionsByOutcome: Record<string, number>;
    settledSelections: number;
    unsettledSelections: number;
  };
  betLab: {
    usersWithTickets: number;
    totalTickets: number;
    totalStakedVirtualPoints: number;
    potentialReturnVirtualPoints: number;
    ticketsByStatus: Record<string, number>;
    legsByStatus: Record<string, number>;
    unresolvedLegs: number;
  };
  recentJobs: SettlementJob[];
  recentRuns: SettlementRun[];
  recentWarningsAndErrors: SettlementEvent[];
}

/** Exact response from SettlementAdminController.requeueFixture(). */
export interface RequeueFixtureResponse {
  success: boolean;
  queued: boolean;
  jobKey?: string;
  reason: string;
  [key: string]: unknown;
}


export type ManualBetLabLegOutcome =
  | 'WON'
  | 'LOST'
  | 'VOID'
  | 'PUSH'
  | 'HALF_WON'
  | 'HALF_LOST';

export interface OverdueBetLabLeg {
  ticketId: string;
  ticketNumber?: string;
  userId?: string;
  ticketStatus?: string;
  ticketType?: string;
  stake?: number;
  placedAt?: string;
  overdueHours: number;
  leg: {
    legId?: string;
    eventId?: string;
    fixtureDate?: string;
    homeTeamName?: string;
    awayTeamName?: string;
    homeTeam?: string;
    awayTeam?: string;
    marketCode?: string;
    selectionCode?: string;
    selectionFullName?: string;
    selectionName?: string;
    decimalOdds?: number;
    line?: number;
    status?: string;
    [key: string]: unknown;
  };
}

export interface OverdueBetLabLegsResponse {
  items: OverdueBetLabLeg[];
  page: number;
  limit: number;
  total: number;
  olderThanHours: number;
  cutoff: string;
}

export interface ManualBetLabLegSettlementRequest {
  outcome: ManualBetLabLegOutcome;
  reason: string;
}

export interface ManualBetLabLegSettlementResponse {
  success: boolean;
  ticketId: string;
  ticketNumber?: string;
  legId: string;
  outcome: ManualBetLabLegOutcome;
  ticketStatus: string;
  grossReturn?: number;
  finalized: boolean;
  alreadyApplied?: boolean;
}

/** Administrative override for one Prediction Engine selection. */
export type ManualPredictionSelectionOutcome = PredictionSettlementOutcome;

export interface ManualPredictionSelectionSettlementRequest {
  outcome: ManualPredictionSelectionOutcome;
  reason: string;
}

export interface ManualPredictionSelectionSettlementResponse {
  success?: boolean;
  marketPredictionId?: string;
  selectionKey?: string;
  outcome?: ManualPredictionSelectionOutcome;
  alreadyApplied?: boolean;
  [key: string]: unknown;
}
