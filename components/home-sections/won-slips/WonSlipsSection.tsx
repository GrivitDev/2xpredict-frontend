'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaChevronUp, FaTrophy } from 'react-icons/fa6';
import { useListSlipsQuery } from '@/hooks/use-prediction-access';
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

type Row = {
  [key: string]: unknown;
  _id?: string;
  name?: string;
  slipCode?: string;
  status?: string;
  settlementStatus?: string;
  legs?: Row[];
  combinedOdds?: number | string;
  odds?: number | string;
  combinedFairOdds?: number | string;
  eventId?: string | number;
  fixtureDate?: string;
  leagueId?: string | number;
  leagueName?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeScore?: string | number;
  awayScore?: string | number;
  marketName?: string;
  selectionName?: string;
  settlementOutcome?: string;
};

function identifier(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'object' || value === null) return undefined;

  const record = value as Record<string, unknown>;
  for (const key of ['id', 'teamId', 'espnId', 'uid', 'competitionId', 'leagueId']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return String(candidate);
  }
  return undefined;
}

function displayText(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'object' || value === null) return undefined;

  const record = value as Record<string, unknown>;
  for (const key of ['name', 'displayName', 'countryName', 'title', 'code']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return undefined;
}

const asRows = (value: unknown): Row[] => {
  if (Array.isArray(value)) return value as Row[];
  if (typeof value !== 'object' || value === null) return [];
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items as Row[];
  if (Array.isArray(record.data)) return record.data as Row[];
  if (typeof record.data === 'object' && record.data !== null) {
    const data = record.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items as Row[];
  }
  if (Array.isArray(record.results)) return record.results as Row[];
  if (Array.isArray(record.leagues)) return record.leagues as Row[];
  return [];
};

