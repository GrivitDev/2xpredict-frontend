"use client";

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  predictionEngineQueryKeys,
  useGetCatalogQuery,
  useGetDashboardQuery,
  useGetEventMarketsQuery,
  useGetEventsQuery,
  useGetQueueQuery,
  useGetRunsQuery,
  useListCalibrationQuery,
  useRecoverStaleQueueMutation,
  useRebuildCalibrationMutation,
  useRefreshSlipsMutation,
  useRunNextQueueItemMutation,
  useSyncQueueMutation,
  useGenerateFixtureMutation,
  useBuildSlipMutation,
  useUpdateSportyBetMutation,
  usePublishSlipMutation,
  useUpdateSlipLegsMutation,
  useGetSlipQuery,
  useListAdminSlipsQuery,
  useListAdminPickCenterQuery,
  useListAdminCuratedPredictionsQuery,
  useRefreshCuratedPredictionsMutation,
  usePublishCuratedPredictionMutation,
  useUnpublishCuratedPredictionMutation,
} from '@/hooks/use-prediction-engine';
import { errorMessage } from '@/lib/api-shapes';
import SectionHeader from '@/components/shared/SectionHeader';
import PredictionMarketCoverage from './PredictionMarketCoverage';
import type { ActiveSlipProductType, SlipProductType } from '@/types/predictions';
import type {
  MonitorRecord,
  PredictionEventLevel,
  PredictionQueueStatus,
} from '@/types/prediction-engine-monitor';

type Field = [keyof MonitorRecord | string, string];

function record(value: unknown): MonitorRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as MonitorRecord : {};
}
function list(value: unknown, keys: string[] = []): MonitorRecord[] {
  if (Array.isArray(value)) return value.map(record);
  const source = record(value);
  for (const key of keys) {
    if (Array.isArray(source[key])) return (source[key] as unknown[]).map(record);
  }
  if (source.data !== undefined) return list(source.data, keys);
  return [];
}
function value(source: unknown, keys: string[], fallback = '—'): string {
  const item = record(source);
  for (const key of keys) {
    const found = item[key];
    if (found !== undefined && found !== null && found !== '') {
      if (typeof found === 'object') return JSON.stringify(found);
      return String(found);
    }
  }
  return fallback;
}
function count(source: unknown, key: string): string {
  const found = record(source)[key];
  return typeof found === 'number' && Number.isFinite(found) ? found.toLocaleString() : '0';
}
function date(value?: unknown): string {
  if (!value) return '—';
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
}
function percent(value?: number | null, scale = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${(value * scale).toFixed(1)}%`;
}
function duration(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return '—';
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(1)} s`;
}
function statusTone(status: string): string {
  const normalized = status.toLowerCase();
  if (['ready', 'completed', 'success', 'calculated', 'published', 'true'].some((part) => normalized.includes(part))) return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (['failed', 'error', 'degraded', 'unavailable', 'false'].some((part) => normalized.includes(part))) return 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  if (['processing', 'pending', 'retry', 'partial', 'unknown'].some((part) => normalized.includes(part))) return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  return 'border-border bg-muted/50 text-muted-foreground';
}

