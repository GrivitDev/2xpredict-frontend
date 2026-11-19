import type {
  AdminRealtimeEventName,
  AdminRealtimeEventRecord,
  AdminRealtimeModuleStatus,
  AdminRealtimePayload,
  AdminRealtimeReadyPayload,
} from '@/types/admin-realtime';

export const ADMIN_REALTIME_MAX_RECENT_EVENTS = 40;
export const ADMIN_REALTIME_INVALIDATION_DEBOUNCE_MS = 350;
export const ADMIN_REALTIME_SERVER_RETRY_DELAYS_MS = [1_000, 3_000, 7_000] as const;

export type AdminRealtimeQueryPrefix = readonly unknown[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function toAdminRealtimePayload(value: unknown): AdminRealtimePayload {
  return isRecord(value) ? (value as AdminRealtimePayload) : {};
}

function isOperationalStatus(value: unknown): value is AdminRealtimeModuleStatus['operationalStatus'] {
  return value === 'READY' || value === 'STARTING' || value === 'DEGRADED' ||
    value === 'FAILED' || value === 'STOPPED' || value === 'UNKNOWN';
}

export function isAdminRealtimeModuleStatus(value: unknown): value is AdminRealtimeModuleStatus {
  if (!isRecord(value)) return false;
  return typeof value.module === 'string' && value.module.trim().length > 0 &&
    (value.integrationStatus === 'READY' || value.integrationStatus === 'FAILED') &&
    isOperationalStatus(value.operationalStatus) &&
    typeof value.message === 'string' &&
    typeof value.registeredAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.eventCount === 'number' && Number.isFinite(value.eventCount) && value.eventCount >= 0;
}

export function parseAdminRealtimeReadyPayload(value: unknown): AdminRealtimeReadyPayload | null {
  if (!isRecord(value) || value.connected !== true || value.audience !== 'admin') return null;
  const modules = Array.isArray(value.modules)
    ? value.modules.filter(isAdminRealtimeModuleStatus)
    : [];

  return {
    connected: true,
    audience: 'admin',
    connectedAt: typeof value.connectedAt === 'string' ? value.connectedAt : new Date().toISOString(),
    modules,
  };
}

export function getAdminRealtimeModuleForEvent(
  event: AdminRealtimeEventName,
  payload: AdminRealtimePayload,
): string {
  if (typeof payload.module === 'string' && payload.module.trim()) return payload.module;
  if (event.startsWith('payment:')) return 'payments';
  if (event.startsWith('analytics:')) return 'website-analytics';
  if (event.startsWith('odds:')) return 'odds';
  if (event.startsWith('predictions:')) return 'predictions-engine';
  if (event.startsWith('settlement:')) return 'settlement';
  if (event.startsWith('bet-lab:')) return 'bet-lab';
  return 'system-monitor';
}

export function getAdminRealtimeInvalidationPrefixes(
  event: AdminRealtimeEventName,
): AdminRealtimeQueryPrefix[] {
  if (event === 'payment:new') return [['payments'], ['analytics']];
  if (event === 'payment:update') return [['payments'], ['analytics'], ['subscriptions']];
  if (event === 'analytics:update' || event === 'analytics:ingestion-update') {
    return [['analytics'], ['website-analytics']];
  }
  if (event.startsWith('odds:')) return [['odds'], ['system-monitor']];
  if (event === 'predictions:worker-status') {
    return [['predictions', 'engine'], ['system-monitor']];
  }
  if (event === 'predictions:event') return [['predictions', 'engine']];
  if (event.startsWith('settlement:')) return [['settlement'], ['system-monitor']];
  if (event === 'bet-lab:ticket-placed') return [['bet-lab']];
  if (event === 'system:module-health' || event === 'system:error') return [['system-monitor']];
  if (event === 'system:activity') return [['system-monitor', 'activity']];
  return [];
}

/** Stable IDs are used only when the publisher supplies an explicit event ID. */
export function getAdminRealtimeEventIdentity(
  event: AdminRealtimeEventName,
  payload: AdminRealtimePayload,
): string | null {
  const eventId = typeof payload.eventId === 'string' || typeof payload.eventId === 'number'
    ? String(payload.eventId).trim()
    : typeof payload.event_id === 'string' || typeof payload.event_id === 'number'
      ? String(payload.event_id).trim()
      : '';
  return eventId ? `${event}:${eventId}` : null;
}

export function appendAdminRealtimeEvent(
  current: AdminRealtimeEventRecord[],
  next: AdminRealtimeEventRecord,
  maximum = ADMIN_REALTIME_MAX_RECENT_EVENTS,
): AdminRealtimeEventRecord[] {
  if (current.some((item) => item.id === next.id)) return current;
  return [next, ...current].slice(0, Math.max(1, maximum));
}

export function upsertAdminRealtimeModuleStatus(
  current: AdminRealtimeModuleStatus[],
  next: AdminRealtimeModuleStatus,
): AdminRealtimeModuleStatus[] {
  const normalizedName = next.module.trim().toLowerCase();
  const updated = current.filter((item) => item.module.trim().toLowerCase() !== normalizedName);
  updated.push(next);
  return updated.sort((a, b) => a.module.localeCompare(b.module));
}

export function getAdminRealtimeEventOccurredAt(payload: AdminRealtimePayload): string {
  if (typeof payload.occurredAt === 'string' && !Number.isNaN(Date.parse(payload.occurredAt))) {
    return payload.occurredAt;
  }
  return new Date().toISOString();
}
