'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { monitoringService } from '@/services/monitoring.service';
import systemMonitorApi from '@/services/system-monitor.service';
import type { PredictionEngineDashboard } from '@/types/prediction-engine-monitor';
import type { SportsSystemMonitorResponse } from '@/types/sports';
import type { BetLabAdminMonitorResponse } from '@/types/bet-lab';
import type {
  SettlementEventsResponse,
  SettlementJob,
  SettlementMonitorOverview,
  SettlementPage,
  SettlementRun,
} from '@/types/settlement-admin';
import type {
  BetLabMonitorEventsQuery,
  MonitorEvent,
  MonitorModule,
  MonitorRecord,
  PredictionEventsMonitorQuery,
  PredictionQueueMonitorQuery,
  PredictionRunsMonitorQuery,
  SportsMonitorQuery,
  SettlementEventQuery,
  SettlementJobQuery,
  SettlementRunQuery,
  SystemMonitorActivity,
  SystemMonitorActivityQuery,
  SystemMonitorCollectionOperationsQuery,
  SystemMonitorCron,
  SystemMonitorCronQuery,
  SystemMonitorDashboard,
  SystemMonitorCoverageResponse,
  SystemMonitorDatabaseHealth,
  SystemMonitorCollectionDetail,
  SystemMonitorStorage,
  SystemMonitorDatabaseOperationsQuery,
  SystemMonitorDatabaseOperationsResponse,
  SystemMonitorError,
  SystemMonitorErrorQuery,
  SystemMonitorModuleQuery,
  SystemMonitorStorageHistoryItem,
  SystemMonitorStorageHistoryQuery,
} from '@/types/monitoring';

/**
 * Supported per-hook controls. Keep this intentionally small and value-based:
 * React Query callback options are generic in the response type and are not
 * safely interchangeable between unrelated monitoring endpoints.
 */
export type MonitorHookOptions = {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnMount?: boolean | 'always';
  refetchIntervalInBackground?: boolean;
  retry?: boolean | number;
  gcTime?: number;
};

/** Canonical React Query keys for all monitoring endpoints. */
export const monitoringQueryKeys = {
  all: ['monitoring'] as const,
  system: () => ['monitoring', 'system'] as const,
  systemDashboard: () => ['monitoring', 'system', 'dashboard'] as const,
  systemCoverage: () => ['monitoring', 'system', 'coverage'] as const,
  systemModules: (query: SystemMonitorModuleQuery = {}) => ['monitoring', 'system', 'modules', query] as const,
  systemModule: (name: string) => ['monitoring', 'system', 'module', name] as const,
  systemCrons: (query: SystemMonitorCronQuery = {}) => ['monitoring', 'system', 'crons', query] as const,
  systemCron: (key: string) => ['monitoring', 'system', 'cron', key] as const,
  systemErrors: (query: SystemMonitorErrorQuery = {}) => ['monitoring', 'system', 'errors', query] as const,
  systemActivity: (query: SystemMonitorActivityQuery = {}) => ['monitoring', 'system', 'activity', query] as const,
  systemStorage: () => ['monitoring', 'system', 'storage'] as const,
  systemStorageHistory: (query: SystemMonitorStorageHistoryQuery = {}) => ['monitoring', 'system', 'storage-history', query] as const,
  systemDatabase: () => ['monitoring', 'system', 'database'] as const,
  systemCollection: (name: string) => ['monitoring', 'system', 'collection', name] as const,
  systemDatabaseOperations: (query: SystemMonitorDatabaseOperationsQuery = {}) => ['monitoring', 'system', 'database-operations', query] as const,
  systemCollectionOperations: (name: string, query: SystemMonitorCollectionOperationsQuery = {}) => ['monitoring', 'system', 'collection-operations', name, query] as const,
  sports: () => ['monitoring', 'sports'] as const,
  prediction: () => ['monitoring', 'prediction-engine'] as const,
  predictionList: (kind: string, query: object = {}) => ['monitoring', 'prediction-engine', kind, query] as const,
  betLab: () => ['monitoring', 'bet-lab'] as const,
  betLabEvents: (query: BetLabMonitorEventsQuery = {}) => ['monitoring', 'bet-lab', 'events', query] as const,
  settlement: () => ['monitoring', 'settlement'] as const,
  settlementList: (kind: string, query: object = {}) => ['monitoring', 'settlement', kind, query] as const,
  ads: () => ['monitoring', 'ads'] as const,
  customerCare: () => ['monitoring', 'customer-care'] as const,
  odds: () => ['monitoring', 'odds'] as const,
  promos: () => ['monitoring', 'promos'] as const,
  referrals: () => ['monitoring', 'referrals'] as const,
  subscriptions: () => ['monitoring', 'subscriptions'] as const,
};

