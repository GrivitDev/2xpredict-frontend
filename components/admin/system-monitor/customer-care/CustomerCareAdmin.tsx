/* Compact Customer Care monitor and admin recovery controls. */
'use client';

import { Fragment, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCustomerCareAdminActions,
  useCustomerCareAdminBroadcasts,
  useCustomerCareAdminIncident,
  useCustomerCareAdminIncidents,
  useCustomerCareAdminJobs,
  useCustomerCareAdminMonitor,
  useRetryCustomerCareBroadcast,
  useRetryCustomerCareJob,
  useUpdateCustomerCareIncident,
} from '@/hooks/use-customer-care-admin';
import type { SupportIncidentStatus, SupportIncidentSeverity } from '@/types/customer-care';
import { errorMessage } from '@/lib/api-shapes';

type Row = Record<string, unknown>;
type Tab = 'overview' | 'incidents' | 'actions' | 'broadcasts' | 'jobs';

function record(value: unknown): Row {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}
function rowsFrom(value: unknown): Row[] {
  if (Array.isArray(value)) return value.map(record);
  const source = record(value);
  for (const key of ['items', 'results', 'actions', 'conversations', 'incidents', 'broadcasts', 'jobs', 'data']) {
    if (Array.isArray(source[key])) return (source[key] as unknown[]).map(record);
  }
  return [];
}
function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
function date(value: unknown): string {
  if (!value) return '—';
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? text(value) : parsed.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
}
function tone(value: unknown) {
  const status = String(value ?? '').toUpperCase();
  if (['OK', 'HEALTHY', 'SUCCESS', 'SUCCEEDED', 'RESOLVED', 'CLOSED', 'SENT', 'COMPLETED'].includes(status)) return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (['FAILED', 'ERROR', 'CRITICAL', 'DENIED'].includes(status)) return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  if (['WARN', 'DEGRADED', 'OPEN', 'IN_PROGRESS', 'PENDING', 'PROCESSING', 'READY'].includes(status)) return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  return 'border-border bg-muted/30 text-muted-foreground';
}
function keyOf(row: Row, index: number) {
  return String(row._id ?? row.id ?? row.jobKey ?? row.conversationId ?? index);
}
function FieldTable({
  columns,
  data,
  loading,
  empty,
  action,
}: {
  columns: { key: string; label: string }[];
  data: Row[];
  loading?: boolean;
  empty: string;
  action?: (row: Row) => React.ReactNode;
}) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  if (loading) return <p className="px-3 py-3 text-center text-[11px] text-muted-foreground">Loading…</p>;
  if (!data.length) return <p className="px-3 py-3 text-center text-[11px] text-muted-foreground">{empty}</p>;
  return <div className="max-h-[65vh] overflow-auto">
    <table className="w-full min-w-[600px] text-left text-[10px]">
      <thead className="sticky top-0 z-10 bg-muted/90 text-muted-foreground"><tr>{columns.map((col) => <th key={col.key} className="whitespace-nowrap px-2 py-1.5 font-semibold">{col.label}</th>)}<th className="px-2 py-1.5" /></tr></thead>
      <tbody>{data.map((row, index) => {
        const rowKey = keyOf(row, index);
        const isExpanded = expandedRow === rowKey;
        return <Fragment key={rowKey}>
          <tr className="border-t border-border/60 align-top hover:bg-muted/20">
            {columns.map((col) => {
              const raw = row[col.key];
              const content = /at$|date|time/i.test(col.key) ? date(raw) : text(raw);
              return <td key={col.key} className="max-w-[260px] px-2 py-1.5">
                <span title={content} className={['status', 'severity', 'level', 'outcome'].includes(col.key.toLowerCase()) ? `inline-flex max-w-full rounded border px-1.5 py-0.5 ${tone(raw)}` : 'block max-w-[260px] truncate'}>{content}</span>
              </td>;
            })}
            <td className="whitespace-nowrap px-2 py-1"><div className="flex items-center gap-1">
              <button type="button" aria-expanded={isExpanded} onClick={() => setExpandedRow(isExpanded ? null : rowKey)} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted">{isExpanded ? 'Hide' : 'Details'}</button>
              {action ? action(row) : null}
            </div></td>
          </tr>
          {isExpanded ? <tr className="border-t border-border/50 bg-muted/15"><td colSpan={columns.length + 1} className="p-0"><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-2 font-mono text-[10px]">{JSON.stringify(row, null, 2)}</pre></td></tr> : null}
        </Fragment>;
      })}</tbody>
    </table>
  </div>;
}
function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`h-7 shrink-0 rounded-md px-2 text-[11px] font-medium ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{children}</button>;
}
function MetricGrid({ data }: { data: unknown }) {
  const metrics = useMemo(() => {
    const out: { key: string; value: unknown }[] = [];
    const visit = (value: unknown, path = '', depth = 0) => {
      if (depth > 3 || value === null || value === undefined || Array.isArray(value)) return;
      if (typeof value === 'object') {
        for (const [key, item] of Object.entries(value as Row)) visit(item, path ? `${path}.${key}` : key, depth + 1);
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        out.push({ key: path, value });
      }
    };
    visit(data);
    return out;
  }, [data]);
  return <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
    {metrics.map((metric) => <div key={metric.key} className="min-w-0 rounded border border-border/70 bg-muted/15 px-2 py-1.5">
      <div className="truncate text-[9px] text-muted-foreground" title={metric.key}>{metric.key.split('.').join(' / ').replaceAll('_', ' ')}</div>
      <div className={`truncate text-xs font-semibold ${/status/i.test(metric.key) ? '' : 'tabular-nums'}`} title={text(metric.value)}>{text(metric.value)}</div>
    </div>)}
    {!metrics.length ? <p className="px-2 py-4 text-[11px] text-muted-foreground">No monitor metrics returned.</p> : null}
  </div>;
}

export default function CustomerCareAdmin() {
  const client = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [incidentStatus, setIncidentStatus] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('');
  const [actionType, setActionType] = useState('');
  const [actionOutcome, setActionOutcome] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [listLimit, setListLimit] = useState('50');
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [selectedIncidentStatus, setSelectedIncidentStatus] = useState<SupportIncidentStatus>('OPEN');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [confirmNotPosted, setConfirmNotPosted] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const monitor = useCustomerCareAdminMonitor({ enabled: tab === 'overview', refetchInterval: tab === 'overview' ? 30_000 : false });
  const incidents = useCustomerCareAdminIncidents({ limit: Number(listLimit) || 50, ...(incidentStatus ? { status: incidentStatus as SupportIncidentStatus } : {}), ...(incidentSeverity ? { severity: incidentSeverity as SupportIncidentSeverity } : {}) }, { enabled: tab === 'incidents', refetchInterval: tab === 'incidents' ? 30_000 : false });
  const actions = useCustomerCareAdminActions({ limit: Number(listLimit) || 50, ...(actionType ? { type: actionType } : {}), ...(actionOutcome ? { outcome: actionOutcome } : {}) }, { enabled: tab === 'actions', refetchInterval: tab === 'actions' ? 30_000 : false });
  const broadcasts = useCustomerCareAdminBroadcasts({ limit: Number(listLimit) || 50, ...(broadcastStatus ? { status: broadcastStatus as never } : {}) }, { enabled: tab === 'broadcasts', refetchInterval: tab === 'broadcasts' ? 30_000 : false });
  const jobs = useCustomerCareAdminJobs({ limit: Number(listLimit) || 50, ...(jobStatus ? { status: jobStatus as never } : {}) }, { enabled: tab === 'jobs', refetchInterval: tab === 'jobs' ? 30_000 : false });
  const incident = useCustomerCareAdminIncident(selectedIncidentId || undefined, { enabled: tab === 'incidents' && Boolean(selectedIncidentId) });
  const updateIncident = useUpdateCustomerCareIncident();
  const retryBroadcast = useRetryCustomerCareBroadcast();
  const retryJob = useRetryCustomerCareJob();

  const incidentRows = rowsFrom(incidents.data);
  const actionRows = rowsFrom(actions.data);
  const broadcastRows = rowsFrom(broadcasts.data);
  const jobRows = rowsFrom(jobs.data);

  async function refresh() {
    setNotice(null);
    await Promise.all([
      client.invalidateQueries({ queryKey: ['monitoring', 'customer-care'] }),
      client.invalidateQueries({ queryKey: ['admin-customer-care'] }),
      ...(selectedIncidentId ? [client.invalidateQueries({ queryKey: ['admin-customer-care', 'incident', selectedIncidentId] })] : []),
    ]);
  }
  async function saveIncident() {
    if (!selectedIncidentId) return;
    setNotice(null);
    try {
      await updateIncident.mutateAsync({ id: selectedIncidentId, body: { status: selectedIncidentStatus, resolutionNotes } });
      setNotice({ kind: 'success', text: 'Incident updated.' });
      setSelectedIncidentId('');
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, 'Incident update failed.') });
    }
  }
  async function retryBroadcastRow(row: Row) {
    const id = String(row._id ?? row.id ?? '');
    if (!id) return;
    if (row.manualReviewRequired && !confirmNotPosted) {
      setNotice({ kind: 'error', text: 'Confirm the public channel was checked and the message was not posted.' });
      return;
    }
    setNotice(null);
    try {
      await retryBroadcast.mutateAsync({ id, body: row.manualReviewRequired ? { confirmNotPosted: true } : {} });
      setNotice({ kind: 'success', text: 'Broadcast queued for retry.' });
      setConfirmNotPosted(false);
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, 'Broadcast retry failed.') });
    }
  }
  async function retryJobRow(row: Row) {
    const id = String(row._id ?? row.id ?? '');
    if (!id) return;
    setNotice(null);
    try {
      await retryJob.mutateAsync(id);
      setNotice({ kind: 'success', text: 'Job queued for retry.' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, 'Job retry failed.') });
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'actions', label: 'Actions' },
    { id: 'broadcasts', label: 'Broadcasts' },
    { id: 'jobs', label: 'Jobs' },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-border/80 bg-card">
      <header className="flex min-h-9 items-center justify-between gap-2 border-b border-border/70 px-2 py-1.5">
        <h2 className="text-xs font-semibold tracking-tight">Customer Care</h2>
        <div className="flex items-center gap-1.5">
          <select aria-label="Customer Care rows" value={listLimit} onChange={(event) => setListLimit(event.target.value)} className="h-6 rounded border border-border bg-background px-1.5 text-[10px]">{[25, 50, 100, 200].map((limit) => <option key={limit} value={limit}>{limit} rows</option>)}</select>
          <button type="button" onClick={() => void refresh()} className="h-6 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted">Refresh</button>
        </div>
      </header>
      <nav className="flex gap-0.5 overflow-x-auto border-b border-border/70 px-1 py-1">
        {tabs.map((item) => <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</TabButton>)}
      </nav>
      {notice ? <div role={notice.kind === 'error' ? 'alert' : 'status'} className={`mx-2 mt-2 rounded border px-2 py-1.5 text-[10px] ${notice.kind === 'error' ? 'border-rose-500/20 text-rose-700 dark:text-rose-300' : 'border-emerald-500/20 text-emerald-700 dark:text-emerald-300'}`}>{notice.text}</div> : null}
      {monitor.isError ? <div role="alert" className="m-2 rounded border border-rose-500/20 bg-rose-500/5 px-2 py-1.5 text-[10px] text-rose-700 dark:text-rose-300">Monitor request failed.</div> : null}

      {tab === 'overview' ? <div className="space-y-2 p-2">
        <MetricGrid data={monitor.data} />
        <details className="rounded border border-border/70"><summary className="cursor-pointer px-2 py-1 text-[10px] font-medium">Complete monitor payload</summary><pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words p-2 text-[10px]">{JSON.stringify(monitor.data ?? {}, null, 2)}</pre></details>
      </div> : null}

      {tab === 'incidents' ? <div className="space-y-2 p-2">
        <div className="flex flex-wrap gap-1.5">
          <select value={incidentStatus} onChange={(event) => setIncidentStatus(event.target.value)} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All statuses</option>{['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((value) => <option key={value}>{value}</option>)}</select>
          <select value={incidentSeverity} onChange={(event) => setIncidentSeverity(event.target.value)} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All severity</option>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}</select>
        </div>
        <FieldTable data={incidentRows} loading={incidents.isLoading} empty="No incidents." columns={[
          { key: '_id', label: 'ID' }, { key: 'status', label: 'Status' }, { key: 'severity', label: 'Severity' }, { key: 'title', label: 'Title' }, { key: 'lastSeenAt', label: 'Last seen' }, { key: 'occurrences', label: 'Occurrences' },
        ]} action={(row) => <button type="button" onClick={() => { setSelectedIncidentId(String(row._id ?? row.id ?? '')); setSelectedIncidentStatus(String(row.status ?? 'OPEN') as SupportIncidentStatus); setResolutionNotes(String(row.resolutionNotes ?? '')); }} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted">Edit</button>} />
        {selectedIncidentId ? <form onSubmit={(event) => { event.preventDefault(); void saveIncident(); }} className="grid gap-1.5 rounded border border-border/70 p-2 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-end">
          <label className="text-[10px] text-muted-foreground">Status<select value={selectedIncidentStatus} onChange={(event) => setSelectedIncidentStatus(event.target.value as SupportIncidentStatus)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-1.5 text-[10px] text-foreground">{['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="text-[10px] text-muted-foreground">Resolution notes<textarea value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} maxLength={3000} rows={2} className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1 text-[10px] text-foreground" /></label>
          <div className="flex gap-1"><button type="submit" disabled={updateIncident.isPending} className="h-7 rounded bg-primary px-2 text-[10px] font-semibold text-primary-foreground disabled:opacity-50">{updateIncident.isPending ? 'Saving…' : 'Save'}</button><button type="button" onClick={() => setSelectedIncidentId('')} className="h-7 rounded border border-border px-2 text-[10px]">Cancel</button></div>
        </form> : null}
        {selectedIncidentId ? <details className="rounded border border-border/70"><summary className="cursor-pointer px-2 py-1 text-[10px] font-medium">Incident detail</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-2 font-mono text-[10px]">{JSON.stringify(incident.data ?? (incident.isLoading ? 'Loading…' : {}), null, 2)}</pre></details> : null}
      </div> : null}

      {tab === 'actions' ? <div className="space-y-2 p-2">
        <div className="flex flex-wrap gap-1.5"><select value={actionType} onChange={(event) => setActionType(event.target.value)} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All action types</option>{['DIAGNOSTIC', 'REPAIR', 'ESCALATION', 'BROADCAST'].map((value) => <option key={value}>{value}</option>)}</select><select value={actionOutcome} onChange={(event) => setActionOutcome(event.target.value)} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All outcomes</option>{['STARTED', 'SUCCEEDED', 'FAILED', 'DENIED', 'SKIPPED'].map((value) => <option key={value}>{value}</option>)}</select></div>
        <FieldTable data={actionRows} loading={actions.isLoading} empty="No actions." columns={[{ key: 'createdAt', label: 'Time' }, { key: 'actionType', label: 'Type' }, { key: 'actionName', label: 'Action' }, { key: 'outcome', label: 'Outcome' }, { key: 'summary', label: 'Summary' }, { key: 'actorRole', label: 'Actor' }]} />
      </div> : null}

      {tab === 'broadcasts' ? <div className="space-y-2 p-2">
        <div className="flex flex-wrap items-center gap-2"><select value={broadcastStatus} onChange={(event) => setBroadcastStatus(event.target.value)} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All statuses</option>{['GENERATING', 'READY', 'SENDING', 'SENT', 'SKIPPED', 'FAILED'].map((value) => <option key={value}>{value}</option>)}</select>
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground"><input type="checkbox" checked={confirmNotPosted} onChange={(event) => setConfirmNotPosted(event.target.checked)} /> Confirm channel checked / not posted</label>
        </div>
        <FieldTable data={broadcastRows} loading={broadcasts.isLoading} empty="No broadcasts." columns={[{ key: '_id', label: 'ID' }, { key: 'kind', label: 'Kind' }, { key: 'dateKey', label: 'Date key' }, { key: 'status', label: 'Status' }, { key: 'manualReviewRequired', label: 'Review required' }, { key: 'lastError', label: 'Last error' }]} action={(row) => {
          const status = String(row.status ?? '').toUpperCase();
          const disabled = ['SENT', 'SKIPPED'].includes(status) || Boolean(row.manualReviewRequired && !confirmNotPosted) || retryBroadcast.isPending;
          return <button type="button" disabled={disabled} onClick={() => void retryBroadcastRow(row)} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted disabled:opacity-40">Retry</button>;
        }} />
      </div> : null}

      {tab === 'jobs' ? <div className="space-y-2 p-2">
        <select value={jobStatus} onChange={(event) => setJobStatus(event.target.value)} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All statuses</option>{['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map((value) => <option key={value}>{value}</option>)}</select>
        <FieldTable data={jobRows} loading={jobs.isLoading} empty="No jobs." columns={[{ key: '_id', label: 'ID' }, { key: 'jobKey', label: 'Key' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' }, { key: 'attempts', label: 'Attempts' }, { key: 'scheduledAt', label: 'Scheduled' }, { key: 'lastError', label: 'Last error' }]} action={(row) => <button type="button" disabled={String(row.status).toUpperCase() !== 'FAILED' || retryJob.isPending} onClick={() => void retryJobRow(row)} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted disabled:opacity-40">Retry</button>} />
      </div> : null}
    </section>
  );
}
