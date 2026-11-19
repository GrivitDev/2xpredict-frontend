import type { PageResult } from '@/types/common';

/** Canonical contracts for every administrative monitoring endpoint. */
export type MonitorStatus =
  | 'ONLINE'
  | 'HEALTHY'
  | 'OK'
  | 'DEGRADED'
  | 'FAILED'
  | 'ERROR'
  | 'UNKNOWN'
  | (string & {});

/** Filter values accepted by the System Monitor modules endpoint. */
export type ModuleHealthStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'UNKNOWN';
export type ModuleMonitoringLevel = 'deep' | 'health';

export type MonitorLevel =
  | 'DEBUG'
  | 'INFO'
  | 'WARN'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | (string & {});

export interface MonitorRecord {
  [key: string]: unknown;
}

export interface MonitorCheck extends MonitorRecord {
  name?: string;
  status?: MonitorStatus;
  message?: string;
  error?: string;
  checkedAt?: string;
  durationMs?: number;
}

export interface MonitorModule extends MonitorRecord {
  /** Backend field returned by ModuleHealthView. */
  module: string;
  status: MonitorStatus;
  monitoringLevel?: 'deep' | 'health' | string;
  critical: boolean;
  message: string;
  source: string;
  checkedAt: string;
  lastSuccessfulAt?: string;
  lastFailedAt?: string;
  consecutiveFailures: number;
  activeOperations: number;
  requests: number;
  requestFailures: number;
  averageDurationMs: number;
  lastDurationMs?: number;
  lastActivityAt?: string;
  lastOperation?: string;
  details?: Record<string, unknown>;
  /** Normalized client alias derived from the backend's `module` field. */
  name?: string;
}

/** Backend module-health row. The client may also add the optional `name` alias. */
export type SystemMonitorModuleRecord = MonitorModule;

/** Compatibility alias for older system-monitor imports; defined in this canonical file. */
export type SystemMonitorModule = MonitorModule;

export interface MonitorEvent extends MonitorRecord {
  _id?: string;
  id?: string;
  createdAt?: string;
  occurredAt?: string;
  module?: string;
  source?: string;
  operation?: string;
  level?: MonitorLevel;
  status?: string;
  action?: string;
  message?: string;
  durationMs?: number;
  referenceKey?: string;
  stack?: string;
  error?: string;
}

export interface SystemMonitorError extends MonitorEvent {
  module: string;
  source: string;
  operation: string;
  message: string;
  occurredAt: string;
}

export interface SystemMonitorActivity extends MonitorEvent {
  module: string;
  source: string;
  operation: string;
  status: 'STARTED' | 'SUCCESS' | 'FAILED' | 'INFO' | string;
  message: string;
  occurredAt: string;
}

export interface MonitorHealthSummary extends MonitorRecord {
  status?: MonitorStatus;
  message?: string;
  checks?: MonitorCheck[];
  warnings?: string[];
  errors?: string[];
}

/** Common shape shared by module-specific monitoring snapshots. */
export interface ModuleMonitorOverview extends MonitorRecord {
  generatedAt?: string;
  checkedAt?: string;
  status?: MonitorStatus;
  healthy?: boolean;
  health?: MonitorHealthSummary;
  checks?: MonitorCheck[];
  warnings?: string[];
  errors?: string[];
}

