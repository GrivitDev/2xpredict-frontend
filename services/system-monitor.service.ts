import api from '@/lib/axios';
import { compactQuery, encodePathPart } from '@/lib/api-utils';
import type {
  SystemMonitorActivity, SystemMonitorActivityQuery, SystemMonitorCoverageResponse,
  SystemMonitorCollectionDetail, SystemMonitorCollectionOperationsQuery,
  SystemMonitorCron, SystemMonitorCronQuery, SystemMonitorDashboard,
  SystemMonitorDatabaseHealth, SystemMonitorDatabaseOperationsResponse,
  SystemMonitorDatabaseOperationsQuery, SystemMonitorError,
  SystemMonitorErrorQuery, SystemMonitorModuleQuery,
  SystemMonitorModuleRecord, SystemMonitorStorage,
  SystemMonitorStorageHistoryItem, SystemMonitorStorageHistoryQuery,
  MonitorModule,
} from '@/types/monitoring';

/** Owns only /admin/system-monitor/* endpoints. */
const systemMonitorEndpoints = {
  getCoverage: () => api.get<SystemMonitorCoverageResponse>('/admin/system-monitor/coverage').then((response) => response.data),
  getSystemDashboard: async () => {
    const response = await api.get<SystemMonitorDashboard>('/admin/system-monitor');
    const dashboard = response.data;
    return {
      ...dashboard,
      modules: dashboard.modules?.map((module): MonitorModule => ({
        ...module, name: module.name ?? module.module,
      })),
    };
  },
  getSystemModules: async (query: SystemMonitorModuleQuery = {}) => {
    const response = await api.get<SystemMonitorModuleRecord[]>('/admin/system-monitor/modules', { params: compactQuery(query) });
    return response.data.map((module): MonitorModule => ({ ...module, name: module.name ?? module.module }));
  },
  getSystemModule: async (name: string) => {
    const response = await api.get<SystemMonitorModuleRecord | null>(`/admin/system-monitor/modules/${encodePathPart(name)}`);
    if (!response.data) return null;
    return { ...response.data, name: response.data.name ?? response.data.module };
  },
  getCrons: (query: SystemMonitorCronQuery = {}) =>
    api.get<SystemMonitorCron[]>('/admin/system-monitor/crons', { params: compactQuery(query) }).then((response) => response.data),
  getCron: (key: string) =>
    api.get<SystemMonitorCron | null>(`/admin/system-monitor/crons/${encodePathPart(key)}`).then((response) => response.data),
  getErrors: (query: SystemMonitorErrorQuery = {}) =>
    api.get<SystemMonitorError[]>('/admin/system-monitor/errors', { params: compactQuery(query) }).then((response) => response.data),
  getActivity: (query: SystemMonitorActivityQuery = {}) =>
    api.get<SystemMonitorActivity[]>('/admin/system-monitor/activity', { params: compactQuery(query) }).then((response) => response.data),
  getStorage: () => api.get<SystemMonitorStorage>('/admin/system-monitor/storage').then((response) => response.data),
  getStorageHistory: (queryOrLimit: SystemMonitorStorageHistoryQuery | number = {}) => {
    const query = typeof queryOrLimit === 'number' ? { limit: queryOrLimit } : queryOrLimit;
    return api.get<SystemMonitorStorageHistoryItem[]>('/admin/system-monitor/storage/history', { params: compactQuery(query) }).then((response) => response.data);
  },
  getDatabaseHealth: () => api.get<SystemMonitorDatabaseHealth>('/admin/system-monitor/database').then((response) => response.data),
  getCollection: (name: string) =>
    api.get<SystemMonitorCollectionDetail>(`/admin/system-monitor/database/collections/${encodePathPart(name)}`).then((response) => response.data),
  getDatabaseOperations: (query: SystemMonitorDatabaseOperationsQuery = {}) =>
    api.get<SystemMonitorDatabaseOperationsResponse>('/admin/system-monitor/database/operations', { params: compactQuery(query) }).then((response) => response.data),
  getCollectionOperations: (name: string, queryOrLimit: SystemMonitorCollectionOperationsQuery | number = {}) => {
    const query = typeof queryOrLimit === 'number' ? { limit: queryOrLimit } : queryOrLimit;
    return api.get<SystemMonitorDatabaseOperationsResponse>(
      `/admin/system-monitor/database/collections/${encodePathPart(name)}/operations`,
      { params: compactQuery(query) },
    ).then((response) => response.data);
  },
} as const;

export const systemMonitorService = {
  ...systemMonitorEndpoints,
  // Friendly aliases used by current system-monitor hooks.
  getDashboard: systemMonitorEndpoints.getSystemDashboard,
  getModules: systemMonitorEndpoints.getSystemModules,
  getModule: systemMonitorEndpoints.getSystemModule,
} as const;

export type SystemMonitorService = typeof systemMonitorService;
export default systemMonitorService;
