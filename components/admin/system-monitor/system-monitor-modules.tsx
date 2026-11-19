'use client';

import { useMemo, useState } from 'react';
import { useSystemMonitorDashboard, useSystemMonitorModule, useSystemMonitorModules } from '@/hooks/use-monitoring';
import type { MonitorModule, ModuleHealthStatus, ModuleMonitoringLevel } from '@/types/monitoring';

type Row = Record<string, unknown>;

const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('en-US').format(value) : '—';
const date = (value: unknown) => value && !Number.isNaN(new Date(String(value)).getTime()) ? new Date(String(value)).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const duration = (value: unknown) => typeof value !== 'number' || !Number.isFinite(value) ? '—' : value < 1000 ? `${Math.round(value)} ms` : `${(value / 1000).toFixed(2)} s`;
const statusTone = (value: unknown) => {
  const status = String(value ?? '').toUpperCase();
  if (['HEALTHY', 'OK', 'SUCCESS'].includes(status)) return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (['DEGRADED', 'WARN', 'WARNING', 'UNKNOWN'].includes(status)) return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  if (['FAILED', 'ERROR'].includes(status)) return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  return 'border-border bg-muted/40 text-muted-foreground';
};
function record(value: unknown): Row {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-md border border-border/70 bg-card px-2 py-1.5"><div className="truncate text-[10px] text-muted-foreground">{label}</div><div className="mt-0.5 truncate text-sm font-semibold tabular-nums">{value}</div></div>;
}
function Payload({ value }: { value: unknown }) {
  return <pre className="max-h-[45vh] overflow-auto whitespace-pre-wrap break-words p-2 font-mono text-[10px]">{JSON.stringify(value ?? {}, null, 2)}</pre>;
}

