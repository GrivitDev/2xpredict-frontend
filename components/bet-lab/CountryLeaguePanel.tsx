'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaChevronDown,
  FaChevronRight,
  FaGlobe,
  FaLock,
  FaMagnifyingGlass,
  FaXmark,
} from 'react-icons/fa6';
import useBetLabScrollLock from './use-bet-lab-scroll-lock';
import type { CountryGroup, LeagueGroup } from './bet-lab.utils';
import BetLabLogo from './BetLabLogo';

type Props = {
  countries: CountryGroup[];
  selectedCountry: string;
  selectedLeagueId: string;
  mobileOpen: boolean;
  guestMode?: boolean;
  onSelectCountry: (countryKey: string) => void;
  onSelectAll: () => void;
  onSelectLeague: (countryKey: string, league: LeagueGroup) => void;
  onRequestAccess?: () => void;
  onCloseMobile: () => void;
};

export default function CountryLeaguePanel({
  countries,
  selectedCountry,
  selectedLeagueId,
  mobileOpen,
  guestMode = false,
  onSelectCountry,
  onSelectAll,
  onSelectLeague,
  onRequestAccess,
  onCloseMobile,
}: Props) {
  const [search, setSearch] = useState('');
  const [expandedCountry, setExpandedCountry] = useState(selectedCountry);

  useBetLabScrollLock(mobileOpen);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return countries;

    return countries.filter((country) =>
      country.name.toLocaleLowerCase().includes(query) ||
      country.leagues.some((league) => league.name.toLocaleLowerCase().includes(query)),
    );
  }, [countries, search]);

  const totalLeagues = countries.reduce((sum, country) => sum + country.leagues.length, 0);
  const totalMatches = countries.reduce((sum, country) => sum + country.matchCount, 0);

  const selectCountry = (country: CountryGroup) => {
    setExpandedCountry(country.key);
    onSelectCountry(country.key);
    onCloseMobile();
  };

  const selectLeague = (countryKey: string, league: LeagueGroup) => {
    if (guestMode) {
      onRequestAccess?.();
      return;
    }

    onSelectLeague(countryKey, league);
    onCloseMobile();
  };

  const content = (
    <>
      <div className="shrink-0 border-b border-border/70 px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight">
            <FaGlobe className="h-3 w-3 text-primary" /> Countries & leagues
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[8px] font-extrabold tabular-nums text-primary">
              {countries.length}
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close country selector"
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted xl:hidden"
            >
              <FaXmark className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px] font-semibold">
          <span className="text-muted-foreground">{totalLeagues} leagues</span>
          <span className="text-emerald-700 dark:text-emerald-300">{totalMatches} matches</span>
        </div>

        <label className="mt-1.5 flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-background/65 px-2">
          <FaMagnifyingGlass className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search countries or leagues"
            aria-label="Search countries and leagues"
            className="min-w-0 flex-1 bg-transparent text-[9px] outline-none placeholder:text-muted-foreground/70"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground"
            >
              <FaXmark className="h-2.5 w-2.5" />
            </button>
          ) : null}
        </label>
      </div>

      <div className="max-h-[calc(100dvh-180px)] space-y-0.5 overflow-y-auto overscroll-y-contain p-1 xl:max-h-none xl:overflow-visible xl:overscroll-auto">
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
            {totalMatches}
          </span>
        </button>

        {filteredCountries.length ? (
          filteredCountries.map((country) => {
            const expanded = expandedCountry === country.key || Boolean(search.trim());
            const countrySelected = selectedCountry === country.key && !selectedLeagueId;
            const lockedCount = country.leagues.filter((league) => guestMode || !league.isOpen).length;

            return (
              <section
                key={country.key}
                className="overflow-hidden rounded-md border border-border/65 bg-background/30"
              >
                <div className={`flex min-h-7 items-center gap-1 px-1 ${countrySelected ? 'bg-primary/10' : ''}`}>
                  <button
                    type="button"
                    onClick={() => selectCountry(country)}
                    className="flex min-w-0 flex-1 items-center gap-1 text-left"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                      <FaGlobe className="h-2.5 w-2.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-semibold">{country.name}</span>
                      <span className="flex flex-wrap items-center gap-x-2.5 text-[9px] font-semibold">
                        <span className="text-muted-foreground">
                          <strong className="font-extrabold text-foreground">{country.leagues.length}</strong> leagues
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300">
                          <strong className="font-extrabold">{country.matchCount}</strong> matches
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
                    onClick={() => setExpandedCountry(expanded ? '' : country.key)}
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
                      const locked = guestMode || !league.isOpen;

                      return (
                        <button
                          key={league.id}
                          type="button"
                          onClick={() => selectLeague(country.key, league)}
                          className={`flex min-h-6 w-full items-center gap-1 rounded px-0.5 text-left transition ${
                            active
                              ? 'bg-primary/10 text-foreground'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          }`}
                        >
                          <BetLabLogo
                            src={league.logo}
                            name={league.name}
                            sizeClassName="h-4 w-4"
                            shape="rounded"
                            fallbackClassName="border-0 bg-transparent text-muted-foreground"
                          />
                          <span title={league.name} className="min-w-0 flex-1 truncate text-[10px] font-medium">
                            {league.name}
                          </span>
                          <span className="rounded bg-emerald-500/10 px-1.5 text-[7px] font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                            {league.fixtures.length}
                          </span>
                          {locked ? (
                            <FaLock
                              aria-label="Locked league"
                              className="h-2 w-2 shrink-0 text-amber-600 dark:text-amber-400"
                            />
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
          <div className="px-2 py-6 text-center text-[10px] leading-4 text-muted-foreground">
            No countries or leagues match this search.
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden min-w-0 rounded-lg border border-border/80 bg-card/80 shadow-[0_5px_18px_rgba(0,0,0,0.05)] backdrop-blur-xl xl:block">
        {content}
      </aside>

      {mobileOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] flex xl:hidden"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) onCloseMobile();
              }}
            >
              <aside className="flex h-dvh max-h-dvh w-[min(88vw,360px)] flex-col overflow-hidden border-r border-border bg-card shadow-2xl">
                {content}
              </aside>
              <button
                type="button"
                aria-label="Close country selector"
                onClick={onCloseMobile}
                className="flex-1 bg-slate-950/55 backdrop-blur-sm"
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