export default function PredictionEngineAdmin() {
  const queryClient = useQueryClient();
  const dashboard = useGetDashboardQuery({ refetchInterval: 30_000, staleTime: 10_000 });
  const [tab, setTab] = useState<'overview' | 'models' | 'calibration' | 'queue' | 'events' | 'controls' | 'pick-center' | 'slips' | 'curated' | 'coverage'>('overview');
  const [queueStatus, setQueueStatus] = useState<PredictionQueueStatus | ''>('');
  const [queueLimit, setQueueLimit] = useState('40');
  const [runsLimit, setRunsLimit] = useState('25');
  const [eventsLimit, setEventsLimit] = useState('40');
  const [eventsLevel, setEventsLevel] = useState<PredictionEventLevel | ''>('');
  const [pickPage, setPickPage] = useState(1);
  const [pickPageSize, setPickPageSize] = useState(50);
  const [pickLeagueId, setPickLeagueId] = useState('');
  const [pickFrom, setPickFrom] = useState('');
  const [pickTo, setPickTo] = useState('');
  const [pickIncludePast, setPickIncludePast] = useState(true);
  const [slipsPage, setSlipsPage] = useState(1);
  const [slipsPageSize, setSlipsPageSize] = useState(50);
  const [slipsFrom, setSlipsFrom] = useState('');
  const [slipsTo, setSlipsTo] = useState('');
  const [slipsProductType, setSlipsProductType] = useState<SlipProductType | ''>('');
  const [slipsAutomatic, setSlipsAutomatic] = useState('');
  const [slipsStatus, setSlipsStatus] = useState('');
  const [curatedPage, setCuratedPage] = useState(1);
  const [curatedPageSize, setCuratedPageSize] = useState(50);
  const [curatedStatus, setCuratedStatus] = useState('');
  const [buildFixtureFrom, setBuildFixtureFrom] = useState('');
  const [buildFixtureTo, setBuildFixtureTo] = useState('');
  const [buildCreatedBy, setBuildCreatedBy] = useState('');
  const [buildSureOddsProduct, setBuildSureOddsProduct] = useState('');
  const queue = useGetQueueQuery({ query: { limit: Number(queueLimit) || 40, ...(queueStatus ? { status: queueStatus } : {}) } }, { enabled: tab === 'queue', refetchInterval: 30_000 });
  const runs = useGetRunsQuery({ query: { limit: Number(runsLimit) || 25 } }, { enabled: tab === 'queue', refetchInterval: 30_000 });
  const events = useGetEventsQuery({ query: { limit: Number(eventsLimit) || 40, ...(eventsLevel ? { level: eventsLevel } : {}) } }, { enabled: tab === 'events', refetchInterval: 30_000 });
  const catalog = useGetCatalogQuery({ enabled: tab === 'models', staleTime: 5 * 60_000 });
  const calibration = useListCalibrationQuery({ enabled: tab === 'calibration', refetchInterval: 60_000 });
  const [eventId, setEventId] = useState('');
  const [marketKey, setMarketKey] = useState('');
  const [forceSync, setForceSync] = useState(false);
  const [buildEventIds, setBuildEventIds] = useState('');
  const [buildSlipName, setBuildSlipName] = useState('');
  const [buildProductType, setBuildProductType] = useState<ActiveSlipProductType>('ODDS_10');
  const [buildSelectionCount, setBuildSelectionCount] = useState('2');
  const [buildMinimumProbability, setBuildMinimumProbability] = useState('40');
  const [buildMinimumConfidence, setBuildMinimumConfidence] = useState('70');
  const [buildPublish, setBuildPublish] = useState(false);
  const [slipId, setSlipId] = useState('');
  const [sportyBetCode, setSportyBetCode] = useState('');
  const [sportyBetLink, setSportyBetLink] = useState('');
  const [slipLegsJson, setSlipLegsJson] = useState('[]');
  const [selectedSlipId, setSelectedSlipId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [actionResult, setActionResult] = useState<unknown>(null);
  const sync = useSyncQueueMutation();
  const recover = useRecoverStaleQueueMutation();
  const runNext = useRunNextQueueItemMutation();
  const generate = useGenerateFixtureMutation();
  const refreshSlips = useRefreshSlipsMutation();
  const rebuild = useRebuildCalibrationMutation();
  const eventMarkets = useGetEventMarketsQuery({ path: { eventId: eventId.trim() } }, { enabled: tab === 'models' && Boolean(eventId.trim()), staleTime: 10_000 });
  const pickCenter = useListAdminPickCenterQuery({ query: { page: pickPage, pageSize: pickPageSize, includePast: pickIncludePast, ...(pickLeagueId.trim() ? { leagueId: pickLeagueId.trim() } : {}), ...(pickFrom ? { from: pickFrom } : {}), ...(pickTo ? { to: pickTo } : {}) } }, { enabled: tab === 'pick-center', staleTime: 15_000 });
  const adminSlips = useListAdminSlipsQuery({ query: { page: slipsPage, pageSize: slipsPageSize, ...(slipsFrom ? { from: slipsFrom } : {}), ...(slipsTo ? { to: slipsTo } : {}), ...(slipsProductType ? { productType: slipsProductType } : {}), ...(slipsAutomatic !== '' ? { automatic: slipsAutomatic === 'true' } : {}), ...(slipsStatus ? { status: slipsStatus } : {}) } }, { enabled: tab === 'slips', staleTime: 15_000 });
  const curatedPredictions = useListAdminCuratedPredictionsQuery({ query: { page: curatedPage, pageSize: curatedPageSize, ...(curatedStatus ? { status: curatedStatus } : {}) } }, { enabled: tab === 'curated', staleTime: 15_000 });
  const selectedSlip = useGetSlipQuery({ path: { slipId: selectedSlipId } }, { enabled: Boolean(selectedSlipId), staleTime: 10_000 });
  const buildSlip = useBuildSlipMutation();
  const updateSportyBet = useUpdateSportyBetMutation();
  const publishSlip = usePublishSlipMutation();
  const updateSlipLegs = useUpdateSlipLegsMutation();
  const refreshCurated = useRefreshCuratedPredictionsMutation();
  const publishCurated = usePublishCuratedPredictionMutation();
  const unpublishCurated = useUnpublishCuratedPredictionMutation();

  const dash = dashboard.data;
  const queueRows = useMemo(() => list(queue.data, ['items', 'queue', 'entries', 'results']), [queue.data]);
  const runRows = useMemo(() => list(runs.data, ['items', 'runs', 'results']), [runs.data]);
  const eventRows = useMemo(() => list(events.data, ['items', 'events', 'results']), [events.data]);
  const catalogRows = useMemo(() => list(catalog.data, ['items', 'markets', 'catalog', 'results']), [catalog.data]);
  const calibrationRows = useMemo(() => list(calibration.data, ['items', 'calibration', 'records', 'results']), [calibration.data]);
  const marketRows = useMemo(() => list(eventMarkets.data, ['items', 'markets', 'results']), [eventMarkets.data]);
  const pickCenterRows = useMemo(() => list(pickCenter.data, ['items', 'records', 'markets', 'results']), [pickCenter.data]);
  const adminSlipRows = useMemo(() => list(adminSlips.data, ['items', 'slips', 'records', 'results']), [adminSlips.data]);
  const curatedRows = useMemo(() => list(curatedPredictions.data, ['items', 'predictions', 'records', 'results']), [curatedPredictions.data]);

  async function runAction(label: string, action: () => Promise<unknown>) {
    setNotice(''); setError(''); setActionResult(null);
    try {
      const result = await action();
      setActionResult(result);
      const details = result && typeof result === 'object' ? record(result) : {};
      const summary = value(details, ['message', 'summary', 'reason'], '');
      setNotice(summary && summary !== '—' ? `${label}: ${summary}` : `${label} completed.`);
      await queryClient.invalidateQueries({ queryKey: predictionEngineQueryKeys.all });
    } catch (caught) {
      setError(errorMessage(caught, `${label} failed.`));
    }
  }
  async function buildAdminSlip() {
    const eventIds = buildEventIds.split(/[\s,]+/).map((id) => id.trim()).filter(Boolean);
    if (!eventIds.length && !buildSlipName.trim() && !buildFixtureFrom && !buildFixtureTo) {
      setError('Enter fixture IDs, a name, or a fixture date range.');
      setNotice('');
      return;
    }
    await runAction('Build slip', () => buildSlip.mutateAsync({
      body: {
        ...(eventIds.length ? { eventIds } : {}),
        ...(buildSlipName.trim() ? { name: buildSlipName.trim() } : {}),
        ...(buildFixtureFrom ? { fixtureFrom: buildFixtureFrom } : {}),
        ...(buildFixtureTo ? { fixtureTo: buildFixtureTo } : {}),
        ...(buildCreatedBy.trim() ? { createdBy: buildCreatedBy.trim() } : {}),
        ...(buildSureOddsProduct ? { sureOddsProduct: buildSureOddsProduct as 'SURE_2' | 'SURE_5' | 'SURE_7', sureOddsTier: buildSureOddsProduct === 'SURE_2' ? 'VIP' as const : 'PREMIUM' as const } : {}),
        selectionCount: Number(buildSelectionCount) || 2,
        minimumProbability: Number(buildMinimumProbability) || 40,
        minimumConfidence: Number(buildMinimumConfidence) || 70,
        productType: buildProductType,
        publish: buildPublish,
      },
    }));
    void adminSlips.refetch();
  }

  async function saveSportyBet() {
    if (!slipId.trim()) { setError('Enter a slip ID.'); setNotice(''); return; }
    await runAction('SportyBet details', () => updateSportyBet.mutateAsync({
      path: { slipId: slipId.trim() },
      body: { sportyBetSlipCode: sportyBetCode.trim() || null, sportyBetSlipLink: sportyBetLink.trim() || null },
    }));
  }

  async function saveSlipLegs() {
    if (!slipId.trim()) { setError('Enter a slip ID.'); setNotice(''); return; }
    try {
      const parsed: unknown = JSON.parse(slipLegsJson);
      const legs = Array.isArray(parsed) ? parsed : record(parsed).legs;
      if (!Array.isArray(legs)) throw new Error('Slip legs must be a JSON array.');
      await runAction('Update slip legs', () => updateSlipLegs.mutateAsync({
        path: { slipId: slipId.trim() },
        body: { legs: legs as { eventId: string; marketPredictionId: string; marketKey: string; selectionKey: string }[] },
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Invalid slip legs JSON.');
      setNotice('');
    }
  }

  async function changeCuratedPublication(row: MonitorRecord, publish: boolean) {
    const predictionId = value(row, ['_id', 'id', 'predictionId'], '');
    if (!predictionId) return;
    await runAction(publish ? 'Publish curated prediction' : 'Unpublish curated prediction', () =>
      publish
        ? publishCurated.mutateAsync({ path: { predictionId } })
        : unpublishCurated.mutateAsync({ path: { predictionId } }),
    );
    void curatedPredictions.refetch();
  }

  function refreshAll() {
    void dashboard.refetch();
    if (tab === 'queue') { void queue.refetch(); void runs.refetch(); }
    if (tab === 'events') void events.refetch();
    if (tab === 'models') void catalog.refetch();
    if (tab === 'calibration') void calibration.refetch();
    if (tab === 'pick-center') void pickCenter.refetch();
    if (tab === 'slips') void adminSlips.refetch();
    if (tab === 'curated') void curatedPredictions.refetch();
  }

  const engineStatus = !dash ? (dashboard.isLoading ? 'Loading' : 'Unknown') : !dash.engine.enabled ? 'Disabled' : dash.engine.workerRunning ? 'Worker running' : 'Worker stopped';
  const overallTone = !dash ? 'unknown' : !dash.engine.enabled || !dash.engine.workerRunning || Boolean(dash.engine.lastError) ? 'degraded' : 'ready';

  return (
    <main className="mx-auto max-w-[1480px] space-y-2 px-1 py-1 sm:px-1.5">
      <SectionHeader title="Prediction Engine" action={
        <button type="button" onClick={refreshAll} disabled={dashboard.isFetching} className="h-6 rounded-md border border-border bg-card px-3 text-xs font-semibold transition hover:bg-muted disabled:opacity-50">{dashboard.isFetching ? 'Refreshing…' : 'Refresh data'}</button>
      } />
      <nav aria-label="Prediction Engine sections" className="flex gap-0.5 overflow-x-auto border-b border-border/70 py-1">
        {([
          ['overview', 'Overview'],
          ['queue', 'Queue & runs'],
          ['models', 'Markets'],
          ['coverage', 'Market coverage'],
          ['calibration', 'Calibration'],
          ['pick-center', 'Pick Center'],
          ['curated', 'Curated'],
          ['slips', 'Slips'],
          ['events', 'Events'],
          ['controls', 'Controls'],
        ] as const).map(([id, labelText]) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-pressed={tab === id}
            className={`h-7 shrink-0 rounded-md px-2 text-[11px] font-medium ${tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            {labelText}
          </button>
        ))}
      </nav>

      {(notice || error) && <div role={error ? 'alert' : 'status'} className={`rounded-md border px-2 py-1.5 text-xs ${error ? 'border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300' : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'}`}>{error || notice}</div>}
      {tab === 'controls' && actionResult !== null ? <PayloadDetails title="Last action response" value={actionResult} /> : null}
      {dashboard.isError && <div role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/5 px-2 py-1.5 text-xs text-rose-700 dark:text-rose-300">Dashboard request failed. Check administrator access and the backend logs.</div>}

{tab === 'coverage' && <PredictionMarketCoverage />}

{tab === 'overview' && (
      <>
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Engine" value={engineStatus} hint={dash?.engine.modelVersion || 'Model version unavailable'} tone={overallTone} />
        <Metric label="Pending queue" value={count(dash?.queue, 'pending')} hint={`${count(dash?.queue, 'processing')} processing · ${count(dash?.queue, 'retry')} retry`} tone={Number(dash?.queue.failed || 0) ? 'degraded' : 'neutral'} />
        <Metric label="Runs · 24 hours" value={count(dash?.runs, 'last24Hours')} hint={`${count(dash?.runs, 'completed')} completed · ${count(dash?.runs, 'failed')} failed`} tone={Number(dash?.runs.failed || 0) ? 'degraded' : 'neutral'} />
        <Metric label="Market documents" value={count(dash?.predictions, 'marketDocuments')} hint={`${count(dash?.predictions, 'calculatedMarketDocuments')} calculated`} />
        <Metric label="Upcoming fixtures" value={count(dash?.fixtures, 'upcoming')} hint={`${count(dash?.fixtures, 'eligibleWithSummary')} summary-ready`} />
        <Metric label="Published slips" value={count(dash?.slips, 'published')} hint={`${count(dash?.slips, 'ready')} ready`} />
      </section>
      </>

)}
{tab === 'overview' && (
      <section className="grid gap-2 xl:grid-cols-[1.05fr_1fr]">
        <Panel title="Engine & fixture readiness" meta={dash?.generatedAt ? `Updated ${date(dash.generatedAt)}` : undefined}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            <Datum label="Enabled" value={dash ? (dash.engine.enabled ? 'Yes' : 'No') : '—'} />
            <Datum label="Worker" value={dash ? (dash.engine.workerRunning ? 'Running' : 'Stopped') : '—'} />
            <Datum label="Curated/slip horizon" value={dash ? `${dash.generationWindows.curatedAndSlipForwardHours} hours` : '—'} />
            <Datum label="Odds readiness gate" value={dash?.generationWindows.oddsModuleReadinessRequired ? 'Required' : 'Not required'} />
            <Datum label="Timing gate" value={dash?.engine.timingGate ?? '—'} />
            <Datum label="Queue last synced" value={date(dash?.engine.lastQueueSyncAt)} />
            <Datum label="Last successful run" value={date(dash?.engine.lastSuccessfulRunAt)} />
            <Datum label="Last failed run" value={date(dash?.engine.lastFailedRunAt)} />
          </div>
          {dash?.engine.lastError && <p className="mt-3 rounded-md border border-rose-500/25 bg-rose-500/5 px-2 py-1.5 text-xs text-rose-700 dark:text-rose-300">Last engine error: {dash.engine.lastError}</p>}
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fixtures</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              <MiniStat label="Upcoming" value={count(dash?.fixtures, 'upcoming')} />
              <MiniStat label="Ready summary" value={count(dash?.fixtures, 'eligibleWithSummary')} />
              <MiniStat label="Missing summary" value={count(dash?.fixtures, 'upcomingMissingSummary')} />
              <MiniStat label="Live" value={count(dash?.fixtures, 'live')} />
              <MiniStat label="Completed" value={count(dash?.fixtures, 'completed')} />
            </div>
          </div>
        </Panel>

        <Panel title="Queue & run health" meta={`Average run ${duration(dash?.runs.averageDurationMs)}`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {([['Pending', 'pending'], ['Processing', 'processing'], ['Retry', 'retry'], ['Waiting for odds', 'waitingForOdds'], ['Completed', 'completed'], ['Failed', 'failed'], ['Skipped', 'skipped']] as const).map(([label, key]) => <MiniStat key={key} label={label} value={count(dash?.queue, key)} tone={key === 'failed' && Number(dash?.queue.failed || 0) > 0 ? 'degraded' : 'neutral'} />)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat label="Total runs" value={count(dash?.runs, 'total')} />
            <MiniStat label="Completed" value={count(dash?.runs, 'completed')} />
            <MiniStat label="Partial" value={count(dash?.runs, 'partial')} />
            <MiniStat label="Failed" value={count(dash?.runs, 'failed')} tone={Number(dash?.runs.failed || 0) ? 'degraded' : 'neutral'} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <span>Oldest pending: <strong className="font-medium text-foreground">{date(dash?.queue.oldestPendingAt)}</strong></span>
            <span>Average duration: <strong className="font-medium text-foreground">{duration(dash?.runs.averageDurationMs)}</strong></span>
            <span>Calculated selections: <strong className="font-medium text-foreground">{count(dash?.predictions, 'calculatedSelections')} / {count(dash?.predictions, 'selections')}</strong></span>
          </div>
        </Panel>
      </section>


)}
{tab === 'overview' && (
      <>
      <section className="grid gap-2 xl:grid-cols-2">
        <Panel title="Prediction quality" meta="Backend aggregate metrics">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MiniStat label="Average confidence" value={percent(dash?.quality.averageConfidence, 1)} />
            <MiniStat label="Average probability" value={percent(dash?.quality.averageProbability, 100)} />
            <MiniStat label="Market selections" value={count(dash?.predictions, 'selections')} />
            <MiniStat label="Partial markets" value={count(dash?.predictions, 'partialMarketDocuments')} />
            <MiniStat label="Unavailable markets" value={count(dash?.predictions, 'unavailableMarketDocuments')} />
            <MiniStat label="Failed markets" value={count(dash?.predictions, 'failedMarketDocuments')} tone={Number(dash?.predictions.failedMarketDocuments || 0) ? 'degraded' : 'neutral'} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
            <MiniStat label="Missing odds" value={count(dash?.quality, 'missingOddsFixtures')} />
            <MiniStat label="Missing evidence" value={count(dash?.quality, 'missingHistoricalEvidenceFixtures')} />
            <MiniStat label="Stale summaries" value={count(dash?.quality, 'staleSummaries')} tone={Number(dash?.quality.staleSummaries || 0) ? 'degraded' : 'neutral'} />
            <MiniStat label="Provider-priced" value={count(dash?.quality, 'providerPricedSelections')} />
            <MiniStat label="Estimated-priced" value={count(dash?.quality, 'estimatedPricedSelections')} />
            <MiniStat label="Odds-ready selections" value={count(dash?.quality, 'oddsReadySelections')} />
            <MiniStat label="Calibration applied" value={count(dash?.quality, 'calibrationAppliedSelections')} />
            <MiniStat label="Recommendation eligible" value={count(dash?.quality, 'recommendationEligibleSelections')} />
          </div>
        </Panel>
        <Panel title="Slip & Pick Center status">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MiniStat label="Total slips" value={count(dash?.slips, 'total')} />
            <MiniStat label="Ready" value={count(dash?.slips, 'ready')} />
            <MiniStat label="Published" value={count(dash?.slips, 'published')} />
            <MiniStat label="With SportyBet code" value={count(dash?.slips, 'withSportyBetCode')} />
            <MiniStat label="Without code" value={count(dash?.slips, 'withoutSportyBetCode')} />
            <MiniStat label="Ranked Pick Center" value={count(dash?.predictions, 'rankedPickCenterMarkets')} />
            <MiniStat label="Selected Pick Center" value={count(dash?.predictions, 'selectedPickCenterMarkets')} />
            <MiniStat label="Automatic active slips" value={count(dash?.slips, 'automaticActive')} />
            <MiniStat label="Published Sure Odds" value={count(dash?.slips, 'sureOddsPublished')} />
            <MiniStat label="Generated today" value={count(dash?.slips, 'generatedToday')} />
            <MiniStat label="Curated published" value={count(dash?.curatedPredictions, 'published')} />
            <MiniStat label="Curated awaiting" value={count(dash?.curatedPredictions, 'ready')} />
            <MiniStat label="Eligible fixtures missing curated" value={count(dash?.curatedPredictions, 'missingForEligiblePickCenterFixtures')} tone={Number(dash?.curatedPredictions.missingForEligiblePickCenterFixtures || 0) ? 'degraded' : 'neutral'} />
          </div>
        </Panel>
      </section>
      <PayloadDetails title="Full dashboard response" value={dashboard.data} />
      </>
)}
{tab === 'overview' && (
      <>
        <section className="grid gap-2 xl:grid-cols-2">
          <Panel title="Calibration health" >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Markets refreshed" value={count(dash?.calibration, 'marketsRefreshedLastCycle')} />
              <MiniStat label="Active calibrators" value={count(dash?.calibration, 'activeMarketsLastCycle')} />
              <MiniStat label="Markets with samples" value={count(dash?.quality, 'calibrationMarkets')} />
              <MiniStat label="Calibrated markets" value={count(dash?.quality, 'calibratedMarkets')} />
              <MiniStat label="Settled selections" value={count(dash?.quality, 'calibrationSettledSelections')} />
              <MiniStat label="Mean Brier" value={dash?.quality.meanBrierScore == null ? '—' : dash.quality.meanBrierScore.toFixed(4)} />
              <MiniStat label="Mean ECE" value={dash?.quality.meanCalibrationError == null ? '—' : dash.quality.meanCalibrationError.toFixed(4)} />
              <MiniStat label="Mean log loss" value={dash?.quality.meanLogLoss == null ? '—' : dash.quality.meanLogLoss.toFixed(4)} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-[10px] text-muted-foreground">
              <span>Last cycle: <strong className="font-medium text-foreground">{dash?.calibration.lastCycleStatus ?? 'Unknown'}</strong></span>
              <span>Last refresh: <strong className="font-medium text-foreground">{date(dash?.calibration.lastRefreshAt)}</strong></span>
              <span>Mean reliability: <strong className="font-medium text-foreground">{percent(dash?.quality.meanCalibrationReliability, 100)}</strong></span>
            </div>
            {dash?.calibration.lastError && <p className="mt-2 rounded border border-rose-500/25 bg-rose-500/5 px-2 py-1 text-[10px] text-rose-700 dark:text-rose-300">{dash.calibration.lastError}</p>}
          </Panel>
          <Panel title="Pricing & recommendation readiness">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <MiniStat label="Provider prices" value={count(dash?.quality, 'providerPricedSelections')} />
              <MiniStat label="Estimated prices" value={count(dash?.quality, 'estimatedPricedSelections')} />
              <MiniStat label="Odds-ready" value={count(dash?.quality, 'oddsReadySelections')} />
              <MiniStat label="Eligible recommendations" value={count(dash?.quality, 'recommendationEligibleSelections')} />
              <MiniStat label="Avg data quality" value={percent(dash?.quality.averageDataQuality, 100)} />
              <MiniStat label="Avg safety score" value={percent(dash?.quality.averageSafetyScore, 100)} />
              <MiniStat label="Avg calibration reliability" value={percent(dash?.quality.averageCalibrationReliability, 100)} />
              <MiniStat label="Avg expected value" value={dash?.quality.averageExpectedValuePercent == null ? '—' : `${dash.quality.averageExpectedValuePercent.toFixed(1)}%`} />
            </div>
          </Panel>
        </section>
        {dash?.runtime ? <section className="grid gap-2 xl:grid-cols-2">
          <DataTable title="Operational runtime" loading={dashboard.isLoading} rows={dash.runtime.operations as unknown as MonitorRecord[]} fields={[
            ['name', 'Operation'], ['status', 'Status'], ['activeRuns', 'Active'], ['runs', 'Runs'], ['failures', 'Failures'], ['lastStartedAt', 'Last started'], ['lastCompletedAt', 'Last completed'], ['lastDurationMs', 'Last duration'], ['lastError', 'Last error'],
          ]} />
          <Panel title="Engine alerts">
            {!dash.runtime.alerts.length ? <p className="text-[11px] text-muted-foreground">No active runtime alerts.</p> : <div className="space-y-1.5">{dash.runtime.alerts.map((alert) => <div key={`${alert.code}-${alert.operation ?? ''}`} className={`rounded border px-2 py-1.5 ${alert.severity === 'ERROR' ? 'border-rose-500/25 bg-rose-500/5' : 'border-amber-500/25 bg-amber-500/5'}`}><div className="flex flex-wrap items-center gap-2"><span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${alert.severity === 'ERROR' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>{alert.severity}</span><span className="text-[10px] font-semibold text-foreground">{alert.code}</span>{alert.operation && <span className="text-[10px] text-muted-foreground">{alert.operation}</span>}</div><p className="mt-1 text-[11px] text-foreground">{alert.message}</p></div>)}</div>}
          </Panel>
        </section> : null}
        <PayloadDetails title="Latest curated refresh" value={dash?.curatedPredictions.lastRefresh} />
        <PayloadDetails title="Latest automatic slip refresh" value={dash?.slips.lastRefresh} />
      </>
)}
{tab === 'models' && (
      <>
      <section className="grid gap-2 xl:grid-cols-2">
        <DataTable title="Market performance" loading={dashboard.isLoading} rows={(dash?.markets || []) as unknown as MonitorRecord[]} fields={[
          ['marketName', 'Market'], ['marketKey', 'Key'], ['documents', 'Docs'], ['calculated', 'Calculated'], ['unavailable', 'Unavailable'], ['selections', 'Selections'], ['averageProbability', 'Avg. probability'], ['averageConfidence', 'Avg. confidence'],
        ]} />
        <DataTable title="Market catalog" loading={catalog.isLoading} rows={catalogRows} fields={[
          ['fullName', 'Market'], ['key', 'Key'], ['family', 'Family'], ['model', 'Model'], ['selectionMode', 'Selection mode'], ['period', 'Period'], ['pricingEnabled', 'Pricing'], ['minimumSampleSize', 'Minimum samples'],
        ]} />
        <Panel title="Fixture market inspection" meta="Read-only inspection">
          <div className="flex gap-2">
            <input value={eventId} onChange={(event) => setEventId(event.target.value)} placeholder="ESPN event ID" aria-label="ESPN event ID" className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:border-primary" />
            <button type="button" disabled={!eventId.trim() || eventMarkets.isFetching} onClick={() => void eventMarkets.refetch()} className="h-8 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50">{eventMarkets.isFetching ? 'Loading…' : 'Inspect'}</button>
          </div>
          <div className="mt-2">
            {eventMarkets.isError ? <p className="text-xs text-rose-600">Could not load market documents for this event.</p> : <DataTable title="" rows={marketRows} loading={eventMarkets.isLoading && Boolean(eventId.trim())} fields={[
              ['marketName', 'Market'], ['marketKey', 'Key'], ['status', 'Status'], ['modelVersion', 'Model version'], ['fixtureSourceRevision', 'Source revision'], ['sourceSummaryCollectedAt', 'Summary collected'], ['dataQuality', 'Data quality'], ['updatedAt', 'Updated'],
            ]} />}
            {!eventId.trim() && <p className="pt-2 text-[11px] text-muted-foreground">Enter a fixture event ID to inspect its stored market documents.</p>}
          </div>
        </Panel>
      </section>
      <PayloadDetails title="Market performance response" value={dash?.markets} />
      <PayloadDetails title="Full market catalog response" value={catalog.data} />
      <PayloadDetails title="Fixture market documents" value={eventMarkets.data} />
      </>

)}
{tab === 'calibration' && (
      <>
      <section className="grid gap-2 xl:grid-cols-2">
        <DataTable title="Calibration records" loading={calibration.isLoading} rows={calibrationRows} fields={[
          ['marketKey', 'Market key'], ['sampleSize', 'Settled samples'], ['averagePredictedProbability', 'Mean predicted'], ['observedSuccessRate', 'Observed win rate'], ['brierScore', 'Brier score'], ['calibrationError', 'ECE'], ['logLoss', 'Log loss'], ['reliabilityScore', 'Reliability'], ['active', 'Active'], ['calibrationIntercept', 'Intercept'], ['calibrationSlope', 'Slope'], ['lastCalculatedAt', 'Calculated'],
        ]} />

      </section>
      <PayloadDetails title="Full calibration response" value={calibration.data} />
      </>

)}
{tab === 'controls' && (
      <Panel title="Operational controls">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={sync.isPending} onClick={() => void runAction('Queue synchronization', () => sync.mutateAsync({ body: { force: forceSync } }))} className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">{sync.isPending ? 'Syncing…' : 'Sync queue'}</button>
          <label className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={forceSync} onChange={(event) => setForceSync(event.target.checked)} /> Force sync</label>
          <button type="button" disabled={recover.isPending} onClick={() => void runAction('Stale queue recovery', () => recover.mutateAsync())} className="h-8 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50">{recover.isPending ? 'Recovering…' : 'Recover stale'}</button>
          <button type="button" disabled={runNext.isPending} onClick={() => void runAction('Run next queue item', () => runNext.mutateAsync())} className="h-8 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50">{runNext.isPending ? 'Running…' : 'Run next item'}</button>
          <button type="button" disabled={refreshSlips.isPending} onClick={() => void runAction('Automatic slip refresh', () => refreshSlips.mutateAsync())} className="h-8 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50">{refreshSlips.isPending ? 'Refreshing…' : 'Refresh slips'}</button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="text-[11px] font-medium text-muted-foreground">Generate predictions for fixture<input value={eventId} onChange={(event) => setEventId(event.target.value)} placeholder="ESPN event ID" className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs font-normal text-foreground outline-none focus:border-primary" /></label>
          <button type="button" disabled={!eventId.trim() || generate.isPending} onClick={() => void runAction('Fixture generation', () => generate.mutateAsync({ path: { eventId: eventId.trim() } }))} className="self-end h-8 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50">{generate.isPending ? 'Generating…' : 'Generate fixture'}</button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="text-[11px] font-medium text-muted-foreground">Rebuild calibration for a market (optional)<input value={marketKey} onChange={(event) => setMarketKey(event.target.value)} placeholder="Leave blank to rebuild all markets" className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs font-normal text-foreground outline-none focus:border-primary" /></label>
          <button type="button" disabled={rebuild.isPending} onClick={() => void runAction('Calibration rebuild', () => rebuild.mutateAsync({ body: marketKey.trim() ? { marketKey: marketKey.trim() } : {} }))} className="self-end h-8 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50">{rebuild.isPending ? 'Rebuilding…' : 'Rebuild calibration'}</button>
        </div>
      </Panel>


)}
{tab === 'queue' && (
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <select value={queueStatus} onChange={(event) => setQueueStatus(event.target.value as PredictionQueueStatus | '')} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All queue statuses</option>{['PENDING', 'PROCESSING', 'RETRY', 'WAITING_FOR_ODDS', 'COMPLETED', 'FAILED', 'SKIPPED'].map((status) => <option key={status}>{status}</option>)}</select>
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Queue rows<select value={queueLimit} onChange={(event) => setQueueLimit(event.target.value)} className="ml-1 h-7 rounded border border-border bg-background px-1.5 text-[10px]">{['10','25','40','50','100','200'].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Run rows<select value={runsLimit} onChange={(event) => setRunsLimit(event.target.value)} className="ml-1 h-7 rounded border border-border bg-background px-1.5 text-[10px]">{['10','25','50','100'].map((n) => <option key={n}>{n}</option>)}</select></label>
        </div>
        <div className="grid gap-2 xl:grid-cols-2">
        <DataTable title="Queue items" loading={queue.isLoading} rows={queueRows} fields={[
          ['eventId', 'Event'], ['status', 'Status'], ['priority', 'Priority'], ['attempts', 'Attempts'], ['fixtureDate', 'Fixture'], ['availableAt', 'Available at'], ['summaryCollectedAt', 'Sports summary'], ['oddsUpdatedAt', 'Odds updated'], ['reason', 'Queue reason'], ['errorMessage', 'Last error'],
        ]} />
        <DataTable title="Generation runs" loading={runs.isLoading} rows={runRows} fields={[
          ['runId', 'Run'], ['eventId', 'Event'], ['status', 'Status'], ['fixtureDate', 'Fixture'], ['startedAt', 'Started'], ['completedAt', 'Completed'], ['durationMs', 'Duration'], ['totalMarkets', 'Markets'], ['calculatedMarkets', 'Calculated'], ['failedMarkets', 'Failed'], ['errorMessage', 'Error'],
        ]} />
        </div>
        <PayloadDetails title="Queue response" value={queue.data} />
        <PayloadDetails title="Run response" value={runs.data} />
      </section>

)}
{tab === 'events' && (
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <select value={eventsLevel} onChange={(event) => setEventsLevel(event.target.value as PredictionEventLevel | '')} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All event levels</option>{['DEBUG', 'INFO', 'WARNING', 'ERROR'].map((level) => <option key={level}>{level}</option>)}</select>
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Rows<select value={eventsLimit} onChange={(event) => setEventsLimit(event.target.value)} className="ml-1 h-7 rounded border border-border bg-background px-1.5 text-[10px]">{['10','25','40','50','100','200'].map((n) => <option key={n}>{n}</option>)}</select></label>
        </div>
        <DataTable title="Engine events" loading={events.isLoading} rows={eventRows} fields={[
        ['level', 'Level'], ['type', 'Type'], ['message', 'Message'], ['eventId', 'Event'], ['runId', 'Run'], ['occurredAt', 'Occurred'],
      ]} />
        <PayloadDetails title="Full engine events response" value={events.data} />
      </section>

)}

      {tab === 'pick-center' ? (
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/70 bg-card p-2">
            <input value={pickLeagueId} onChange={(event) => { setPickLeagueId(event.target.value); setPickPage(1); }} placeholder="League ID" className="h-7 w-32 rounded border border-border bg-background px-2 text-[10px]" />
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">From<input type="date" value={pickFrom} onChange={(event) => { setPickFrom(event.target.value); setPickPage(1); }} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">To<input type="date" value={pickTo} onChange={(event) => { setPickTo(event.target.value); setPickPage(1); }} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground"><input type="checkbox" checked={pickIncludePast} onChange={(event) => { setPickIncludePast(event.target.checked); setPickPage(1); }} />Include past</label>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Page size<select value={pickPageSize} onChange={(event) => { setPickPageSize(Number(event.target.value)); setPickPage(1); }} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground">{[10,25,50,100].map((n) => <option key={n}>{n}</option>)}</select></label>
            <button type="button" onClick={() => void pickCenter.refetch()} disabled={pickCenter.isFetching} className="h-7 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50">Apply</button>
          </div>
          <DataTable title="Pick Center" loading={pickCenter.isLoading} rows={pickCenterRows} fields={[
            ['eventId', 'Event'], ['leagueName', 'League'], ['homeTeamName', 'Home'], ['awayTeamName', 'Away'], ['fixtureDate', 'Kickoff'], ['status', 'Status'], ['selectedMarketCount', 'Selected'], ['eligibleMarketCount', 'Eligible'], ['generalConfidence', 'Confidence'], ['exclusionReason', 'Exclusion'],
          ]} />
          <Pager data={pickCenter.data} page={pickPage} pageSize={pickPageSize} onPage={setPickPage} />
          <PayloadDetails title="Full Pick Center response" value={pickCenter.data} />
        </section>
      ) : null}

      {tab === 'curated' ? (
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/70 bg-card p-2">
            <select value={curatedStatus} onChange={(event) => { setCuratedStatus(event.target.value); setCuratedPage(1); }} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All prediction statuses</option>{['READY', 'PUBLISHED', 'SETTLED', 'CANCELLED'].map((status) => <option key={status}>{status}</option>)}</select>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Page size<select value={curatedPageSize} onChange={(event) => { setCuratedPageSize(Number(event.target.value)); setCuratedPage(1); }} className="h-7 rounded border border-border bg-background px-1.5 text-[10px]">{[10,25,50,100].map((n) => <option key={n}>{n}</option>)}</select></label>
            <button type="button" onClick={() => void curatedPredictions.refetch()} disabled={curatedPredictions.isFetching} className="h-7 rounded border border-border px-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-50">Apply</button>
            <button type="button" disabled={refreshCurated.isPending} onClick={() => void runAction('Refresh curated predictions', () => refreshCurated.mutateAsync())} className="h-7 rounded border border-border px-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-50">{refreshCurated.isPending ? 'Refreshing…' : 'Refresh predictions'}</button>
          </div>
          <div className="max-h-[65vh] overflow-auto rounded-lg border border-border/80 bg-card">
            <table className="w-full min-w-[720px] text-left text-[10px]">
              <thead className="sticky top-0 bg-muted/90 text-muted-foreground"><tr>{['Code', 'Title', 'Status', 'Selections', 'Combined odds', 'Confidence', 'Publication'].map((heading) => <th key={heading} className="whitespace-nowrap px-2 py-1.5 font-semibold">{heading}</th>)}<th className="px-2 py-1.5">Action</th></tr></thead>
              <tbody>{curatedRows.map((row, index) => {
                const id = value(row, ['_id', 'id', 'predictionId'], String(index));
                const published = String(row.status ?? '').toUpperCase() === 'PUBLISHED';
                return <tr key={id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-2 py-1.5">{value(row, ['predictionCode', 'code'])}</td>
                  <td className="max-w-[260px] truncate px-2 py-1.5" title={value(row, ['title'])}>{value(row, ['title'])}</td>
                  <td className="px-2 py-1.5">{value(row, ['status'])}</td>
                  <td className="px-2 py-1.5 tabular-nums">{value(row, ['selectionCount'])}</td>
                  <td className="px-2 py-1.5 tabular-nums">{value(row, ['combinedOdds'])}</td>
                  <td className="px-2 py-1.5 tabular-nums">{value(row, ['confidence'])}</td>
                  <td className="px-2 py-1.5">{date(row.publishedAt)}</td>
                  <td className="px-2 py-1.5"><button type="button" onClick={() => void changeCuratedPublication(row, !published)} disabled={publishCurated.isPending || unpublishCurated.isPending} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted disabled:opacity-50">{published ? 'Unpublish' : 'Publish'}</button></td>
                </tr>;
              })}{!curatedRows.length ? <tr><td colSpan={8} className="px-2 py-3 text-center text-muted-foreground">{curatedPredictions.isLoading ? 'Loading…' : 'No curated predictions.'}</td></tr> : null}</tbody>
            </table>
          </div>
          <PayloadDetails title="Full curated predictions response" value={curatedPredictions.data} />
        </section>
      ) : null}

      {tab === 'slips' ? (
        <section className="space-y-2">
          <Panel title="Build slip">
            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-[10px] text-muted-foreground">Fixture event IDs<input value={buildEventIds} onChange={(event) => setBuildEventIds(event.target.value)} placeholder="Fixture event IDs" className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Name<input value={buildSlipName} onChange={(event) => setBuildSlipName(event.target.value)} placeholder="Slip name" className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Product type<select value={buildProductType} onChange={(event) => setBuildProductType(event.target.value as typeof buildProductType)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground">{['ODDS_10', 'ODDS_25', 'ODDS_50', 'SURE_ODDS'].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="text-[10px] text-muted-foreground">Selection count<input type="number" min={1} max={100} value={buildSelectionCount} onChange={(event) => setBuildSelectionCount(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Minimum probability<input type="number" min={0} max={100} value={buildMinimumProbability} onChange={(event) => setBuildMinimumProbability(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Minimum confidence<input type="number" min={0} max={100} value={buildMinimumConfidence} onChange={(event) => setBuildMinimumConfidence(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Fixture from<input type="date" value={buildFixtureFrom} onChange={(event) => setBuildFixtureFrom(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Fixture to<input type="date" value={buildFixtureTo} onChange={(event) => setBuildFixtureTo(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Created by<input value={buildCreatedBy} onChange={(event) => setBuildCreatedBy(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Sure Odds product<select value={buildSureOddsProduct} onChange={(event) => setBuildSureOddsProduct(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground"><option value="">Default</option><option value="SURE_2">Sure 2 — Regular access</option><option value="SURE_5">Sure 5 — VIP access</option><option value="SURE_7">Sure 7 — VIP access</option></select></label>
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground"><input type="checkbox" checked={buildPublish} onChange={(event) => setBuildPublish(event.target.checked)} /> Publish after build</label>
              <button type="button" disabled={buildSlip.isPending} onClick={() => void buildAdminSlip()} className="h-7 self-end rounded bg-primary px-2 text-[10px] font-semibold text-primary-foreground disabled:opacity-50">{buildSlip.isPending ? 'Building…' : 'Build slip'}</button>
            </div>
          </Panel>
          <Panel title="Stored slips">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground">From<input type="date" value={slipsFrom} onChange={(event) => { setSlipsFrom(event.target.value); setSlipsPage(1); }} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground">To<input type="date" value={slipsTo} onChange={(event) => { setSlipsTo(event.target.value); setSlipsPage(1); }} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
              <select value={slipsProductType} onChange={(event) => { setSlipsProductType(event.target.value as SlipProductType | ''); setSlipsPage(1); }} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All products</option>{['ODDS_10', 'ODDS_25', 'ODDS_50', 'SURE_ODDS', 'STANDARD', 'MEDIUM_ODDS', 'HIGH_ODDS', 'EXTENDED_ODDS', 'UNLIMITED_ODDS'].map((type) => <option key={type}>{type}</option>)}</select>
              <select value={slipsAutomatic} onChange={(event) => { setSlipsAutomatic(event.target.value); setSlipsPage(1); }} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All origins</option><option value="true">Automatic</option><option value="false">Manual</option></select>
              <select value={slipsStatus} onChange={(event) => { setSlipsStatus(event.target.value); setSlipsPage(1); }} className="h-7 rounded border border-border bg-background px-2 text-[10px]"><option value="">All statuses</option>{['DRAFT', 'READY', 'PUBLISHED', 'CANCELLED', 'SETTLED'].map((status) => <option key={status}>{status}</option>)}</select>
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Page size<select value={slipsPageSize} onChange={(event) => { setSlipsPageSize(Number(event.target.value)); setSlipsPage(1); }} className="h-7 rounded border border-border bg-background px-1.5 text-[10px]">{[10,25,50,100].map((n) => <option key={n}>{n}</option>)}</select></label>
              <button type="button" onClick={() => void adminSlips.refetch()} disabled={adminSlips.isFetching} className="h-7 rounded border border-border px-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-50">Apply</button>
            </div>
            <div className="max-h-[36vh] overflow-auto">
              <table className="w-full min-w-[740px] text-left text-[10px]">
                <thead className="sticky top-0 bg-muted/90 text-muted-foreground"><tr>{['Slip', 'Name', 'Status', 'Product', 'Legs', 'Odds', 'SportyBet'].map((heading) => <th key={heading} className="whitespace-nowrap px-2 py-1.5 font-semibold">{heading}</th>)}<th className="px-2 py-1.5">Actions</th></tr></thead>
                <tbody>{adminSlipRows.map((row, index) => {
                  const id = value(row, ['_id', 'id', 'slipId'], String(index));
                  const status = String(row.status ?? '').toUpperCase();
                  return <tr key={id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-2 py-1.5">{value(row, ['slipCode', '_id'])}</td><td className="max-w-[210px] truncate px-2 py-1.5" title={value(row, ['name'])}>{value(row, ['name'])}</td><td className="px-2 py-1.5">{status}</td><td className="px-2 py-1.5">{value(row, ['productType'])}</td><td className="px-2 py-1.5 tabular-nums">{value(row, ['legCount'])}</td><td className="px-2 py-1.5 tabular-nums">{value(row, ['combinedOdds', 'odds'])}</td><td className="px-2 py-1.5">{value(row, ['sportyBetSlipCode'])}</td>
                    <td className="whitespace-nowrap px-2 py-1.5"><div className="flex gap-1">
                      <button type="button" onClick={() => { setSelectedSlipId(id); }} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted">View</button>
                      {status !== 'PUBLISHED' && <button type="button" disabled={publishSlip.isPending} onClick={() => void runAction('Publish slip', () => publishSlip.mutateAsync({ path: { slipId: id } }))} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted disabled:opacity-50">Publish</button>}
                    </div></td>
                  </tr>;
                })}{!adminSlipRows.length ? <tr><td colSpan={8} className="px-2 py-3 text-center text-muted-foreground">{adminSlips.isLoading ? 'Loading…' : 'No slips.'}</td></tr> : null}</tbody>
              </table>
            </div>
            <Pager data={adminSlips.data} page={slipsPage} pageSize={slipsPageSize} onPage={setSlipsPage} />
            <PayloadDetails title="Full slips response" value={adminSlips.data} />
          </Panel>
          <Panel title="Edit slip">
            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-[10px] text-muted-foreground">Slip ID<input value={slipId} onChange={(event) => setSlipId(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">SportyBet slip code<input value={sportyBetCode} onChange={(event) => setSportyBetCode(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">SportyBet link<input value={sportyBetLink} onChange={(event) => setSportyBetLink(event.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
              <button type="button" disabled={updateSportyBet.isPending} onClick={() => void saveSportyBet()} className="h-7 self-end rounded border border-border px-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-50">{updateSportyBet.isPending ? 'Saving…' : 'Save SportyBet'}</button>
            </div>
            <label className="mt-2 block text-[10px] text-muted-foreground">Replacement legs JSON<textarea value={slipLegsJson} onChange={(event) => setSlipLegsJson(event.target.value)} rows={3} className="mt-0.5 w-full rounded border border-border bg-background p-2 font-mono text-[10px] text-foreground" /></label>
            <button type="button" disabled={updateSlipLegs.isPending} onClick={() => void saveSlipLegs()} className="mt-1 h-7 rounded border border-border px-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-50">{updateSlipLegs.isPending ? 'Saving…' : 'Update legs'}</button>
            {selectedSlipId ? <details className="mt-2 rounded border border-border/70"><summary className="cursor-pointer px-2 py-1 text-[10px] font-medium">Slip {selectedSlipId}</summary><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-2 text-[10px]">{JSON.stringify(selectedSlip.data ?? (selectedSlip.isLoading ? 'Loading…' : {}), null, 2)}</pre></details> : null}
          </Panel>
        </section>
      ) : null}
    </main>
  );
}

function PayloadDetails({ title, value: payload }: { title: string; value: unknown }) {
  if (payload === null || payload === undefined) return null;
  return <details className="rounded-md border border-border/70 bg-card"><summary className="cursor-pointer px-2 py-1.5 text-[10px] font-medium">{title}</summary><pre className="max-h-[45vh] overflow-auto whitespace-pre-wrap break-words border-t border-border/60 p-2 font-mono text-[10px]">{JSON.stringify(payload, null, 2)}</pre></details>;
}

function Metric({ label, value: metricValue, hint, tone = 'neutral' }: { label: string; value: string; hint?: string; tone?: string }) {
  return <div className="min-w-0 rounded-lg border border-border/80 bg-card px-2 py-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.025)]">
    <div className="flex items-center justify-between gap-2"><p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'ready' ? 'bg-emerald-500' : tone === 'degraded' ? 'bg-rose-500' : tone === 'unknown' ? 'bg-amber-500' : 'bg-muted-foreground/40'}`} /></div>
    <p className="mt-1 truncate text-base font-semibold leading-5 tracking-tight text-foreground">{metricValue}</p>{hint && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{hint}</p>}
  </div>;
}
function Panel({ title, children }: { title: string; meta?: string; children: ReactNode }) {
  return <section className="min-w-0 rounded-lg border border-border/80 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.025)]"><div className="flex items-center justify-between gap-2 border-b border-border/70 px-2 py-1.5"><h2 className="text-xs font-semibold tracking-tight text-foreground">{title}</h2></div><div className="p-2">{children}</div></section>;
}
function Datum({ label, value: datumValue }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-0.5 truncate text-[11px] font-medium text-foreground" title={datumValue}>{datumValue}</p></div>;
}
function MiniStat({ label, value: statValue, tone = 'neutral' }: { label: string; value: string; tone?: string }) {
  return <div className={`min-w-0 rounded-md border px-2 py-1.5 ${tone === 'degraded' ? 'border-rose-500/20 bg-rose-500/5' : 'border-border/70 bg-muted/20'}`}><p className="truncate text-[10px] text-muted-foreground">{label}</p><p className={`mt-0.5 truncate text-sm font-semibold ${tone === 'degraded' ? 'text-rose-700 dark:text-rose-300' : 'text-foreground'}`}>{statValue}</p></div>;
}
function Pager({ data, page, pageSize, onPage }: { data: unknown; page: number; pageSize: number; onPage: (page: number) => void }) {
  const root = record(data);
  const pagination = record(root.pagination);
  const total = Number(pagination.total ?? root.total ?? 0);
  const pages = Math.max(1, Number(pagination.pages ?? (pageSize > 0 ? Math.ceil(total / pageSize) : 1)) || 1);
  return <div className="flex items-center justify-between gap-2 px-1 py-1 text-[10px] text-muted-foreground">
    <span>{total.toLocaleString()} records · Page {page} of {pages}</span>
    <div className="flex gap-1"><button type="button" disabled={page <= 1} onClick={() => onPage(Math.max(1, page - 1))} className="h-6 rounded border border-border px-2 hover:bg-muted disabled:opacity-40">Previous</button><button type="button" disabled={page >= pages} onClick={() => onPage(Math.min(pages, page + 1))} className="h-6 rounded border border-border px-2 hover:bg-muted disabled:opacity-40">Next</button></div>
  </div>;
}

function DataTable({ title, rows, fields, loading }: { title: string; rows: MonitorRecord[]; fields: Field[]; loading: boolean }) {
  return <section className="min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.025)]">
    {title && <div className="border-b border-border/70 px-2 py-1.5"><h2 className="text-xs font-semibold text-foreground">{title}</h2></div>}
    {loading ? <p className="px-2 py-3 text-center text-xs text-muted-foreground">Loading data…</p> : rows.length === 0 ? <p className="px-2 py-3 text-center text-xs text-muted-foreground">No records returned.</p> : <div className="max-h-[300px] overflow-auto"><table className="w-full min-w-[500px] text-left text-[10px]"><thead className="sticky top-0 z-[1] bg-muted/90 text-muted-foreground backdrop-blur"><tr>{fields.map(([key, label], index) => <th key={`${String(key)}-${index}`} className="whitespace-nowrap px-2 py-1.5 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={value(row, ['_id', 'id', 'eventId', 'marketKey'], String(rowIndex))} className="border-t border-border/60 align-top hover:bg-muted/20">{fields.map(([field], index) => {
      const key = String(field); const raw = row[key]; let display = '—';
      if (raw !== undefined && raw !== null && raw !== '') {
        if (key.toLowerCase().includes('at') || key.toLowerCase().includes('date')) display = date(raw);
        else if (key.toLowerCase().includes('probability') && typeof raw === 'number') display = `${(raw <= 1 ? raw * 100 : raw).toFixed(1)}%`;
        else if (key.toLowerCase().includes('confidence') && typeof raw === 'number') display = `${raw.toFixed(1)}%`;
        else if (typeof raw === 'object') display = JSON.stringify(raw);
        else display = String(raw);
      }
      const isStatus = key.toLowerCase() === 'status' || key.toLowerCase() === 'level' || key.toLowerCase() === 'enabled';
      return <td key={`${key}-${index}`} className="max-w-[260px] px-2 py-1.5 text-foreground"><span title={display} className={isStatus ? `inline-flex max-w-full truncate rounded border px-1.5 py-0.5 text-[9px] font-semibold ${statusTone(display)}` : 'block max-w-[260px] truncate'}>{display}</span></td>;
    })}</tr>)}</tbody></table></div>}
  </section>;
}