export default function SystemMonitorModules() {
  const dashboard = useSystemMonitorDashboard();
  const [status, setStatus] = useState<ModuleHealthStatus | ''>('');
  const [level, setLevel] = useState<ModuleMonitoringLevel | ''>('');
  const [critical, setCritical] = useState<'' | 'true' | 'false'>('');
  const [selectedName, setSelectedName] = useState('');
  const query = useMemo(() => ({
    ...(status ? { status } : {}),
    ...(level ? { level } : {}),
    ...(critical !== '' ? { critical: critical === 'true' } : {}),
  }), [status, level, critical]);
  const modules = useSystemMonitorModules(query);
  const detail = useSystemMonitorModule(selectedName, { enabled: Boolean(selectedName) });
  const rows = modules.data ?? [];
  const summary = dashboard.data?.summary;
  const system = dashboard.data?.system;

  async function refresh() {
    await Promise.all([dashboard.refetch(), modules.refetch(), ...(selectedName ? [detail.refetch()] : [])]);
  }

  return (
    <section className="space-y-2">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-tight">Modules</h2>
        <button type="button" onClick={() => void refresh()} disabled={dashboard.isFetching || modules.isFetching || detail.isFetching} className="h-6 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50">{dashboard.isFetching || modules.isFetching || detail.isFetching ? 'Refreshing…' : 'Refresh'}</button>
      </header>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Application" value={String(system?.status ?? 'UNKNOWN')} />
        <Metric label="Modules" value={number(summary?.modules)} />
        <Metric label="Failed" value={number(summary?.failedModules)} />
        <Metric label="Degraded" value={number(summary?.degradedModules)} />
        <Metric label="Critical unhealthy" value={number(summary?.criticalModulesUnhealthy)} />
        <Metric label="Critical unverified" value={number(summary?.criticalModulesUnverified)} />
      </div>

      {dashboard.isError || modules.isError ? <div role="alert" className="rounded border border-rose-500/20 bg-rose-500/5 px-2 py-1.5 text-[10px] text-rose-700 dark:text-rose-300">Module health request failed.</div> : null}

      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/70 bg-card p-2">
        <select aria-label="Filter module status" value={status} onChange={(event) => setStatus(event.target.value as ModuleHealthStatus | '')} className="h-7 rounded border border-border bg-background px-2 text-[10px]">
          <option value="">All statuses</option><option value="HEALTHY">Healthy</option><option value="DEGRADED">Degraded</option><option value="FAILED">Failed</option><option value="UNKNOWN">Unknown</option>
        </select>
        <select aria-label="Filter monitoring level" value={level} onChange={(event) => setLevel(event.target.value as ModuleMonitoringLevel | '')} className="h-7 rounded border border-border bg-background px-2 text-[10px]">
          <option value="">All levels</option><option value="deep">Deep</option><option value="health">Health only</option>
        </select>
        <select aria-label="Filter critical modules" value={critical} onChange={(event) => setCritical(event.target.value as '' | 'true' | 'false')} className="h-7 rounded border border-border bg-background px-2 text-[10px]">
          <option value="">All modules</option><option value="true">Critical</option><option value="false">Non-critical</option>
        </select>
        <span className="ml-auto text-[10px] text-muted-foreground">{rows.length} modules</span>
      </div>

      <div className="overflow-auto rounded-md border border-border/70 bg-card">
        <table className="w-full min-w-[760px] text-left text-[10px]">
          <thead className="sticky top-0 bg-muted/90 text-muted-foreground"><tr>{['Module', 'Status', 'Level', 'Requests', 'Failures', 'Avg.', 'Active', 'Checked', ''].map((label, index) => <th key={`${label}-${index}`} className="whitespace-nowrap px-2 py-1.5 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{rows.map((item: MonitorModule) => <tr key={item.module} className={`border-t border-border/60 hover:bg-muted/20 ${selectedName === item.module ? 'bg-primary/5' : ''}`}>
            <td className="max-w-[220px] px-2 py-1.5"><div className="truncate font-semibold" title={item.module}>{item.module}</div><div className="truncate text-[9px] text-muted-foreground" title={item.message}>{item.message || item.source || '—'}</div></td>
            <td className="px-2 py-1.5"><span className={`rounded border px-1.5 py-0.5 ${statusTone(item.status)}`}>{item.status}</span></td>
            <td className="px-2 py-1.5 capitalize">{item.monitoringLevel ?? '—'}</td>
            <td className="px-2 py-1.5 tabular-nums">{number(item.requests)}</td>
            <td className={`px-2 py-1.5 tabular-nums ${item.requestFailures ? 'font-semibold text-rose-600' : ''}`}>{number(item.requestFailures)}</td>
            <td className="px-2 py-1.5 tabular-nums">{duration(item.averageDurationMs)}</td>
            <td className="px-2 py-1.5 tabular-nums">{number(item.activeOperations)}</td>
            <td className="whitespace-nowrap px-2 py-1.5">{date(item.checkedAt)}</td>
            <td className="px-2 py-1.5"><button type="button" onClick={() => setSelectedName(selectedName === item.module ? '' : item.module)} className="rounded border border-border px-1.5 py-0.5 font-medium hover:bg-muted">{selectedName === item.module ? 'Hide' : 'Inspect'}</button></td>
          </tr>)}
          {!rows.length ? <tr><td colSpan={9} className="px-2 py-3 text-center text-[10px] text-muted-foreground">{modules.isLoading ? 'Loading…' : 'No modules match the filters.'}</td></tr> : null}</tbody>
        </table>
      </div>

      {selectedName ? <section className="overflow-hidden rounded-md border border-border/70 bg-card">
        <header className="flex items-center justify-between gap-2 border-b border-border/70 px-2 py-1.5"><h3 className="truncate text-xs font-semibold">{selectedName}</h3><button type="button" onClick={() => setSelectedName('')} className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted">Close</button></header>
        {detail.isError ? <p className="px-2 py-3 text-[10px] text-rose-600">Module details unavailable.</p> : detail.isLoading ? <p className="px-2 py-3 text-[10px] text-muted-foreground">Loading…</p> : <>
          {detail.data ? <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-4">
            <Metric label="Last success" value={date(detail.data.lastSuccessfulAt)} />
            <Metric label="Last failure" value={date(detail.data.lastFailedAt)} />
            <Metric label="Consecutive failures" value={number(detail.data.consecutiveFailures)} />
            <Metric label="Last duration" value={duration(detail.data.lastDurationMs)} />
          </div> : null}
          <details className="border-t border-border/70"><summary className="cursor-pointer px-2 py-1.5 text-[10px] font-semibold">Full module record</summary><Payload value={detail.data} /></details>
        </>}
      </section> : null}
    </section>
  );
}