const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const shift = (value: string, amount: number) => { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + amount); return key(date); };
const ordinal = (value: number) => { const mod100 = value % 100; return `${value}${mod100 >= 11 && mod100 <= 13 ? 'th' : value % 10 === 1 ? 'st' : value % 10 === 2 ? 'nd' : value % 10 === 3 ? 'rd' : 'th'}`; };
const dateChipLabel = (value: string, today: string) => {
  const diff = Math.round((new Date(`${value}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  const date = new Date(`${value}T12:00:00`);
  return `${ordinal(date.getDate())} ${new Intl.DateTimeFormat('en-NG', { weekday: 'short' }).format(date)}`;
};
const fullDate = (value: string) => new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
function logoUrl(value: unknown, depth = 0): string | null {
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
  const record = value as Record<string, unknown>;
  for (const key of ['href', 'url', 'src', 'imageUrl', 'logoUrl']) {
    const found = logoUrl(record[key], depth + 1);
    if (found) return found;
  }
  for (const key of ['logo', 'logos', 'crest', 'badge', 'emblem', 'image', 'images', 'icon']) {
    const found = logoUrl(record[key], depth + 1);
    if (found) return found;
  }
  return null;
}

const initials = (value?: string) => (value ?? '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase() || '?';

function Logo({ src, name, size = 'h-6 w-6', eager = false }: { src?: string | null; name?: string; size?: string; eager?: boolean }) {
  return (
    <span className={`${size} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[8px] font-bold text-muted-foreground`}>
      {initials(name)}
      {src?.trim() ? <Image src={src} alt="" fill unoptimized sizes="24px" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} className="bg-card object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
    </span>
  );
}

export default function WonSlipsSection() {
  const today = key(new Date());
  const [date, setDate] = useState(shift(today, -1));
  const [league, setLeague] = useState('ALL');
  const [expanded, setExpanded] = useState(false);

  const query = useListSlipsQuery(
    { query: { from: date, to: date, page: 1, pageSize: 100 } },
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

  const options = Array.from({ length: 9 }, (_, index) => shift(today, index - 8));
  const slips = useMemo(() => (query.data?.items ?? []).filter((slip) =>
    String(slip.settlementStatus ?? '').toUpperCase() === 'WON',
  ) as unknown as Row[], [query.data?.items]);
  const fixtureRefs = useMemo(() => slips.flatMap((slip: Row) => (slip.legs ?? []).map((leg: Row) => ({
    eventId: identifier(leg.eventId),
    fixtureDate: leg.fixtureDate,
    leagueId: identifier(leg.leagueId),
    leagueName: leg.leagueName,
    leagueCountry: displayText(leg.country ?? leg.leagueCountry),
    homeTeamId: identifier(leg.homeTeamId),
    awayTeamId: identifier(leg.awayTeamId),
    homeTeamName: leg.homeTeamName,
    awayTeamName: leg.awayTeamName,
    homeTeamLogo: logoUrl(leg.homeTeamLogo),
    awayTeamLogo: logoUrl(leg.awayTeamLogo),
    fixtureRecord: leg, summaryRecord: leg.summary,
  }))), [slips]);
  const presentations = useMatchPresentation(fixtureRefs);

  const leagues = useMemo(() => {
    const map = new Map<string, { id: string; name: string; logo?: string | null; country?: string | null }>();

    for (const slip of slips) {
      for (const leg of slip.legs ?? []) {
        const presentation = presentations.get(String(leg.eventId));
        const sourceId = leg.leagueId ?? presentation?.leagueId;
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
            leg.leagueName,
            presentation?.leagueName,
            existing?.name,
          ]),
          country: presentation?.leagueCountry ?? competition?.country ?? null,
          logo: resolveLeagueLogo(
            leg.leagueLogo,
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
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [slips, presentations, leagueById]);

  const selectedLeague = league === 'ALL' || leagues.some((item) => item.id === league) ? league : 'ALL';

  const visibleSlips = slips.filter((slip) => selectedLeague === 'ALL' || (slip.legs ?? []).some((leg) => {
    const sourceId = leg.leagueId ?? presentations.get(String(leg.eventId))?.leagueId;
    const competition = findCompetition(leagueById, sourceId);
    return leagueFilterId(sourceId, competition) === league;
  }));
  const displayedSlips = expanded ? visibleSlips : visibleSlips.slice(0, 3);

  return (
    <section className="px-2.5 py-1.5 sm:px-5 sm:py-2">
      <div className="mx-auto max-w-[1600px]">
        <HomeDateSelector
          dates={options}
          selected={date}
          today={today}
          onSelect={setDate}
          getLabel={dateChipLabel}
          className="mb-1"
        />

        <LeagueSelector
          leagues={leagues}
          selected={selectedLeague}
          onSelect={setLeague}
          allLabel="All"
          className="mb-1.5"
        />

        {query.isLoading ? (
          <div className="rounded-lg border border-border/70 bg-card p-4 text-center text-xs text-muted-foreground">Loading won slips…</div>
        ) : query.isError ? (
          <div className="rounded-lg border border-border/70 bg-card p-4 text-center text-xs text-muted-foreground">Won slips are temporarily unavailable.</div>
        ) : visibleSlips.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">No winning slips found for {fullDate(date)}.</div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 xl:grid-cols-3">
            {displayedSlips.map((slip, slipIndex) => (
              <article key={slip._id} className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/25 px-2.5 py-1.5">
                  <div className="min-w-0">
                    <p className="flex min-w-0 items-center gap-1 text-[10px] font-bold">
                      <FaTrophy className="shrink-0 text-status-success" />
                      <span className="truncate">{slip.name || slip.slipCode || 'Winning slip'}</span>
                    </p>
                    <p className="mt-0.5 truncate text-[8px] text-muted-foreground">{slip.slipCode || 'Settled combination'} · {(slip.legs ?? []).length} matches</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[8px] uppercase tracking-wide text-muted-foreground">{(slip.legs ?? []).some((leg: Row) => String(leg.priceType ?? '').toUpperCase() === 'ESTIMATED') ? 'Est. total odds' : 'Total odds'}</p>
                    <strong title={(slip.legs ?? []).some((leg: Row) => String(leg.priceType ?? '').toUpperCase() === 'ESTIMATED') ? 'At least one slip leg uses a Grivit estimate, not a bookmaker offer.' : 'Product of the stored slip-leg decimal prices.'} className="text-sm font-extrabold leading-none text-status-success">{Number(slip.combinedOdds ?? slip.odds ?? slip.combinedFairOdds ?? 0) > 0 ? `${(slip.legs ?? []).some((leg: Row) => String(leg.priceType ?? '').toUpperCase() === 'ESTIMATED') ? '~' : ''}${Number(slip.combinedOdds ?? slip.odds ?? slip.combinedFairOdds ?? 0).toFixed(2)}` : '—'}</strong>
                  </div>
                </div>

                <div className="divide-y divide-border/50 px-2.5">
                  {(slip.legs ?? []).map((leg, index) => {
                    const presentation = presentations.get(String(leg.eventId));
                    const homeName = resolveTeamDisplayName(presentation?.homeTeamName, leg.homeTeamName);
                    const awayName = resolveTeamDisplayName(presentation?.awayTeamName, leg.awayTeamName);
                    const sourceLeagueId = leg.leagueId ?? presentation?.leagueId ?? '';
                    const competition = findCompetition(leagueById, sourceLeagueId);
                    const leagueName = resolveLeagueName(sourceLeagueId, [
                      competition?.name,
                      competition?.displayName,
                      competition?.espnPayload?.displayName,
                      competition?.espnPayload?.name,
                      leg.leagueName,
                      presentation?.leagueName,
                    ]);
                    const leagueLogo = resolveLeagueLogo(
                      leg.leagueLogo,
                      competition?.logo,
                      competition?.logos,
                      competition?.emblem,
                      competition?.images,
                      competition?.espnPayload,
                      presentation?.leagueLogo,
                    );
                    const homeLogo = logoUrl(leg.homeTeamLogo ?? presentation?.homeTeamLogo);
                    const awayLogo = logoUrl(leg.awayTeamLogo ?? presentation?.awayTeamLogo);
                    const homeScore = presentation?.homeScore ?? leg.homeScore ?? '–';
                    const awayScore = presentation?.awayScore ?? leg.awayScore ?? '–';
                    return (
                      <div key={`${leg.eventId}-${index}`} className="py-1">
                        <div className="mb-0.5 flex min-w-0 items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1 text-[8px] font-semibold text-muted-foreground">
                            <Logo src={leagueLogo} name={leagueName} size="h-3.5 w-3.5" eager={slipIndex === 0} />
                            <span className="truncate">{leagueName}</span>
                          </span>
                          <span className="shrink-0 text-[8px] text-muted-foreground">
                            {leg.fixtureDate ? new Date(leg.fixtureDate).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>

                        <div className="flex min-w-0 items-center gap-1.5">
                          <div className="flex min-w-0 flex-1 items-center gap-1">
                            <Logo src={homeLogo} name={homeName} size="h-4 w-4" eager={slipIndex === 0} />
                            <span className="truncate text-[10px] font-bold">{homeName}</span>
                          </div>
                          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums">
                            {homeScore}<span className="px-0.5 text-muted-foreground">:</span>{awayScore}
                          </span>
                          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                            <span className="truncate text-right text-[10px] font-bold">{awayName}</span>
                            <Logo src={awayLogo} name={awayName} size="h-4 w-4" eager={slipIndex === 0} />
                          </div>
                        </div>

                        <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-[9px] text-muted-foreground">{leg.marketName ?? 'Market'} · {leg.selectionName ?? 'Selection'}</span>
                          <span className="shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-[8px] font-bold text-status-success">{leg.settlementOutcome ?? 'WON'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}

        {!query.isLoading && !query.isError && visibleSlips.length > 3 ? (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-4 py-1.5 text-[10px] font-bold text-muted-foreground transition hover:border-primary/40 hover:bg-muted hover:text-foreground"
            >
              {expanded ? 'Show less' : `Show all ${visibleSlips.length} slips`}
              {expanded ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
