import api from '@/lib/axios';
import { compactQuery, encodePathPart } from '@/lib/api-utils';
import type {
  AdsMonitorResponse,
  BetLabMonitorEventsQuery,
  CustomerCareMonitorResponse,
  MonitorEvent,
  MonitorModule,
  MonitorRecord,
  OddsMonitorResponse,
  PromosMonitorResponse,
  ReferralsMonitorResponse,
  SettlementEventQuery,
  SettlementJobQuery,
  SettlementRunQuery,
  SubscriptionsMonitorResponse,
  SportsMonitorQuery,
  SystemMonitorActivity,
  SystemMonitorActivityQuery,
  SystemMonitorCollectionDetail,
  SystemMonitorCollectionOperationsQuery,
  SystemMonitorCron,
  SystemMonitorCronQuery,
  SystemMonitorDashboard,
  SystemMonitorDatabaseHealth,
  SystemMonitorDatabaseOperationsResponse,
  SystemMonitorDatabaseOperationsQuery,
  SystemMonitorError,
  SystemMonitorErrorQuery,
  SystemMonitorModuleQuery,
  SystemMonitorModuleRecord,
  SystemMonitorStorage,
  SystemMonitorStorageHistoryItem,
  SystemMonitorStorageHistoryQuery,
} from '@/types/monitoring';
import type { SportsSystemMonitorResponse } from '@/types/sports';
import type { PredictionEngineDashboard } from '@/types/prediction-engine-monitor';
import type { PredictionEventsMonitorQuery, PredictionQueueMonitorQuery, PredictionRunsMonitorQuery } from '@/types/monitoring';
import type { BetLabAdminMonitorResponse } from '@/types/bet-lab';
import type {
  SettlementEventsResponse,
  SettlementJob,
  SettlementMonitorOverview,
  SettlementPage,
  SettlementRun,
  RequeueFixtureResponse,
} from '@/types/settlement-admin';

/**
 * The single frontend service for all operational monitoring endpoints.
 * Paths intentionally omit the global `/api` prefix because the shared Axios
 * client already supplies it. Query types match the backend controller DTOs.
 */
