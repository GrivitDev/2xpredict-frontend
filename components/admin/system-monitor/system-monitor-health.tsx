'use client';

import {
  FaChartLine as Activity,
  FaTriangleExclamation as AlertTriangle,
  FaCircleCheck as CheckCircle2,
  FaClock as Clock3,
  FaGlobe as Globe2,
  FaArrowsRotate as RefreshCw,
  FaServer as Server,
  FaShieldHalved as ShieldCheck,
  FaStopwatch as Timer,
  FaCircleXmark as XCircle,
  FaBolt as Zap,
} from 'react-icons/fa6';

import {
  useState,
} from 'react';

import { useSportsMonitor } from '@/hooks/use-sports';

import {
  useSystemMonitorDashboard,
} from '@/hooks/use-monitoring';



// ============================================================
// HELPERS
// ============================================================

const formatDuration = (
  seconds: number,
): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '—';
  }

  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};


const formatDateTime = (
  value?: string,
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};


const formatTime = (
  value?: string,
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleTimeString(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
  );
};


const statusClass = (
  status?: string,
): string => {
  switch (status) {
    case 'ONLINE':
    case 'SUCCESS':
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-status-success';

    case 'RUNNING':
    case 'PROCESSING':
      return 'bg-blue-500/10 text-status-info';

    case 'FAILED':
    case 'PARTIAL':
      return 'bg-red-500/10 text-status-danger';

    default:
      return 'bg-muted text-muted-foreground';
  }
};


// ============================================================
// COMPONENT
// ============================================================

