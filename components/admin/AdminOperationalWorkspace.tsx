'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminError, AdminMetrics, AdminNotice, AdminPageFrame, AdminPanel, AdminTable, AdminTabs, adminButton, adminDangerButton, adminInput, adminPrimaryButton, adminTextarea, compactDate, compactStatus, displayValue, rowsFrom, type AdminColumn } from '@/components/admin/AdminWorkspace';
import { systemMonitorService } from '@/services/system-monitor.service';
import { sportsService } from '@/services/sports.service';
import { oddsService } from '@/services/odds.service';
import { predictionEngineService } from '@/services/prediction-engine.service';
import { settlementService } from '@/services/settlement.service';
import { betLabService } from '@/services/bet-lab.service';

type ModuleKey = 'system' | 'sports' | 'odds' | 'predictions' | 'settlement' | 'bet-lab';
type FilterState = { limit: string; status: string; level: string; eventId: string; competitionId: string; teamId: string; seasonId: string; collection: string; from: string; to: string };
type Operation = { action: string; id?: string; eventId?: string; leagueId?: string; selectionKey?: string; marketPredictionId?: string; ticketId?: string; legId?: string; outcome?: string; reason?: string; body?: Record<string, unknown> };

const now = new Date();
const dateInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const defaultFilters = (): FilterState => ({ limit: '50', status: '', level: '', eventId: '', competitionId: '', teamId: '', seasonId: '', collection: 'sports_espn_fixtures', from: dateInput(new Date(now.getTime() - 2 * 86_400_000)), to: dateInput(new Date(now.getTime() + 5 * 86_400_000)) });
const DEFAULT_SLIP_LEGS = JSON.stringify([{ eventId: '', marketPredictionId: '', marketKey: '', selectionKey: '' }], null, 2);
const tabSets: Record<ModuleKey, Array<{ value: string; label: string }>> = {
  system: [
    { value: 'overview', label: 'Overview' }, { value: 'modules', label: 'Modules' }, { value: 'crons', label: 'Crons' },
    { value: 'errors', label: 'Errors' }, { value: 'activity', label: 'Activity' }, { value: 'storage', label: 'Storage' },
    { value: 'storage-history', label: 'Storage history' }, { value: 'database', label: 'Database' }, { value: 'db-operations', label: 'DB operations' },
    { value: 'collection', label: 'Collection detail' }, { value: 'collection-operations', label: 'Collection ops' },
  ],
  sports: [
    { value: 'monitor', label: 'Overview' },
    { value: 'competitions', label: 'Competitions' },
    { value: 'teams', label: 'Teams' },
    { value: 'fixtures', label: 'Fixtures' },
    { value: 'news', label: 'News' },
  ],
  odds: [{ value: 'monitor', label: 'Monitor' }, { value: 'center', label: 'Priced fixtures' }],
  predictions: [
    { value: 'overview', label: 'Overview' }, { value: 'runs', label: 'Runs' }, { value: 'queue', label: 'Queue' },
    { value: 'events', label: 'Events' }, { value: 'markets', label: 'Market records' }, { value: 'pick-center', label: 'Pick Center' },
    { value: 'curated', label: 'Curated picks' }, { value: 'slips', label: 'Slips' }, { value: 'build-slip', label: 'Build slip' }, { value: 'slip-detail', label: 'Slip detail' }, { value: 'edit-slip', label: 'Edit slip' }, { value: 'calibration', label: 'Calibration' }, { value: 'catalog', label: 'Market catalog' },
  ],
  settlement: [{ value: 'overview', label: 'Overview' }, { value: 'jobs', label: 'Jobs' }, { value: 'runs', label: 'Runs' }, { value: 'events', label: 'Events' }, { value: 'overdue', label: 'Overdue legs' }],
  'bet-lab': [{ value: 'overview', label: 'Overview' }, { value: 'events', label: 'Event history' }],
};
const moduleMeta: Record<ModuleKey, { title: string; description: string }> = {
  system: { title: 'System monitor', description: 'Compact diagnostics for module health, scheduled work, failures, storage and database activity.' },
  sports: { title: 'Sports data operations', description: 'Inspect normalized competitions, teams, fixtures, news and the Sports collection monitor.' },
  odds: { title: 'Odds center', description: 'Inspect stored prices by fixture and market. This workspace is read-only and does not trigger collection.' },
  predictions: { title: 'Predictions engine', description: 'Inspect and operate the prediction queue, market records, curated predictions, slips and calibration.' },
  settlement: { title: 'Settlement operations', description: 'Monitor settlement jobs and runs, inspect events, requeue fixtures and use audited manual settlement overrides.' },
  'bet-lab': { title: 'Bet Lab operations', description: 'Monitor virtual tickets, wallet-related activity and recent Bet Lab events.' },
};