export const monitoringService = {
  // Main System Monitor
  getSystemDashboard: async () => {
    const response = await api.get<SystemMonitorDashboard>('/admin/system-monitor');
    const dashboard = response.data;
    return {
      ...dashboard,
      modules: dashboard.modules?.map((module): MonitorModule => ({
        ...module,
        name: module.name ?? module.module,
      })),
    };
  },

  getSystemModules: async (query: SystemMonitorModuleQuery = {}) => {
    const response = await api.get<SystemMonitorModuleRecord[]>('/admin/system-monitor/modules', {
      params: compactQuery(query),
    });
    return response.data.map((module): MonitorModule => ({
      ...module,
      name: module.name ?? module.module,
    }));
  },

  getSystemModule: async (name: string) => {
    const response = await api.get<SystemMonitorModuleRecord | null>(
      `/admin/system-monitor/modules/${encodePathPart(name)}`,
    );
    if (!response.data) return null;
    return {
      ...response.data,
      name: response.data.name ?? response.data.module,
    };
  },

  getCrons: (query: SystemMonitorCronQuery = {}) =>
    api.get<SystemMonitorCron[]>('/admin/system-monitor/crons', {
      params: compactQuery(query),
    }).then((response) => response.data),

  getCron: (key: string) =>
    api.get<SystemMonitorCron | null>(`/admin/system-monitor/crons/${encodePathPart(key)}`).then((response) => response.data),

  getErrors: (query: SystemMonitorErrorQuery = {}) =>
    api.get<SystemMonitorError[]>('/admin/system-monitor/errors', {
      params: compactQuery(query),
    }).then((response) => response.data),

  getActivity: (query: SystemMonitorActivityQuery = {}) =>
    api.get<SystemMonitorActivity[]>('/admin/system-monitor/activity', {
      params: compactQuery(query),
    }).then((response) => response.data),

  getStorage: () =>
    api.get<SystemMonitorStorage>('/admin/system-monitor/storage').then((response) => response.data),

  getStorageHistory: (queryOrLimit: SystemMonitorStorageHistoryQuery | number = {}) => {
    const query = typeof queryOrLimit === 'number' ? { limit: queryOrLimit } : queryOrLimit;
    return api.get<SystemMonitorStorageHistoryItem[]>('/admin/system-monitor/storage/history', {
      params: compactQuery(query),
    }).then((response) => response.data);
  },

  getDatabaseHealth: () =>
    api.get<SystemMonitorDatabaseHealth>('/admin/system-monitor/database').then((response) => response.data),

  getCollection: (name: string) =>
    api.get<SystemMonitorCollectionDetail>(`/admin/system-monitor/database/collections/${encodePathPart(name)}`)
      .then((response) => response.data),

  getDatabaseOperations: (query: SystemMonitorDatabaseOperationsQuery = {}) =>
    api.get<SystemMonitorDatabaseOperationsResponse>('/admin/system-monitor/database/operations', {
      params: compactQuery(query),
    }).then((response) => response.data),

  getCollectionOperations: (
    name: string,
    queryOrLimit: SystemMonitorCollectionOperationsQuery | number = {},
  ) => {
    const query = typeof queryOrLimit === 'number' ? { limit: queryOrLimit } : queryOrLimit;
    return api.get<SystemMonitorDatabaseOperationsResponse>(
      `/admin/system-monitor/database/collections/${encodePathPart(name)}/operations`,
      { params: compactQuery(query) },
    ).then((response) => response.data);
  },

  // Compatibility monitor reader; the current backend route is /admin/sports/monitor.
  getSportsMonitor: <TResponse = SportsSystemMonitorResponse>(query: SportsMonitorQuery = {}) =>
    api.get<TResponse>('/admin/sports/monitor', { params: compactQuery(query) })
      .then((response) => response.data),

  // Prediction Engine Monitor: paths match PredictionEngineController.
  getPredictionEngineDashboard: <TResponse = PredictionEngineDashboard>() =>
    api.get<TResponse>('/predictions-engine/monitor').then((response) => response.data),

  getPredictionEngineRuns: (query: PredictionRunsMonitorQuery = {}) =>
    api.get<MonitorRecord[]>('/predictions-engine/monitor/runs', { params: compactQuery(query) })
      .then((response) => response.data),

  getPredictionEngineQueue: (query: PredictionQueueMonitorQuery = {}) =>
    api.get<MonitorRecord[]>('/predictions-engine/monitor/queue', { params: compactQuery(query) })
      .then((response) => response.data),

  getPredictionEngineEvents: (query: PredictionEventsMonitorQuery = {}) =>
    api.get<MonitorEvent[]>('/predictions-engine/monitor/events', { params: compactQuery(query) })
      .then((response) => response.data),

  getPredictionEngineMarketDocuments: (eventId: string) =>
    api.get<MonitorRecord[]>(`/predictions-engine/monitor/markets/${encodePathPart(eventId)}`)
      .then((response) => response.data),

  // Bet Lab Monitor
  getBetLabDashboard: <TResponse = BetLabAdminMonitorResponse>() =>
    api.get<TResponse>('/bet-lab/admin/monitor').then((response) => response.data),

  getBetLabEvents: <TResponse = MonitorEvent[]>(queryOrLimit: BetLabMonitorEventsQuery | number = 50) => {
    const query = typeof queryOrLimit === 'number' ? { limit: queryOrLimit } : queryOrLimit;
    return api.get<TResponse>('/bet-lab/admin/events', { params: compactQuery(query) })
      .then((response) => response.data);
  },

  // Settlement Monitor: query contracts match SettlementAdminController DTOs.
  getSettlementDashboard: <TResponse = SettlementMonitorOverview>() =>
    api.get<TResponse>('/settlement/admin/monitor').then((response) => response.data),

  getSettlementJobs: <TResponse = SettlementPage<SettlementJob>>(query: SettlementJobQuery = {}) =>
    api.get<TResponse>('/settlement/admin/jobs', { params: compactQuery(query) })
      .then((response) => response.data),

  getSettlementRuns: <TResponse = SettlementPage<SettlementRun>>(query: SettlementRunQuery = {}) =>
    api.get<TResponse>('/settlement/admin/runs', { params: compactQuery(query) })
      .then((response) => response.data),

  getSettlementEvents: <TResponse = SettlementEventsResponse>(query: SettlementEventQuery = {}) =>
    api.get<TResponse>('/settlement/admin/events', { params: compactQuery(query) })
      .then((response) => response.data),

  requeueSettlementFixture: (eventId: string, leagueId?: string) =>
    api.post<RequeueFixtureResponse>(
      `/settlement/admin/fixtures/${encodePathPart(eventId)}/requeue`,
      undefined,
      { params: compactQuery({ leagueId }) },
    ).then((response) => response.data),

  // Module-specific monitors use the same service and shared response contract.
  getAdsMonitor: () =>
    api.get<AdsMonitorResponse>('/admin/ads/monitor').then((response) => response.data),

  getCustomerCareMonitor: () =>
    api.get<CustomerCareMonitorResponse>('/admin/customer-care/monitor').then((response) => response.data),

  getOddsMonitor: () =>
    api.get<OddsMonitorResponse>('/odds/admin/monitor').then((response) => response.data),

  getPromosMonitor: () =>
    api.get<PromosMonitorResponse>('/promos/admin/monitor').then((response) => response.data),

  getReferralsMonitor: () =>
    api.get<ReferralsMonitorResponse>('/referrals/admin/monitor').then((response) => response.data),

  getSubscriptionsMonitor: () =>
    api.get<SubscriptionsMonitorResponse>('/subscriptions/admin/monitor').then((response) => response.data),
} as const;

/**
 * Backwards-compatible method names for callers that previously imported the
 * standalone System Monitor service. Requests still flow through the canonical
 * monitoringService implementation above.
 */
export const systemMonitorService = {
  ...monitoringService,
  getDashboard: monitoringService.getSystemDashboard,
  getModules: monitoringService.getSystemModules,
  getModule: monitoringService.getSystemModule,
} as const;

export type MonitoringService = typeof monitoringService;
export type { MonitorRecord } from '@/types/monitoring';
export type MonitorRecordResponse = MonitorRecord;
export default monitoringService;

