'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/lib/axios';
import {
  ADMIN_REALTIME_EVENTS,
  type AdminRealtimeEventName,
  type AdminRealtimeEventRecord,
  type AdminRealtimeModuleStatus,
  type AdminRealtimePayload,
  type AdminRealtimeState,
} from '@/types/admin-realtime';
import {
  ADMIN_REALTIME_INVALIDATION_DEBOUNCE_MS,
  ADMIN_REALTIME_MAX_RECENT_EVENTS,
  ADMIN_REALTIME_SERVER_RETRY_DELAYS_MS,
  appendAdminRealtimeEvent,
  getAdminRealtimeEventIdentity,
  getAdminRealtimeEventOccurredAt,
  getAdminRealtimeInvalidationPrefixes,
  getAdminRealtimeModuleForEvent,
  isAdminRealtimeModuleStatus,
  parseAdminRealtimeReadyPayload,
  toAdminRealtimePayload,
  upsertAdminRealtimeModuleStatus,
} from '@/lib/admin-realtime.utils';

const INITIAL_STATE: AdminRealtimeState = {
  connectionStatus: 'disconnected',
  modules: [],
  recentEvents: [],
  reconnectAttempts: 0,
};
const MAX_SERVER_DISCONNECT_RETRIES = ADMIN_REALTIME_SERVER_RETRY_DELAYS_MS.length;

type QueryPrefix = readonly unknown[];

function createEventRecord(
  event: AdminRealtimeEventName,
  payload: AdminRealtimePayload,
): AdminRealtimeEventRecord {
  const occurredAt = getAdminRealtimeEventOccurredAt(payload);
  const identity = getAdminRealtimeEventIdentity(event, payload);
  return {
    id: identity ?? `${Date.now()}-${event}-${Math.random().toString(36).slice(2, 8)}`,
    event,
    module: getAdminRealtimeModuleForEvent(event, payload),
    occurredAt,
    payload,
  };
}

/**
 * Opens the authenticated root Socket.IO gateway for admins only.
 * REST remains the source of truth; realtime events invalidate active queries.
 */