const numericEntries = (value: unknown, prefix = '', depth = 0): Array<{ label: string; value: number }> => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 2) return [];
  const output: Array<{ label: string; value: number }> = [];
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (typeof nested === 'number' && Number.isFinite(nested)) output.push({ label: prefix ? `${prefix} · ${key}` : key, value: nested });
    else if (nested && typeof nested === 'object' && !Array.isArray(nested)) output.push(...numericEntries(nested, prefix ? `${prefix} · ${key}` : key, depth + 1));
  }
  return output;
};

function resultRows(data: unknown): Record<string, unknown>[] {
  return rowsFrom(data, ['items', 'data', 'results', 'rows', 'records', 'events', 'jobs', 'runs', 'users', 'referrals', 'predictions', 'slips', 'tickets', 'collections', 'modules', 'crons', 'recent', 'recentEvents', 'recentJobs', 'recentRuns', 'recentWarningsAndErrors', 'errors', 'activities', 'snapshots', 'fixtures', 'leagues', 'teams', 'standings', 'conversations', 'incidents', 'broadcasts', 'operations', 'entries', 'syncStates', 'markets', 'queue', 'items']);
}

async function fetchWorkspace(module: ModuleKey, tab: string, filters: FilterState): Promise<unknown> {
  const limit = Math.min(500, Math.max(1, Number(filters.limit) || 50));
  const query = { limit, status: filters.status || undefined, level: filters.level || undefined };
  switch (module) {
    case 'system':
      switch (tab) {
        case 'overview': return systemMonitorService.getSystemDashboard();
        case 'modules': return systemMonitorService.getSystemModules({ status: filters.status || undefined, level: (filters.level || 'deep') as 'deep' | 'health' });
        case 'crons': return systemMonitorService.getCrons({ module: undefined, status: filters.status || undefined });
        case 'errors': return systemMonitorService.getErrors({ module: undefined, limit });
        case 'activity': return systemMonitorService.getActivity({ module: undefined, status: filters.status || undefined, limit });
        case 'storage': return systemMonitorService.getStorage();
        case 'storage-history': return systemMonitorService.getStorageHistory({ limit });
        case 'database': return systemMonitorService.getDatabaseHealth();
        case 'db-operations': return systemMonitorService.getDatabaseOperations({ limit, status: filters.status || undefined });
        case 'collection': return filters.collection ? systemMonitorService.getCollection(filters.collection) : { message: 'Enter a collection name to inspect its detail.' };
        case 'collection-operations': return filters.collection ? systemMonitorService.getCollectionOperations(filters.collection, { limit }) : { message: 'Enter a collection name to inspect its operations.' };
        default: return null;
      }
    case 'sports': {
      if (tab === 'monitor') return sportsService.getAdminSystemMonitor();
      if (tab === 'competitions') {
        return sportsService.getV2Competitions({
          query: { activeOnly: true, search: filters.status.trim() || undefined, limit },
        });
      }
      if (tab === 'teams') {
        return sportsService.getV2Teams({
          query: {
            leagueId: filters.competitionId.trim() || undefined,
            search: filters.status.trim() || undefined,
            limit,
          },
        });
      }
      if (tab === 'fixtures') {
        const states = ['SCHEDULED', 'LIVE', 'HALFTIME', 'EXTRA_TIME', 'PENALTIES', 'COMPLETED', 'POSTPONED', 'CANCELLED', 'ABANDONED', 'UNKNOWN'] as const;
        const state = states.find((value) => value === filters.status);
        return sportsService.getV2Fixtures({
          query: {
            competitionId: filters.competitionId.trim() || undefined,
            seasonId: filters.seasonId.trim() || undefined,
            teamId: filters.teamId.trim() || undefined,
            state,
            from: filters.from || undefined,
            to: filters.to || undefined,
            limit,
          },
        });
      }
      if (tab === 'news') {
        const scopes = ['SOCCER', 'LEAGUE', 'SUMMARY'] as const;
        const scope = scopes.find((value) => value === filters.level);
        return sportsService.getV2News({
          query: {
            competitionId: filters.competitionId.trim() || undefined,
            teamId: filters.teamId.trim() || undefined,
            scope,
            limit,
          },
        });
      }
      return null;
    }
    case 'odds':
      if (tab === 'monitor') return oddsService.getOddsMonitor();
      if (tab === 'center') {
        const from = new Date(`${filters.from}T00:00:00`).toISOString();
        const to = new Date(`${filters.to}T23:59:59`).toISOString();
        if (new Date(to).getTime() <= new Date(from).getTime()) throw new Error('The end date must be after the start date.');
        if (new Date(to).getTime() - new Date(from).getTime() > 8 * 86_400_000) throw new Error('The Odds Center accepts a date range of at most 8 days.');
        return oddsService.getOddsCenter({ query: { from, to } });
      }
      return null;
    case 'predictions':
      switch (tab) {
        case 'overview': return predictionEngineService.getDashboard();
        case 'runs': return predictionEngineService.getRuns({ query: { limit } } as any);
        case 'queue': return predictionEngineService.getQueue({ query: { status: filters.status || undefined, limit } } as any);
        case 'events': return predictionEngineService.getEvents({ query: { level: filters.level || undefined, limit } } as any);
        case 'markets': return filters.eventId ? predictionEngineService.getEventMarkets({ path: { eventId: filters.eventId } }) : { message: 'Enter an event ID to load its market documents.' };
        case 'pick-center': return predictionEngineService.listAdminPickCenter({ query: { page: 1, pageSize: limit, from: filters.from, to: filters.to, includePast: true } } as any);
        case 'curated': return predictionEngineService.listAdminCuratedPredictions({ query: { page: 1, pageSize: limit, status: filters.status || undefined } } as any);
        case 'slips': return predictionEngineService.listAdminSlips({ query: { page: 1, pageSize: limit, status: filters.status || undefined } } as any);
        case 'slip-detail': return filters.eventId.trim() ? predictionEngineService.getEngineSlip({ path: { slipId: filters.eventId.trim() } } as any) : { message: 'Enter a slip ID in the identifier field to inspect its complete record.' };
        case 'build-slip': return { message: 'Use the build form below. Building a slip publishes it through the current backend implementation.' };
        case 'edit-slip': return { message: 'Use the slip editing form below. Enter a slip ID before submitting changes.' };
        case 'calibration': return predictionEngineService.listCalibration();
        case 'catalog': return predictionEngineService.getCatalog();
        default: return null;
      }
    case 'settlement':
      switch (tab) {
        case 'overview': return settlementService.getMonitor();
        case 'jobs': return settlementService.getJobs({ query: { limit, status: filters.status || undefined } } as any);
        case 'runs': return settlementService.getRuns({ query: { limit, status: filters.status || undefined } } as any);
        case 'events': return settlementService.getEvents({ query: { limit, level: filters.level || undefined } } as any);
        case 'overdue': return settlementService.getOverdueBetLabLegs({ query: { page: 1, limit } } as any);
        default: return null;
      }
    case 'bet-lab':
      if (tab === 'overview') return betLabService.getMonitor();
      if (tab === 'events') return betLabService.getRecentEvents({ query: { limit } } as any);
      return null;
  }
}

