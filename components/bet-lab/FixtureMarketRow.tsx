'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaChartSimple, FaClock, FaFutbol, FaLock } from 'react-icons/fa6';
import { useGetOddsQuery } from '@/hooks/use-bet-lab';
import type { MatchPresentation } from '@/hooks/use-match-presentation';
import { asRecord, firstValue, rowsFrom, text, unwrapRecord, type ApiRecord } from '@/lib/api-shapes';
import {
  arrayFrom,
  eventIdOf,
  fixtureDateOf,
  fixtureTeamName,
  isOverUnderMarket,
  isAsianHandicapMarket,
  isDoubleChanceMarket,
  marketCodeOf,
  marketOdds,
  marketSelectionCode,
  marketSelectionHeaderLabel,
  marketSelectionHandicapSide,
  marketSelectionLine,
  marketSelectionName,
  marketSelectionSide,
  fixtureTeamLogoSources,
  fixtureLeagueLogoSources,
  resolveStatus,
  statusLabel,
  timeLabel,
  type TicketPick,
} from './bet-lab.utils';
import { findBetLabSelectionCompatibilityError } from './bet-lab-selection-compatibility';
import {
  buildBetLabFixturePricingModel,
  buildBetLabSelectionPricing,
  type BetLabPricingMarket,
} from './bet-lab-pricing';
import FixtureStatsDialog from './stats/FixtureStatsDialog';
import BetLabLogo from './BetLabLogo';

type SelectionCategory = {
  label: string;
  options: ApiRecord[];
};

function readableLeagueName(fixture: ApiRecord, presentation?: MatchPresentation): string {
  const league = asRecord(firstValue(fixture, ['league', 'competition'])) ?? {};
  const ids = [
    text(firstValue(fixture, ['leagueId', 'competitionId', 'league_id', 'competition_id'])),
    text(firstValue(league, ['leagueId', 'competitionId', 'id', 'slug', 'code'])),
  ].filter(Boolean).map((value) => value.toLowerCase());
  const candidates = [
    presentation?.leagueName,
    firstValue(league, ['leagueName', 'displayName', 'name', 'fullName', 'shortName']),
    firstValue(fixture, ['leagueName', 'competitionName', 'displayCompetitionName']),
  ];

  for (const candidate of candidates) {
    const name = text(candidate);
    if (!name) continue;
    if (ids.includes(name.toLowerCase())) continue;
    if (/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(name)) continue;
    return name;
  }
  return 'Competition';
}

function leagueLogoOf(fixture: ApiRecord, presentation?: MatchPresentation): string[] {
  return fixtureLeagueLogoSources(fixture, presentation);
}

type Props = {
  fixture: ApiRecord;
  presentation?: MatchPresentation;
  selected: boolean;
  activeMarket?: ApiRecord;
  picks: TicketPick[];
  selectionHeaders: string[];
  guestMode?: boolean;
  onRequestAccess?: () => void;
  onSelect: (eventId: string) => void;
  onAddPick: (pick: TicketPick) => void;
};



