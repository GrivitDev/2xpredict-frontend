'use client';

import {
  FaChartLine as Activity,
  FaTriangleExclamation as AlertTriangle,
  FaClock as Clock3,
  FaDatabase as Database,
  FaFile as File,
  FaListCheck as ListChecks,
  FaRadio as Radio,
  FaArrowsRotate as RefreshCw,
  FaServer as Server,
  FaStopwatch as Timer,
  FaBolt as Zap,
} from 'react-icons/fa6';

import { useSportsMonitor } from '@/hooks/use-sports';

import {
  useSystemMonitorDashboard,
  useSystemMonitorStorage,
} from '@/hooks/use-monitoring';


import {
  useEffect,
  useState,
} from 'react';


// ============================================================
// HELPERS
// ============================================================

const formatDuration = (
  seconds: number,
): string => {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return '—';
  }

  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }

  const minutes =
    Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};


const formatTime = (
  value?: string,
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
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


const formatNumber = (
  value: number,
): string => {
  return new Intl.NumberFormat(
    'en-US',
  ).format(value);
};


const formatBytes = (
  bytes: number,
): string => {
  if (
    !Number.isFinite(bytes) ||
    bytes < 0
  ) {
    return '—';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes /
    Math.pow(
      1024,
      index,
    );

  return `${value.toFixed(
    index === 0 ? 0 : 2,
  )} ${units[index]}`;
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

type DashboardData = {
  crons: Array<{
    key: string;
    name: string;
    module: string;
    status: string;
  }>;
  recentActivity: Array<{
    occurredAt: string;
    operation: string;
    module: string;
    message: string;
    status: string;
  }>;
  summary: {
    recentErrors: number;
  };
  system: {
    status: string;
    uptimeSeconds: number;
  };
};

type StorageData = {
  totals: {
    totalSizeBytes: number;
    dataSizeBytes: number;
    documents: number;
    collections: number;
  };
};

export default function SystemMonitorOverview() {
  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    () => Date.now(),
  );

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(
        Date.now(),
      );
    };

    updateCurrentTime();

    const interval =
      window.setInterval(
        updateCurrentTime,
        1000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, []);


  // ==========================================================
  // QUERIES
  // ==========================================================

  const dashboardQuery =
    useSystemMonitorDashboard();

  const sportsMonitorQuery = useSportsMonitor();
  const sportsMonitor = sportsMonitorQuery.data;
  const provider = sportsMonitor?.provider.espn;

  const storageQuery =
    useSystemMonitorStorage();

  const dashboard =
    dashboardQuery.data as unknown as DashboardData | undefined;

  const storage =
    storageQuery.data as unknown as StorageData | undefined;


  // ==========================================================
  // DERIVED STATE
  // ==========================================================

  const runningCrons =
    dashboard?.crons.filter(
      cron =>
        cron.status === 'RUNNING',
    ) ?? [];

  const failedCrons =
    dashboard?.crons.filter(
      cron =>
        cron.status === 'FAILED',
    ) ?? [];

  const lockedProviders =
    provider?.cooldownUntil &&
    new Date(provider.cooldownUntil).getTime() > currentTime
      ? [provider]
      : [];

  const queuePending = Number(sportsMonitor?.queue.byStatus.PENDING ?? 0);
  const queueProcessing = Number(sportsMonitor?.queue.byStatus.PROCESSING ?? 0);
  const queueCompleted = Number(sportsMonitor?.queue.byStatus.COMPLETED ?? 0);
  const queueFailed = Number(sportsMonitor?.queue.byStatus.FAILED ?? 0) + Number(sportsMonitor?.queue.byStatus.QUARANTINED ?? 0);

  const queueActive =
    queuePending +
    queueProcessing;

  const queueTotal = sportsMonitor?.queue.totalTracked ?? (queuePending + queueProcessing + queueCompleted + queueFailed);

  const queueCompletionPercent =
    queueTotal > 0
      ? Math.round(
          (queueCompleted /
            queueTotal) *
            100,
        )
      : 0;


  // ==========================================================
  // PROVIDER USAGE
  // ==========================================================

  const recentActivity =
    dashboard?.recentActivity ??
    [];

  const recentErrors =
    dashboard?.summary.recentErrors ??
    0;

  const totalOperationalAlerts =
    recentErrors +
    failedCrons.length +
    queueFailed +
    lockedProviders.length +
    (sportsMonitor?.summary.criticalAlerts ?? 0);


  // ==========================================================
  // STORAGE
  // ==========================================================

  const databaseTotalSize =
    storage?.totals.totalSizeBytes ??
    0;

  const databaseFileSize =
    storage?.totals.dataSizeBytes ??
    0;

  const databaseDocuments =
    storage?.totals.documents ??
    0;

  const databaseCollections =
    storage?.totals.collections ??
    0;


  return (
    <div className="space-y-2">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div>
          <h2 className="text-xs font-bold text-foreground">
            System Overview
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${
              dashboardQuery.isFetching ||
              storageQuery.isFetching ||
              sportsMonitorQuery.isFetching
                ? 'animate-spin'
                : ''
            }`}
          />

          <span className="text-[10px] text-muted-foreground">
            Auto-refreshing
          </span>
        </div>
      </div>


      {/* ======================================================
          PRIMARY STATUS
      ====================================================== */}

      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          icon={Server}
          label="Backend"
          value={
            dashboard?.system.status ??
            '—'
          }
          detail={
            dashboard?.system.status ===
            'ONLINE'
              ? 'Application responding'
              : 'Status unavailable'
          }
          valueClass={statusClass(
            dashboard?.system.status,
          )}
        />

        <MetricCard
          icon={Timer}
          label="Uptime"
          value={
            dashboard
              ? formatDuration(
                  dashboard.system
                    .uptimeSeconds,
                )
              : '—'
          }
          detail="Current process runtime"
        />

        <MetricCard
          icon={Activity}
          label="Active Work"
          value={formatNumber(
            queueActive,
          )}
          detail={`${runningCrons.length} cron${
            runningCrons.length ===
            1
              ? ''
              : 's'
          } running`}
          valueClass={
            queueActive > 0 ||
            runningCrons.length > 0
              ? 'bg-blue-500/10 text-status-info'
              : ''
          }
        />

        <MetricCard
          icon={AlertTriangle}
          label="Alerts"
          value={formatNumber(
            totalOperationalAlerts,
          )}
          detail={
            totalOperationalAlerts >
            0
              ? 'Requires attention'
              : 'No active alerts'
          }
          valueClass={
            totalOperationalAlerts >
            0
              ? 'bg-red-500/10 text-status-danger'
              : 'bg-emerald-500/10 text-status-success'
          }
        />

        <MetricCard
          icon={Database}
          label="DB Storage"
          value={formatBytes(
            databaseTotalSize,
          )}
          detail={
            storage
              ? `${formatNumber(
                  databaseDocuments,
                )} docs · ${formatNumber(
                  databaseCollections,
                )} collections`
              : 'Storage unavailable'
          }
          valueClass="bg-primary/10 text-primary"
        />

        <MetricCard
          icon={File}
          label="DB File Size"
          value={formatBytes(
            databaseFileSize,
          )}
          detail="Database data size"
          valueClass="bg-blue-500/10 text-status-info"
        />
      </div>


      {/* ======================================================
          OPERATIONAL SNAPSHOT
      ====================================================== */}

      <div className="grid gap-2 xl:grid-cols-3">
        <Panel
          title="Queue Snapshot"
          icon={ListChecks}
        >
          <div className="grid grid-cols-4 gap-1.5">
            <MiniMetric
              label="Pending"
              value={queuePending}
            />

            <MiniMetric
              label="Processing"
              value={queueProcessing}
              valueClass={
                queueProcessing > 0
                  ? 'text-status-info'
                  : undefined
              }
            />

            <MiniMetric
              label="Completed"
              value={queueCompleted}
              valueClass="text-status-success"
            />

            <MiniMetric
              label="Failed"
              value={queueFailed}
              valueClass={
                queueFailed > 0
                  ? 'text-status-danger'
                  : undefined
              }
            />
          </div>

          <div className="mt-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">
                Queue completion
              </span>

              <span className="font-semibold text-foreground">
                {queueCompletionPercent}%
              </span>
            </div>

            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${queueCompletionPercent}%`,
                }}
              />
            </div>
          </div>
        </Panel>


        <Panel
          title="Cron State"
          icon={Radio}
        >
          <div className="grid grid-cols-4 gap-1.5">
            <MiniMetric
              label="Running"
              value={
                runningCrons.length
              }
              valueClass={
                runningCrons.length >
                0
                  ? 'text-status-info'
                  : undefined
              }
            />

            <MiniMetric
              label="Failed"
              value={
                failedCrons.length
              }
              valueClass={
                failedCrons.length >
                0
                  ? 'text-status-danger'
                  : undefined
              }
            />

            <MiniMetric
              label="Registered"
              value={
                dashboard?.crons
                  .length ?? 0
              }
            />

            <MiniMetric
              label="Errors"
              value={recentErrors}
              valueClass={
                recentErrors > 0
                  ? 'text-status-danger'
                  : 'text-status-success'
              }
            />
          </div>

          <div className="mt-1 flex items-center justify-between rounded-lg border border-border bg-background/40 px-1.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />

              <span className="text-[10px] text-muted-foreground">
                Runtime
              </span>
            </div>

            <span className="text-[11px] font-semibold text-foreground">
              {dashboard
                ? formatDuration(
                    dashboard.system
                      .uptimeSeconds,
                  )
                : '—'}
            </span>
          </div>
        </Panel>


        <Panel title="Provider Health" icon={Zap}>
          <div className="grid grid-cols-4 gap-1.5">
            <MiniMetric label="Provider" value="ESPN" />
            <MiniMetric label="Health" value={provider?.health ?? 'UNKNOWN'} />
            <MiniMetric label="Requests" value={formatNumber(provider?.requestAttempts ?? 0)} />
            <MiniMetric label="Failures" value={formatNumber(provider?.consecutiveFailures ?? 0)} valueClass={(provider?.consecutiveFailures ?? 0) > 0 ? 'text-status-warning' : 'text-status-success'} />
          </div>
        </Panel>
      </div>


      {/* ======================================================
          CURRENT OPERATIONS
      ====================================================== */}

      <Panel
        title="Current Operations"
        icon={Activity}
      >
        <div className="space-y-1.5">
          {runningCrons.length > 0 &&
            runningCrons.map(
              cron => (
                <OperationRow
                  key={cron.key}
                  title={cron.name}
                  detail={cron.module}
                  status="RUNNING"
                  tone="blue"
                />
              ),
            )}

          {queueProcessing >
            0 && (
            <OperationRow
              title="ESPN queue processing"
              detail={`${formatNumber(
                queueProcessing,
              )} job${
                queueProcessing ===
                1
                  ? ''
                  : 's'
              } currently processing`}
              status="PROCESSING"
              tone="blue"
            />
          )}

          {lockedProviders.length >
            0 && (
            <OperationRow
              title="Provider rate-limit lock"
              detail={`${lockedProviders.length} endpoint${
                lockedProviders.length ===
                1
                  ? ''
                  : 's'
              } currently locked`}
              status="LOCKED"
              tone="red"
            />
          )}

          {runningCrons.length ===
            0 &&
            queueProcessing ===
              0 &&
            lockedProviders.length ===
              0 && (
            <EmptyState>
              No active backend operation requires attention.
            </EmptyState>
          )}
        </div>
      </Panel>


      {/* ======================================================
          PROVIDER STATE
      ====================================================== */}

      <Panel title="Provider State" icon={Zap}>
        {provider ? (
          <div className="space-y-1.5 rounded-md border border-border bg-background/40 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-foreground">ESPN v2 provider</span>
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${lockedProviders.length ? 'bg-amber-500/10 text-status-warning' : 'bg-emerald-500/10 text-status-success'}`}>
                {lockedProviders.length ? 'COOLDOWN' : provider.health ?? 'UNKNOWN'}
              </span>
            </div>
            <p className="break-words text-[10px] text-muted-foreground">{provider.lastFailure ?? 'No provider failure reported.'}</p>
            <p className="text-[9px] text-muted-foreground">Cooldown until: {formatTime(provider.cooldownUntil)}</p>
            <p className="text-[9px] text-muted-foreground">Last failure: {formatTime(provider.lastFailedAt)}</p>
          </div>
        ) : <EmptyState>ESPN provider telemetry is not available.</EmptyState>}
      </Panel>


      {/* ======================================================
          RECENT ACTIVITY
      ====================================================== */}

      <Panel
        title="Recent Activity"
        icon={Database}
      >
        <div className="space-y-1.5">
          {recentActivity
            .slice(0, 6)
            .map(
              (
                item,
                index,
              ) => (
                <div
                  key={`${item.occurredAt}-${item.operation}-${index}`}
                  className="flex items-start justify-between gap-1.5 rounded-lg border border-border/60 bg-background/30 px-1.5 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {
                        item.operation
                      }
                    </p>

                    <p className="truncate text-[9px] text-muted-foreground">
                      {
                        item.module
                      }{' '}
                      ·{' '}
                      {
                        item.message
                      }
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${statusClass(
                        item.status,
                      )}`}
                    >
                      {
                        item.status
                      }
                    </span>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      {formatTime(
                        item.occurredAt,
                      )}
                    </p>
                  </div>
                </div>
              ),
            )}

          {recentActivity.length ===
            0 && (
            <EmptyState>
              No recent activity recorded.
            </EmptyState>
          )}
        </div>
      </Panel>
    </div>
  );
}