export interface MonitorListResponse<T> extends MonitorRecord {
  items?: T[];
  data?: T[];
  results?: T[];
  total?: number;
  limit?: number;
  page?: number;
  totalPages?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

export type MonitorListResult<T> = T[] | MonitorListResponse<T>;
export type MonitorPage<T> = PageResult<T>;

// -----------------------------------------------------------------------------
// Main System Monitor: query contracts mirror SystemMonitorController.
// -----------------------------------------------------------------------------

export interface SystemMonitorModuleQuery {
  status?: string;
  level?: 'deep' | 'health';
  critical?: boolean | string;
}

export interface SystemMonitorCronQuery {
  module?: string;
  status?: string;
}

export interface SystemMonitorErrorQuery {
  module?: string;
  limit?: number | string;
}

export interface SystemMonitorActivityQuery {
  module?: string;
  status?: string;
  limit?: number | string;
}

export interface SystemMonitorStorageHistoryQuery {
  limit?: number | string;
}

export interface SystemMonitorDatabaseOperationsQuery {
  limit?: number | string;
  status?: string;
}

export interface SystemMonitorCollectionOperationsQuery {
  limit?: number | string;
}

/** Endpoint-query aliases retained in the canonical monitoring contract. */
export type GetModulesQuery = SystemMonitorModuleQuery;
export type GetCronsQuery = SystemMonitorCronQuery;
export type GetErrorsQuery = SystemMonitorErrorQuery;
export type GetActivityQuery = SystemMonitorActivityQuery;
export type GetStorageHistoryQuery = SystemMonitorStorageHistoryQuery;
export type GetDatabaseOperationsQuery = SystemMonitorDatabaseOperationsQuery;
export type GetCollectionOperationsQuery = SystemMonitorCollectionOperationsQuery;

/** Read-only coverage and module dependency graph returned by /admin/system-monitor/coverage. */
export interface SystemMonitorCoverageDependency extends MonitorRecord {
  module: string;
  status: ModuleHealthStatus;
  critical: boolean;
  kind: 'module-import' | 'data' | 'runtime' | string;
}

export interface SystemMonitorCoverageModule extends MonitorRecord {
  module: string;
  category: string;
  description: string;
  critical: boolean;
  monitoringLevel: ModuleMonitoringLevel;
  probeMode: string;
  status: ModuleHealthStatus;
  observedStatus: ModuleHealthStatus;
  discovered: boolean;
  healthIsStale: boolean;
  healthAgeMs?: number;
  moduleImports: string[];
  actualModuleImports: string[];
  missingModuleImports: string[];
  unexpectedModuleImports: string[];
  moduleImportDrift: boolean;
  dependsOn: string[];
  dependencies: SystemMonitorCoverageDependency[];
}

export interface SystemMonitorCoverageResponse extends MonitorRecord {
  checkedAt: string;
  expectedModules: number;
  discoveredModules: number;
  missingModules: string[];
  unclassifiedDiscoveredModules: string[];
  staleModules: string[];
  moduleGraphIssues: Array<{
    module: string;
    critical: boolean;
    expectedImports: string[];
    actualImports: string[];
    missingImports: string[];
    unexpectedImports: string[];
  }>;
  summary: {
    criticalModules: number;
    criticalHealthy: number;
    criticalDegraded: number;
    criticalFailed: number;
    criticalUnknown: number;
    criticalDependencyIssues: number;
    modulesMissingFromNest: number;
    unclassifiedDiscoveredModules: number;
    modulesWithImportDrift: number;
    staleModules: number;
    criticalWithoutLocalProbe: string[];
    criticalOnDemandOnly: string[];
    probeModes: Record<string, number>;
  };
  criticalDependencyIssues: Array<SystemMonitorCoverageDependency & { parentModule: string }>;
  modules: SystemMonitorCoverageModule[];
}

export interface SystemMonitorDashboard extends MonitorRecord {
  system?: {
    status?: MonitorStatus;
    startedAt?: string;
    uptimeSeconds?: number;
    currentTime?: string;
    pid?: number;
    nodeVersion?: string;
    memory?: Record<string, number>;
    telemetry?: Record<string, unknown>;
    [key: string]: unknown;
  };
  summary?: {
    totalCrons?: number;
    runningCrons?: number;
    failedCrons?: number;
    recentErrors?: number;
    modules?: number;
    failedModules?: number;
    degradedModules?: number;
    unknownModules?: number;
    criticalModulesUnhealthy?: number;
    criticalModulesUnverified?: number;
    [key: string]: unknown;
  };
  modules?: MonitorModule[];
  crons?: SystemMonitorCron[];
  recentActivity?: SystemMonitorActivity[];
  recentErrors?: SystemMonitorError[];
  database?: SystemMonitorDatabaseHealth & {
    storage?: SystemMonitorStorage;
    storageError?: string;
  };
}

export interface SystemMonitorCron extends MonitorRecord {
  key: string;
  module: string;
  name: string;
  expression?: string;
  timeZone?: string;
  enabled: boolean;
  status: 'REGISTERED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'IDLE' | string;
  lastStartedAt?: string;
  lastSuccessfulAt?: string;
  lastFailedAt?: string;
  lastDurationMs?: number;
  consecutiveFailures: number;
  lastError?: string;
  scheduler?: {
    active: boolean;
    callbackRunning: boolean;
    lastRunAt?: string;
    nextRunAt?: string;
  };
}

export interface SystemMonitorStorageTotals {
  collections: number;
  documents: number;
  dataSizeBytes: number;
  storageSizeBytes: number;
  indexSizeBytes: number;
  totalSizeBytes: number;
}

export interface SystemMonitorStorageCollection {
  name: string;
  documents: number;
  dataSizeBytes: number;
  storageSizeBytes: number;
  averageDocumentSizeBytes: number;
  indexes: number;
  totalIndexSizeBytes: number;
  totalSizeBytes: number;
}

export interface SystemMonitorStorage extends MonitorRecord {
  capturedAt: string;
  databaseName: string;
  totals: SystemMonitorStorageTotals;
  collections: SystemMonitorStorageCollection[];
  persistedAt?: string;
}

export interface SystemMonitorStorageHistoryItem {
  capturedAt: string;
  databaseName: string;
  totals: SystemMonitorStorageTotals;
}

export interface SystemMonitorDatabaseHealth extends MonitorRecord {
  status?: MonitorStatus;
  state?: string;
  readyState?: number;
  databaseName?: string | null;
  pingMs?: number | null;
  collections?: number | null;
  documents?: number | null;
  dataSizeBytes?: number | null;
  storageSizeBytes?: number | null;
  indexSizeBytes?: number | null;
  totalSizeBytes?: number | null;
  checkedAt?: string;
  error?: string;
}

export interface SystemMonitorCollectionDetail extends SystemMonitorStorageCollection {}

export interface SystemMonitorDatabaseOperationMetric extends MonitorRecord {
  database: string;
  collection: string;
  command: string;
  count: number;
  failures: number;
  slow: number;
  lastDurationMs: number;
  averageDurationMs: number;
  lastAt?: string;
}

export type DatabaseOperationStatus = 'SUCCESS' | 'FAILED';

export interface SystemMonitorDatabaseOperation extends MonitorEvent {
  database: string;
  collection: string;
  command: string;
  durationMs: number;
  status: 'SUCCESS' | 'FAILED' | string;
  occurredAt: string;
}

export interface SystemMonitorDatabaseOperationsResponse extends MonitorRecord {
  slowThresholdMs: number;
  aggregates: SystemMonitorDatabaseOperationMetric[];
  recent: SystemMonitorDatabaseOperation[];
}

// Argument aliases kept here so endpoint contracts have one canonical source.
export interface GetModulesArgs { query?: SystemMonitorModuleQuery }
export interface GetModuleArgs { path: { name: string } }
export interface GetCronsArgs { query?: SystemMonitorCronQuery }
export interface GetCronArgs { path: { key: string } }
export interface GetErrorsArgs { query?: SystemMonitorErrorQuery }
export interface GetActivityArgs { query?: SystemMonitorActivityQuery }
export interface GetStorageHistoryArgs { query?: SystemMonitorStorageHistoryQuery }
export interface GetCollectionArgs { path: { name: string } }
export interface GetDatabaseOperationsArgs { query?: SystemMonitorDatabaseOperationsQuery }
export interface GetCollectionOperationsArgs {
  path: { name: string };
  query?: SystemMonitorCollectionOperationsQuery;
}

// -----------------------------------------------------------------------------
// Sports Data Monitor.
// -----------------------------------------------------------------------------

export interface SportsMonitorQuery {
  refresh?: boolean | string;
}

// -----------------------------------------------------------------------------
// Prediction Engine Monitor: each route only accepts its actual backend query.
// -----------------------------------------------------------------------------

export interface PredictionRunsMonitorQuery {
  limit?: number | string;
}

export interface PredictionQueueMonitorQuery {
  status?: string;
  limit?: number | string;
}

export interface PredictionEventsMonitorQuery {
  limit?: number | string;
  level?: string;
}

/** Compatibility contract for older code that previously used one shared query. */
export interface PredictionMonitorQuery {
  limit?: number | string;
  status?: string;
  level?: string;
}

export interface PredictionMarketDocumentsQuery {
  eventId: string;
}

// -----------------------------------------------------------------------------
// Bet Lab Monitor.
// -----------------------------------------------------------------------------

export interface BetLabMonitorEventsQuery {
  limit?: number | string;
}

// -----------------------------------------------------------------------------
// Settlement Monitor: these fields mirror the individual Nest DTOs.
// -----------------------------------------------------------------------------

export type SettlementEventLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type SettlementJobStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'RETRY'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'SKIPPED';

export interface SettlementJobQuery {
  status?: SettlementJobStatus;
  eventId?: string;
  page?: number;
  limit?: number;
}

export interface SettlementRunQuery {
  eventId?: string;
  page?: number;
  limit?: number;
}

export interface SettlementEventQuery {
  level?: SettlementEventLevel;
  eventId?: string;
  action?: string;
  limit?: number;
}

/** Compatibility type for callers that share one settlement query variable. */
export type SettlementMonitorQuery = SettlementJobQuery & SettlementRunQuery & SettlementEventQuery;

// -----------------------------------------------------------------------------
// Standardized module-specific response contracts.
// -----------------------------------------------------------------------------

export type AdsMonitorResponse = ModuleMonitorOverview;
export type CustomerCareMonitorResponse = ModuleMonitorOverview;
export type OddsMonitorResponse = ModuleMonitorOverview;
export type PromosMonitorResponse = ModuleMonitorOverview;
export type ReferralsMonitorResponse = ModuleMonitorOverview;
export type SubscriptionsMonitorResponse = ModuleMonitorOverview;
export type SportsMonitorResponse = ModuleMonitorOverview;
export type PredictionEngineMonitorResponse = ModuleMonitorOverview;
export type BetLabMonitorResponse = ModuleMonitorOverview;
export type SettlementMonitorResponse = ModuleMonitorOverview;
