export type AdminRealtimeConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type AdminRealtimeOperationalStatus =
  | 'READY'
  | 'STARTING'
  | 'DEGRADED'
  | 'FAILED'
  | 'STOPPED'
  | 'UNKNOWN';

export interface AdminRealtimeModuleStatus {
  module: string;
  integrationStatus: 'READY' | 'FAILED';
  operationalStatus: AdminRealtimeOperationalStatus;
  message: string;
  registeredAt: string;
  updatedAt: string;
  lastEventAt?: string;
  eventCount: number;
  details?: Record<string, unknown>;
}

export interface AdminRealtimeReadyPayload {
  connected: true;
  audience: 'admin';
  connectedAt: string;
  modules: AdminRealtimeModuleStatus[];
}

export interface AdminRealtimePayload extends Record<string, unknown> {
  module?: string;
  message?: string;
  occurredAt?: string;
}

/** Event names currently published by backend/src/realtime/admin.gateway.ts and its callers. */
export const ADMIN_REALTIME_EVENTS = [
  'payment:new',
  'payment:update',
  'analytics:update',
  'analytics:ingestion-update',
  'odds:cycle-completed',
  'odds:worker-error',
  'odds:retention-completed',
  'odds:retention-error',
  'predictions:event',
  'predictions:worker-status',
  'settlement:worker-ready',
  'settlement:worker-error',
  'settlement:drain-started',
  'settlement:job-started',
  'settlement:job-requeued',
  'settlement:job-skipped',
  'settlement:job-completed',
  'settlement:job-failed',
  'bet-lab:ticket-placed',
  'system:module-health',
  'system:error',
  'system:activity',
] as const;

export type AdminRealtimeEventName = (typeof ADMIN_REALTIME_EVENTS)[number] | 'realtime:module-status';

export interface AdminRealtimeEventRecord {
  id: string;
  event: AdminRealtimeEventName;
  module: string;
  occurredAt: string;
  payload: AdminRealtimePayload;
}

export interface AdminRealtimeState {
  connectionStatus: AdminRealtimeConnectionStatus;
  connectedAt?: string;
  lastEventAt?: string;
  modules: AdminRealtimeModuleStatus[];
  recentEvents: AdminRealtimeEventRecord[];
  reconnectAttempts?: number;
  errorMessage?: string;
}