export default function SystemMonitorHealth() {
  const dashboardQuery =
    useSystemMonitorDashboard();

  const sportsMonitorQuery = useSportsMonitor();
  const sportsMonitor = sportsMonitorQuery.data;
  const provider = sportsMonitor?.provider.espn;
  const dashboard = dashboardQuery.data;
  const [now] = useState(() => Date.now());

  const failedCrons = dashboard?.crons?.filter((cron) => cron.status === 'FAILED').length ?? 0;
  const runningCrons = dashboard?.crons?.filter((cron) => cron.status === 'RUNNING').length ?? 0;
  const completedCrons = dashboard?.crons?.filter((cron) => cron.status === 'SUCCESS').length ?? 0;
  const providerLocked = Boolean(provider?.cooldownUntil && new Date(provider.cooldownUntil).getTime() > now);
  const lockedCount = providerLocked ? 1 : 0;
  const recentErrors = dashboard?.summary?.recentErrors ?? 0;
  const operationalIssues = failedCrons + recentErrors + lockedCount + (sportsMonitor?.summary.criticalAlerts ?? 0);


  // ==========================================================
  // RECENT ACTIVITY
  // ==========================================================

  const recentActivity =
    dashboard?.recentActivity
      ?.slice(0, 6) ?? [];


  return (
    <div className="space-y-2">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold text-foreground">
            System Health
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${
              dashboardQuery.isFetching ||
              sportsMonitorQuery.isFetching
                ? 'animate-spin'
                : ''
            }`}
          />

          <span className="text-[11px] text-muted-foreground">
            Live monitor
          </span>
        </div>
      </div>


      {/* ======================================================
          HEALTH SUMMARY
      ====================================================== */}

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <HealthMetric
          label="Backend Status"
          value={
            dashboard?.system?.status ??
            'UNKNOWN'
          }
          icon={
            dashboard?.system?.status === 'ONLINE'
              ? CheckCircle2
              : XCircle
          }
          tone={
            dashboard?.system?.status === 'ONLINE'
              ? 'success'
              : 'danger'
          }
        />

        <HealthMetric
          label="Running Crons"
          value={String(runningCrons)}
          icon={Activity}
          tone={
            runningCrons > 0
              ? 'neutral'
              : 'success'
          }
        />

        <HealthMetric
          label="Provider Locks"
          value={String(lockedCount)}
          icon={ShieldCheck}
          tone={
            lockedCount > 0
              ? 'warning'
              : 'success'
          }
        />

        <HealthMetric
          label="Operational Issues"
          value={String(operationalIssues)}
          icon={AlertTriangle}
          tone={
            operationalIssues > 0
              ? 'danger'
              : 'success'
          }
        />
      </div>


      {/* ======================================================
          BACKEND
      ====================================================== */}

      <section className="rounded-lg border border-border bg-card/60 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-md ${
                dashboard?.system?.status === 'ONLINE'
                  ? 'bg-emerald-500/10 text-status-success'
                  : 'bg-red-500/10 text-status-danger'
              }`}
            >
              <Server className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground">
                Backend Application
              </p>

              <p className="text-[11px] text-muted-foreground">
                {dashboard?.system?.status === 'ONLINE'
                  ? 'Application process is online and responding'
                  : 'Backend status is unavailable'}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(
              dashboard?.system?.status,
            )}`}
          >
            {dashboard?.system?.status ?? 'UNKNOWN'}
          </span>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <HealthMetric
            label="Uptime"
            value={
              dashboard?.system?.uptimeSeconds != null
                ? formatDuration(dashboard.system.uptimeSeconds)
                : '—'
            }
            icon={Clock3}
          />

          <HealthMetric
            label="Started"
            value={formatDateTime(
              dashboard?.system?.startedAt,
            )}
            icon={Activity}
          />

          <HealthMetric
            label="Monitor Time"
            value={formatDateTime(
              dashboard?.system?.currentTime,
            )}
            icon={Globe2}
          />

          <HealthMetric
            label="Recent Errors"
            value={String(recentErrors)}
            icon={
              recentErrors > 0
                ? AlertTriangle
                : CheckCircle2
            }
            tone={
              recentErrors > 0
                ? 'danger'
                : 'success'
            }
          />
        </div>
      </section>


      {/* ======================================================
          RUNTIME
      ====================================================== */}

      <section className="rounded-lg border border-border bg-card/60 p-2">
        <div className="mb-2 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-muted-foreground" />

          <h3 className="text-xs font-semibold text-foreground">
            Runtime Health
          </h3>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <HealthMetric
            label="Running Crons"
            value={String(runningCrons)}
            icon={Activity}
            tone={
              runningCrons > 0
                ? 'neutral'
                : 'success'
            }
          />

          <HealthMetric
            label="Completed Crons"
            value={String(completedCrons)}
            icon={CheckCircle2}
            tone="success"
          />

          <HealthMetric
            label="Failed Crons"
            value={String(failedCrons)}
            icon={
              failedCrons > 0
                ? XCircle
                : CheckCircle2
            }
            tone={
              failedCrons > 0
                ? 'danger'
                : 'success'
            }
          />
        </div>

        <div className="mt-2 space-y-1.5">
          {(dashboard?.crons ?? [])
            .slice(0, 8)
            .map(cron => (
              <div
                key={cron.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background/40 p-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusClass(
                      cron.status,
                    )}`}
                  >
                    {cron.status === 'FAILED' ? (
                      <XCircle className="h-4 w-4" />
                    ) : cron.status === 'RUNNING' ? (
                      <Activity className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {cron.name}
                    </p>

                    <p className="truncate text-[11px] text-muted-foreground">
                      {cron.module}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-1.5 py-1 text-[10px] font-semibold ${statusClass(
                    cron.status,
                  )}`}
                >
                  {cron.status}
                </span>
              </div>
            ))}

          {(dashboard?.crons?.length ?? 0) === 0 && (
            <div className="rounded-md border border-dashed border-border p-2 text-center text-[11px] text-muted-foreground">
              No cron runtime records available.
            </div>
          )}
        </div>
      </section>


      {/* ======================================================
          PROVIDER HEALTH
      ====================================================== */}

      <section className="rounded-lg border border-border bg-card/60 p-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Globe2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-foreground">ESPN Provider Health</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">From Sports operational monitor</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <HealthMetric label="Provider status" value={provider?.health ?? 'UNKNOWN'} icon={Zap} tone={provider?.health === 'HEALTHY' ? 'success' : provider?.health === 'DEGRADED' ? 'warning' : provider?.health === 'FAILED' ? 'danger' : 'neutral'} />
          <HealthMetric label="Request attempts" value={String(provider?.requestAttempts ?? 0)} icon={Activity} />
          <HealthMetric label="Consecutive failures" value={String(provider?.consecutiveFailures ?? 0)} icon={AlertTriangle} tone={(provider?.consecutiveFailures ?? 0) > 0 ? 'warning' : 'success'} />
          <HealthMetric label="Cooldown" value={providerLocked ? 'ACTIVE' : 'INACTIVE'} icon={ShieldCheck} tone={providerLocked ? 'warning' : 'success'} />
        </div>
        {provider?.lastFailure ? <p className="mt-2 break-words rounded-md border border-border bg-background/40 p-2 text-[10px] text-muted-foreground">{provider.lastFailure}</p> : null}
        <p className="mt-1 text-[9px] text-muted-foreground">Last failure: {formatDateTime(provider?.lastFailedAt)} · Cooldown until: {formatDateTime(provider?.cooldownUntil)}</p>
      </section>

      {/* ======================================================
          RECENT ACTIVITY
      ====================================================== */}

      <section className="rounded-lg border border-border bg-card/60 p-2">
        <div className="mb-2 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-muted-foreground" />

            <h3 className="text-xs font-semibold text-foreground">
              Recent Monitor Activity
            </h3>
          </div>

          <span className="text-[11px] text-muted-foreground">
            Latest events
          </span>
        </div>

        <div className="space-y-1.5">
          {recentActivity.map(
            (item, index) => (
              <div
                key={`${item.occurredAt}-${item.operation}-${index}`}
                className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-border bg-background/40 p-2"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusClass(
                      item.status,
                    )}`}
                  >
                    {item.status === 'FAILED' ? (
                      <XCircle className="h-4 w-4" />
                    ) : item.status === 'STARTED' ? (
                      <Activity className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.operation}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {item.module} · {item.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`rounded-full px-1.5 py-1 text-[10px] font-semibold ${statusClass(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDateTime(
                      item.occurredAt,
                    )}
                  </p>
                </div>
              </div>
            ),
          )}

          {recentActivity.length === 0 && (
            <div className="rounded-md border border-dashed border-border p-2 text-center text-[11px] text-muted-foreground">
              No recent monitor activity recorded.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


// ============================================================
// HEALTH METRIC
// ============================================================

function HealthMetric({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const toneClasses = {
    neutral:
      'bg-muted text-foreground',

    success:
      'bg-emerald-500/10 text-status-success',

    warning:
      'bg-amber-500/10 text-status-warning',

    danger:
      'bg-red-500/10 text-status-danger',
  };

  return (
    <div className="rounded-md border border-border bg-background/40 p-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-4 w-4" />

        <span className="text-[11px]">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 inline-flex rounded-full px-1.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}


// ============================================================
// PROVIDER SUMMARY METRIC
// ============================================================


