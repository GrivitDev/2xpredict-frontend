'use client';

import { useMemo, useState } from 'react';
import { useSystemMonitorErrors } from '@/hooks/use-monitoring';
import type { SystemMonitorError } from '@/types/monitoring';

const date = (value: unknown) => value && !Number.isNaN(new Date(String(value)).getTime()) ? new Date(String(value)).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' }) : '—';
const text = (value: unknown) => value === null || value === undefined || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value);

export default function SystemMonitorErrors() {
  const [draftModule, setDraftModule] = useState('');
  const [module, setModule] = useState('');
  const [limit, setLimit] = useState('100');
  const query = useSystemMonitorErrors({ ...(module ? { module } : {}), limit: Number(limit) || 100 });
  const errors = query.data ?? [];
  const modules = useMemo(() => Array.from(new Set(errors.map((item) => item.module).filter(Boolean))), [errors]);
  const unique = useMemo(() => new Set(errors.map((item) => `${item.module}|${item.source}|${item.operation}|${item.message}`)).size, [errors]);

  return <section className="space-y-2">
    <header className="flex items-center justify-between gap-2"><h2 className="text-xs font-semibold">Errors</h2><button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="h-6 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50">{query.isFetching ? 'Refreshing…' : 'Refresh'}</button></header>
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"><div className="rounded border border-border/70 bg-card px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Returned</div><div className="text-sm font-semibold tabular-nums">{errors.length}</div></div><div className="rounded border border-border/70 bg-card px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Unique errors</div><div className="text-sm font-semibold tabular-nums">{unique}</div></div><div className="rounded border border-border/70 bg-card px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Stack traces</div><div className="text-sm font-semibold tabular-nums">{errors.filter((item) => Boolean(item.stack)).length}</div></div><div className="rounded border border-border/70 bg-card px-2 py-1.5"><div className="text-[10px] text-muted-foreground">References</div><div className="text-sm font-semibold tabular-nums">{errors.filter((item) => Boolean(item.referenceKey)).length}</div></div></div>

    <form onSubmit={(event) => { event.preventDefault(); setModule(draftModule.trim()); }} className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/70 bg-card p-2">
      <input value={draftModule} onChange={(event) => setDraftModule(event.target.value)} placeholder="Module" aria-label="Filter errors by module" className="h-7 w-40 rounded border border-border bg-background px-2 text-[10px]" />
      <select value={limit} onChange={(event) => setLimit(event.target.value)} aria-label="Number of errors" className="h-7 rounded border border-border bg-background px-2 text-[10px]">{[25, 50, 100, 200, 500].map((n) => <option key={n} value={n}>{n} rows</option>)}</select>
      <button type="submit" className="h-7 rounded bg-primary px-2 text-[10px] font-semibold text-primary-foreground">Apply</button>
      <button type="button" onClick={() => { setDraftModule(''); setModule(''); }} className="h-7 rounded border border-border px-2 text-[10px] hover:bg-muted">Clear</button>
      <span className="ml-auto text-[10px] text-muted-foreground">{modules.length} modules</span>
    </form>

    {query.isError ? <div role="alert" className="rounded border border-rose-500/20 bg-rose-500/5 px-2 py-1.5 text-[10px] text-rose-700 dark:text-rose-300">Error records unavailable.</div> : null}
    <div className="overflow-auto rounded-md border border-border/70 bg-card">
      <table className="w-full min-w-[850px] text-left text-[10px]">
        <thead className="sticky top-0 bg-muted/90 text-muted-foreground"><tr>{['Time', 'Module', 'Source', 'Operation', 'Message', 'Reference', 'Details'].map((label) => <th key={label} className="whitespace-nowrap px-2 py-1.5 font-semibold">{label}</th>)}</tr></thead>
        <tbody>{errors.map((item: SystemMonitorError, index) => <tr key={String(item._id ?? item.id ?? `${item.occurredAt}-${index}`)} className="border-t border-border/60 align-top hover:bg-muted/20">
          <td className="whitespace-nowrap px-2 py-1.5">{date(item.occurredAt ?? item.createdAt)}</td>
          <td className="px-2 py-1.5">{text(item.module)}</td>
          <td className="max-w-[170px] px-2 py-1.5"><span className="block truncate" title={text(item.source)}>{text(item.source)}</span></td>
          <td className="max-w-[150px] px-2 py-1.5"><span className="block truncate" title={text(item.operation)}>{text(item.operation)}</span></td>
          <td className="max-w-[400px] px-2 py-1.5"><span className="line-clamp-2" title={text(item.message)}>{text(item.message)}</span></td>
          <td className="max-w-[160px] px-2 py-1.5"><span className="block truncate" title={text(item.referenceKey)}>{text(item.referenceKey)}</span></td>
          <td className="px-2 py-1.5"><details><summary className="cursor-pointer rounded border border-border px-1.5 py-0.5">View</summary><div className="absolute z-20 mt-1 max-w-[min(80vw,760px)] rounded border border-border bg-card p-2 shadow-lg"><div className="mb-1 text-[10px] font-semibold">Error record</div><pre className="max-h-[45vh] overflow-auto whitespace-pre-wrap break-words font-mono text-[10px]">{JSON.stringify(item, null, 2)}</pre></div></details></td>
        </tr>)}
        {!errors.length ? <tr><td colSpan={7} className="px-2 py-3 text-center text-[10px] text-muted-foreground">{query.isLoading ? 'Loading…' : 'No error records returned.'}</td></tr> : null}</tbody>
      </table>
    </div>
  </section>;
}