async function runOperation(operation: Operation): Promise<unknown> {
  switch (operation.action) {
    case 'sync-queue': return predictionEngineService.syncQueue({ body: { force: false } } as any);
    case 'force-sync-queue': return predictionEngineService.syncQueue({ body: { force: true } } as any);
    case 'recover-stale': return predictionEngineService.recoverStaleQueue();
    case 'run-next': return predictionEngineService.runNextQueueItem();
    case 'refresh-curated': return predictionEngineService.refreshCuratedPredictions();
    case 'refresh-slips': return predictionEngineService.refreshSlips();
    case 'rebuild-calibration': return predictionEngineService.rebuildCalibration({ body: { marketKey: operation.body?.marketKey as string | undefined } } as any);
    case 'generate-fixture': if (operation.eventId) return predictionEngineService.generateFixture({ path: { eventId: operation.eventId } } as any); break;
    case 'publish-curated': if (operation.id) return predictionEngineService.publishCuratedPrediction({ path: { predictionId: operation.id } } as any); break;
    case 'unpublish-curated': if (operation.id) return predictionEngineService.unpublishCuratedPrediction({ path: { predictionId: operation.id } } as any); break;
    case 'publish-slip': if (operation.id) return predictionEngineService.publishSlip({ path: { slipId: operation.id } } as any); break;
    case 'build-slip': if (operation.body) return predictionEngineService.buildSlip({ body: operation.body } as any); break;
    case 'update-slip-legs': if (operation.id && operation.body) return predictionEngineService.updateSlipLegs({ path: { slipId: operation.id }, body: operation.body } as any); break;
    case 'update-sportybet': if (operation.id && operation.body) return predictionEngineService.updateSportyBet({ path: { slipId: operation.id }, body: operation.body as any } as any); break;
    case 'requeue-fixture': if (operation.eventId) return settlementService.requeueFixture({ path: { eventId: operation.eventId }, query: { leagueId: operation.leagueId || undefined } } as any); break;
    case 'manual-prediction-settlement':
      if (operation.marketPredictionId && operation.selectionKey && operation.outcome && operation.reason) return settlementService.manuallySettlePredictionSelection({ path: { marketPredictionId: operation.marketPredictionId, selectionKey: operation.selectionKey }, body: { outcome: operation.outcome as any, reason: operation.reason } });
      break;
    case 'manual-bet-lab-settlement':
      if (operation.ticketId && operation.legId && operation.outcome && operation.reason) return settlementService.manuallySettleBetLabLeg({ path: { ticketId: operation.ticketId, legId: operation.legId }, body: { outcome: operation.outcome as any, reason: operation.reason } });
      break;
  }
  throw new Error('The selected operation is missing a required identifier or field.');
}

