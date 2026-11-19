'use client';

import { FaCircle, FaTriangleExclamation, FaTowerBroadcast } from 'react-icons/fa6';
import { useAdminRealtimeState } from './AdminRealtimeProvider';
import type { AdminRealtimeEventRecord, AdminRealtimeModuleStatus } from '@/types/admin-realtime';

function formatModule(value: string): string {
  return value.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function timeLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function isFailure(event: AdminRealtimeEventRecord): boolean {
  const level = event.payload.level;
  return event.event.includes('error') || event.event.endsWith(':failed') || level === 'ERROR' || event.payload.terminal === true;
}

function eventMessage(event: AdminRealtimeEventRecord): string {
  if (typeof event.payload.message === 'string' && event.payload.message.trim()) return event.payload.message;
  if (typeof event.payload.operation === 'string') return `${formatModule(event.module)} · ${event.payload.operation}`;
  if (typeof event.payload.status === 'string') return `${formatModule(event.module)} · ${event.payload.status}`;
  return formatModule(event.event.replace(/:/g, ' '));
}

function statusTone(status: AdminRealtimeModuleStatus['operationalStatus'] | 'INTEGRATION_FAILED') {
  if (status === 'READY') return 'text-emerald-700 dark:text-emerald-300';
  if (status === 'FAILED' || status === 'DEGRADED' || status === 'INTEGRATION_FAILED') return 'text-rose-700 dark:text-rose-300';
  if (status === 'STARTING') return 'text-sky-700 dark:text-sky-300';
  return 'text-amber-700 dark:text-amber-300';
}

export default function AdminRealtimeMonitor() {
  const { connectionStatus, modules, recentEvents, connectedAt, reconnectAttempts = 0, errorMessage } = useAdminRealtimeState();
  const degraded = modules.filter((item) =>
    item.integrationStatus === 'FAILED' || item.operationalStatus === 'FAILED' || item.operationalStatus === 'DEGRADED',
  ).length;
  const ready = modules.filter((item) => item.integrationStatus === 'READY' && item.operationalStatus === 'READY').length;

  return (
    <section className="rounded-lg border border-border/70 bg-card p-2.5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary"><FaTowerBroadcast className="text-xs" /></span>
          <div>
            <h2 className="text-xs font-semibold text-foreground">Admin realtime</h2>
            <p className="text-[10px] text-muted-foreground">
              {connectionStatus === 'connected'
                ? `Connected${connectedAt ? ` since ${timeLabel(connectedAt)}` : ''}`
                : connectionStatus === 'connecting'
                  ? `Authenticating / reconnecting${reconnectAttempts ? ` · attempt ${reconnectAttempts}` : ''}`
                  : errorMessage || 'Waiting for an authenticated gateway connection'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{ready} ready</span>
          <span className={degraded ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}>{degraded} degraded</span>
          <span className="text-muted-foreground">{modules.length} registered</span>
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 rounded-md bg-muted/40 p-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Module readiness</h3>
            <span className="text-[9px] text-muted-foreground">Integration and operation are separate</span>
          </div>
          {modules.length ? (
            <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
              {modules.map((module) => {
                const failedIntegration = module.integrationStatus === 'FAILED';
                const status = failedIntegration ? 'INTEGRATION_FAILED' : module.operationalStatus;
                return (
                  <div key={module.module} className="flex items-start justify-between gap-2 border-b border-border/50 pb-1 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-medium text-foreground">{formatModule(module.module)}</p>
                      <p className="truncate text-[9px] text-muted-foreground" title={module.message}>{module.message}</p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-bold ${statusTone(status)}`}>{status.replace(/_/g, ' ')}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-5 text-center text-[10px] text-muted-foreground">Module status will appear after the gateway authenticates.</p>
          )}
        </div>

        <div className="min-w-0 rounded-md bg-muted/40 p-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Live event stream</h3>
            <span className="text-[9px] text-muted-foreground">Newest first · {recentEvents.length} buffered</span>
          </div>
          {recentEvents.length ? (
            <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
              {recentEvents.slice(0, 12).map((event) => {
                const failed = isFailure(event);
                return (
                  <div key={event.id} className="flex items-start gap-2 border-b border-border/50 pb-1 last:border-0 last:pb-0">
                    {failed
                      ? <FaTriangleExclamation className="mt-0.5 h-2.5 w-2.5 shrink-0 text-rose-500" />
                      : <FaCircle className="mt-1 h-1.5 w-1.5 shrink-0 text-emerald-500" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-2">
                        <span className={`text-[9px] font-semibold ${failed ? 'text-rose-700 dark:text-rose-300' : 'text-foreground'}`}>{formatModule(event.event.replace(/:/g, ' '))}</span>
                        <time className="text-[9px] tabular-nums text-muted-foreground">{timeLabel(event.occurredAt)}</time>
                      </div>
                      <p className="line-clamp-2 break-words text-[10px] text-muted-foreground">{eventMessage(event)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-5 text-center text-[10px] text-muted-foreground">No admin events received in this session.</p>
          )}
        </div>
      </div>
    </section>
  );
}
