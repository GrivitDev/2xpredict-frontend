'use client';

import { FaCircle } from 'react-icons/fa6';
import { useAdminRealtimeState } from './AdminRealtimeProvider';

const connectionLabels = {
  connecting: 'Connecting',
  connected: 'Connected',
  disconnected: 'Offline',
  error: 'Connection error',
} as const;

export default function AdminRealtimeStatusBar() {
  const { connectionStatus, modules, lastEventAt, errorMessage, reconnectAttempts = 0 } = useAdminRealtimeState();
  const degradedCount = modules.filter((item) =>
    item.integrationStatus === 'FAILED' ||
    item.operationalStatus === 'DEGRADED' ||
    item.operationalStatus === 'FAILED',
  ).length;
  const connected = connectionStatus === 'connected';
  const tone = connected
    ? 'text-emerald-700 dark:text-emerald-300'
    : connectionStatus === 'error'
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-amber-700 dark:text-amber-300';
  const dot = connected ? 'text-emerald-500' : connectionStatus === 'error' ? 'text-rose-500' : 'text-amber-500';
  const parsedLastEvent = lastEventAt ? new Date(lastEventAt) : null;
  const lastSeen = parsedLastEvent && !Number.isNaN(parsedLastEvent.getTime())
    ? parsedLastEvent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'No events yet';
  const connectionLabel = connectionStatus === 'connecting' && reconnectAttempts > 0
    ? `Reconnecting (${reconnectAttempts})`
    : connectionLabels[connectionStatus];

  return (
    <div title={errorMessage || 'Authenticated admin Socket.IO connection'} className="mb-1 flex min-h-7 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-border/60 bg-card/80 px-2 py-1 text-[10px]">
      <div className={`inline-flex items-center gap-1.5 font-semibold ${tone}`}>
        <FaCircle className={`h-1.5 w-1.5 ${dot}`} />
        Admin realtime {connectionLabel}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
        <span>{modules.length} module integrations</span>
        {degradedCount > 0 ? <span className="font-semibold text-rose-600 dark:text-rose-400">{degradedCount} degraded / failed</span> : null}
        <span>Last event: {lastSeen}</span>
      </div>
    </div>
  );
}