function compactLabel(value: string): string { return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export default function AdminOperationalWorkspace({ module }: { module: ModuleKey }) {
  const [tab, setTab] = useState(tabSets[module][0].value);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [manual, setManual] = useState({ eventId: '', leagueId: '', collection: 'sports_espn_fixtures', marketPredictionId: '', selectionKey: '', ticketId: '', legId: '', outcome: 'WON', reason: '', slipId: '', slipLegsJson: DEFAULT_SLIP_LEGS, sportyBetSlipCode: '', sportyBetSlipLink: '', marketKey: '' });
  const [buildSlipForm, setBuildSlipForm] = useState({ name: '', eventIds: '', selectionCount: '5', minimumProbabilityPercent: '40', minimumConfidence: '70', fixtureFrom: '', fixtureTo: '', productType: 'ODDS_10', sureOddsProduct: 'SURE_2' });
  const [formError, setFormError] = useState('');
  const [responseDetailsOpen, setResponseDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-ops', module, tab, filters.limit, filters.status, filters.level, filters.eventId, filters.competitionId, filters.teamId, filters.seasonId, filters.collection, filters.from, filters.to],
    queryFn: () => fetchWorkspace(module, tab, { ...filters, collection: manual.collection || filters.collection }),
    enabled: !(module === 'predictions' && ['build-slip', 'edit-slip'].includes(tab)),
    refetchInterval: ['overview', 'monitor'].includes(tab) ? 30_000 : false,
    retry: 1,
  });
  const mutation = useMutation({
    mutationFn: runOperation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-ops', module] });
      setManual((current) => ({ ...current, reason: '' }));
    },
  });
  const rows = useMemo(() => resultRows(query.data), [query.data]);
  const metrics = useMemo(() => numericEntries(query.data).slice(0, 8).map((item) => ({ ...item, label: item.label.replaceAll('_', ' ') })), [query.data]);
  // Large operational responses can contain hundreds of records. Avoid pretty-
  // printing the complete payload on every render while its disclosure is closed.
  const formattedResponse = useMemo(
    () => responseDetailsOpen && query.data !== undefined
      ? JSON.stringify(query.data, null, 2)
      : '',
    [responseDetailsOpen, query.data],
  );
  const cols = useMemo(() => {
    if (!rows.length) return [];
    const preferred = ['_id', 'eventId', 'jobKey', 'name', 'title', 'status', 'level', 'severity', 'leagueName', 'homeTeam', 'awayTeam', 'message', 'action', 'attempts', 'nextRunAt', 'occurredAt', 'createdAt', 'updatedAt'];
    const keys = [...preferred.filter((key) => key in rows[0]), ...Object.keys(rows[0]).filter((key) => !preferred.includes(key) && key !== '__v')].slice(0, module === 'predictions' && ['curated', 'slips'].includes(tab) ? 6 : 8);
    const columns: Array<AdminColumn<Record<string, unknown>>> = keys.map((key) => ({ key, label: compactLabel(key), render: (row: Record<string, unknown>) => {
      const value = row[key];
      if (/status|level|severity|outcome/i.test(key)) return compactStatus(value);
      if (/date|At$|time|RunAt/i.test(key)) return compactDate(value);
      return displayValue(value);
    } }));
    const actionRows = module === 'predictions' && ['curated', 'slips'].includes(tab);
    if (actionRows) columns.push({ key: 'adminAction', label: 'Action', render: (row: Record<string, unknown>) => {
      const id = String(row._id ?? row.id ?? row.predictionId ?? row.slipId ?? '');
      if (!id) return '—';
      if (module === 'predictions' && tab === 'curated') {
        const published = String(row.status ?? '').toUpperCase() === 'PUBLISHED' || row.isPublished === true;
        return <button type="button" className={adminButton} disabled={mutation.isPending} onClick={() => mutation.mutate({ action: published ? 'unpublish-curated' : 'publish-curated', id })}>{published ? 'Unpublish' : 'Publish'}</button>;
      }
      if (module === 'predictions' && tab === 'slips') {
        const published = /PUBLISHED|READY/.test(String(row.status ?? '').toUpperCase()) || row.isPublished === true;
        return <div className="flex flex-wrap gap-1"><button type="button" className={adminButton} disabled={mutation.isPending || published} onClick={() => { if (window.confirm('Publish this slip? It may become visible to users with eligible access.')) mutation.mutate({ action: 'publish-slip', id }); }}>{published ? 'Published' : 'Publish'}</button><button type="button" className={adminButton} onClick={() => { setFilters((current) => ({ ...current, eventId: id })); setManual((current) => ({ ...current, slipId: id })); setTab('slip-detail'); }}>View</button><button type="button" className={adminButton} onClick={() => { setManual((current) => ({ ...current, slipId: id })); setTab('edit-slip'); }}>Edit</button></div>;
      }
      return '—';
    } });
    return columns;
  }, [rows, module, tab, mutation.isPending]);

  const meta = moduleMeta[module];
  const showDateFilter = (module === 'odds' && tab === 'center') || (module === 'predictions' && tab === 'pick-center') || (module === 'sports' && tab === 'fixtures');
  const submitManual = (action: string) => mutation.mutate({ action, eventId: manual.eventId.trim(), leagueId: manual.leagueId.trim(), id: manual.slipId.trim(), marketPredictionId: manual.marketPredictionId.trim(), selectionKey: manual.selectionKey.trim(), ticketId: manual.ticketId.trim(), legId: manual.legId.trim(), outcome: manual.outcome, reason: manual.reason.trim() });
  const submitSlipBuild = () => {
    setFormError('');
    const ids = buildSlipForm.eventIds.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean);
    const minProbPercent = Number(buildSlipForm.minimumProbabilityPercent);
    const minimumConfidence = Number(buildSlipForm.minimumConfidence);
    const selectionCount = buildSlipForm.selectionCount.trim() ? Number(buildSlipForm.selectionCount) : undefined;
    if (!Number.isFinite(minProbPercent) || minProbPercent < 0 || minProbPercent > 100) { setFormError('Minimum probability must be between 0 and 100%.'); return; }
    if (!Number.isFinite(minimumConfidence) || minimumConfidence < 0 || minimumConfidence > 100) { setFormError('Minimum confidence must be between 0 and 100.'); return; }
    if (selectionCount !== undefined && (!Number.isInteger(selectionCount) || selectionCount < 1 || selectionCount > 30)) { setFormError('Selection count must be a whole number between 1 and 30.'); return; }
    if (buildSlipForm.fixtureFrom && buildSlipForm.fixtureTo && buildSlipForm.fixtureTo < buildSlipForm.fixtureFrom) { setFormError('Fixture end date must be on or after the start date.'); return; }
    const body: Record<string, unknown> = { name: buildSlipForm.name.trim() || undefined, eventIds: ids.length ? ids : undefined, selectionCount, minimumProbability: minProbPercent / 100, minimumConfidence, fixtureFrom: buildSlipForm.fixtureFrom ? new Date(`${buildSlipForm.fixtureFrom}T00:00:00`).toISOString() : undefined, fixtureTo: buildSlipForm.fixtureTo ? new Date(`${buildSlipForm.fixtureTo}T23:59:59`).toISOString() : undefined, productType: buildSlipForm.productType };
    if (buildSlipForm.productType === 'SURE_ODDS') { body.sureOddsProduct = buildSlipForm.sureOddsProduct; body.sureOddsTier = buildSlipForm.sureOddsProduct === 'SURE_2' ? 'VIP' : 'PREMIUM'; }
    if (!window.confirm('Build and publish this slip? The current backend always publishes a manually built slip. Continue?')) return;
    mutation.mutate({ action: 'build-slip', body });
  };
  const submitSlipEdit = (kind: 'legs' | 'sportybet') => {
    setFormError('');
    const id = manual.slipId.trim();
    if (!id) { setFormError('Slip ID is required.'); return; }
    if (kind === 'legs') {
      try {
        const parsed: unknown = JSON.parse(manual.slipLegsJson);
        if (!Array.isArray(parsed) || parsed.some((leg) => !leg || typeof leg !== 'object' || !['eventId', 'marketPredictionId', 'marketKey', 'selectionKey'].every((key) => typeof (leg as Record<string, unknown>)[key] === 'string' && String((leg as Record<string, unknown>)[key]).trim()))) { setFormError('Every leg requires eventId, marketPredictionId, marketKey and selectionKey.'); return; }
        if (!window.confirm('Replace all selection legs on this slip? This is a direct administrative change.')) return;
        mutation.mutate({ action: 'update-slip-legs', id, body: { legs: parsed } });
      } catch { setFormError('The legs JSON is invalid.'); }
      return;
    }
    if (!manual.sportyBetSlipCode.trim() && !manual.sportyBetSlipLink.trim() && !window.confirm('Clear both saved SportyBet references for this slip?')) return;
    mutation.mutate({ action: 'update-sportybet', id, body: { sportyBetSlipCode: manual.sportyBetSlipCode.trim() || null, sportyBetSlipLink: manual.sportyBetSlipLink.trim() || null } });
  };
  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters((current) => ({ ...current, [key]: value }));

  return <AdminPageFrame title={meta.title} description={meta.description} badge={<span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Admin</span>} actions={<><span className="text-[9px] text-muted-foreground">{query.dataUpdatedAt ? `Updated ${new Date(query.dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live data'}</span><button type="button" className={adminButton} disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? 'Refreshing…' : 'Refresh'}</button></>}>
    <AdminTabs value={tab} onChange={setTab} tabs={tabSets[module]} />
    <div className="flex flex-wrap items-end gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-2">
      <label className="w-[88px]"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Limit</span><select className={adminInput} value={filters.limit} onChange={(e) => setFilter('limit', e.target.value)}>{['25', '50', '100', '250', '500'].map((v) => <option key={v}>{v}</option>)}</select></label>
      {module === 'sports' && ['competitions', 'teams'].includes(tab) && <label className="w-44"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Search</span><input className={adminInput} value={filters.status} onChange={(e) => setFilter('status', e.target.value)} placeholder="Name or keyword" /></label>}
      {module === 'sports' && ['teams', 'fixtures', 'news'].includes(tab) && <label className="w-44"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Competition ID</span><input className={adminInput} value={filters.competitionId} onChange={(e) => setFilter('competitionId', e.target.value)} placeholder="Optional competition ID" /></label>}
      {module === 'sports' && ['fixtures', 'news'].includes(tab) && <label className="w-44"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Team ID</span><input className={adminInput} value={filters.teamId} onChange={(e) => setFilter('teamId', e.target.value)} placeholder="Optional team ID" /></label>}
      {module === 'sports' && tab === 'fixtures' && <><label className="w-36"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Fixture state</span><select className={adminInput} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}><option value="">Any state</option>{['SCHEDULED', 'LIVE', 'HALFTIME', 'EXTRA_TIME', 'PENALTIES', 'COMPLETED', 'POSTPONED', 'CANCELLED', 'ABANDONED', 'UNKNOWN'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="w-44"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Season ID</span><input className={adminInput} value={filters.seasonId} onChange={(e) => setFilter('seasonId', e.target.value)} placeholder="Optional season ID" /></label></>}
      {module === 'sports' && tab === 'news' && <label className="w-36"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">News scope</span><select className={adminInput} value={filters.level} onChange={(e) => setFilter('level', e.target.value)}><option value="">All scopes</option>{['SOCCER', 'LEAGUE', 'SUMMARY'].map((value) => <option key={value}>{value}</option>)}</select></label>}
      {['queue', 'jobs', 'runs'].includes(tab) && <label className="w-36"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Status</span><input className={adminInput} value={filters.status} onChange={(e) => setFilter('status', e.target.value)} placeholder="Any status" /></label>}
      {['events', 'errors'].includes(tab) && <label className="w-36"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Level / type</span><input className={adminInput} value={filters.level} onChange={(e) => setFilter('level', e.target.value)} placeholder="Any level" /></label>}
      {showDateFilter && <><label className="w-36"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">From</span><input className={adminInput} type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} /></label><label className="w-36"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">To</span><input className={adminInput} type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} /></label></>}
      {['markets', 'sync-state-detail', 'slip-detail'].includes(tab) && <label className="w-56"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{tab === 'markets' ? 'Event ID' : tab === 'slip-detail' ? 'Slip ID' : 'Sync-state key'}</span><input className={adminInput} value={filters.eventId} onChange={(e) => setFilter('eventId', e.target.value)} placeholder={tab === 'markets' ? 'ESPN event ID' : tab === 'slip-detail' ? 'Slip document ID' : 'Exact state key'} /></label>}
      {['collection', 'collection-operations'].includes(tab) && <label className="w-56"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Collection name</span><input className={adminInput} value={manual.collection} onChange={(e) => setManual((current) => ({ ...current, collection: e.target.value }))} placeholder="MongoDB collection" /></label>}
      <button className={adminButton} type="button" onClick={() => { void query.refetch(); }}>Apply</button>
    </div>

    {module === 'predictions' && <AdminPanel title="Queue & publication controls" meta="Protected admin operations"><div className="flex flex-wrap items-center gap-1.5 p-2.5"><button className={adminButton} disabled={mutation.isPending} onClick={() => submitManual('sync-queue')}>Sync queue</button><button className={adminButton} disabled={mutation.isPending} onClick={() => { if (window.confirm('Force a queue sync? This requests the backend to bypass its normal sync guard.')) mutation.mutate({ action: 'force-sync-queue' }); }}>Force sync</button><button className={adminButton} disabled={mutation.isPending} onClick={() => submitManual('recover-stale')}>Recover stale items</button><button className={adminButton} disabled={mutation.isPending} onClick={() => submitManual('run-next')}>Run next item</button><button className={adminButton} disabled={mutation.isPending} onClick={() => submitManual('refresh-curated')}>Refresh curated picks</button><button className={adminButton} disabled={mutation.isPending} onClick={() => submitManual('refresh-slips')}>Refresh slips</button><div className="flex min-w-[240px] flex-1 gap-1.5"><input className={adminInput} value={manual.marketKey} onChange={(e) => setManual((current) => ({ ...current, marketKey: e.target.value }))} placeholder="Market key (blank = all)"/><button className={adminButton} disabled={mutation.isPending} onClick={() => mutation.mutate({ action: 'rebuild-calibration', body: { marketKey: manual.marketKey.trim() || undefined } })}>Rebuild calibration</button></div><div className="flex min-w-[260px] flex-1 gap-1.5"><input className={adminInput} value={manual.eventId} onChange={(e) => setManual((current) => ({ ...current, eventId: e.target.value }))} placeholder="Fixture event ID" /><button className={adminPrimaryButton} disabled={mutation.isPending || !manual.eventId.trim()} onClick={() => submitManual('generate-fixture')}>Generate</button></div></div></AdminPanel>}

    {module === 'predictions' && tab === 'build-slip' && <AdminPanel title="Build & publish a slip" meta="Uses Pick Center selections; backend currently publishes manual builds"><form className="grid gap-2 p-2.5" onSubmit={(event) => { event.preventDefault(); submitSlipBuild(); }}>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4"><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Slip name</span><input className={adminInput} value={buildSlipForm.name} onChange={(e) => setBuildSlipForm((current) => ({ ...current, name: e.target.value }))} maxLength={140} placeholder="Auto-generated if blank" /></label><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Product type</span><select className={adminInput} value={buildSlipForm.productType} onChange={(e) => setBuildSlipForm((current) => ({ ...current, productType: e.target.value }))}>{['ODDS_10', 'ODDS_25', 'ODDS_50', 'SURE_ODDS'].map((value) => <option key={value}>{value}</option>)}</select></label><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Selection count</span><input className={adminInput} type="number" min={1} max={30} value={buildSlipForm.selectionCount} onChange={(e) => setBuildSlipForm((current) => ({ ...current, selectionCount: e.target.value }))} /></label><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Minimum probability (%)</span><input className={adminInput} type="number" min={0} max={100} step="0.1" value={buildSlipForm.minimumProbabilityPercent} onChange={(e) => setBuildSlipForm((current) => ({ ...current, minimumProbabilityPercent: e.target.value }))} /></label></div>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4"><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Minimum confidence</span><input className={adminInput} type="number" min={0} max={100} step="1" value={buildSlipForm.minimumConfidence} onChange={(e) => setBuildSlipForm((current) => ({ ...current, minimumConfidence: e.target.value }))} /></label><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Fixture from</span><input className={adminInput} type="date" value={buildSlipForm.fixtureFrom} onChange={(e) => setBuildSlipForm((current) => ({ ...current, fixtureFrom: e.target.value }))} /></label><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Fixture to</span><input className={adminInput} type="date" value={buildSlipForm.fixtureTo} onChange={(e) => setBuildSlipForm((current) => ({ ...current, fixtureTo: e.target.value }))} /></label>{buildSlipForm.productType === 'SURE_ODDS' && <label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Sure Odds product</span><select className={adminInput} value={buildSlipForm.sureOddsProduct} onChange={(e) => setBuildSlipForm((current) => ({ ...current, sureOddsProduct: e.target.value }))}>{['SURE_2', 'SURE_5', 'SURE_7'].map((value) => <option key={value}>{value}</option>)}</select></label>}</div>
      <label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Optional event IDs · comma or space separated</span><input className={adminInput} value={buildSlipForm.eventIds} onChange={(e) => setBuildSlipForm((current) => ({ ...current, eventIds: e.target.value }))} placeholder="Blank uses the backend publication window" /></label>
      {formError && <AdminNotice kind="error">{formError}</AdminNotice>}<div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[9px] text-muted-foreground">Probability is sent as a fraction (40% → 0.4). Fixture dates remain subject to backend publication-window rules.</p><button className={adminPrimaryButton} disabled={mutation.isPending}>{mutation.isPending ? 'Building…' : 'Build & publish slip'}</button></div>
    </form></AdminPanel>}

    {module === 'predictions' && tab === 'edit-slip' && <AdminPanel title="Edit a slip" meta="Changes apply to the selected slip document"><div className="grid gap-2 p-2.5"><label><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Slip ID</span><input className={adminInput} value={manual.slipId} onChange={(e) => setManual((current) => ({ ...current, slipId: e.target.value }))} placeholder="Slip document ID" /></label><div className="grid gap-2 xl:grid-cols-2"><div className="space-y-1.5"><label className="block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Replace selection legs · JSON array</label><textarea className={`${adminTextarea} min-h-[165px] font-mono text-[10px]`} value={manual.slipLegsJson} onChange={(e) => setManual((current) => ({ ...current, slipLegsJson: e.target.value }))} spellCheck={false} /><button type="button" className={adminDangerButton} disabled={mutation.isPending || !manual.slipId.trim()} onClick={() => submitSlipEdit('legs')}>Save selection legs</button></div><div className="space-y-1.5"><label className="block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">SportyBet reference</label><input className={adminInput} value={manual.sportyBetSlipCode} onChange={(e) => setManual((current) => ({ ...current, sportyBetSlipCode: e.target.value }))} placeholder="SportyBet slip code" /><input className={adminInput} value={manual.sportyBetSlipLink} onChange={(e) => setManual((current) => ({ ...current, sportyBetSlipLink: e.target.value }))} placeholder="SportyBet slip URL" /><button type="button" className={adminPrimaryButton} disabled={mutation.isPending || !manual.slipId.trim()} onClick={() => submitSlipEdit('sportybet')}>Save SportyBet reference</button><p className="text-[9px] leading-4 text-muted-foreground">Blank fields clear their stored values. Confirm before clearing both fields.</p></div></div>{formError && <AdminNotice kind="error">{formError}</AdminNotice>}</div></AdminPanel>}

    {module === 'settlement' && <AdminPanel title="Settlement controls" meta="Overrides are explicit and reasoned"><div className="grid gap-2 p-2.5 xl:grid-cols-2">
      <form className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" onSubmit={(e) => { e.preventDefault(); submitManual('requeue-fixture'); }}><input className={adminInput} value={manual.eventId} onChange={(e) => setManual((current) => ({ ...current, eventId: e.target.value }))} placeholder="Finished fixture event ID" required /><input className={adminInput} value={manual.leagueId} onChange={(e) => setManual((current) => ({ ...current, leagueId: e.target.value }))} placeholder="League ID (optional)" /><button className={adminPrimaryButton} disabled={mutation.isPending}>Requeue</button></form>
      <div className="grid gap-1.5 sm:grid-cols-2"><input className={adminInput} value={manual.marketPredictionId} onChange={(e) => setManual((current) => ({ ...current, marketPredictionId: e.target.value }))} placeholder="Market prediction ID" /><input className={adminInput} value={manual.selectionKey} onChange={(e) => setManual((current) => ({ ...current, selectionKey: e.target.value }))} placeholder="Selection key" /><input className={adminInput} value={manual.ticketId} onChange={(e) => setManual((current) => ({ ...current, ticketId: e.target.value }))} placeholder="Bet Lab ticket ID" /><input className={adminInput} value={manual.legId} onChange={(e) => setManual((current) => ({ ...current, legId: e.target.value }))} placeholder="Ticket leg ID" /><select className={adminInput} value={manual.outcome} onChange={(e) => setManual((current) => ({ ...current, outcome: e.target.value }))}>{['WON', 'LOST', 'VOID', 'PUSH', 'HALF_WON', 'HALF_LOST'].map((value) => <option key={value}>{value}</option>)}</select><input className={adminInput} value={manual.reason} onChange={(e) => setManual((current) => ({ ...current, reason: e.target.value }))} placeholder="Reason (at least 5 characters)" /><button className={adminDangerButton} disabled={mutation.isPending || manual.reason.trim().length < 5 || (!(manual.ticketId.trim() && manual.legId.trim()) && !(manual.marketPredictionId.trim() && manual.selectionKey.trim()))} onClick={() => submitManual(manual.ticketId.trim() && manual.legId.trim() ? 'manual-bet-lab-settlement' : 'manual-prediction-settlement')}>Manual settle</button></div>
    </div></AdminPanel>}


    {mutation.isError && <AdminError error={mutation.error} retry={() => mutation.reset()} />}
    {mutation.isSuccess && <AdminNotice kind="success">Operation completed successfully. Relevant admin data has been refreshed.</AdminNotice>}
    {formError && !['build-slip', 'edit-slip'].includes(tab) && <AdminNotice kind="error">{formError}</AdminNotice>}
    {query.isError && <AdminError error={query.error} retry={() => query.refetch()} />}
    {module === 'predictions' && ['build-slip', 'edit-slip'].includes(tab) ? null : query.isLoading ? <div className="rounded-lg border border-border/70 bg-card px-3 py-10 text-center text-[11px] text-muted-foreground">Loading {compactLabel(tab).toLowerCase()}…</div> : <>
      {metrics.length > 0 && ['overview', 'monitor', 'storage', 'database', 'queue-summary', 'sync-summary'].includes(tab) && <AdminMetrics items={metrics.map((item) => ({ label: item.label, value: item.value.toLocaleString(), tone: /failed|error|critical/i.test(item.label) && item.value > 0 ? 'bad' : /healthy|active|completed/i.test(item.label) ? 'good' : 'default' }))} columns={Math.min(6, Math.max(2, metrics.length)) as 2 | 3 | 4 | 5 | 6} />}
      <AdminPanel title={compactLabel(tab)} meta={Array.isArray(query.data) ? `${query.data.length} records` : rows.length ? `${rows.length} records` : query.dataUpdatedAt ? 'Response received' : 'Awaiting response'} actions={<span className="text-[9px] text-muted-foreground">{query.isFetching ? 'Refreshing…' : 'Backend response'}</span>}>
        {rows.length > 0 ? <AdminTable rows={rows} columns={cols} limit={Math.min(500, Math.max(1, Number(filters.limit) || 50))} empty="No records match the selected filters." /> : <div className="px-3 py-5 text-center text-[11px] text-muted-foreground">{query.data && typeof query.data === 'object' && 'message' in (query.data as Record<string, unknown>) ? String((query.data as Record<string, unknown>).message) : 'No tabular records returned for this view. The full response is available below.'}</div>}
        {query.data !== undefined && <details className="border-t border-border/60 px-2.5 py-2" onToggle={(event) => setResponseDetailsOpen(event.currentTarget.open)}><summary className="cursor-pointer text-[10px] font-semibold text-muted-foreground">Inspect complete response</summary>{responseDetailsOpen && <pre className="mt-2 max-h-[420px] overflow-auto rounded-md bg-muted/40 p-2 text-[9px] leading-4 text-foreground">{formattedResponse}</pre>}</details>}
      </AdminPanel>
    </>}
    <footer className="flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-muted-foreground"><span>2xPredict · {meta.title}</span><span>{module === 'sports' ? 'Normalized Sports v2 reads · operational monitor is admin-only' : 'Admin API · read-only unless a named operation is provided'}</span></footer>
  </AdminPageFrame>;
}