// Main System Monitor
export function useSystemMonitorDashboard(options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorDashboard>({
    queryKey: monitoringQueryKeys.systemDashboard(),
    queryFn: monitoringService.getSystemDashboard,
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function useSystemMonitorCoverage(options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorCoverageResponse>({
    queryKey: monitoringQueryKeys.systemCoverage(),
    queryFn: systemMonitorApi.getCoverage,
    staleTime: 15_000,
    refetchInterval: 30_000,
    ...options,
  });
}

export function useSystemMonitorModules(query: SystemMonitorModuleQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<MonitorModule[]>({
    queryKey: monitoringQueryKeys.systemModules(query),
    queryFn: () => monitoringService.getSystemModules(query),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function useSystemMonitorModule(name?: string, options: MonitorHookOptions = {}) {
  return useQuery<MonitorModule | null>({
    queryKey: monitoringQueryKeys.systemModule(name ?? ''),
    queryFn: () => monitoringService.getSystemModule(name as string),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
    enabled: Boolean(name) && options.enabled !== false,
  });
}

export function useSystemMonitorCrons(query: SystemMonitorCronQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorCron[]>({
    queryKey: monitoringQueryKeys.systemCrons(query),
    queryFn: () => monitoringService.getCrons(query),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function useSystemMonitorCron(key?: string, options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorCron | null>({
    queryKey: monitoringQueryKeys.systemCron(key ?? ''),
    queryFn: () => monitoringService.getCron(key as string),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
    enabled: Boolean(key) && options.enabled !== false,
  });
}

export function useSystemMonitorErrors(query: SystemMonitorErrorQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorError[]>({
    queryKey: monitoringQueryKeys.systemErrors(query),
    queryFn: () => monitoringService.getErrors(query),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function useSystemMonitorActivity(query: SystemMonitorActivityQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorActivity[]>({
    queryKey: monitoringQueryKeys.systemActivity(query),
    queryFn: () => monitoringService.getActivity(query),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function useSystemStorage(options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorStorage>({
    queryKey: monitoringQueryKeys.systemStorage(),
    queryFn: monitoringService.getStorage,
    staleTime: 60_000,
    refetchInterval: 60_000,
    ...options,
  });
}

export function useSystemStorageHistory(query: SystemMonitorStorageHistoryQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorStorageHistoryItem[]>({
    queryKey: monitoringQueryKeys.systemStorageHistory(query),
    queryFn: () => monitoringService.getStorageHistory(query),
    staleTime: 300_000,
    refetchInterval: 300_000,
    ...options,
  });
}

export function useSystemDatabaseHealth(options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorDatabaseHealth>({
    queryKey: monitoringQueryKeys.systemDatabase(),
    queryFn: monitoringService.getDatabaseHealth,
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function useSystemDatabaseCollection(name?: string, options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorCollectionDetail | null>({
    queryKey: monitoringQueryKeys.systemCollection(name ?? ''),
    queryFn: () => monitoringService.getCollection(name as string),
    staleTime: 60_000,
    refetchInterval: 60_000,
    ...options,
    enabled: Boolean(name) && options.enabled !== false,
  });
}

export function useSystemDatabaseOperations(query: SystemMonitorDatabaseOperationsQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SystemMonitorDatabaseOperationsResponse>({
    queryKey: monitoringQueryKeys.systemDatabaseOperations(query),
    queryFn: () => monitoringService.getDatabaseOperations(query),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function useSystemCollectionOperations(
  name?: string,
  query: SystemMonitorCollectionOperationsQuery = {},
  options: MonitorHookOptions = {},
) {
  return useQuery<SystemMonitorDatabaseOperationsResponse>({
    queryKey: monitoringQueryKeys.systemCollectionOperations(name ?? '', query),
    queryFn: () => monitoringService.getCollectionOperations(name as string, query),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
    enabled: Boolean(name) && options.enabled !== false,
  });
}

// Sports Data Monitor
export function useSportsMonitor(query: SportsMonitorQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SportsSystemMonitorResponse>({
    queryKey: [...monitoringQueryKeys.sports(), query],
    queryFn: () => monitoringService.getSportsMonitor<SportsSystemMonitorResponse>(query),
    staleTime: 15_000,
    refetchInterval: 30_000,
    ...options,
  });
}

// Prediction Engine Monitor
export function usePredictionEngineMonitorDashboard(options: MonitorHookOptions = {}) {
  return useQuery<PredictionEngineDashboard>({
    queryKey: monitoringQueryKeys.prediction(),
    queryFn: () => monitoringService.getPredictionEngineDashboard<PredictionEngineDashboard>(),
    staleTime: 10_000,
    refetchInterval: 15_000,
    ...options,
  });
}

export function usePredictionEngineMonitorRuns(query: PredictionRunsMonitorQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<MonitorRecord[]>({
    queryKey: monitoringQueryKeys.predictionList('runs', query),
    queryFn: () => monitoringService.getPredictionEngineRuns(query),
    staleTime: 10_000,
    refetchInterval: 30_000,
    ...options,
  });
}

export function usePredictionEngineMonitorQueue(query: PredictionQueueMonitorQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<MonitorRecord[]>({
    queryKey: monitoringQueryKeys.predictionList('queue', query),
    queryFn: () => monitoringService.getPredictionEngineQueue(query),
    staleTime: 5_000,
    refetchInterval: 10_000,
    ...options,
  });
}

export function usePredictionEngineMonitorEvents(query: PredictionEventsMonitorQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<MonitorEvent[]>({
    queryKey: monitoringQueryKeys.predictionList('events', query),
    queryFn: () => monitoringService.getPredictionEngineEvents(query),
    staleTime: 10_000,
    refetchInterval: 30_000,
    ...options,
  });
}

export function usePredictionEngineMonitorMarkets(eventId?: string, options: MonitorHookOptions = {}) {
  return useQuery<MonitorRecord[]>({
    queryKey: [...monitoringQueryKeys.prediction(), 'markets', eventId ?? ''],
    queryFn: () => monitoringService.getPredictionEngineMarketDocuments(eventId as string),
    staleTime: 10_000,
    ...options,
    enabled: Boolean(eventId) && options.enabled !== false,
  });
}

// Bet Lab Monitor
export function useBetLabMonitor(options: MonitorHookOptions = {}) {
  return useQuery<BetLabAdminMonitorResponse>({
    queryKey: monitoringQueryKeys.betLab(),
    queryFn: () => monitoringService.getBetLabDashboard<BetLabAdminMonitorResponse>(),
    staleTime: 10_000,
    refetchInterval: 20_000,
    ...options,
  });
}

export function useBetLabMonitorEvents(limit = 50, options: MonitorHookOptions = {}) {
  return useQuery<MonitorEvent[]>({
    queryKey: monitoringQueryKeys.betLabEvents({ limit }),
    queryFn: () => monitoringService.getBetLabEvents<MonitorEvent[]>(limit),
    staleTime: 10_000,
    refetchInterval: 20_000,
    ...options,
  });
}

// Settlement Monitor
export function useSettlementMonitor(options: MonitorHookOptions = {}) {
  return useQuery<SettlementMonitorOverview>({
    queryKey: monitoringQueryKeys.settlement(),
    queryFn: () => monitoringService.getSettlementDashboard<SettlementMonitorOverview>(),
    staleTime: 10_000,
    refetchInterval: 30_000,
    ...options,
  });
}

export function useSettlementJobs(query: SettlementJobQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SettlementPage<SettlementJob>>({
    queryKey: monitoringQueryKeys.settlementList('jobs', query),
    queryFn: () => monitoringService.getSettlementJobs<SettlementPage<SettlementJob>>(query),
    staleTime: 10_000,
    refetchInterval: 20_000,
    ...options,
  });
}

export function useSettlementRuns(query: SettlementRunQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SettlementPage<SettlementRun>>({
    queryKey: monitoringQueryKeys.settlementList('runs', query),
    queryFn: () => monitoringService.getSettlementRuns<SettlementPage<SettlementRun>>(query),
    staleTime: 10_000,
    refetchInterval: 30_000,
    ...options,
  });
}

export function useSettlementEvents(query: SettlementEventQuery = {}, options: MonitorHookOptions = {}) {
  return useQuery<SettlementEventsResponse>({
    queryKey: monitoringQueryKeys.settlementList('events', query),
    queryFn: () => monitoringService.getSettlementEvents<SettlementEventsResponse>(query),
    staleTime: 10_000,
    refetchInterval: 20_000,
    ...options,
  });
}

export function useSettlementMonitorActions() {
  const client = useQueryClient();
  return {
    requeueFixture: useMutation({
      mutationFn: ({ eventId, leagueId }: { eventId: string; leagueId?: string }) =>
        monitoringService.requeueSettlementFixture(eventId, leagueId),
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: monitoringQueryKeys.settlement() });
      },
    }),
  };
}

// Module-specific monitors all call the canonical service above.
export function useAdsMonitor(options: MonitorHookOptions = {}) {
  return useQuery({
    queryKey: monitoringQueryKeys.ads(),
    queryFn: monitoringService.getAdsMonitor,
    staleTime: 15_000,
    refetchInterval: 30_000,
    ...options,
  });
}

export function useCustomerCareMonitor(options: MonitorHookOptions = {}) {
  return useQuery({
    queryKey: monitoringQueryKeys.customerCare(),
    queryFn: monitoringService.getCustomerCareMonitor,
    staleTime: 10_000,
    refetchInterval: 20_000,
    ...options,
  });
}

export function useOddsMonitor(options: MonitorHookOptions = {}) {
  return useQuery({
    queryKey: monitoringQueryKeys.odds(),
    queryFn: monitoringService.getOddsMonitor,
    staleTime: 10_000,
    refetchInterval: 30_000,
    ...options,
  });
}

export function usePromosMonitor(options: MonitorHookOptions = {}) {
  return useQuery({
    queryKey: monitoringQueryKeys.promos(),
    queryFn: monitoringService.getPromosMonitor,
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

export function useReferralsMonitor(options: MonitorHookOptions = {}) {
  return useQuery({
    queryKey: monitoringQueryKeys.referrals(),
    queryFn: monitoringService.getReferralsMonitor,
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

export function useSubscriptionsMonitor(options: MonitorHookOptions = {}) {
  return useQuery({
    queryKey: monitoringQueryKeys.subscriptions(),
    queryFn: monitoringService.getSubscriptionsMonitor,
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

/** Backwards-compatible key names, but all keys now share the canonical prefix. */
export const systemMonitorQueryKeys = {
  all: monitoringQueryKeys.system,
  dashboard: monitoringQueryKeys.systemDashboard,
  modules: monitoringQueryKeys.systemModules,
  module: monitoringQueryKeys.systemModule,
  crons: monitoringQueryKeys.systemCrons,
  cron: monitoringQueryKeys.systemCron,
  errors: monitoringQueryKeys.systemErrors,
  activity: monitoringQueryKeys.systemActivity,
  storage: monitoringQueryKeys.systemStorage,
  storageHistory: monitoringQueryKeys.systemStorageHistory,
  database: monitoringQueryKeys.systemDatabase,
  collection: monitoringQueryKeys.systemCollection,
  databaseOperations: monitoringQueryKeys.systemDatabaseOperations,
  collectionOperations: (name: string, queryOrLimit: SystemMonitorCollectionOperationsQuery | number = {}) =>
    monitoringQueryKeys.systemCollectionOperations(
      name,
      typeof queryOrLimit === 'number' ? { limit: queryOrLimit } : queryOrLimit,
    ),
} as const;

/**
 * Legacy hook names re-exported here so old consumers can migrate without a
 * second implementation or a second query-cache namespace.
 */
export const useSystemMonitorStorage = useSystemStorage;
export const useSystemMonitorStorageHistory = useSystemStorageHistory;
export const useSystemMonitorDatabaseHealth = useSystemDatabaseHealth;
export const useSystemMonitorCollection = useSystemDatabaseCollection;
export const useSystemMonitorDatabaseOperations = useSystemDatabaseOperations;
export function useSystemMonitorCollectionOperations(
  name?: string,
  queryOrLimit: SystemMonitorCollectionOperationsQuery | number = {},
  options: MonitorHookOptions = {},
) {
  const query = typeof queryOrLimit === 'number' ? { limit: queryOrLimit } : queryOrLimit;
  return useSystemCollectionOperations(name, query, options);
}

/** Older name retained for existing monitoring imports. */
export const monitorQueryKeys = {
  all: monitoringQueryKeys.all,
  system: monitoringQueryKeys.system,
  modules: monitoringQueryKeys.systemModules,
  sports: monitoringQueryKeys.sports,
  prediction: monitoringQueryKeys.prediction,
  predictionList: monitoringQueryKeys.predictionList,
  betLab: monitoringQueryKeys.betLab,
  settlement: monitoringQueryKeys.settlement,
  settlementList: monitoringQueryKeys.settlementList,
};

