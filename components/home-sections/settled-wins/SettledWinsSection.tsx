'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTrophy } from 'react-icons/fa6';
import { useListCuratedPredictionsQuery } from '@/hooks/use-prediction-access';
import { useGetV2CompetitionsQuery } from '@/hooks/use-sports';
import { resolveTeamDisplayName, useMatchPresentation } from '@/hooks/use-match-presentation';
import HomeDateSelector from '../HomeDateSelector';
import LeagueSelector from '../LeagueSelector';
import {
  createCompetitionLookup,
  findCompetition,
  leagueFilterId,
  resolveLeagueLogo,
  resolveLeagueName,
} from '../league-display';

type Row = Record<string, any>;

const asRows = (value: any): Row[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.items)) return value.data.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.leagues)) return value.leagues;
  return [];
};


const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const shiftDay = (value: string, offset: number) => { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + offset); return dayKey(date); };
const ordinal = (value: number) => { const mod100 = value % 100; return `${value}${mod100 >= 11 && mod100 <= 13 ? 'th' : value % 10 === 1 ? 'st' : value % 10 === 2 ? 'nd' : value % 10 === 3 ? 'rd' : 'th'}`; };

const dateChipLabel = (value: string, today: string) => {
  const diff = Math.round((new Date(`${value}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  const date = new Date(`${value}T12:00:00`);
  return `${ordinal(date.getDate())} ${new Intl.DateTimeFormat('en-NG', { weekday: 'short' }).format(date)}`;
};

const fmtDate = (value: string) => new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
function logoUrl(value: any, depth = 0): string | null {
  if (depth > 5 || value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const candidate = value.trim().replace(/^http:\/\//i, 'https://');
    return /^(https?:\/\/|\/|data:image\/)/i.test(candidate) ? candidate : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logoUrl(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== 'object') return null;
  for (const key of ['href', 'url', 'src', 'imageUrl', 'logoUrl']) {
    const found = logoUrl(value[key], depth + 1);
    if (found) return found;
  }
  for (const key of ['logo', 'logos', 'crest', 'badge', 'emblem', 'image', 'images', 'icon']) {
    const found = logoUrl(value[key], depth + 1);
    if (found) return found;
  }
  return null;
}

const initials = (value?: string) => (value ?? '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase() || '?';

function Logo({ src, name, size = 'h-6 w-6', eager = false }: { src?: string | null; name?: string; size?: string; eager?: boolean }) {
  return (
    <span className={`${size} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[8px] font-bold text-muted-foreground`}>
      {initials(name)}
      {src?.trim() ? <img src={src} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'} className="absolute inset-0 h-full w-full bg-card object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
    </span>
  );
}

function isWinningOutcome(selection: Row) {
  const outcome = String(selection.settlementOutcome ?? selection.actualOutcome ?? selection.matchSettlementStatus ?? selection.status ?? '').toUpperCase();
  return outcome === 'WON' || outcome === 'HALF_WON';
}

function selectionLabel(selection: Row) {
  const market = String(selection.marketName ?? selection.marketDisplayName ?? selection.marketKey ?? 'Market').trim();
  const choice = String(selection.selectionName ?? selection.displayName ?? selection.selectionKey ?? selection.key ?? 'Selection').trim();
  return `${market}: ${choice}`;
}

function predictionDate(prediction: Row, selections: Row[]) {
  const value = prediction.fixtureDateFrom ?? prediction.fixtureDate ?? selections[0]?.fixtureDate;
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dayKey(date);
}

export default function SettledWinsSection() {
  const today = dayKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [league, setLeague] = useState('ALL');
  const [expanded, setExpanded] = useState(false);

  const query = useListCuratedPredictionsQuery(
    { query: { from: selectedDate, to: selectedDate, page: 1, pageSize: 100 } },
    { staleTime: 3 * 60_000, retry: 1, refetchOnWindowFocus: false },
  );

  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: false, limit: 1000 } },
    { staleTime: 30 * 60_000, retry: 1, refetchOnWindowFocus: false },
  );
  const competitions = asRows(competitionsQuery.data);
  const leagueById = useMemo(
    () => createCompetitionLookup(competitions),
    [competitions],
  );

  const predictions = useMemo(() => (query.data?.items ?? [])
    .map((prediction) => ({
      ...prediction,
      selections: (prediction.selections ?? []).filter((selection) => isWinningOutcome(selection as unknown as Row)),
    }))
    .filter((prediction) => prediction.selections.length > 0)
    .filter((prediction) => {
      const recordDate = predictionDate(prediction as unknown as Row, prediction.selections as unknown as Row[]);
      return !recordDate || recordDate === selectedDate;
    }) as unknown as Row[], [query.data?.items, selectedDate]);
  const fixtureRefs = useMemo(() => predictions.map((prediction: Row) => {
    const selection = prediction.selections?.[0] ?? {};
    return {
      eventId: prediction.eventId ?? selection.eventId,
      fixtureDate: prediction.fixtureDateFrom ?? prediction.fixtureDate ?? selection.fixtureDate,
      leagueId: selection.leagueId ?? prediction.leagueId,
      leagueName: selection.leagueName ?? prediction.leagueName,
      leagueCountry: selection.country ?? prediction.country,
      homeTeamId: selection.homeTeamId ?? prediction.homeTeamId,
      awayTeamId: selection.awayTeamId ?? prediction.awayTeamId,
      homeTeamName: selection.homeTeamName ?? prediction.homeTeamName,
      awayTeamName: selection.awayTeamName ?? prediction.awayTeamName,
      homeTeamLogo: selection.homeTeamLogo ?? prediction.homeTeamLogo,
      awayTeamLogo: selection.awayTeamLogo ?? prediction.awayTeamLogo,
      fixtureRecord: prediction,
      summaryRecord: prediction.summary,
    };
  }), [predictions]);

  const presentations = useMatchPresentation(fixtureRefs);

  const leagues = useMemo(() => {
    const map = new Map<string, { id: string; name: string; logo?: string | null; country?: string | null }>();

    for (const prediction of predictions) {
      const selection = prediction.selections?.[0] ?? {};
      const presentation = presentations.get(String(prediction.eventId ?? selection.eventId ?? ''));
      const sourceId = selection.leagueId ?? prediction.leagueId ?? presentation?.leagueId;
      if (!sourceId) continue;

      const competition = findCompetition(leagueById, sourceId);
      const id = leagueFilterId(sourceId, competition);
      if (!id) continue;

      const existing = map.get(id);
      map.set(id, {
        id,
        name: resolveLeagueName(id, [
          competition?.name,
          competition?.displayName,
          competition?.espnPayload?.displayName,
          competition?.espnPayload?.name,
          selection.leagueName,
          prediction.leagueName,
          presentation?.leagueName,
          existing?.name,
        ]),
        country: presentation?.leagueCountry ?? competition?.country ?? null,
        logo: resolveLeagueLogo(
          selection.leagueLogo,
          prediction.leagueLogo,
          competition?.logo,
          competition?.logos,
          competition?.emblem,
          competition?.images,
          competition?.espnPayload,
          presentation?.leagueLogo,
          existing?.logo,
        ),
      });
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [predictions, presentations, leagueById]);

  useEffect(() => {
    if (league !== 'ALL' && !leagues.some((item) => item.id === league)) setLeague('ALL');
  }, [league, leagues]);

  const visible = useMemo(() => predictions.filter((prediction: Row) => {
    if (league === 'ALL') return true;
    const selection = prediction.selections?.[0] ?? {};
    const presentation = presentations.get(String(prediction.eventId ?? selection.eventId ?? ''));
    const sourceId = selection.leagueId ?? prediction.leagueId ?? presentation?.leagueId;
    const competition = findCompetition(leagueById, sourceId);
    return leagueFilterId(sourceId, competition) === league;
  }), [league, predictions, presentations, leagueById]);

  const options = Array.from({ length: 9 }, (_, index) => shiftDay(today, index - 8));

  return (
    <section className="px-2.5 py-1.5 sm:px-5 sm:py-2">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-2 flex flex-col items-center justify-center text-center">
          <h2 className="font-serif text-2xl font-semibold italic tracking-tight text-brand-accent sm:text-3xl">Our Recent Wins</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">Winning predictions & slips</p>
        </header>

        <HomeDateSelector
          dates={options}
          selected={selectedDate}
          today={today}
          onSelect={(value) => {
            setSelectedDate(value);
            setExpanded(false);
          }}
          getLabel={dateChipLabel}
          className="mb-1"
        />

        <LeagueSelector
          leagues={leagues}
          selected={league}
          onSelect={setLeague}
          allLabel="All"
          className="mb-2"
        />

        {query.isLoading ? (
          <div className="rounded-lg border border-border bg-card p-3 text-center text-xs text-muted-foreground">Loading settled wins…</div>
        ) : query.isError ? (
          <div className="rounded-lg border border-border bg-card p-3 text-center text-xs text-muted-foreground">Settled wins are temporarily unavailable.</div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">No curated winning predictions found for {fmtDate(selectedDate)}.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-5">
              {visible.map((prediction: Row, index: number) => {
                const selections: Row[] = prediction.selections ?? [];
                const firstSelection = selections[0] ?? {};
                const eventId = String(prediction.eventId ?? firstSelection.eventId ?? '');
                const presentation = presentations.get(eventId);
                const homeName = resolveTeamDisplayName(presentation?.homeTeamName, firstSelection.homeTeamName, prediction.homeTeamName);
                const awayName = resolveTeamDisplayName(presentation?.awayTeamName, firstSelection.awayTeamName, prediction.awayTeamName);
                const sourceLeagueId = firstSelection.leagueId ?? prediction.leagueId ?? presentation?.leagueId ?? '';
                const competition = findCompetition(leagueById, sourceLeagueId);
                const leagueName = resolveLeagueName(sourceLeagueId, [
                  competition?.name,
                  competition?.displayName,
                  competition?.espnPayload?.displayName,
                  competition?.espnPayload?.name,
                  firstSelection.leagueName,
                  prediction.leagueName,
                  presentation?.leagueName,
                ]);
                const leagueLogo = resolveLeagueLogo(
                  firstSelection.leagueLogo,
                  prediction.leagueLogo,
                  competition?.logo,
                  competition?.logos,
                  competition?.emblem,
                  competition?.images,
                  competition?.espnPayload,
                  presentation?.leagueLogo,
                );
                const homeLogo = logoUrl(firstSelection.homeTeamLogo ?? prediction.homeTeamLogo ?? presentation?.homeTeamLogo);
                const awayLogo = logoUrl(firstSelection.awayTeamLogo ?? prediction.awayTeamLogo ?? presentation?.awayTeamLogo);
                // The backend's CuratedPrediction.combinedOdds is the primary selection's
                // price. Additional same-match recommendations are not an accumulator.
                const primarySelection = selections[0] ?? {};
                const rawPrimaryOdds = Number(prediction.combinedOdds ?? primarySelection.decimalOdds ?? primarySelection.bookmakerOdds);
                const primaryOdds = Number.isFinite(rawPrimaryOdds) && rawPrimaryOdds > 1 ? rawPrimaryOdds : null;
                const primaryOddsEstimated = String(primarySelection.priceType ?? '').toUpperCase() === 'ESTIMATED';
                const visibility = !expanded && index >= 10 ? 'hidden' : !expanded && index >= 6 ? 'hidden sm:flex' : '';

                return (
                  <article key={prediction._id ?? prediction.predictionCode ?? eventId ?? index}
                    className={`group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-card p-1.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-accent/40 hover:shadow-md sm:p-2.5 ${visibility}`}>
                    <div className="mb-1 flex min-w-0 items-center justify-between gap-1 border-b border-border/60 pb-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Logo src={leagueLogo} name={leagueName} size="h-4 w-4" eager={index < 4} />
                        <span className="truncate text-[9px] font-semibold text-muted-foreground">{leagueName}</span>
                      </div>
                      <span className="shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-status-success">Won</span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
                      <div className="flex min-w-0 flex-col items-center text-center">
                        <Logo src={homeLogo} name={homeName} size="h-6 w-6 sm:h-8 sm:w-8" eager={index < 4} />
                        <span className="mt-0.5 line-clamp-2 min-h-[1.75rem] w-full text-[9px] font-semibold leading-3.5 sm:text-[10px]">{homeName}</span>
                      </div>
                      <div className="flex min-w-[38px] flex-col items-center">
                        <span className="rounded-md bg-muted px-1.5 py-1 text-xs font-extrabold tabular-nums">
                          {presentation?.homeScore ?? '–'}<span className="px-0.5 text-muted-foreground">:</span>{presentation?.awayScore ?? '–'}
                        </span>
                        <span className="mt-1 text-[8px] font-medium text-muted-foreground">FT</span>
                      </div>
                      <div className="flex min-w-0 flex-col items-center text-center">
                        <Logo src={awayLogo} name={awayName} size="h-6 w-6 sm:h-8 sm:w-8" eager={index < 4} />
                        <span className="mt-0.5 line-clamp-2 min-h-[1.75rem] w-full text-[9px] font-semibold leading-3.5 sm:text-[10px]">{awayName}</span>
                      </div>
                    </div>

                    <div className="mt-1.5 flex-1 border-t border-border/60 pt-1.5">
                      <p className="mb-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-[.1em] text-status-success"><FaTrophy className="text-[9px]" />Winning selections</p>
                      <div className="space-y-0.5">
                        {selections.map((selection, selectionIndex) => (
                          <div key={`${selection.marketKey ?? selection.marketName}-${selection.selectionKey ?? selectionIndex}`} className="rounded-md bg-muted/60 px-1.5 py-1">
                            <p className="break-words text-[9px] font-semibold leading-[1.35] text-foreground sm:text-[10px]">{selectionLabel(selection)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-border/60 pt-1">
                      <span className="text-[8px] text-muted-foreground">Primary pick odds</span>
                      <strong title={primaryOddsEstimated ? 'Grivit estimate; not a bookmaker offer.' : 'Price for the primary curated selection.'} className="text-[10px] font-bold tabular-nums text-status-success">{primaryOdds === null ? '—' : `${primaryOddsEstimated ? '~' : ''}${primaryOdds.toFixed(2)}`}</strong>
                    </div>
                  </article>
                );
              })}
            </div>

            {visible.length > 6 ? (
              <div className="mt-2 flex justify-center">
                <button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/5 px-4 py-2 text-[11px] font-bold text-brand-accent transition hover:bg-brand-accent/10">
                  {expanded ? <>Show less <FaChevronUp className="text-[9px]" /></> : <>View all {visible.length} wins <FaChevronDown className="text-[9px]" /></>}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

