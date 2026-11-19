'use client';

import { useMemo, useState } from 'react';
import { FaArrowsRotate, FaCircleCheck, FaCircleExclamation, FaCircleXmark, FaMagnifyingGlass } from 'react-icons/fa6';
import { useSystemMonitorCoverage } from '@/hooks/use-monitoring';
import type { SystemMonitorCoverageModule } from '@/types/monitoring';

function number(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '0';
}
function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}
function tone(status: unknown): string {
  const state = String(status ?? 'UNKNOWN').toUpperCase();
  if (state === 'HEALTHY') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (state === 'FAILED') return 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  if (state === 'DEGRADED' || state === 'UNKNOWN') return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  return 'border-border bg-muted/50 text-muted-foreground';
}
function State({ value }: { value: unknown }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone(value)}`}>{String(value ?? 'UNKNOWN')}</span>;
}
function Metric({ label, value, hint }: { label: string; value: unknown; hint?: string }) {
  return <div className="min-w-0 rounded-lg border border-border/70 bg-card px-3 py-2"><p className="text-[10px] font-medium text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold tracking-tight text-foreground">{number(value)}</p>{hint ? <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p> : null}</div>;
}

export default function SystemMonitorCoverage() {
  const monitor = useSystemMonitorCoverage();
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const data = monitor.data;
  const modules = useMemo(() => {
    const rows = (data?.modules ?? []) as SystemMonitorCoverageModule[];
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const issue = !row.discovered || row.status !== 'HEALTHY' || row.healthIsStale || row.moduleImportDrift || (row.dependencies ?? []).some((item) => item.status !== 'HEALTHY');
      return (!issuesOnly || issue) && (!term || `${row.module} ${row.category} ${row.description}`.toLowerCase().includes(term));
    });
  }, [data?.modules, issuesOnly, search]);
  const selected = modules.find((row) => row.module === selectedModule) ?? data?.modules?.find((row) => row.module === selectedModule);
  const summary = data?.summary;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-sm font-semibold text-foreground">Module coverage & dependency integrity</h2><p className="text-[11px] text-muted-foreground">Registry coverage, live Nest discovery, health freshness and import-graph drift.</p></div>
        <button type="button" onClick={() => void monitor.refetch()} disabled={monitor.isFetching} className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-muted disabled:opacity-50"><FaArrowsRotate className={monitor.isFetching ? 'animate-spin' : ''} /> Refresh</button>
      </div>
      {monitor.isPending ? <div className="h-36 animate-pulse rounded-lg bg-muted" /> : monitor.isError ? <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-700 dark:text-rose-300">Coverage data could not be loaded. Verify administrator access and GET /admin/system-monitor/coverage.</div> : data ? <>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
          <Metric label="Expected modules" value={data.expectedModules} />
          <Metric label="Discovered" value={data.discoveredModules} />
          <Metric label="Missing from Nest" value={summary?.modulesMissingFromNest} />
          <Metric label="Stale health" value={summary?.staleModules} />
          <Metric label="Import graph drift" value={summary?.modulesWithImportDrift} />
          <Metric label="Critical dependency issues" value={summary?.criticalDependencyIssues} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs"><FaCircleCheck className="text-emerald-600" /> Critical healthy <strong className="ml-auto">{number(summary?.criticalHealthy)}</strong></div>
          <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs"><FaCircleExclamation className="text-amber-600" /> Degraded / unknown <strong className="ml-auto">{number(Number(summary?.criticalDegraded ?? 0) + Number(summary?.criticalUnknown ?? 0))}</strong></div>
          <div className="flex items-center gap-2 rounded-md border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs"><FaCircleXmark className="text-rose-600" /> Critical failed <strong className="ml-auto">{number(summary?.criticalFailed)}</strong></div>
          <div className="rounded-md border border-border/70 px-3 py-2 text-[11px] text-muted-foreground">Unclassified discovered: <strong className="text-foreground">{number(summary?.unclassifiedDiscoveredModules)}</strong></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[180px] flex-1"><FaMagnifyingGlass className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search modules…" className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-xs outline-none focus:ring-1 focus:ring-primary" /></label>
          <label className="flex h-8 items-center gap-2 rounded-md border border-border px-2 text-[11px]"><input type="checkbox" checked={issuesOnly} onChange={(event) => setIssuesOnly(event.target.checked)} /> Issues only</label>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/70">
          <table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2">Module</th><th className="px-3 py-2">Health</th><th className="px-3 py-2">Discovery</th><th className="px-3 py-2">Freshness</th><th className="px-3 py-2">Import graph</th><th className="px-3 py-2">Dependencies</th></tr></thead><tbody className="divide-y divide-border/60">{modules.map((row) => <tr key={row.module} className={`cursor-pointer hover:bg-muted/35 ${selectedModule === row.module ? 'bg-muted/50' : ''}`} onClick={() => setSelectedModule((current) => current === row.module ? '' : row.module)}><td className="px-3 py-2"><span className="font-semibold text-foreground">{row.module}</span>{row.critical ? <span className="ml-1 text-[9px] font-bold uppercase text-primary">Critical</span> : null}<p className="mt-0.5 max-w-[260px] truncate text-[10px] text-muted-foreground">{row.category} · {row.description}</p></td><td className="px-3 py-2"><State value={row.status} /></td><td className="px-3 py-2">{row.discovered ? <span className="text-emerald-700 dark:text-emerald-300">Discovered</span> : <span className="text-rose-700 dark:text-rose-300">Missing</span>}</td><td className="px-3 py-2">{row.healthIsStale ? <span className="text-amber-700 dark:text-amber-300">Stale</span> : 'Current'}</td><td className="px-3 py-2">{row.moduleImportDrift ? <span className="text-rose-700 dark:text-rose-300">Drift detected</span> : 'Aligned'}</td><td className="px-3 py-2">{number((row.dependencies ?? []).filter((item) => item.status !== 'HEALTHY').length)} issue(s) / {(row.dependencies ?? []).length}</td></tr>)}</tbody></table>
          {modules.length === 0 ? <p className="px-3 py-6 text-center text-xs text-muted-foreground">No modules match these filters.</p> : null}
        </div>
        {selected ? <div className="space-y-2 rounded-lg border border-border/70 bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold">{selected.module} · details</p><p className="text-[10px] text-muted-foreground">{selected.probeMode} · {selected.monitoringLevel} monitoring</p></div><State value={selected.status} /></div>
          <div className="grid gap-3 md:grid-cols-2">
            <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Declared module imports</p><p className="break-words text-[11px]">{list(selected.moduleImports).join(', ') || 'None'}</p><p className="mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Observed imports</p><p className="break-words text-[11px]">{list(selected.actualModuleImports).join(', ') || 'None'}</p></div>
            <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Missing / unexpected imports</p><p className="text-[11px] text-rose-700 dark:text-rose-300">Missing: {list(selected.missingModuleImports).join(', ') || 'None'}</p><p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">Unexpected: {list(selected.unexpectedModuleImports).join(', ') || 'None'}</p></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-[11px]"><thead><tr className="text-muted-foreground"><th className="py-1">Dependency</th><th className="py-1">Kind</th><th className="py-1">Status</th><th className="py-1">Critical</th></tr></thead><tbody>{(selected.dependencies ?? []).map((dependency) => <tr key={`${selected.module}-${dependency.module}`} className="border-t border-border/60"><td className="py-1.5">{dependency.module}</td><td className="py-1.5">{dependency.kind}</td><td className="py-1.5"><State value={dependency.status} /></td><td className="py-1.5">{dependency.critical ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>
        </div> : null}
        {data.moduleGraphIssues?.length ? <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3"><p className="mb-2 text-xs font-semibold">Module graph issues ({data.moduleGraphIssues.length})</p><div className="space-y-1">{data.moduleGraphIssues.map((issue) => <p key={issue.module} className="text-[11px]"><strong>{issue.module}</strong>{issue.critical ? ' · critical' : ''} — missing: {issue.missingImports.join(', ') || 'none'}; unexpected: {issue.unexpectedImports.join(', ') || 'none'}</p>)}</div></div> : null}
        <p className="text-right text-[10px] text-muted-foreground">Checked: {data.checkedAt ? new Date(data.checkedAt).toLocaleString() : '—'} · auto-refresh every 30 seconds</p>
      </> : null}
    </section>
  );
}
