'use client';

import type { ComponentType, ReactNode } from 'react';
import { FaArrowsRotate, FaBell, FaBolt, FaDatabase, FaFutbol, FaLayerGroup, FaRotate, FaServer } from 'react-icons/fa6';
import { useRetryFailedSportsBootstrapMutation, useSportsMonitor } from '@/hooks/use-sports';
import toast from 'react-hot-toast';
import type { SportsOperationalAlert } from '@/types/sports-v2';

type MetricProps = { label: string; value: string | number; detail?: string };

function Metric({ label, value, detail }: MetricProps) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-card p-2">
      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-base font-semibold tabular-nums text-foreground">{value}</p>
      {detail ? <p className="mt-0.5 truncate text-[9px] text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function countStatus(statuses: Record<string, number> | undefined, key: string) {
  return Number(statuses?.[key] ?? 0);
}

function StatusBadge({ status }: { status?: string }) {
  const tone = status === 'HEALTHY' || status === 'COMPLETED' || status === 'READY'
    ? 'bg-emerald-500/10 text-emerald-600'
    : status === 'DEGRADED' || status === 'RUNNING' || status === 'PROCESSING'
      ? 'bg-amber-500/10 text-amber-600'
      : status === 'FAILED'
        ? 'bg-rose-500/10 text-rose-600'
        : 'bg-muted text-muted-foreground';
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${tone}`}>{status ?? 'UNKNOWN'}</span>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-border/70 bg-card p-2">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-[11px] font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function AlertRow({ alert }: { alert: SportsOperationalAlert }) {
  const critical = alert.severity === 'CRITICAL';
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-2 py-1.5">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-foreground">{alert.message}</p>
        <p className="mt-0.5 text-[9px] text-muted-foreground">{alert.code}{alert.count !== undefined ? ` · ${alert.count}` : ''}</p>
      </div>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${critical ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>{alert.severity}</span>
    </div>
  );
}

function fmtTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB');
}

export default function SystemMonitorSportsV2() {
  const query = useSportsMonitor();
  const retryBootstrap = useRetryFailedSportsBootstrapMutation();
  const data = query.data;
  const queue = data?.queue;
  const fixtures = data?.fixtures;
  const provider = data?.provider.espn;
  const worker = data?.worker;
  const coverage = data?.oddsSnapshots.upcomingCoverage;
  const alerts = data?.alerts ?? [];
  const cooldownActive = Boolean(provider?.cooldownUntil && new Date(provider.cooldownUntil).getTime() > Date.now());
  const sortedAlerts = [...alerts].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'CRITICAL' ? -1 : 1));

  return (
    <div className="space-y-2">
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-card px-2.5 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-foreground">Sports module health</h2>
            <StatusBadge status={data?.status} />
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{data?.message ?? (query.isLoading ? 'Loading operational status…' : 'Sports monitor unavailable.')}</p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">Last checked: {fmtTime(data?.monitor.lastSuccessfulCheckAt)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => retryBootstrap.mutate(undefined, {
              onSuccess: async (result) => {
                toast.success(result.queued > 0 ? `Queued ${result.queued} failed bootstrap job(s).` : 'No failed bootstrap jobs to retry.');
                await query.refetch();
              },
              onError: (error) => toast.error(error.message || 'Unable to retry failed bootstrap jobs.'),
            })}
            disabled={retryBootstrap.isPending}
            className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50"
          >
            <FaRotate className={`h-3 w-3 ${retryBootstrap.isPending ? 'animate-spin' : ''}`} />
            {retryBootstrap.isPending ? 'Retrying…' : 'Retry failed bootstrap'}
          </button>
          <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50">
            <FaArrowsRotate className={`h-3 w-3 ${query.isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      {query.isError ? <div role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-[11px] text-rose-600">Unable to retrieve Sports operational monitor. Check admin access and API availability.</div> : null}

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Competitions" value={fixtures?.competitions ?? '—'} />
        <Metric label="Stored fixtures" value={fixtures?.total ?? '—'} />
        <Metric label="Upcoming · 60h" value={fixtures?.upcomingWithin60Hours ?? '—'} />
        <Metric label="Live fixtures" value={fixtures?.live ?? '—'} />
        <Metric label="Queue pending" value={countStatus(queue?.byStatus, 'PENDING')} detail={`${queue?.duePendingJobs ?? 0} due`} />
        <Metric label="Quarantined" value={countStatus(queue?.byStatus, 'QUARANTINED')} detail={`${queue?.staleProcessingJobs ?? 0} stale leases`} />
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <Panel title="ESPN provider" icon={FaBolt}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={provider?.health} />
            <span className={`text-[9px] font-medium ${cooldownActive ? 'text-amber-600' : 'text-muted-foreground'}`}>{cooldownActive ? `Cooldown until ${fmtTime(provider?.cooldownUntil)}` : 'No active cooldown'}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Metric label="Request attempts" value={provider?.requestAttempts ?? '—'} />
            <Metric label="Consecutive failures" value={provider?.consecutiveFailures ?? '—'} />
            <Metric label="Last failure" value={fmtTime(provider?.lastFailedAt)} />
          </div>
          {provider?.lastFailure ? <p className="mt-2 break-words rounded bg-muted/50 p-2 text-[10px] text-muted-foreground">{provider.lastFailure}</p> : null}
        </Panel>

        <Panel title="Queue worker" icon={FaServer}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={worker?.initialized ? (worker?.running ? 'RUNNING' : 'READY') : 'UNKNOWN'} />
            <span className="text-[9px] text-muted-foreground">{worker?.laneCount ?? 0} job lanes · concurrency {worker?.laneConcurrency ?? '—'}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Metric label="Claimed" value={worker?.jobsClaimed ?? '—'} />
            <Metric label="Completed" value={worker?.jobsCompleted ?? '—'} />
            <Metric label="Retried" value={worker?.jobsRetried ?? '—'} />
          </div>
          <p className="mt-2 text-[9px] text-muted-foreground">Last pass: {fmtTime(worker?.lastPassCompletedAt)}</p>
        </Panel>

        <Panel title="Collection and bootstrap" icon={FaDatabase}>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Metric label="Collection failures" value={data?.collection.recentFailuresLast24Hours ?? '—'} />
            <Metric label="Stale states" value={data?.collection.staleProcessingStates ?? '—'} />
            <Metric label="Overdue recurring" value={data?.collection.overdueRecurringStates ?? '—'} />
            <Metric label="Seasons bootstrapped" value={data ? `${data.bootstrap.currentSeasons.monthlyBootstrapCompleted}/${data.bootstrap.currentSeasons.total}` : '—'} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
            <StatusBadge status={data?.bootstrap.state?.status} />
            <span className="text-muted-foreground">Phase: {data?.bootstrap.state?.currentPhase ?? '—'}</span>
          </div>
        </Panel>

        <Panel title="Odds and derived data" icon={FaLayerGroup}>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Metric label="Odds snapshots" value={data?.oddsSnapshots.total ?? '—'} />
            <Metric label="Coverage" value={coverage?.coveragePercent == null ? '—' : `${coverage.coveragePercent.toFixed(1)}%`} detail={`${coverage?.freshSnapshots ?? 0} fresh · ${coverage?.missingOrStale ?? 0} missing/stale`} />
            <Metric label="Timeline events" value={data?.timeline.totalEvents ?? '—'} />
            <Metric label="Derived jobs" value={queue?.derivedRecalculation.pendingOrProcessing ?? '—'} detail={`${queue?.derivedRecalculation.failedOrQuarantined ?? 0} failed`} />
          </div>
          <p className="mt-2 text-[9px] text-muted-foreground">Latest odds: {fmtTime(data?.oddsSnapshots.latestCollectedAt)} · Latest projections: {fmtTime(data?.derivedData.latestCalculatedAt)}</p>
        </Panel>
      </div>

      <Panel title="Operational alerts" icon={FaBell}>
        <div className="mb-2 grid grid-cols-3 gap-1.5">
          <Metric label="Critical" value={data?.summary.criticalAlerts ?? '—'} />
          <Metric label="Warnings" value={data?.summary.warningAlerts ?? '—'} />
          <Metric label="Total" value={data?.summary.totalAlerts ?? '—'} />
        </div>
        {sortedAlerts.length ? <div className="space-y-1">{sortedAlerts.slice(0, 12).map((alert) => <AlertRow key={alert.code} alert={alert} />)}</div> : <p className="rounded-md border border-dashed border-border p-3 text-center text-[10px] text-muted-foreground">No active Sports alerts.</p>}
      </Panel>

      <Panel title="Data readiness" icon={FaFutbol}>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <Metric label="Timeline coverage" value={data?.timeline.recentCompletedFixtureCoverage.coveragePercent == null ? '—' : `${data.timeline.recentCompletedFixtureCoverage.coveragePercent.toFixed(1)}%`} />
          <Metric label="Projection stores missing" value={data?.derivedData.freshness.missingStores ?? '—'} />
          <Metric label="Outbox failures" value={data?.sourceOutbox.failedEvents ?? '—'} />
          <Metric label="Outbox pending" value={countStatus(data?.sourceOutbox.byStatus, 'PENDING')} />
        </div>
        <p className="mt-2 text-[9px] text-muted-foreground">Latest completed fixture: {fmtTime(data?.fixtures.latestCompletedAt)} · Monitor interval: {data?.monitor.intervalMs ? `${Math.round(data.monitor.intervalMs / 1000)}s` : '—'}</p>
      </Panel>
    </div>
  );
}