// ============================================================
// UI
// ============================================================

function EmptyState({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="rounded-lg border border-dashed border-border px-2 py-3 text-center text-[10px] text-muted-foreground">
      {children}
    </p>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  valueClass = '',
}: {
  icon: typeof Server;
  label: string;
  value: string | number;
  detail: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card/60 px-2 py-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />

        <span className="text-[10px] font-medium">
          {label}
        </span>
      </div>

      <span
        className={`mt-1.5 inline-flex rounded-full px-1.5 py-0.5 text-xs font-bold ${
          valueClass ||
          'text-foreground'
        }`}
      >
        {value}
      </span>

      <p className="mt-1 truncate text-[9px] text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}


function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Server;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card/60 p-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />

        <h3 className="text-[11px] font-semibold text-foreground">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}


function MiniMetric({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: number | string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-1.5 py-1.5">
      <p className="text-[8px] text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-0.5 text-xs font-bold ${
          valueClass ||
          'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  );
}


function OperationRow({
  title,
  detail,
  status,
  tone,
}: {
  title: string;
  detail: string;
  status: string;
  tone: 'blue' | 'red';
}) {
  return (
    <div className="flex items-center justify-between gap-1.5 rounded-lg border border-border bg-background/40 px-1.5 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-foreground">
          {title}
        </p>

        <p className="truncate text-[9px] text-muted-foreground">
          {detail}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
          tone === 'red'
            ? 'bg-red-500/10 text-status-danger'
            : 'bg-blue-500/10 text-status-info'
        }`}
      >
        {status}
      </span>
    </div>
  );
}