export function useAdminRealtime(enabled = true): AdminRealtimeState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AdminRealtimeState>(INITIAL_STATE);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setState(INITIAL_STATE);
      return;
    }

    let activeToken = Cookies.get('token');
    if (!activeToken) {
      setState(INITIAL_STATE);
      return;
    }

    const socketBase = API_BASE_URL.replace(/\/api\/?$/i, '');
    const socket: Socket = io(socketBase, {
      auth: { token: activeToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      randomizationFactor: 0.35,
      timeout: 10_000,
    });

    let disposed = false;
    let serverDisconnectAttempts = 0;
    let serverRetryTimer: ReturnType<typeof setTimeout> | undefined;
    const invalidationTimers = new Map<string, ReturnType<typeof setTimeout>>();

    const updateState = (updater: (current: AdminRealtimeState) => AdminRealtimeState) => {
      if (!disposed) setState(updater);
    };

    const invalidate = (prefix: QueryPrefix) => {
      void queryClient.invalidateQueries({ queryKey: prefix, refetchType: 'active' }).catch(() => undefined);
    };

    const scheduleInvalidation = (prefix: QueryPrefix) => {
      if (disposed) return;
      const key = JSON.stringify(prefix);
      const existing = invalidationTimers.get(key);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        invalidationTimers.delete(key);
        if (!disposed) invalidate(prefix);
      }, ADMIN_REALTIME_INVALIDATION_DEBOUNCE_MS);
      invalidationTimers.set(key, timer);
    };

    const scheduleServerDisconnectRetry = () => {
      if (disposed || serverRetryTimer) return;
      if (serverDisconnectAttempts >= MAX_SERVER_DISCONNECT_RETRIES) {
        updateState((current) => ({
          ...current,
          connectionStatus: 'error',
          reconnectAttempts: serverDisconnectAttempts,
          errorMessage: 'The admin gateway repeatedly closed the connection. Check your session and reconnect.',
        }));
        return;
      }

      const delay = ADMIN_REALTIME_SERVER_RETRY_DELAYS_MS[serverDisconnectAttempts] ?? 7_000;
      serverDisconnectAttempts += 1;
      updateState((current) => ({
        ...current,
        connectionStatus: 'connecting',
        reconnectAttempts: serverDisconnectAttempts,
        errorMessage: undefined,
      }));
      serverRetryTimer = setTimeout(() => {
        serverRetryTimer = undefined;
        if (disposed) return;
        const latestToken = Cookies.get('token');
        if (!latestToken) {
          updateState(() => INITIAL_STATE);
          return;
        }
        activeToken = latestToken;
        socket.auth = { token: activeToken };
        if (!socket.connected) socket.connect();
      }, delay);
    };

    const handleEvent = (event: AdminRealtimeEventName, rawPayload: unknown) => {
      const payload = toAdminRealtimePayload(rawPayload);
      const eventRecord = createEventRecord(event, payload);
      updateState((current) => ({
        ...current,
        lastEventAt: eventRecord.occurredAt,
        recentEvents: appendAdminRealtimeEvent(
          current.recentEvents,
          eventRecord,
          ADMIN_REALTIME_MAX_RECENT_EVENTS,
        ),
      }));
      for (const prefix of getAdminRealtimeInvalidationPrefixes(event)) scheduleInvalidation(prefix);
    };

    const handleReady = (rawPayload: unknown) => {
      const ready = parseAdminRealtimeReadyPayload(rawPayload);
      if (!ready) return;
      serverDisconnectAttempts = 0;
      if (serverRetryTimer) {
        clearTimeout(serverRetryTimer);
        serverRetryTimer = undefined;
      }
      updateState((current) => ({
        ...current,
        connectionStatus: 'connected',
        connectedAt: ready.connectedAt,
        modules: [...ready.modules].sort((a, b) => a.module.localeCompare(b.module)),
        reconnectAttempts: 0,
        errorMessage: undefined,
      }));
      scheduleInvalidation(['system-monitor']);
    };

    const handleModuleStatus = (rawPayload: unknown) => {
      if (!isAdminRealtimeModuleStatus(rawPayload)) return;
      const status = rawPayload as AdminRealtimeModuleStatus;
      const payload = toAdminRealtimePayload(rawPayload);
      const occurredAt = status.updatedAt;
      const eventRecord: AdminRealtimeEventRecord = {
        id: `realtime:module-status:${status.module}:${status.updatedAt}`,
        event: 'realtime:module-status',
        module: status.module,
        occurredAt,
        payload,
      };
      updateState((current) => ({
        ...current,
        lastEventAt: occurredAt,
        modules: upsertAdminRealtimeModuleStatus(current.modules, status),
        recentEvents: appendAdminRealtimeEvent(
          current.recentEvents,
          eventRecord,
          ADMIN_REALTIME_MAX_RECENT_EVENTS,
        ),
      }));
      scheduleInvalidation(['system-monitor']);
    };

    const onConnect = () => {
      updateState((current) => ({
        ...current,
        connectionStatus: 'connected',
        errorMessage: undefined,
      }));
    };

    const onDisconnect = (reason: string) => {
      updateState((current) => ({
        ...current,
        connectionStatus: 'disconnected',
        errorMessage: reason === 'io server disconnect'
          ? 'The admin gateway closed this connection; retrying authentication.'
          : undefined,
      }));
      // Socket.IO does not automatically reconnect after a server-initiated disconnect.
      if (reason === 'io server disconnect') scheduleServerDisconnectRetry();
    };

    const onConnectError = (error: Error) => {
      updateState((current) => ({
        ...current,
        connectionStatus: 'error',
        errorMessage: error.message.slice(0, 180),
      }));
    };

    const onReconnectAttempt = (attempt: number) => {
      updateState((current) => ({
        ...current,
        connectionStatus: 'connecting',
        reconnectAttempts: attempt,
        errorMessage: undefined,
      }));
    };

    const onReconnectError = (error: Error) => {
      updateState((current) => ({
        ...current,
        connectionStatus: 'error',
        errorMessage: error.message.slice(0, 180),
      }));
    };

    const resyncOnForeground = () => {
      if (document.visibilityState === 'hidden' || !navigator.onLine || disposed) return;
      const latestToken = Cookies.get('token');
      if (!latestToken) {
        socket.disconnect();
        updateState(() => INITIAL_STATE);
        return;
      }

      if (latestToken !== activeToken) {
        if (serverRetryTimer) {
          clearTimeout(serverRetryTimer);
          serverRetryTimer = undefined;
        }
        serverDisconnectAttempts = 0;
        activeToken = latestToken;
        socket.auth = { token: activeToken };
        socket.disconnect();
        updateState((current) => ({ ...current, connectionStatus: 'connecting', reconnectAttempts: 0, errorMessage: undefined }));
        socket.connect();
      } else if (!socket.connected && !socket.active && !serverRetryTimer) {
        serverDisconnectAttempts = 0;
        socket.connect();
      }

      // Reconcile missed events after a suspended tab or temporary network loss.
      for (const prefix of [
        ['system-monitor'], ['payments'], ['subscriptions'], ['analytics'],
        ['website-analytics'], ['odds'], ['predictions', 'engine'], ['settlement'], ['bet-lab'],
      ] as const) invalidate(prefix);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect_error', onReconnectError);
    socket.on('realtime:ready', handleReady);
    socket.on('realtime:module-status', handleModuleStatus);

    const handlers = ADMIN_REALTIME_EVENTS.map((event) => {
      const handler = (payload: unknown) => handleEvent(event, payload);
      socket.on(event, handler);
      return { event, handler };
    });

    document.addEventListener('visibilitychange', resyncOnForeground);
    window.addEventListener('online', resyncOnForeground);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', resyncOnForeground);
      window.removeEventListener('online', resyncOnForeground);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.io.off('reconnect_error', onReconnectError);
      socket.off('realtime:ready', handleReady);
      socket.off('realtime:module-status', handleModuleStatus);
      for (const { event, handler } of handlers) socket.off(event, handler);
      if (serverRetryTimer) clearTimeout(serverRetryTimer);
      for (const timer of invalidationTimers.values()) clearTimeout(timer);
      invalidationTimers.clear();
      socket.disconnect();
    };
  }, [enabled, queryClient]);

  return state;
}
