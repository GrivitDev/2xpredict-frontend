'use client';

import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import SectionHeader from '@/components/shared/SectionHeader';
import {
  useGetEventsQuery,
  useGetJobsQuery,
  useGetMonitorQuery,
  useGetRunsQuery,
  useRequeueFixtureMutation,
  useGetOverdueBetLabLegsQuery,
  useManualSettleBetLabLegMutation,
  useManualSettlePredictionSelectionMutation,
} from '@/hooks/use-settlement-admin';
import type {
  SettlementEvent,
  SettlementEventLevel,
  SettlementJob,
  SettlementJobStatus,
  SettlementMonitorOverview,
  SettlementRun,
  ManualBetLabLegOutcome,
  OverdueBetLabLeg,
  ManualPredictionSelectionOutcome,
} from '@/types/settlement-admin';

const REFRESH_MS = 60_000;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const JOB_STATUSES: SettlementJobStatus[] = [
  'QUEUED', 'PROCESSING', 'RETRY', 'PARTIAL', 'COMPLETED', 'FAILED', 'SKIPPED',
];
const EVENT_LEVELS: SettlementEventLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

export default function SettlementAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'overview' | 'recovery' | 'prediction-manual' | 'jobs' | 'runs' | 'events'>('overview');
  const [predictionMarketId, setPredictionMarketId] = useState('');
  const [predictionSelectionKey, setPredictionSelectionKey] = useState('');
  const [predictionOutcome, setPredictionOutcome] = useState<ManualPredictionSelectionOutcome>('WON');
  const [predictionReason, setPredictionReason] = useState('');
  const [eventId, setEventId] = useState('');
  const [overduePage, setOverduePage] = useState(1);
  const [olderThanHours, setOlderThanHours] = useState(3.5);
  const [manualOutcomes, setManualOutcomes] = useState<Record<string, ManualBetLabLegOutcome>>({});
  const [manualReasons, setManualReasons] = useState<Record<string, string>>({});
  const [manualBusyKey, setManualBusyKey] = useState<string | null>(null);
  const [leagueId, setLeagueId] = useState('');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const [jobEventFilter, setJobEventFilter] = useState('');
  const [jobStatus, setJobStatus] = useState<'' | SettlementJobStatus>('');
  const [jobPage, setJobPage] = useState(1);
  const [jobLimit, setJobLimit] = useState(25);

  const [runEventFilter, setRunEventFilter] = useState('');
  const [runPage, setRunPage] = useState(1);
  const [runLimit, setRunLimit] = useState(25);

  const [eventEventFilter, setEventEventFilter] = useState('');
  const [eventAction, setEventAction] = useState('');
  const [eventLevel, setEventLevel] = useState<'' | SettlementEventLevel>('');
  const [eventLimit, setEventLimit] = useState(50);

  const monitor = useGetMonitorQuery({ refetchInterval: REFRESH_MS });
  const jobs = useGetJobsQuery(
    { query: { page: jobPage, limit: jobLimit, ...(jobStatus ? { status: jobStatus } : {}), ...(jobEventFilter.trim() ? { eventId: jobEventFilter.trim() } : {}) } },
    { enabled: tab === 'jobs', refetchInterval: REFRESH_MS },
  );
  const runs = useGetRunsQuery(
    { query: { page: runPage, limit: runLimit, ...(runEventFilter.trim() ? { eventId: runEventFilter.trim() } : {}) } },
    { enabled: tab === 'runs', refetchInterval: REFRESH_MS },
  );
  const events = useGetEventsQuery(
    { query: { limit: eventLimit, ...(eventLevel ? { level: eventLevel } : {}), ...(eventEventFilter.trim() ? { eventId: eventEventFilter.trim() } : {}), ...(eventAction.trim() ? { action: eventAction.trim() } : {}) } },
    { enabled: tab === 'events', refetchInterval: REFRESH_MS },
  );
  const requeue = useRequeueFixtureMutation();
  const overdueLegs = useGetOverdueBetLabLegsQuery(
    { query: { olderThanHours, page: overduePage, limit: 25 } },
    { enabled: tab === 'recovery', refetchInterval: REFRESH_MS },
  );
  const manualSettle = useManualSettleBetLabLegMutation();
  const manualPredictionSettle = useManualSettlePredictionSelectionMutation();
  const data = monitor.data;

  async function refreshAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['settlement-admin'] }),
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'settlement'] }),
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'prediction-engine'] }),
    ]);
  }

  async function submitRequeue() {
    setNotice(null);
    const trimmedEventId = eventId.trim();
    if (!trimmedEventId) {
      setNotice({ kind: 'error', text: 'Enter a fixture event ID.' });
      return;
    }

    try {
      const result = await requeue.mutateAsync({
        path: { eventId: trimmedEventId },
        query: leagueId.trim() ? { leagueId: leagueId.trim() } : undefined,
      });

      if (result.success && result.queued) {
        setNotice({
          kind: 'success',
          text: result.reason === 'QUEUED' ? 'Fixture queued for settlement.' : `Fixture queued: ${humanize(result.reason)}.`,
        });
        setEventId('');
        await refreshAll();
      } else {
        setNotice({ kind: 'error', text: requeueReason(result.reason) });
      }
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    }
  }

  async function submitPredictionSelectionSettlement() {
    setNotice(null);
    const marketPredictionId = predictionMarketId.trim();
    const selectionKey = predictionSelectionKey.trim();
    const reason = predictionReason.trim();
    if (!marketPredictionId || !selectionKey || reason.length < 5) {
      setNotice({ kind: 'error', text: 'Enter the market prediction ID, selection key, and a reason of at least five characters.' });
      return;
    }
    try {
      const result = await manualPredictionSettle.mutateAsync({
        path: { marketPredictionId, selectionKey },
        body: { outcome: predictionOutcome, reason },
      });
      setNotice({ kind: 'success', text: result.alreadyApplied ? 'Selection settlement already applied.' : 'Prediction selection settled.' });
      await refreshAll();
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error, 'Unable to settle prediction selection.') });
    }
  }

  async function submitManualSettlement(
    item: OverdueBetLabLeg,
    outcome: ManualBetLabLegOutcome,
    reason: string,
  ) {
    const legId = String(item.leg.legId ?? '').trim();
    const key = `${item.ticketId}:${legId}`;
    if (!legId || reason.trim().length < 5) {
      setNotice({ kind: 'error', text: 'A valid leg ID and a settlement reason of at least 5 characters are required.' });
      return;
    }
    const label = item.ticketNumber || item.ticketId;
    if (!window.confirm(`Manually settle leg ${legId} on ticket ${label} as ${humanize(outcome)}? This action cannot overwrite an existing result.`)) return;
    setNotice(null);
    setManualBusyKey(key);
    try {
      const result = await manualSettle.mutateAsync({
        path: { ticketId: item.ticketId, legId },
        body: { outcome, reason: reason.trim() },
      });
      setNotice({
        kind: 'success',
        text: result.finalized
          ? `Leg settled as ${humanize(outcome)}. Ticket finalized${typeof result.grossReturn === 'number' ? `; gross return ${result.grossReturn.toLocaleString()} points` : ''}.`
          : `Leg settled as ${humanize(outcome)}. Ticket remains pending until its other legs are resolved.`,
      });
      setManualReasons((current) => ({ ...current, [key]: '' }));
      await refreshAll();
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error, 'Manual settlement failed.') });
    } finally {
      setManualBusyKey(null);
    }
  }

  return (
    <main className="mx-auto min-w-0 max-w-[1600px] space-y-2 px-1 py-1 sm:px-2 sm:py-2">
      <SectionHeader
        title="Settlement"
        action={
          <button
            type="button"
            onClick={() => void refreshAll()}
            disabled={monitor.isFetching || jobs.isFetching || runs.isFetching || events.isFetching || overdueLegs.isFetching}
            className="inline-flex h-6 items-center rounded-md border border-border bg-card px-3 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
          >
            {monitor.isFetching || jobs.isFetching || runs.isFetching || events.isFetching || overdueLegs.isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />

      <nav aria-label="Settlement tabs" className="sticky top-0 z-20 flex gap-0.5 overflow-x-auto border-y border-border/70 bg-background/95 py-1 backdrop-blur">
        {([
          ['overview', 'Overview'],
          ['recovery', 'Recovery'],
          ['prediction-manual', 'Manual prediction'],
          ['jobs', 'Jobs'],
          ['runs', 'Runs'],
          ['events', 'Events'],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-pressed={tab === id}
            className={`h-7 shrink-0 rounded-md border px-2 text-[11px] font-medium ${tab === id ? 'border-primary/20 bg-primary text-primary-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted'}`}>
            {label}
          </button>
        ))}
      </nav>

      {notice && (
        <div role={notice.kind === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3 py-2 text-xs ${notice.kind === 'success' ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300' : 'border-destructive/25 bg-destructive/5 text-destructive'}`}>
          {notice.text}
        </div>
      )}

      {monitor.isError && <InlineError message={getErrorMessage(monitor.error, 'Unable to load settlement overview.')} onRetry={() => void monitor.refetch()} />}

      {tab === 'overview' ? (
<section aria-label="Queue overview" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <Metric label="All jobs" value={data?.queue.total} detail={`${data?.runs.total ?? 0} runs`} />
        <Metric label="Queued" value={data?.queue.queued} tone="blue" detail={`Retrying ${data?.queue.retrying ?? 0}`} />
        <Metric label="Processing" value={data?.queue.processing} tone="amber" detail={`Partial ${data?.queue.partial ?? 0}`} />
        <Metric label="Completed" value={data?.queue.completed} tone="green" detail={`${data?.predictionEngine.settledSelections ?? 0} selections settled`} />
        <Metric label="Failed" value={data?.queue.failed} tone="red" detail={`${data?.betLab.unresolvedLegs ?? 0} unresolved legs`} />
        <Metric label="Open legs for review" value={overdueLegs.data?.total} tone={overdueLegs.data?.total ? "amber" : "green"} detail={`Age-based filter · ${olderThanHours}h`} />
        <Metric label="Last snapshot" value={data?.generatedAt ? formatDate(data.generatedAt) : '—'} detail="Auto-refresh · 60 sec" smallValue />
      </section>
) : null}

      {tab === 'overview' ? (
<section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Settlement architecture" eyebrow="Runtime" trailing={data?.architecture.cronJobs === false ? <Tag tone="green">No cron</Tag> : data ? <Tag tone="amber">Cron enabled</Tag> : null}>
          {data ? (
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <InfoLine label="Trigger" value={data.architecture.trigger} />
              <InfoLine label="Execution" value={data.architecture.execution} />
              <InfoLine label="Settlement owner" value={data.architecture.settlementOwner} wide />
              <InfoLine label="Run status" value={countSummary(data.runs.byStatus)} />
            </div>
          ) : <LoadingOrEmpty loading={monitor.isLoading} error={monitor.isError} empty="Overview unavailable." />}
        </Panel>

        <Panel title="Prediction engine" eyebrow="Market settlement">
          {data ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <MiniMetric label="Market documents" value={data.predictionEngine.marketDocuments} />
                <MiniMetric label="Settled selections" value={data.predictionEngine.settledSelections} tone="green" />
                <MiniMetric label="Unsettled" value={data.predictionEngine.unsettledSelections} tone={data.predictionEngine.unsettledSelections ? 'amber' : 'neutral'} />
              </div>
              <CountStrip label="Selections by outcome" counts={data.predictionEngine.selectionsByOutcome} />
            </>
          ) : <LoadingOrEmpty loading={monitor.isLoading} error={monitor.isError} empty="Overview unavailable." />}
        </Panel>
      </section>
) : null}

      {tab === 'overview' ? (
<section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Bet Lab settlement" eyebrow="Virtual tickets">
          {data ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MiniMetric label="Users with tickets" value={data.betLab.usersWithTickets} />
                <MiniMetric label="Total tickets" value={data.betLab.totalTickets} />
                <MiniMetric label="Virtual points staked" value={data.betLab.totalStakedVirtualPoints} />
                <MiniMetric label="Potential return" value={data.betLab.potentialReturnVirtualPoints} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CountStrip label="Ticket statuses" counts={data.betLab.ticketsByStatus} />
                <CountStrip label={`Leg statuses · ${data.betLab.unresolvedLegs} unresolved`} counts={data.betLab.legsByStatus} />
              </div>
            </>
          ) : <LoadingOrEmpty loading={monitor.isLoading} error={monitor.isError} empty="Overview unavailable." />}
        </Panel>

        
      </section>
) : null}

      {tab === 'recovery' ? (
<div className="space-y-2">
<Panel title="Requeue a fixture" eyebrow="Manual recovery">
          <form onSubmit={(event) => { event.preventDefault(); void submitRequeue(); }} className="grid gap-2 sm:grid-cols-[1fr_0.8fr_auto] sm:items-end">
            <label className="block text-[11px] font-medium text-muted-foreground">
              Fixture event ID
              <input value={eventId} onChange={(event) => setEventId(event.target.value)} autoComplete="off" className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10" placeholder="e.g. 123456" />
            </label>
            <label className="block text-[11px] font-medium text-muted-foreground">
              League ID <span className="font-normal">(optional)</span>
              <input value={leagueId} onChange={(event) => setLeagueId(event.target.value)} autoComplete="off" className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10" placeholder="league slug" />
            </label>
            <button type="submit" disabled={requeue.isPending} className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {requeue.isPending ? 'Queuing…' : 'Requeue fixture'}
            </button>
          </form>
        </Panel>
<Panel title="Older unresolved Bet Lab legs" eyebrow="Age-based review queue" count={overdueLegs.data?.total} trailing={<Tag tone={overdueLegs.data?.total ? 'amber' : 'green'}>{overdueLegs.data?.total ? 'Review' : 'Clear'}</Tag>}>
        <p className="mb-2 rounded-md border border-amber-500/25 bg-amber-500/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-amber-800 dark:text-amber-300">
          These records are selected by fixture age, not by confirmed match completion. Verify the fixture-feed status and an authoritative result before using manual settlement. Postponed, suspended, or unresolved fixtures must remain open.
        </p>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-end gap-2">
            <FilterSelect label="Age threshold" value={String(olderThanHours)} onChange={(value) => { setOlderThanHours(Number(value)); setOverduePage(1); }} options={[{ value: '3.5', label: '3.5 hours' }, { value: '6', label: '6 hours' }, { value: '12', label: '12 hours' }, { value: '24', label: '24 hours' }, { value: '48', label: '48 hours' }]} />
            <button type="button" onClick={() => void overdueLegs.refetch()} disabled={overdueLegs.isFetching} className="h-8 rounded-md border border-border px-3 text-[10px] font-medium hover:bg-muted disabled:opacity-50">{overdueLegs.isFetching ? 'Loading…' : 'Refresh legs'}</button>
          </div>
        </div>
        {overdueLegs.isError ? <InlineError message={getErrorMessage(overdueLegs.error, 'Unable to load unresolved Bet Lab legs.')} onRetry={() => void overdueLegs.refetch()} /> :
          overdueLegs.isLoading ? <LoadingOrEmpty loading error={false} empty="" /> :
          overdueLegs.data?.items.length ? (
            <>
              <div className="max-h-[520px] overflow-auto rounded-md border border-border/70">
                <table className="w-full min-w-[950px] table-fixed text-left text-[10px]">
                  <thead className="sticky top-0 z-[1] bg-muted/90 text-muted-foreground backdrop-blur"><tr>{['Ticket / user', 'Fixture / market', 'Stake / odds', 'Age', 'Manual outcome', 'Reason', 'Action'].map((label) => <th key={label} className="px-2 py-2 font-semibold">{label}</th>)}</tr></thead>
                  <tbody>{overdueLegs.data.items.map((item) => {
                    const legId = String(item.leg.legId ?? '');
                    const key = `${item.ticketId}:${legId}`;
                    const outcome = manualOutcomes[key] ?? 'WON';
                    const reason = manualReasons[key] ?? '';
                    const fixtureName = [item.leg.homeTeamName ?? item.leg.homeTeam, item.leg.awayTeamName ?? item.leg.awayTeam].filter(Boolean).join(' vs ');
                    return <tr key={key} className="border-t border-border/60 align-top hover:bg-muted/25">
                      <td className="px-2 py-2"><p className="font-semibold">{item.ticketNumber || item.ticketId.slice(-8)}</p><p className="mt-0.5 truncate text-[9px] text-muted-foreground" title={item.userId}>{item.userId || 'Unknown user'}</p><p className="mt-1"><StatusTag status={item.ticketStatus} /></p></td>
                      <td className="px-2 py-2"><p className="font-medium">{fixtureName || `Event ${item.leg.eventId || '—'}`}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{humanize(String(item.leg.marketCode ?? 'Market unavailable'))} · {String(item.leg.selectionFullName ?? item.leg.selectionName ?? item.leg.selectionCode ?? 'Selection unavailable')}</p><p className="mt-0.5 font-mono text-[8px] text-muted-foreground">{item.leg.eventId || '—'} · {formatDate(item.leg.fixtureDate)}</p></td>
                      <td className="px-2 py-2"><p>{Number(item.stake ?? 0).toLocaleString()} pts</p><p className="mt-0.5 text-muted-foreground">{Number(item.leg.decimalOdds ?? 0).toFixed(2)} odds</p></td>
                      <td className="px-2 py-2"><Tag tone="amber">{Number(item.overdueHours ?? 0).toFixed(1)}h</Tag></td>
                      <td className="px-2 py-2"><select value={outcome} onChange={(event) => setManualOutcomes((current) => ({ ...current, [key]: event.target.value as ManualBetLabLegOutcome }))} className="h-8 w-full rounded-md border border-border bg-background px-2 text-[10px]"><option value="WON">Won</option><option value="LOST">Lost</option><option value="VOID">Void</option><option value="PUSH">Push</option><option value="HALF_WON">Half won</option><option value="HALF_LOST">Half lost</option></select></td>
                      <td className="px-2 py-2"><input value={reason} onChange={(event) => setManualReasons((current) => ({ ...current, [key]: event.target.value }))} placeholder="Verified result and source…" maxLength={500} className="h-8 w-full min-w-[160px] rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:border-primary/60" /></td>
                      <td className="px-2 py-2"><button type="button" disabled={!legId || reason.trim().length < 5 || manualBusyKey === key || manualSettle.isPending} onClick={() => void submitManualSettlement(item, outcome, reason)} className="h-8 whitespace-nowrap rounded-md bg-primary px-2.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">{manualBusyKey === key ? 'Settling…' : 'Settle leg'}</button></td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
              <Pagination page={overdueLegs.data.page} pages={Math.ceil(overdueLegs.data.total / overdueLegs.data.limit)} total={overdueLegs.data.total} onPage={setOverduePage} />
            </>
          ) : <p className="py-3 text-center text-[11px] text-muted-foreground">No unresolved Bet Lab legs meet this age-based review threshold.</p>}
      </Panel>
</div>
) : null}

      {tab === 'prediction-manual' ? (
        <Panel title="Manual prediction selection settlement">
          <form onSubmit={(event) => { event.preventDefault(); void submitPredictionSelectionSettlement(); }} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.1fr_1.1fr_150px_1.4fr_auto] sm:items-end">
            <label className="text-[10px] font-medium text-muted-foreground">Market prediction ID
              <input value={predictionMarketId} onChange={(event) => setPredictionMarketId(event.target.value)} required autoComplete="off" className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" />
            </label>
            <label className="text-[10px] font-medium text-muted-foreground">Selection key
              <input value={predictionSelectionKey} onChange={(event) => setPredictionSelectionKey(event.target.value)} required autoComplete="off" className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" />
            </label>
            <label className="text-[10px] font-medium text-muted-foreground">Outcome
              <select value={predictionOutcome} onChange={(event) => setPredictionOutcome(event.target.value as ManualPredictionSelectionOutcome)} className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground">
                {(['WON', 'LOST', 'VOID', 'PUSH', 'HALF_WON', 'HALF_LOST'] as ManualPredictionSelectionOutcome[]).map((outcome) => <option key={outcome} value={outcome}>{humanize(outcome)}</option>)}
              </select>
            </label>
            <label className="text-[10px] font-medium text-muted-foreground">Reason
              <input value={predictionReason} onChange={(event) => setPredictionReason(event.target.value)} minLength={5} maxLength={500} required className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" />
            </label>
            <button type="submit" disabled={manualPredictionSettle.isPending} className="h-8 rounded bg-primary px-3 text-[11px] font-semibold text-primary-foreground disabled:opacity-50">{manualPredictionSettle.isPending ? 'Settling…' : 'Settle'}</button>
          </form>
        </Panel>
      ) : null}

      {tab === 'jobs' || tab === 'runs' ? (
<section className="space-y-2">
        {tab === 'jobs' ? (
<Panel title="Settlement jobs" eyebrow="Persistent queue" count={jobs.data?.pagination.total}>
          <div className="mb-2 grid gap-2 sm:grid-cols-[1fr_155px_90px]">
            <FilterInput label="Filter by event ID" value={jobEventFilter} onChange={(value) => { setJobEventFilter(value); setJobPage(1); }} placeholder="Any fixture" />
            <FilterSelect label="Status" value={jobStatus} onChange={(value) => { setJobStatus(value as '' | SettlementJobStatus); setJobPage(1); }} options={[{ value: '', label: 'All statuses' }, ...JOB_STATUSES.map((status) => ({ value: status, label: humanize(status) }))]} />
            <PageSize value={jobLimit} onChange={(value) => { setJobLimit(value); setJobPage(1); }} />
          </div>
          <JobsTable rows={jobs.data?.items ?? []} loading={jobs.isLoading} error={jobs.isError} onRetry={() => void jobs.refetch()} />
          <Pagination page={jobs.data?.pagination.page ?? jobPage} pages={jobs.data?.pagination.pages ?? 0} total={jobs.data?.pagination.total ?? 0} onPage={setJobPage} />
        </Panel>
) : null}

        {tab === 'runs' ? (
<Panel title="Settlement runs" eyebrow="Processing history" count={runs.data?.pagination.total}>
          <div className="mb-2 grid gap-2 sm:grid-cols-[1fr_100px]">
            <FilterInput label="Filter by event ID" value={runEventFilter} onChange={(value) => { setRunEventFilter(value); setRunPage(1); }} placeholder="Any fixture" />
            <PageSize value={runLimit} onChange={(value) => { setRunLimit(value); setRunPage(1); }} />
          </div>
          <RunsTable rows={runs.data?.items ?? []} loading={runs.isLoading} error={runs.isError} onRetry={() => void runs.refetch()} />
          <Pagination page={runs.data?.pagination.page ?? runPage} pages={runs.data?.pagination.pages ?? 0} total={runs.data?.pagination.total ?? 0} onPage={setRunPage} />
        </Panel>
) : null}
      </section>
) : null}

      {tab === 'events' ? (
<Panel title="Settlement events" eyebrow="Audit trail" count={events.data?.items.length}>
        <div className="mb-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_145px_1fr_90px]">
          <FilterInput label="Filter by event ID" value={eventEventFilter} onChange={setEventEventFilter} placeholder="Any fixture" />
          <FilterSelect label="Level" value={eventLevel} onChange={(value) => setEventLevel(value as '' | SettlementEventLevel)} options={[{ value: '', label: 'All levels' }, ...EVENT_LEVELS.map((level) => ({ value: level, label: level }))]} />
          <FilterInput label="Action" value={eventAction} onChange={setEventAction} placeholder="e.g. JOB_FAILED" />
          <PageSize value={eventLimit} onChange={setEventLimit} max={200} />
        </div>
        <EventsTable rows={events.data?.items ?? []} loading={events.isLoading} error={events.isError} onRetry={() => void events.refetch()} />
      </Panel>
) : null}

      {tab === 'overview' ? (
<section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Recent queue activity" eyebrow="Latest 10 jobs">
          <JobsTable rows={data?.recentJobs ?? []} loading={monitor.isLoading} error={monitor.isError} onRetry={() => void monitor.refetch()} compact />
        </Panel>
        <Panel title="Recent warnings & errors" eyebrow="Latest 20 events">
          <EventsTable rows={data?.recentWarningsAndErrors ?? []} loading={monitor.isLoading} error={monitor.isError} onRetry={() => void monitor.refetch()} compact />
        </Panel>
      </section>
) : null}

    </main>
  );
}

function Panel({ title, count, trailing, children }: { title: string; eyebrow?: string; count?: number; trailing?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm shadow-black/[0.02]">
      <header className="flex min-h-10 items-center justify-between gap-3 border-b border-border/70 px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-xs font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {typeof count === 'number' && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">{count.toLocaleString()}</span>}
          {trailing}
        </div>
      </header>
      <div className="p-2">{children}</div>
    </section>
  );
}

function Metric({ label, value, detail, tone = 'neutral', smallValue = false }: { label: string; value?: number | string; detail: string; tone?: Tone; smallValue?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/80 bg-card px-3 py-2.5">
      <p className="truncate text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 truncate font-semibold tabular-nums tracking-tight ${smallValue ? 'text-[11px]' : 'text-xl'} ${toneText(tone)}`}>{value === undefined ? '—' : typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="mt-1 truncate text-[9px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function MiniMetric({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: Tone }) {
  return <div className="min-w-0 rounded-md bg-muted/45 px-2.5 py-2"><p className="truncate text-[9px] text-muted-foreground">{label}</p><p className={`mt-0.5 truncate text-sm font-semibold tabular-nums ${toneText(tone)}`}>{Number(value ?? 0).toLocaleString()}</p></div>;
}

function InfoLine({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? 'sm:col-span-2' : ''}><p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-0.5 text-[11px] leading-relaxed text-foreground/85">{value || '—'}</p></div>;
}

function CountStrip({ label, counts }: { label: string; counts: Record<string, number> }) {
  const entries = Object.entries(counts ?? {}).sort((a, b) => b[1] - a[1]);
  return <div className="mt-3"><p className="mb-1.5 text-[10px] font-medium text-muted-foreground">{label}</p>{entries.length ? <div className="flex flex-wrap gap-1">{entries.map(([key, count]) => <span key={key} className="inline-flex items-center gap-1 rounded border border-border/70 bg-background px-1.5 py-1 text-[9px]"><span className="text-muted-foreground">{humanize(key)}</span><b className="tabular-nums">{count.toLocaleString()}</b></span>)}</div> : <p className="text-[10px] text-muted-foreground">No recorded outcomes.</p>}</div>;
}

type Tone = 'neutral' | 'blue' | 'amber' | 'green' | 'red';
function toneText(tone: Tone) {
  return ({ neutral: 'text-foreground', blue: 'text-sky-700 dark:text-sky-300', amber: 'text-amber-700 dark:text-amber-300', green: 'text-emerald-700 dark:text-emerald-300', red: 'text-rose-700 dark:text-rose-300' } as const)[tone];
}

function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  const styles: Record<Tone, string> = {
    neutral: 'border-border bg-muted/60 text-muted-foreground',
    blue: 'border-sky-500/20 bg-sky-500/8 text-sky-700 dark:text-sky-300',
    amber: 'border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-300',
    green: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300',
    red: 'border-rose-500/20 bg-rose-500/8 text-rose-700 dark:text-rose-300',
  };
  return <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-semibold ${styles[tone]}`}>{children}</span>;
}

function JobsTable({ rows, loading, error, onRetry, compact = false }: { rows: SettlementJob[]; loading: boolean; error: boolean; onRetry: () => void; compact?: boolean }) {
  return <TableState loading={loading} error={error} onRetry={onRetry} empty="No settlement jobs match these filters.">
    {rows.length > 0 && <div className="max-h-[300px] overflow-auto rounded-md border border-border/70"><table className="w-full min-w-[680px] table-fixed text-left text-[10px]"><thead className="sticky top-0 z-[1] bg-muted/90 text-muted-foreground backdrop-blur"><tr>{['Fixture / league', 'Status', 'Attempts', 'Trigger', 'Updated', ...(compact ? [] : ['Result / issue'])].map((label) => <th key={label} className="px-2.5 py-2 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map((job, index) => <tr key={job._id ?? job.jobKey ?? `${job.eventId}-${index}`} className="border-t border-border/60 align-top hover:bg-muted/25"><td className="px-2.5 py-2"><p className="truncate font-semibold text-foreground">{job.eventId || 'Unknown event'}</p><p className="mt-0.5 truncate text-[9px] text-muted-foreground">{job.leagueId || 'Unknown league'}</p><p className="mt-0.5 truncate font-mono text-[8px] text-muted-foreground" title={job.jobKey}>{job.jobKey || '—'}</p></td><td className="px-2.5 py-2"><StatusTag status={job.status} /></td><td className="px-2.5 py-2 tabular-nums">{job.attempts ?? 0}<span className="text-muted-foreground"> / {job.maximumAttempts ?? '—'}</span><p className="mt-0.5 text-[9px] text-muted-foreground">P{job.priority ?? '—'}</p></td><td className="px-2.5 py-2"><p className="truncate" title={job.triggerReason}>{humanize(job.triggerReason || '—')}</p>{job.lastDurationMs != null && <p className="mt-0.5 text-[9px] text-muted-foreground">{formatDuration(job.lastDurationMs)}</p>}</td><td className="px-2.5 py-2 text-muted-foreground">{formatDate(job.updatedAt ?? job.createdAt)}</td>{!compact && <td className="px-2.5 py-2">{job.lastError ? <p className="line-clamp-2 text-rose-700 dark:text-rose-300" title={job.lastError}>{job.lastError}</p> : <><p className="truncate text-muted-foreground" title={JSON.stringify(job.resultCounts ?? {})}>{countSummary(job.resultCounts)}</p>{job.unresolvedReasons?.length > 0 && <p className="mt-1 truncate text-amber-700 dark:text-amber-300" title={job.unresolvedReasons.join('\n')}>{job.unresolvedReasons.length} unresolved reason(s)</p>}</>}</td>}</tr>)}</tbody></table></div>}
  </TableState>;
}

function RunsTable({ rows, loading, error, onRetry }: { rows: SettlementRun[]; loading: boolean; error: boolean; onRetry: () => void }) {
  return <TableState loading={loading} error={error} onRetry={onRetry} empty="No settlement runs match this fixture filter.">
    {rows.length > 0 && <div className="max-h-[300px] overflow-auto rounded-md border border-border/70"><table className="w-full min-w-[620px] table-fixed text-left text-[10px]"><thead className="sticky top-0 z-[1] bg-muted/90 text-muted-foreground backdrop-blur"><tr>{['Fixture / league', 'Status', 'Started', 'Duration', 'Counts / unresolved'].map((label) => <th key={label} className="px-2.5 py-2 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map((run, index) => <tr key={run._id ?? `${run.eventId}-${run.sourceFingerprint}-${index}`} className="border-t border-border/60 align-top hover:bg-muted/25"><td className="px-2.5 py-2"><p className="truncate font-semibold">{run.eventId || 'Unknown event'}</p><p className="mt-0.5 truncate text-[9px] text-muted-foreground">{run.leagueId || 'Unknown league'}</p></td><td className="px-2.5 py-2"><StatusTag status={run.status} /></td><td className="px-2.5 py-2 text-muted-foreground">{formatDate(run.startedAt ?? run.createdAt)}<p className="mt-0.5 text-[9px]">Done: {formatDate(run.completedAt)}</p></td><td className="px-2.5 py-2 tabular-nums">{run.durationMs == null ? '—' : formatDuration(run.durationMs)}</td><td className="px-2.5 py-2"><p className="line-clamp-2" title={JSON.stringify(run.counts ?? {})}>{countSummary(run.counts)}</p>{run.unresolvedReasons?.length > 0 && <details className="mt-1"><summary className="cursor-pointer text-amber-700 dark:text-amber-300">{run.unresolvedReasons.length} unresolved</summary><ul className="mt-1 list-disc space-y-1 pl-3 text-[9px] text-muted-foreground">{run.unresolvedReasons.map((reason, i) => <li key={`${i}-${reason}`}>{reason}</li>)}</ul></details>}</td></tr>)}</tbody></table></div>}
  </TableState>;
}

function EventsTable({ rows, loading, error, onRetry, compact = false }: { rows: SettlementEvent[]; loading: boolean; error: boolean; onRetry: () => void; compact?: boolean }) {
  return <TableState loading={loading} error={error} onRetry={onRetry} empty="No settlement events match these filters.">
    {rows.length > 0 && <div className="max-h-[320px] overflow-auto rounded-md border border-border/70"><table className="w-full min-w-[620px] table-fixed text-left text-[10px]"><thead className="sticky top-0 z-[1] bg-muted/90 text-muted-foreground backdrop-blur"><tr>{['Level / time', 'Action', 'Message', 'Fixture', ...(!compact ? ['References / metadata'] : [])].map((label) => <th key={label} className="px-2.5 py-2 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map((event, index) => <tr key={event._id ?? `${event.occurredAt}-${event.action}-${index}`} className="border-t border-border/60 align-top hover:bg-muted/25"><td className="px-2.5 py-2"><EventLevelTag level={event.level} /><p className="mt-1 text-[9px] text-muted-foreground">{formatDate(event.occurredAt)}</p></td><td className="px-2.5 py-2"><p className="break-words font-medium">{humanize(event.action || 'Unknown action')}</p>{event.jobKey && <p className="mt-1 truncate font-mono text-[8px] text-muted-foreground" title={event.jobKey}>{event.jobKey}</p>}</td><td className="px-2.5 py-2"><p className="line-clamp-3 break-words" title={event.message}>{event.message || '—'}</p></td><td className="px-2.5 py-2"><p className="truncate font-mono">{event.eventId || '—'}</p>{event.runId && <p className="mt-1 truncate text-[9px] text-muted-foreground" title={event.runId}>Run {event.runId}</p>}</td>{!compact && <td className="px-2.5 py-2">{event.metadata && Object.keys(event.metadata).length > 0 ? <details><summary className="cursor-pointer text-primary">View metadata</summary><pre className="mt-1 max-w-[300px] whitespace-pre-wrap break-words rounded bg-muted/60 p-2 text-[9px]">{safeJson(event.metadata)}</pre></details> : <span className="text-muted-foreground">—</span>}</td>}</tr>)}</tbody></table></div>}
  </TableState>;
}

function TableState({ loading, error, onRetry, empty, children }: { loading: boolean; error: boolean; onRetry: () => void; empty: string; children: ReactNode }) {
  if (loading && !children) return <p className="py-3 text-center text-[11px] text-muted-foreground">Loading records…</p>;
  if (error) return <InlineError message="Unable to load these records." onRetry={onRetry} />;
  if (!loading && !children) return <p className="py-3 text-center text-[11px] text-muted-foreground">{empty}</p>;
  return <>{children}</>;
}

function LoadingOrEmpty({ loading, error, empty }: { loading: boolean; error: boolean; empty: string }) {
  return <p className="py-3 text-[11px] text-muted-foreground">{loading ? 'Loading overview…' : error ? 'Overview failed to load.' : empty}</p>;
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-destructive"><span>{message}</span><button type="button" onClick={onRetry} className="shrink-0 rounded border border-destructive/20 px-2 py-1 font-medium hover:bg-destructive/5">Retry</button></div>;
}

function FilterInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-[10px] font-medium text-muted-foreground">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2.5 text-[11px] text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10" /></label>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return <label className="block text-[10px] font-medium text-muted-foreground">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-[11px] text-foreground outline-none focus:border-primary/60">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function PageSize({ value, onChange, max = 100 }: { value: number; onChange: (value: number) => void; max?: number }) {
  const options = PAGE_SIZE_OPTIONS.filter((size) => size <= max);
  return <label className="block text-[10px] font-medium text-muted-foreground">Rows<select aria-label="Rows per page" value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-[11px] text-foreground">{options.map((size) => <option key={size} value={size}>{size} / page</option>)}</select></label>;
}

function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (page: number) => void }) {
  if (total <= 0) return <div className="pt-2 text-[10px] text-muted-foreground">0 records</div>;
  return <div className="flex items-center justify-between gap-2 pt-2 text-[10px] text-muted-foreground"><span>Page {page} of {Math.max(pages, 1)} · {total.toLocaleString()} records</span><div className="flex gap-1"><button type="button" disabled={page <= 1} onClick={() => onPage(Math.max(1, page - 1))} className="h-7 rounded border border-border px-2 hover:bg-muted disabled:opacity-35">Previous</button><button type="button" disabled={page >= pages} onClick={() => onPage(Math.min(pages, page + 1))} className="h-7 rounded border border-border px-2 hover:bg-muted disabled:opacity-35">Next</button></div></div>;
}

function StatusTag({ status }: { status?: string }) {
  const normalized = (status ?? '').toUpperCase();
  const tone: Tone = ['COMPLETED', 'WON'].includes(normalized) ? 'green' : ['FAILED', 'LOST'].includes(normalized) ? 'red' : ['PROCESSING', 'RETRY', 'PARTIAL'].includes(normalized) ? 'amber' : ['QUEUED'].includes(normalized) ? 'blue' : 'neutral';
  return <Tag tone={tone}>{humanize(normalized || 'Unknown')}</Tag>;
}

function EventLevelTag({ level }: { level: SettlementEventLevel }) {
  const tone: Tone = level === 'ERROR' ? 'red' : level === 'WARN' ? 'amber' : level === 'DEBUG' ? 'neutral' : 'blue';
  return <Tag tone={tone}>{level}</Tag>;
}

function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function formatDuration(milliseconds: number) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '—';
  if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`;
  if (milliseconds < 60_000) return `${(milliseconds / 1000).toFixed(1)} s`;
  return `${Math.floor(milliseconds / 60_000)}m ${Math.round((milliseconds % 60_000) / 1000)}s`;
}

function countSummary(counts?: Record<string, number> | null) {
  if (!counts || Object.keys(counts).length === 0) return '—';
  return Object.entries(counts).map(([key, value]) => `${humanize(key)}: ${Number(value).toLocaleString()}`).join(' · ');
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function safeJson(value: unknown) {
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

function getErrorMessage(error: unknown, fallback = 'The request could not be completed.') {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

function requeueReason(reason?: string) {
  const messages: Record<string, string> = {
    EMPTY_EVENT_ID: 'Enter a fixture event ID.',
    FIXTURE_NOT_FOUND: 'Fixture not found. Check the event ID and optional league ID.',
    SUMMARY_MISSING: 'The fixture could not be queued because the current backend rejected the missing Summary.',
    FIXTURE_NOT_FINISHED: 'This fixture is not marked as finished, so it cannot be settled yet.',
    ALREADY_PROCESSING: 'This fixture is already being processed.',
    QUEUED: 'The fixture was queued.',
    PROCESSING: 'The fixture is already processing.',
    PARTIAL: 'The fixture is already partially settled; the backend did not queue another run.',
    FAILED: 'The fixture could not be queued. Check the settlement job and event logs.',
  };
  return messages[reason ?? ''] ?? `Fixture was not queued${reason ? `: ${humanize(reason)}` : '.'}`;
}