export default function FixtureMarketRow({
  fixture,
  presentation,
  selected,
  activeMarket,
  picks,
  selectionHeaders,
  guestMode = false,
  onRequestAccess,
  onSelect,
  onAddPick,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [oddsSnapshotExpired, setOddsSnapshotExpired] = useState(false);
  const eventId = eventIdOf(fixture);
  const homeName = presentation?.homeTeamName ?? fixtureTeamName(fixture, 'home');
  const awayName = presentation?.awayTeamName ?? fixtureTeamName(fixture, 'away');
  const homeLogo = fixtureTeamLogoSources(fixture, 'home', presentation);
  const awayLogo = fixtureTeamLogoSources(fixture, 'away', presentation);
  const leagueName = readableLeagueName(fixture, presentation);
  const leagueLogo = leagueLogoOf(fixture, presentation);
  const status = resolveStatus(fixture, presentation);
  const live = status === 'LIVE' || status === 'IN_PLAY';
  const hasScore = presentation?.homeScore !== null && presentation?.homeScore !== undefined
    && presentation?.awayScore !== null && presentation?.awayScore !== undefined;
  const homeScore = hasScore ? presentation?.homeScore : status === 'UPCOMING' ? 0 : '—';
  const awayScore = hasScore ? presentation?.awayScore : status === 'UPCOMING' ? 0 : '—';
  const kickoff = timeLabel(fixtureDateOf(fixture));
  const liveClock = live && presentation?.displayClock ? presentation.displayClock : '';
  const marketCode = activeMarket ? marketCodeOf(activeMarket) : '';
  const marketName = activeMarket
    ? text(firstValue(activeMarket, ['fullName', 'marketName', 'name']), marketCode || 'Market')
    : 'Market';

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { root: null, rootMargin: '220px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const oddsQuery = useGetOddsQuery<unknown>(
    { path: { eventId } },
    {
      enabled: !guestMode && Boolean(eventId) && nearViewport && Boolean(activeMarket),
      staleTime: 90_000,
      gcTime: 10 * 60_000,
      refetchInterval: !guestMode && nearViewport ? 120_000 : false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const oddsRecord = unwrapRecord(oddsQuery.data);
  const oddsFreshUntil = text(oddsRecord.oddsFreshUntil);
  const rawMarkets = useMemo(() => arrayFrom(oddsRecord, ['markets']), [oddsRecord]);
  const pricingMarkets = rawMarkets as unknown as BetLabPricingMarket[];
  const pricingModel = useMemo(
    () => buildBetLabFixturePricingModel(pricingMarkets),
    [rawMarkets],
  );

  useEffect(() => {
    if (!oddsFreshUntil) {
      setOddsSnapshotExpired(false);
      return;
    }
    const expiresAt = Date.parse(oddsFreshUntil);
    if (!Number.isFinite(expiresAt)) {
      setOddsSnapshotExpired(false);
      return;
    }
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setOddsSnapshotExpired(true);
      return;
    }
    setOddsSnapshotExpired(false);
    const timer = window.setTimeout(
      () => setOddsSnapshotExpired(Date.now() >= expiresAt),
      Math.min(remaining + 25, 2_147_000_000),
    );
    return () => window.clearTimeout(timer);
  }, [oddsFreshUntil]);
  const marketData = useMemo(
    () => rawMarkets.find((market) => marketCodeOf(market) === marketCode),
    [rawMarkets, marketCode],
  );

  const selections = useMemo(() => {
    if (!marketData) return [];
    return rowsFrom(marketData.selections)
      .map((selection) => asRecord(selection))
      .filter((selection): selection is ApiRecord => Boolean(selection))
      .filter((selection) => {
        const odds = marketOdds(selection);
        return !oddsSnapshotExpired && selection.available !== false && selection.isStale !== true && odds > 1;
      });
  }, [marketData, oddsSnapshotExpired]);

  const overUnderMarket = Boolean(activeMarket && isOverUnderMarket(activeMarket));
  const asianHandicapMarket = Boolean(activeMarket && isAsianHandicapMarket(activeMarket));
  const doubleChanceMarket = Boolean(activeMarket && isDoubleChanceMarket(activeMarket));

  function selectionCodeOf(selection: ApiRecord): string {
    return marketSelectionCode(selection) || marketSelectionName(selection);
  }

  function categoryForSelection(selection: ApiRecord): string {
    if (overUnderMarket) {
      const side = marketSelectionSide(selection);
      if (side === 'OVER') return 'Over';
      if (side === 'UNDER') return 'Under';
    }
    if (asianHandicapMarket) return marketSelectionHandicapSide(selection) ?? '';
    return marketSelectionHeaderLabel(selection, activeMarket ?? {});
  }

  const categories = useMemo<SelectionCategory[]>(() => {
    const labels = [...selectionHeaders];

    // Double Chance outcomes are mapped only by their explicit canonical
    // selection identity. Unknown provider labels are omitted, never guessed.
    if (doubleChanceMarket) {
      const grouped = new Map<string, ApiRecord[]>(labels.map((label) => [label, []]));
      for (const selection of selections) {
        const label = marketSelectionHeaderLabel(selection, activeMarket ?? {});
        const group = grouped.get(label);
        if (group) group.push(selection);
      }
      return labels.map((label) => ({ label, options: grouped.get(label) ?? [] }));
    }

    const dynamicLabels = selections.map((selection) => {
      if (overUnderMarket) {
        const side = marketSelectionSide(selection);
        if (side === 'OVER') return 'Over';
        if (side === 'UNDER') return 'Under';
      }
      if (asianHandicapMarket) return marketSelectionHandicapSide(selection) ?? '';
      return marketSelectionHeaderLabel(selection, activeMarket ?? {});
    });

    for (const label of dynamicLabels) {
      if (label && !labels.some((item) => item.toLowerCase() === label.toLowerCase())) labels.push(label);
    }

    return labels.map((label) => ({
      label,
      options: selections.filter((selection) => categoryForSelection(selection).toLowerCase() === label.toLowerCase()),
    }));
  // categoryForSelection intentionally follows the selected market and response.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionHeaders, selections, overUnderMarket, asianHandicapMarket, doubleChanceMarket, activeMarket]);

  function ticketPickForSelection(selection: ApiRecord): TicketPick {
    return {
      eventId,
      eventName: `${homeName} vs ${awayName}`,
      marketCode,
      marketName,
      selectionCode: selectionCodeOf(selection),
      selectionName: marketSelectionName(selection),
      odds: marketOdds(selection),
      pricing: buildBetLabSelectionPricing(
        pricingMarkets,
        marketCode,
        selectionCodeOf(selection),
        marketOdds(selection),
        pricingModel,
      ),
    };
  }

  function addSelection(selection: ApiRecord) {
    const pick = ticketPickForSelection(selection);
    if (pick.odds <= 1) return;
    onAddPick(pick);
  }

  function isSelected(selection: ApiRecord): boolean {
    return picks.some((pick) =>
      pick.eventId === eventId
      && pick.marketCode === marketCode
      && pick.selectionCode === selectionCodeOf(selection),
    );
  }

  function compatibilityErrorForSelection(selection: ApiRecord): string | null {
    if (isSelected(selection)) return null;
    const candidate = ticketPickForSelection(selection);
    return findBetLabSelectionCompatibilityError([
      ...picks.filter((pick) => pick.eventId === eventId),
      candidate,
    ]);
  }

  function selectionLineLabel(selection: ApiRecord): string {
    const line = marketSelectionLine(selection).trim();
    const numericLine = line.match(/[+-]?\d+(?:\.\d+)?(?:\s*\/\s*[+-]?\d+(?:\.\d+)?)?/);
    return numericLine ? numericLine[0].replace(/\s+/g, '') : line.replace(/^(?:over|under)\s*/i, '').trim();
  }

  function renderCategory(category: SelectionCategory, index: number) {
    const { label, options } = category;
    const selectedOptions = options.filter(isSelected);
    const needsDropdown = overUnderMarket || asianHandicapMarket;

    if (guestMode) {
      return (
        <button
          key={label}
          type="button"
          onClick={onRequestAccess}
          aria-label={`Unlock ${label} selections for ${homeName} versus ${awayName}`}
          className="flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-md border border-primary/20 bg-primary/[0.045] px-1 text-[9px] font-semibold text-muted-foreground transition hover:border-primary/45 hover:bg-primary/10 hover:text-primary sm:min-h-8"
        >
          <FaLock className="h-2.5 w-2.5 text-primary" />
          <span className="truncate">{label}</span>
        </button>
      );
    }

    if (!options.length) {
      return (
        <span key={label} className="flex min-h-7 min-w-0 items-center justify-center rounded-md border border-dashed border-border/70 text-[9px] text-muted-foreground/60">—</span>
      );
    }

    if (needsDropdown) {
      const dropdownTone = label === 'Over'
        ? 'border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-300'
        : label === 'Under'
          ? 'border-rose-500/25 bg-rose-500/[0.07] text-rose-700 dark:text-rose-300'
          : label === '2'
            ? 'border-sky-500/25 bg-sky-500/[0.07] text-sky-700 dark:text-sky-300'
            : 'border-primary/25 bg-primary/[0.07] text-primary';
      const selectedOption = selectedOptions[0];
      const firstOption = options.find((option) => !compatibilityErrorForSelection(option)) ?? options[0];
      const initialOptionValue = '__bet_lab_first_available__';
      const selectValue = selectedOption ? selectionCodeOf(selectedOption) : initialOptionValue;

      return (
        <div key={label} className="min-w-0">
          <select
            aria-label={`${label} selection for ${homeName} versus ${awayName}`}
            value={selectValue}
            onChange={(event) => {
              const selectedCode = event.target.value === initialOptionValue
                ? selectionCodeOf(firstOption)
                : event.target.value;
              const selection = options.find((option) => selectionCodeOf(option) === selectedCode);
              if (selection) addSelection(selection);
            }}
            className={`h-7 min-w-0 w-full rounded-md border px-1 text-center text-[8px] font-semibold outline-none transition focus:border-primary sm:h-8 sm:px-1.5 sm:text-[9px] ${dropdownTone}`}
          >
            {firstOption ? (
              <option value={initialOptionValue}>
                {selectionLineLabel(firstOption)} · {marketOdds(firstOption).toFixed(2)}
              </option>
            ) : null}
            {options.map((option, optionIndex) => {
              const code = selectionCodeOf(option);
              const conflict = compatibilityErrorForSelection(option);
              const disabled = !isSelected(option) && Boolean(conflict);
              return (
                <option key={`${code}-${optionIndex}`} value={code} disabled={disabled} title={conflict ?? undefined}>
                  {selectionLineLabel(option)} · {marketOdds(option).toFixed(2)}{disabled ? ' · unavailable' : ''}
                </option>
              );
            })}
          </select>
        </div>
      );
    }

    const normalizedLabel = label.toUpperCase().replace(/\s+/g, ' ');
    const tone = /^(1|1X)$/.test(normalizedLabel)
      ? 'text-primary'
      : /^(X|12|YES \(GG\))$/.test(normalizedLabel)
        ? (normalizedLabel === 'YES (GG)' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')
        : /^(2|X2|NO \(NG\))$/.test(normalizedLabel)
          ? (normalizedLabel === 'NO (NG)' ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400')
          : index % 2 ? 'text-sky-600 dark:text-sky-400' : 'text-primary';

    return (
      <div key={label} className="grid min-w-0 grid-cols-1 gap-1">
        {options.map((selection, optionIndex) => {
          const odds = marketOdds(selection);
          const selectedPick = isSelected(selection);
          const conflict = compatibilityErrorForSelection(selection);
          const disabled = !selectedPick && Boolean(conflict);
          const optionLabel = options.length > 1
            ? marketSelectionName(selection)
            : label;
          return (
            <button
              key={`${selectionCodeOf(selection)}-${optionIndex}`}
              type="button"
              onClick={() => addSelection(selection)}
              disabled={disabled}
              aria-label={`${optionLabel}, odds ${odds.toFixed(2)} for ${homeName} versus ${awayName}`}
              aria-disabled={disabled}
              title={conflict ?? `${optionLabel} · ${odds.toFixed(2)}`}
              className={`flex min-h-7 min-w-0 items-center justify-between gap-1 rounded-md border px-1.5 py-0.5 text-left transition sm:min-h-8 ${selectedPick ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/20' : disabled ? 'cursor-not-allowed border-border/45 bg-muted/35 opacity-35' : 'border-border/75 bg-background/75 hover:border-primary/35 hover:bg-primary/5'}`}
            >
              <strong className="mx-auto shrink-0 text-[9px] font-black tabular-nums sm:text-[10px]">
                {odds.toFixed(2)}
              </strong>
            </button>
          );
        })}
      </div>
    );
  }

  const statusTone = live
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    : status === 'FINISHED'
      ? 'bg-muted text-muted-foreground'
      : status === 'POSTPONED' || status === 'CANCELLED'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
        : 'bg-muted text-muted-foreground';

  return (
    <>
      <article
        ref={containerRef}
        className={`min-w-0 px-2 py-1.5 transition sm:px-2.5 ${selected ? 'bg-primary/[0.055]' : 'hover:bg-muted/20'}`}
      >
        <div className="mb-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 border-b border-border/45 pb-1">
          <BetLabLogo src={leagueLogo} name={leagueName} sizeClassName="h-4 w-4" shape="rounded" fallbackClassName="border-0 bg-transparent text-muted-foreground" />
          <span title={leagueName} className="min-w-0 max-w-[48%] truncate text-[8px] font-bold text-foreground/85 sm:text-[9px]">{leagueName}</span>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide ${statusTone}`}>
            {live ? <span className="h-1 w-1 animate-pulse rounded-full bg-current" /> : null}
            {statusLabel(status, presentation)}
            {liveClock ? <span className="font-semibold opacity-80">{liveClock}</span> : null}
          </span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[8px] font-semibold tabular-nums text-muted-foreground">
            <FaClock className="h-2.5 w-2.5 opacity-70" /> {kickoff}
          </span>
          <button
            type="button"
            onClick={() => guestMode ? onRequestAccess?.() : setStatsOpen(true)}
            aria-label={guestMode ? 'Unlock match statistics' : `View ${homeName} versus ${awayName} statistics`}
            title="Match statistics"
            className="inline-flex h-5 shrink-0 items-center gap-1 rounded-md border border-sky-500/25 bg-sky-500/[0.07] px-1.5 text-[7px] font-extrabold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
          >
            {guestMode ? <FaLock className="h-2.5 w-2.5" /> : <FaChartSimple className="h-2.5 w-2.5" />}
            Stats
          </button>
        </div>

        <div className="grid min-w-0 grid-cols-1 items-center gap-1.5 sm:grid-cols-[minmax(0,0.9fr)_minmax(150px,1.1fr)] sm:gap-2">
          <button type="button" onClick={() => onSelect(eventId)} className="flex min-w-0 flex-col gap-1 border-b border-border/35 pb-1 text-left sm:border-0 sm:pb-0">
            <span className="flex min-w-0 items-center gap-1.5">
              <BetLabLogo src={homeLogo} name={homeName} sizeClassName="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="min-w-0 flex-1 truncate text-[9px] font-semibold sm:text-[10px]">{homeName}</span>
              <strong className="w-4 shrink-0 text-right text-[9px] font-extrabold tabular-nums text-foreground/90 sm:text-[10px]">{homeScore}</strong>
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <BetLabLogo src={awayLogo} name={awayName} sizeClassName="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="min-w-0 flex-1 truncate text-[9px] font-semibold sm:text-[10px]">{awayName}</span>
              <strong className="w-4 shrink-0 text-right text-[9px] font-extrabold tabular-nums text-foreground/90 sm:text-[10px]">{awayScore}</strong>
            </span>
          </button>

          <div
            className="grid min-w-0 items-center gap-1"
            style={{ gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, minmax(0, 1fr))` }}
          >
            {guestMode ? (
              categories.length ? categories.map((category, index) => renderCategory(category, index)) : (
                <button type="button" onClick={onRequestAccess} className="col-span-full flex h-7 items-center justify-center gap-1 rounded-md border border-primary/20 bg-primary/[0.045] text-[9px] font-semibold text-primary"><FaLock className="h-2.5 w-2.5" /> Unlock markets</button>
              )
            ) : oddsQuery.isLoading || (nearViewport && !oddsQuery.data && oddsQuery.isFetching) ? (
              Array.from({ length: Math.max(selectionHeaders.length, 2) }).map((_, index) => <span key={index} className="h-7 animate-pulse rounded-md bg-muted sm:h-8" />)
            ) : oddsQuery.isError ? (
              <span className="col-span-full py-1.5 text-center text-[8px] text-muted-foreground">Prices unavailable</span>
            ) : !nearViewport ? (
              <span className="col-span-full py-1.5 text-center text-[8px] text-muted-foreground">Prices load on view</span>
            ) : oddsSnapshotExpired ? (
              <span className="col-span-full py-1.5 text-center text-[8px] text-muted-foreground">Odds expired. Waiting for a fresh quote.</span>
            ) : selections.length ? (
              categories.map((category, index) => renderCategory(category, index))
            ) : (
              <span className="col-span-full py-1.5 text-center text-[8px] text-muted-foreground">No {marketName.toLowerCase()} prices</span>
            )}
          </div>
        </div>
      </article>

      {!guestMode ? (
        <FixtureStatsDialog
          open={statsOpen}
          fixture={fixture}
          presentation={presentation}
          onClose={() => setStatsOpen(false)}
        />
      ) : null}
    </>
  );
}




