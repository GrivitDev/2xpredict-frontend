'use client';

import { useState } from 'react';
import { useSystemMonitorCron, useSystemMonitorCrons } from '@/hooks/use-monitoring';
import type { SystemMonitorCron } from '@/types/monitoring';

type Row = Record<string, unknown>;
const date = (value: unknown) => value && !Number.isNaN(new Date(String(value)).getTime()) ? new Date(String(value)).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' }) : '—';
const duration = (value: unknown) => typeof value !== 'number' || !Number.isFinite(value) ? '—' : value < 1000 ? `${Math.round(value)} ms` : `${(value / 1000).toFixed(2)} s`;
const tone = (value: unknown) => {
  const status = String(value ?? '').toUpperCase();
  if (['SUCCESS', 'HEALTHY'].includes(status)) return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (['FAILED', 'ERROR'].includes(status)) return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  if (['RUNNING', 'REGISTERED', 'IDLE'].includes(status)) return 'border-border bg-muted/40 text-muted-foreground';
  return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
};
function record(value: unknown): Row { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {}; }
function Detail({ value }: { value: unknown }) { return <pre className="max-h-[40vh] overflow-auto whitespace-pre-wrap break-words p-2 font-mono text-[10px]">{JSON.stringify(value ?? {}, null, 2)}</pre>; }

export default function SystemMonitorCrons() {
  const [draftModule, setDraftModule] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [module, setModule] = useState('');
  const [status, setStatus] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const cronsQuery = useSystemMonitorCrons({ ...(module ? { module } : {}), ...(status ? { status } : {}) });
  const detail = useSystemMonitorCron(selectedKey, { enabled: Boolean(selectedKey) });
  const crons = cronsQuery.data ?? [];
  const failures = crons.filter((cron) => cron.status === 'FAILED' || cron.consecutiveFailures > 0).length;
  const running = crons.filter((cron) => cron.status === 'RUNNING').length;

  async function refresh() {
    await Promise.all([cronsQuery.refetch(), ...(selectedKey ? [detail.refetch()] : [])]);
  }

  return <section className="space-y-2">
    <header className="flex items-center justify-between gap-2"><h2 className="text-xs font-semibold">Cron jobs</h2><button type="button" onClick={() => void refresh()} disabled={cronsQuery.isFetching || detail.isFetching} className="h-6 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50">{cronsQuery.isFetching || detail.isFetching ? 'Refreshing…' : 'Refresh'}</button></header>
    <div className="grid grid-cols-3 gap-1.5"><div className="rounded border border-border/70 bg-card px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Registered</div><div className="text-sm font-semibold tabular-nums">{crons.length.toLocaleString()}</div></div><div className="rounded border border-border/70 bg-card px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Running</div><div className="text-sm font-semibold tabular-nums">{running.toLocaleString()}</div></div><div className="rounded border border-border/70 bg-card px-2 py-1.5"><div className="text-[10px] text-muted-foreground">Failed / affected</div><div className={`text-sm font-semibold tabular-nums ${failures ? 'text-status-danger' : ''}`}>{failures.toLocaleString()}</div></div></div>
    <form onSubmit={(event) => { event.preventDefault(); setModule(draftModule.trim()); setStatus(draftStatus); }} className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/70 bg-card p-2">
      <input value={draftModule} onChange={(event) => setDraftModule(event.target.value)} placeholder="Module" aria-label="Filter cron jobs by module" className="h-7 w-36 rounded border border-border bg-background px-2 text-[10px]" />
      <select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)} aria-label="Filter cron jobs by status" className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All statuses</option>{['REGISTERED', 'RUNNING', 'SUCCESS', 'FAILED', 'IDLE'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <button type="submit" className="h-7 rounded bg-primary px-2 text-[10px] font-semibold text-primary-foreground">Apply</button>
      <button type="button" onClick={() => { setDraftModule(''); setDraftStatus(''); setModule(''); setStatus(''); }} className="h-7 rounded border border-border px-2 text-[10px] hover:bg-muted">Clear</button>
      <span className="ml-auto text-[10px] text-muted-foreground">{crons.length} jobs</span>
    </form>

    {cronsQuery.isError ? <div role="alert" className="rounded border border-rose-500/20 bg-rose-500/5 px-2 py-1.5 text-[10px] text-rose-700 dark:text-rose-300">Cron data unavailable.</div> : null}

    <div className="overflow-auto rounded-md border border-border/70 bg-card">
      <table className="w-full min-w-[800px] text-left text-[10px]">
        <thead className="sticky top-0 bg-muted/90 text-muted-foreground"><tr>{['Job', 'Module', 'Schedule', 'Status', 'Last run', 'Next run', 'Duration', 'Failures', ''].map((item, index) => <th key={`${item}-${index}`} className="whitespace-nowrap px-2 py-1.5 font-semibold">{item}</th>)}</tr></thead>
        <tbody>{crons.map((cron: SystemMonitorCron) => <tr key={cron.key} className={`border-t border-border/60 hover:bg-muted/20 ${selectedKey === cron.key ? 'bg-primary/5' : ''}`}>
          <td className="max-w-[200px] px-2 py-1.5"><div className="truncate font-semibold" title={cron.name}>{cron.name}</div><div className="truncate text-[9px] text-muted-foreground" title={cron.key}>{cron.key}</div></td>
          <td className="px-2 py-1.5">{cron.module}</td>
          <td className="max-w-[200px] px-2 py-1.5"><div className="truncate font-mono" title={cron.expression}>{cron.expression ?? '—'}</div><div className="text-[9px] text-muted-foreground">{cron.timeZone ?? 'default'}</div></td>
          <td className="px-2 py-1.5"><span className={`rounded border px-1.5 py-0.5 ${tone(cron.status)}`}>{cron.status}</span></td>
          <td className="whitespace-nowrap px-2 py-1.5">{date(cron.scheduler?.lastRunAt ?? cron.lastStartedAt)}</td>
          <td className="whitespace-nowrap px-2 py-1.5">{date(cron.scheduler?.nextRunAt)}</td>
          <td className="whitespace-nowrap px-2 py-1.5 tabular-nums">{duration(cron.lastDurationMs)}</td>
          <td className={`px-2 py-1.5 tabular-nums ${cron.consecutiveFailures ? 'font-semibold text-status-danger' : ''}`}>{cron.consecutiveFailures}</td>
          <td className="px-2 py-1.5"><button type="button" onClick={() => setSelectedKey(selectedKey === cron.key ? '' : cron.key)} className="rounded border border-border px-1.5 py-0.5 font-medium hover:bg-muted">{selectedKey === cron.key ? 'Hide' : 'Inspect'}</button></td>
        </tr>)}
        {!crons.length ? <tr><td colSpan={9} className="px-2 py-3 text-center text-[10px] text-muted-foreground">{cronsQuery.isLoading ? 'Loading…' : 'No cron jobs found.'}</td></tr> : null}</tbody>
      </table>
    </div>

    {selectedKey ? <section className="overflow-hidden rounded-md border border-border/70 bg-card"><header className="flex items-center justify-between gap-2 border-b border-border/70 px-2 py-1.5"><h3 className="truncate text-xs font-semibold">{selectedKey}</h3><button type="button" onClick={() => setSelectedKey('')} className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted">Close</button></header>{detail.isError ? <p className="px-2 py-3 text-[10px] text-status-danger">Cron details unavailable.</p> : detail.isLoading ? <p className="px-2 py-3 text-[10px] text-muted-foreground">Loading…</p> : <Detail value={detail.data} />}</section> : null}
  </section>;
}

