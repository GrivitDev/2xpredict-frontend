'use client';

import { useMemo, useState } from 'react';

import {
  FaChartLine as Activity,
  FaTriangleExclamation as AlertTriangle,
  FaCircleCheck as CheckCircle2,
  FaDatabase as Database,
  FaArrowsRotate as RefreshCw,
  FaMagnifyingGlass as Search,
  FaStopwatch as Timer,
  FaCircleXmark as XCircle,
} from 'react-icons/fa6';
import { useSystemMonitorCollection, useSystemMonitorCollectionOperations, useSystemMonitorDatabaseHealth, useSystemMonitorDatabaseOperations, useSystemMonitorStorage } from '@/hooks/use-monitoring';
import type { DatabaseOperationStatus } from '@/types/monitoring';

const n = (value?: number | null) => value == null || !Number.isFinite(value) ? '—' : new Intl.NumberFormat('en-US').format(value);
const bytes = (value?: number | null) => {
  if (value == null || !Number.isFinite(value)) return '—';
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB']; let amount = value / 1024; let i = 0;
  while (amount >= 1024 && i < units.length - 1) { amount /= 1024; i += 1; }
  return `${amount.toFixed(2)} ${units[i]}`;
};
const date = (value?: string) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const statusClass = (status?: string) => status === 'HEALTHY' || status === 'SUCCESS' ? 'bg-emerald-500/10 text-status-success' : status === 'DEGRADED' ? 'bg-amber-500/10 text-status-warning' : status === 'FAILED' ? 'bg-destructive/10 text-status-danger' : 'bg-muted text-muted-foreground';

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-md border border-border bg-card p-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 truncate text-lg font-semibold">{value}</p>{detail && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{detail}</p>}</div>;
}

