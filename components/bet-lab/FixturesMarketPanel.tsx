'use client';

import { FaGlobe, FaLock, FaTicket } from 'react-icons/fa6';
import type { MatchPresentation } from '@/hooks/use-match-presentation';
import type { ApiRecord } from '@/lib/api-shapes';
import FixtureMarketRow from './FixtureMarketRow';
import MarketSelectionHeader from './MarketSelectionHeader';
import MarketSelector from './MarketSelector';
import {
  eventIdOf,
  marketCodeOf,
  marketSelectionHeaders,
  type TicketPick,
} from './bet-lab.utils';

type Props = {
  fixtures: ApiRecord[];
  presentations: Map<string, MatchPresentation>;
  selectedEventId: string;
  marketCatalog: ApiRecord[];
  fixturesLoading: boolean;
  fixturesHasMore?: boolean;
  fixturesLoadingMore?: boolean;
  onLoadMoreFixtures?: () => void;
  marketCatalogLoading: boolean;
  marketCatalogMessage?: string;
  activeMarketCode: string;
  picks: TicketPick[];
  selectedCountryLabel: string;
  guestMode?: boolean;
  onSelectEvent: (eventId: string) => void;
  onChangeMarket: (marketCode: string) => void;
  onAddPick: (pick: TicketPick) => void;
  onOpenCountrySelector: () => void;
  onOpenSlip: () => void;
  onRequestAccess: () => void;
};

export default function FixturesMarketPanel({
  fixtures,
  presentations,
  selectedEventId,
  marketCatalog,
  fixturesLoading,
  fixturesHasMore = false,
  fixturesLoadingMore = false,
  onLoadMoreFixtures,
  marketCatalogLoading,
  marketCatalogMessage,
  activeMarketCode,
  picks,
  selectedCountryLabel,
  guestMode = false,
  onSelectEvent,
  onChangeMarket,
  onAddPick,
  onOpenCountrySelector,
  onOpenSlip,
  onRequestAccess,
}: Props) {
  const activeMarket = marketCatalog.find((market) => marketCodeOf(market) === activeMarketCode);
  const selectionHeaders = marketSelectionHeaders(activeMarket);
  const slipMatchCount = new Set(picks.map((pick) => pick.eventId).filter(Boolean)).size;

  return (
    <section className="relative flex min-w-0 flex-col rounded-lg border border-border/80 bg-card shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-2 py-1 xl:hidden">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCountrySelector}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background/80 px-2 text-[9px] font-semibold transition hover:border-primary/40 hover:bg-primary/5"
          >
            <FaGlobe className="h-3 w-3 text-primary" /> Countries
          </button>
          <button
            type="button"
            onClick={() => guestMode ? onRequestAccess() : onOpenSlip()}
            aria-label={guestMode ? 'Unlock slips' : `View selections from ${slipMatchCount} matches`}
            className="relative inline-flex h-7 items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 text-[9px] font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/10"
          >
            {guestMode ? <FaLock className="h-3 w-3 text-primary" /> : <FaTicket className="h-3 w-3 text-primary" />}
            Slips
            {slipMatchCount > 0 && !guestMode ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-card bg-rose-600 px-1 text-[9px] font-bold leading-none text-white shadow-sm">
                {slipMatchCount}
              </span>
            ) : null}
          </button>
        </div>
        <span className="max-w-[40%] truncate text-[8px] font-semibold text-muted-foreground" title={selectedCountryLabel}>{selectedCountryLabel}</span>
      </div>

      <div className="sticky top-[58px] z-20 shrink-0 border-b border-border/60 bg-card/95 shadow-[0_4px_12px_rgba(0,0,0,0.035)] backdrop-blur-xl">
        <MarketSelector
          markets={marketCatalog}
          activeMarketCode={activeMarketCode}
          loading={marketCatalogLoading}
          locked={guestMode}
          emptyMessage={marketCatalogMessage}
          onSelect={onChangeMarket}
          onRequestAccess={onRequestAccess}
        />
        <MarketSelectionHeader selectionHeaders={selectionHeaders} />
      </div>

      <div className="min-w-0">
        {fixturesLoading ? (
          <div className="space-y-1 p-1.5">
            {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-[64px] animate-pulse rounded-lg bg-muted/65" />)}
          </div>
        ) : fixtures.length ? (
          <div className="divide-y divide-border/50">
            {fixtures.map((fixture, index) => {
              const eventId = eventIdOf(fixture) || String(index);
              return (
                <FixtureMarketRow
                  key={eventId}
                  fixture={fixture}
                  presentation={presentations.get(eventId)}
                  selected={selectedEventId === eventId}
                  activeMarket={activeMarket}
                  picks={picks}
                  selectionHeaders={selectionHeaders}
                  guestMode={guestMode}
                  onRequestAccess={onRequestAccess}
                  onSelect={onSelectEvent}
                  onAddPick={onAddPick}
                />
              );
            })}
          </div>
        ) : (
          <div className="px-3 py-7 text-center">
            <p className="text-xs font-semibold">No matches available</p>
            <p className="mt-1 text-[10px] leading-5 text-muted-foreground">There are no fixtures for this date and filter.</p>
          </div>
        )}
        {fixturesHasMore && onLoadMoreFixtures ? (
          <div className="border-t border-border/50 p-2 text-center">
            <button
              type="button"
              onClick={onLoadMoreFixtures}
              disabled={fixturesLoadingMore}
              className="rounded-md border border-border px-3 py-1.5 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-50"
            >
              {fixturesLoadingMore ? 'Loading more fixtures…' : 'Load more fixtures'}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}




