'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaChevronDown,
  FaChevronRight,
  FaFutbol,
  FaGlobe,
  FaLock,
  FaXmark,
} from 'react-icons/fa6';

export type PredictionLeagueItem = {
  id: string;
  name: string;
  count: number;
  locked: boolean;
  /** Number of predictions in this league hidden by the current plan. */
  lockedCount?: number;
  requiredPlan?: string | null;
  logo?: string | null;
  priority?: string;
};

export type PredictionCountryItem = {
  name: string;
  count: number;
  predictionLeagueCount: number;
  locked?: boolean;
  lockedLeagueCount?: number;
  requiredPlan?: string | null;
  leagues: PredictionLeagueItem[];
};

type Props = {
  countries: PredictionCountryItem[];
  selectedCountry: string;
  selectedLeagueId: string;
  mobileOpen: boolean;
  onSelectCountry: (country: string) => void;
  onSelectAll: () => void;
  onSelectLeague: (country: string, league: PredictionLeagueItem) => void;
  onCloseMobile: () => void;
};

function LeagueLogo({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <Image
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-4 w-4 shrink-0 object-contain"
        width={16}
        height={16}
        unoptimized
      />
    );
  }
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-background text-muted-foreground">
      <FaFutbol className="h-2.5 w-2.5" />
    </span>
  );
}

export default function PredictionCountryLeaguePanel({
  countries,
  selectedCountry,
  selectedLeagueId,
  mobileOpen,
  onSelectCountry,
  onSelectAll,
  onSelectLeague,
  onCloseMobile,
}: Props) {
  const [expandedCountry, setExpandedCountry] = useState(selectedCountry);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return countries;
    return countries.filter((country) =>
      country.name.toLocaleLowerCase().includes(query) ||
      country.leagues.some((league) => league.name.toLocaleLowerCase().includes(query)),
    );
  }, [countries, search]);

  const totalLeagues = countries.reduce((sum, country) => sum + country.predictionLeagueCount, 0);
  const totalPredictions = countries.reduce((sum, country) => sum + country.count, 0);

  const content = (
    <>
      <div className="border-b border-border/70 px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight">
            <FaGlobe className="h-3 w-3 text-primary" /> Countries & leagues
          </h2>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[8px] font-extrabold tabular-nums text-primary">
            {countries.length}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] font-semibold">
          <span className="text-muted-foreground">{totalLeagues} leagues</span>
          <span className="text-emerald-700 dark:text-emerald-300">{totalPredictions} predictions</span>
        </div>
      </div>

      <div className="max-h-[calc(100dvh-170px)] space-y-0.5 overflow-y-auto p-1 xl:max-h-[calc(100vh-132px)]">
        <button
          type="button"
          onClick={() => {
            onSelectAll();
            onCloseMobile();
          }}
          className={`flex min-h-8 w-full items-center gap-1.5 rounded-md border px-1.5 text-left transition ${
            !selectedCountry && !selectedLeagueId
              ? 'border-primary/35 bg-primary/10 text-primary'
              : 'border-transparent hover:bg-muted/60'
          }`}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded bg-primary/10 text-primary">
            <FaGlobe className="h-2.5 w-2.5" />
          </span>
          <span className="min-w-0 flex-1 text-[10px] font-semibold">All leagues</span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
            {totalPredictions}
          </span>
        </button>

        {filteredCountries.length ? (
          filteredCountries.map((country) => {
            const expanded = expandedCountry === country.name || Boolean(search.trim());
            const countrySelected = selectedCountry === country.name && !selectedLeagueId;
            const lockedCount = country.lockedLeagueCount ?? country.leagues.filter((league) => league.locked).length;
            return (
              <section
                key={country.name}
                className="overflow-hidden rounded-md border border-border/65 bg-background/30"
              >
                <div className={`flex min-h-7 items-center gap-1 px-1 ${countrySelected ? 'bg-primary/10' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedCountry(country.name);
                      onSelectCountry(country.name);
                      onCloseMobile();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-0.5 text-left"
                  >
                    <span className="flex h-3 w-4 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                      <FaGlobe className="h-3.5 w-2.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-semibold">{country.name}</span>
                      <span className=" flex flex-wrap items-center gap-x-2.5 text-[9px] font-semibold">
                        <span className="text-muted-foreground">
                          <strong className="font-extrabold text-foreground">{country.predictionLeagueCount}</strong> leagues
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300">
                          <strong className="font-extrabold">{country.count}</strong> predictions
                        </span>
                      </span>
                    </span>
                    {lockedCount > 0 ? (
                      <span
                        title={`${lockedCount} locked league${lockedCount === 1 ? '' : 's'}`}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded bg-amber-500/10 px-1 text-[8px] font-bold text-amber-700 dark:text-amber-300"
                      >
                        <FaLock className="h-2 w-2" /> {lockedCount}
                      </span>
                    ) : null}
                    {countrySelected ? <span className="h-1 w-1 rounded-full bg-primary" /> : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedCountry(expanded ? '' : country.name)}
                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${country.name}`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                  >
                    {expanded ? <FaChevronDown className="h-2 w-2" /> : <FaChevronRight className="h-2 w-2" />}
                  </button>
                </div>

                {expanded ? (
                  <div className="space-y-0.5 border-t border-border/55 p-1">
                    {country.leagues.map((league) => {
                      const active = league.id === selectedLeagueId;
                      const hiddenCount = league.lockedCount ?? (league.locked ? league.count : 0);
                      return (
                        <button
                          key={league.id}
                          type="button"
                          onClick={() => {
                            setExpandedCountry(country.name);
                            onSelectLeague(country.name, league);
                            onCloseMobile();
                          }}
                          className={`flex min-h-6 w-full items-center gap-0.5 rounded px-0.5 text-left transition ${
                            active
                              ? 'bg-primary/10 text-foreground'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          }`}
                        >
                          <LeagueLogo src={league.logo} />
                          <span title={league.name} className="min-w-0 flex-1 truncate text-[10px] font-medium">{league.name}</span>
                          <span className="rounded bg-emerald-500/10 px-1.5 text-[7px] font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                            {league.count}
                          </span>
                          {hiddenCount > 0 ? (
                            <span title={`${hiddenCount} prediction${hiddenCount === 1 ? '' : 's'} locked on your plan`} className="inline-flex shrink-0 items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                              <FaLock className="h-2 w-2" /> {hiddenCount}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })
        ) : (
          <div className="px-2 py-6 text-center text-[12px] leading-4 text-muted-foreground">
            No leagues with predictions were found for this date.
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-[66px] hidden min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card/80 shadow-[0_5px_18px_rgba(0,0,0,0.05)] backdrop-blur-xl xl:block">
        {content}
      </aside>

      {mobileOpen && typeof document !== 'undefined' ? createPortal(
        <div
          className="fixed inset-0 z-[9990] flex xl:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseMobile();
          }}
        >
          <aside className="flex h-full w-[min(88vw,360px)] flex-col overflow-hidden border-r border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-2.5 py-2">
              <p className="text-[10px] font-bold">Choose country or league</p>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close country selector"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <FaXmark className="h-3 w-3" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{content}</div>
          </aside>
          <button
            type="button"
            aria-label="Close country selector"
            onClick={onCloseMobile}
            className="flex-1 bg-black/55 backdrop-blur-[2px]"
          />
        </div>,
        document.body,
      ) : null}
    </>
  );
}