export default function SystemMonitorDatabase() {
  const healthQuery = useSystemMonitorDatabaseHealth();
  const storageQuery = useSystemMonitorStorage();
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [status, setStatus] = useState<DatabaseOperationStatus | ''>('');
  const [operationLimit, setOperationLimit] = useState('50');
  const operationQuery = useSystemMonitorDatabaseOperations({ limit: Number(operationLimit) || 50, ...(status ? { status } : {}) });
  const collectionQuery = useSystemMonitorCollection(selectedCollection || undefined);
  const collectionOperationsQuery = useSystemMonitorCollectionOperations(selectedCollection || undefined, { limit: Number(operationLimit) || 50 });
  const health = healthQuery.data;
  const storage = storageQuery.data;
  const collections = useMemo(() => (storage?.collections ?? []).filter(item => item.name.toLowerCase().includes(search.toLowerCase())), [storage?.collections, search]);
  const operations = selectedCollection ? collectionOperationsQuery.data : operationQuery.data;
  const isFetching = healthQuery.isFetching || storageQuery.isFetching || operationQuery.isFetching || collectionOperationsQuery.isFetching;

  return <div className="space-y-1.5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xs font-semibold">Database</h2><button type="button" onClick={() => void Promise.all([healthQuery.refetch(), storageQuery.refetch(), operationQuery.refetch(), ...(selectedCollection ? [collectionQuery.refetch(), collectionOperationsQuery.refetch()] : [])])} disabled={isFetching} className="inline-flex h-6 items-center gap-1.5 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50"><RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />Refresh</button></div>
    {(healthQuery.isError || storageQuery.isError || operationQuery.isError) && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-status-danger">One or more database monitoring requests failed. The sections that loaded successfully remain available.</div>}
    <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      <Metric label="Connection" value={health?.status ?? 'UNKNOWN'} detail={health?.state ?? 'Connection state unavailable'} />
      <Metric label="Database" value={health?.databaseName ?? storage?.databaseName ?? '—'} detail={`Ready state ${health?.readyState ?? '—'}`} />
      <Metric label="Ping" value={health?.pingMs == null ? '—' : `${health.pingMs} ms`} detail={`Checked ${date(health?.checkedAt)}`} />
      <Metric label="Collections" value={n(storage?.totals.collections ?? health?.collections)} />
      <Metric label="Documents" value={n(storage?.totals.documents ?? health?.documents)} />
      <Metric label="Total size" value={bytes(storage?.totals.totalSizeBytes ?? health?.totalSizeBytes)} detail={`Data ${bytes(storage?.totals.dataSizeBytes ?? health?.dataSizeBytes)}`} />
    </section>
    {health?.error && <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-status-danger"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/><div><p className="font-semibold">Database probe error</p><p>{health.error}</p></div></div>}

    <section className="rounded-md border border-border bg-card p-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-muted-foreground"/><h3 className="text-xs font-semibold">Collection inventory</h3><span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{collections.length}</span></div><label className="flex h-8 min-w-[180px] items-center gap-1.5 rounded-md border border-border px-2"><Search className="h-3.5 w-3.5 text-muted-foreground"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter collections…" className="w-full bg-transparent text-xs outline-none"/></label></div>
      {storageQuery.isLoading ? <p className="py-2 text-center text-xs text-muted-foreground">Loading collection statistics…</p> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-xs"><thead><tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground"><th className="px-2 py-2">Collection</th><th className="px-2 py-2">Documents</th><th className="px-2 py-2">Data</th><th className="px-2 py-2">Storage</th><th className="px-2 py-2">Indexes</th><th className="px-2 py-2">Index size</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Inspect</th></tr></thead><tbody>{collections.map(item => <tr key={item.name} className={`border-b border-border/60 last:border-0 ${selectedCollection === item.name ? 'bg-primary/5' : ''}`}><td className="px-2 py-2 font-medium">{item.name}</td><td className="px-2 py-2">{n(item.documents)}</td><td className="px-2 py-2">{bytes(item.dataSizeBytes)}</td><td className="px-2 py-2">{bytes(item.storageSizeBytes)}</td><td className="px-2 py-2">{n(item.indexes)}</td><td className="px-2 py-2">{bytes(item.totalIndexSizeBytes)}</td><td className="px-2 py-2">{bytes(item.totalSizeBytes)}</td><td className="px-2 py-2"><button type="button" onClick={() => setSelectedCollection(current => current === item.name ? '' : item.name)} className="rounded-md border border-border px-2 py-1 text-[10px] hover:bg-muted">{selectedCollection === item.name ? 'Clear' : 'Inspect'}</button></td></tr>)}</tbody></table>{collections.length === 0 && <p className="py-2 text-center text-xs text-muted-foreground">No collections match the filter.</p>}</div>}
      <p className="mt-1 text-[9px] text-muted-foreground">Snapshot {date(storage?.capturedAt)}{storage?.persistedAt ? ` · Persisted ${date(storage.persistedAt)}` : ''}</p>
    </section>

    {selectedCollection && <section className="rounded-md border border-border bg-card p-2"><div className="mb-2 flex items-center justify-between gap-2"><div><h3 className="text-xs font-semibold">{selectedCollection}</h3></div><span className={`rounded-full px-2 py-1 text-[10px] ${collectionQuery.isError ? 'bg-destructive/10 text-status-danger' : 'bg-muted text-muted-foreground'}`}>{collectionQuery.isFetching || collectionOperationsQuery.isFetching ? 'Refreshing' : 'Collection view'}</span></div>{collectionQuery.isError && <p className="text-xs text-status-danger">Collection detail could not be loaded. It may have been removed since the last storage snapshot.</p>}{collectionQuery.data && <><div className="grid grid-cols-2 gap-2 md:grid-cols-4"><Metric label="Documents" value={n(collectionQuery.data.documents)}/><Metric label="Average document" value={bytes(collectionQuery.data.averageDocumentSizeBytes)}/><Metric label="Indexes" value={n(collectionQuery.data.indexes)}/><Metric label="Total size" value={bytes(collectionQuery.data.totalSizeBytes)}/></div><details className="mt-2 rounded border border-border/70"><summary className="cursor-pointer px-2 py-1 text-[10px] font-medium">Full collection response</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-2 text-[10px]">{JSON.stringify(collectionQuery.data, null, 2)}</pre></details></>}</section>}

    <section className="rounded-md border border-border bg-card p-2">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-muted-foreground"/><h3 className="text-xs font-semibold">MongoDB operations</h3><span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px]">Slow {n(operations?.slowThresholdMs ?? operationQuery.data?.slowThresholdMs)} ms</span></div><div className="flex items-center gap-1.5"><select aria-label="Operation rows" value={operationLimit} onChange={e => setOperationLimit(e.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px]">{[10, 25, 50, 100, 200].map(limit => <option key={limit} value={limit}>{limit} rows</option>)}</select><select value={status} onChange={e => setStatus(e.target.value as DatabaseOperationStatus | '')} className="h-7 rounded border border-border bg-background px-1.5 text-[10px]"><option value="">All outcomes</option><option value="SUCCESS">Successful</option><option value="FAILED">Failed</option></select></div></div>
      <div className="mb-2 grid grid-cols-2 gap-1.5 md:grid-cols-4"><Metric label="Tracked command groups" value={n(operations?.aggregates.length)}/><Metric label="Recent operations" value={n(operations?.recent.length)}/><Metric label="Recent failures" value={n(operations?.recent.filter(item => item.status === 'FAILED').length)}/><Metric label="Slow groups" value={n(operations?.aggregates.filter(item => item.slow > 0).length)}/></div>
      <h4 className="mb-1 text-xs font-semibold">Aggregated commands</h4>
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead><tr className="border-b border-border text-[10px] uppercase text-muted-foreground"><th className="px-2 py-2">Collection</th><th className="px-2 py-2">Command</th><th className="px-2 py-2">Count</th><th className="px-2 py-2">Failures</th><th className="px-2 py-2">Slow</th><th className="px-2 py-2">Last</th><th className="px-2 py-2">Average</th><th className="px-2 py-2">Last seen</th></tr></thead><tbody>{(operations?.aggregates ?? []).map((item, index) => <tr key={`${item.database}:${item.collection}:${item.command}:${index}`} className="border-b border-border/60 last:border-0"><td className="px-2 py-2">{item.collection}</td><td className="px-2 py-2 font-medium">{item.command}</td><td className="px-2 py-2">{n(item.count)}</td><td className={`px-2 py-2 ${item.failures ? 'text-status-danger' : ''}`}>{n(item.failures)}</td><td className={`px-2 py-2 ${item.slow ? 'text-status-warning' : ''}`}>{n(item.slow)}</td><td className="px-2 py-2">{item.lastDurationMs} ms</td><td className="px-2 py-2">{item.averageDurationMs} ms</td><td className="px-2 py-2 whitespace-nowrap">{date(item.lastAt)}</td></tr>)}</tbody></table>{!operations?.aggregates.length && <p className="py-2 text-center text-xs text-muted-foreground">No tracked database commands recorded yet.</p>}</div>
      <h4 className="mb-1 mt-3 text-xs font-semibold">Recent operations</h4>
      <div className="space-y-1.5">{(operations?.recent ?? []).filter((item) => !status || item.status === status).slice(0, Number(operationLimit) || 50).map((item, index) => <div key={`${item.collection}:${item.command}:${item.occurredAt}:${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 p-2"><div className="flex min-w-0 items-start gap-2">{item.status === 'SUCCESS' ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-success"/> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-danger"/>}<div className="min-w-0"><p className="truncate text-xs font-medium">{item.command} · {item.collection}</p><p className="text-[10px] text-muted-foreground">{date(item.occurredAt)}{item.message ? ` · ${item.message}` : ''}</p></div></div><div className="flex shrink-0 items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] ${statusClass(item.status)}`}>{item.status}</span><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Timer className="h-3 w-3"/>{item.durationMs} ms</span></div></div>)}{!operations?.recent.length && <p className="py-2 text-center text-xs text-muted-foreground">No recent operations recorded.</p>}</div>
      <details className="mt-2 rounded border border-border/70"><summary className="cursor-pointer px-2 py-1 text-[10px] font-medium">Full operation response</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-2 text-[10px]">{JSON.stringify(operations ?? {}, null, 2)}</pre></details>
    </section>
  </div>;
}

