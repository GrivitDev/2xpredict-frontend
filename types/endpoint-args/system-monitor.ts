import type {
  SystemMonitorActivityQuery, SystemMonitorCollectionOperationsQuery,
  SystemMonitorCronQuery, SystemMonitorDatabaseOperationsQuery,
  SystemMonitorErrorQuery, SystemMonitorModuleQuery, SystemMonitorStorageHistoryQuery,
} from '../monitoring';
export type GetModulesArgs = SystemMonitorModuleQuery;
export type GetCronsArgs = SystemMonitorCronQuery;
export type GetErrorsArgs = SystemMonitorErrorQuery;
export type GetActivityArgs = SystemMonitorActivityQuery;
export type GetStorageHistoryArgs = SystemMonitorStorageHistoryQuery;
export type GetDatabaseOperationsArgs = SystemMonitorDatabaseOperationsQuery;
export type GetCollectionOperationsArgs = SystemMonitorCollectionOperationsQuery;
export interface GetModuleArgs { path: { name: string } }
export interface GetCronArgs { path: { key: string } }
export interface GetCollectionArgs { path: { name: string } }
