/* Compact System Monitor activity view. */
'use client';

import { Fragment, useState } from 'react';
import { useSystemMonitorActivity } from '@/hooks/use-monitoring';
import type { SystemMonitorActivity } from '@/types/monitoring';

type Row = Record<string, unknown>;

function rowsFrom(value: unknown): Row[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Row => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
}
function fmt(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
function date(value: unknown): string {
  if (!value) return '—';
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
}

export default function SystemMonitorActivity() {
  const [module, setModule] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState('50');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const query = useSystemMonitorActivity({
    ...(module.trim() ? { module: module.trim() } : {}),
    ...(status ? { status } : {}),
    limit: Number(limit),
  });
  const rows = rowsFrom(query.data as SystemMonitorActivity[] | undefined);

  return (
    <section className="overflow-hidden rounded-lg border border-border/80 bg-card">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/70 p-2">
        <input value={module} onChange={(event) => setModule(event.target.value)} placeholder="Module" aria-label="Filter by module" className="h-7 w-32 rounded-md border border-border bg-background px-2 text-[11px] outline-none focus:border-primary" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status" className="h-7 rounded-md border border-border bg-background px-2 text-[11px]">
          <option value="">All statuses</option><option value="STARTED">Started</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="INFO">Info</option>
        </select>
        <select value={limit} onChange={(event) => setLimit(event.target.value)} aria-label="Activity limit" className="h-7 rounded-md border border-border bg-background px-2 text-[11px]">
          {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n} rows</option>)}
        </select>
        <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="h-7 rounded-md border border-border px-2 text-[11px] font-medium hover:bg-muted disabled:opacity-50">{query.isFetching ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[700px] text-left text-[11px]">
          <thead className="sticky top-0 bg-muted/90 text-muted-foreground"><tr>{['Time', 'Module', 'Source', 'Operation', 'Status', 'Message', 'Reference', ''].map((item, index) => <th key={`${item}-${index}`} className="whitespace-nowrap px-2 py-1.5 font-semibold">{item}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, index) => {
              const rowKey = fmt(row._id ?? row.id ?? index);
              const expanded = expandedRow === rowKey;
              return <Fragment key={rowKey}>
              <tr className="border-t border-border/60 align-top hover:bg-muted/30">
              <td className="whitespace-nowrap px-2 py-1.5">{date(row.occurredAt ?? row.createdAt)}</td>
              <td className="px-2 py-1.5">{fmt(row.module)}</td>
              <td className="px-2 py-1.5">{fmt(row.source)}</td>
              <td className="px-2 py-1.5">{fmt(row.operation)}</td>
              <td className="px-2 py-1.5">{fmt(row.status)}</td>
              <td className="max-w-[360px] px-2 py-1.5"><span className="line-clamp-2" title={fmt(row.message)}>{fmt(row.message)}</span></td>
              <td className="max-w-[160px] truncate px-2 py-1.5" title={fmt(row.referenceKey)}>{fmt(row.referenceKey)}</td>
              <td className="px-2 py-1.5"><button type="button" onClick={() => setExpandedRow(expanded ? null : rowKey)} aria-expanded={expanded} className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted">{expanded ? 'Hide' : 'Details'}</button></td>
            </tr>
            {expanded ? <tr className="border-t border-border/50 bg-muted/15"><td colSpan={8} className="p-0"><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-2 font-mono text-[10px]">{JSON.stringify(row, null, 2)}</pre></td></tr> : null}
            </Fragment>;
            })}
            {!rows.length && <tr><td colSpan={8} className="px-3 py-3 text-center text-xs text-muted-foreground">{query.isLoading ? 'Loading…' : query.isError ? 'Activity unavailable.' : 'No activity records.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
