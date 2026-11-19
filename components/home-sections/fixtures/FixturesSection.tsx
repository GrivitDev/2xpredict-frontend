'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  useGetV2CompetitionsQuery,
  useGetV2FixturesQuery,
  useGetV2TeamsQuery,
} from '@/hooks/use-sports';
import type {
  SportsFixture as SportsV2Fixture,
  SportsTeam,
} from '@/types/sports-v2';
import HomeDateSelector from '../HomeDateSelector';
import LeagueSelector from '../LeagueSelector';
import {
  createCompetitionLookup,
  findCompetition,
  leagueFilterId,
  resolveLeagueLogo,
  resolveLeagueName,
  type HomeLeague,
} from '../league-display';

type FixtureStatus = 'LIVE' | 'UPCOMING' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'SUSPENDED' | 'UNKNOWN';
type TeamSide = 'HOME' | 'AWAY';

const day = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const shift = (value: string, offset: number) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return day(date);
};
const ordinal = (value: number) => {
  const mod100 = value % 100;
  return `${value}${mod100 >= 11 && mod100 <= 13 ? 'th' : value % 10 === 1 ? 'st' : value % 10 === 2 ? 'nd' : value % 10 === 3 ? 'rd' : 'th'}`;
};
const dateChipLabel = (value: string, today: string) => {
  const diff = Math.round((new Date(`${value}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  const date = new Date(`${value}T12:00:00`);
  return `${ordinal(date.getDate())} ${new Intl.DateTimeFormat('en-NG', { weekday: 'short' }).format(date)}`;
};

function localDayBounds(value: string) {
  const from = new Date(`${value}T00:00:00`);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  to.setMilliseconds(to.getMilliseconds() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function firstText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function logoUrl(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) return null;
  if (typeof value === 'string') {
    const candidate = value.trim().replace(/^http:\/\//i, 'https://');
    if (candidate.startsWith('//')) return `https:${candidate}`;
    return /^(https?:\/\/|\/|data:image\/)/i.test(candidate) ? candidate : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logoUrl(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const record = asRecord(value);
  for (const key of ['href', 'url', 'src', 'imageUrl', 'logoUrl', 'logo', 'logos', 'crest', 'badge', 'emblem', 'image', 'images']) {
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
      {src?.trim() ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
          className="absolute inset-0 h-full w-full bg-card object-contain"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
      ) : null}
    </span>
  );
}

function fixtureTeam(fixture: SportsV2Fixture, side: TeamSide, teamsById: Map<string, SportsTeam>) {
  const competitor = fixture.competitors.find((item) => item.homeAway === side);
  if (!competitor) return { name: side === 'HOME' ? 'Home' : 'Away', logo: null as string | null, score: null as number | null };

  const team = teamsById.get(competitor.teamId);
  const raw = asRecord(competitor.rawPayload);
  const rawTeam = asRecord(raw.team ?? raw.competitor ?? raw);
  const name = firstText(
    team?.displayName,
    team?.name,
    team?.shortName,
    rawTeam.displayName,
    rawTeam.fullName,
    rawTeam.name,
    rawTeam.shortDisplayName,
    rawTeam.shortName,
    competitor.teamId,
  ) ?? (side === 'HOME' ? 'Home' : 'Away');
  const logo = team?.logo ?? logoUrl(rawTeam.logo ?? rawTeam.logos ?? rawTeam.crest ?? rawTeam.emblem);
  const score = competitor.score === null || competitor.score === undefined || !Number.isFinite(Number(competitor.score))
    ? null
    : Number(competitor.score);

  return { name, logo, score };
}

function statusFor(fixture: SportsV2Fixture): FixtureStatus {
  switch (fixture.status.state) {
    case 'LIVE':
    case 'HALFTIME':
    case 'EXTRA_TIME':
    case 'PENALTIES':
      return 'LIVE';
    case 'COMPLETED':
      return 'FINISHED';
    case 'SCHEDULED':
      return 'UPCOMING';
    case 'POSTPONED':
      return 'POSTPONED';
    case 'CANCELLED':
    case 'ABANDONED':
      return 'CANCELLED';
    default:
      return 'UNKNOWN';
  }
}

function statusLabel(fixture: SportsV2Fixture, status: FixtureStatus): string {
  switch (fixture.status.state) {
    case 'HALFTIME': return 'Half-time';
    case 'EXTRA_TIME': return 'Extra time';
    case 'PENALTIES': return 'Penalties';
    default:
      if (status === 'FINISHED') return 'Finished';
      if (status === 'LIVE') return 'Live';
      if (status === 'UPCOMING') return 'Upcoming';
      if (status === 'POSTPONED') return 'Postponed';
      if (status === 'CANCELLED') return 'Canceled';
      return '—';
  }
}

function Status({ value, label, detail }: { value: FixtureStatus; label: string; detail?: string }) {
  const live = value === 'LIVE';
  const finished = value === 'FINISHED';
  const exceptional = value === 'POSTPONED' || value === 'CANCELLED' || value === 'SUSPENDED';
  return (
    <span title={`${value.replace(/_/g, ' ')}${detail ? ` · ${detail}` : ''}`} className={`inline-flex min-w-[54px] max-w-full items-center justify-center gap-1 rounded-full px-1 py-1 text-[8px] font-bold tracking-normal sm:min-w-[68px] sm:px-1.5 sm:text-[9px] ${live ? 'bg-rose-500/10 text-rose-600' : finished ? 'bg-emerald-500/10 text-emerald-600' : exceptional ? 'bg-orange-500/10 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
      {live ? <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-current" /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

export default function FixturesSection({
  initialSearchQuery = '',
  title = 'Fixtures',
  subtitle = 'Match schedules, live action and final scores.',
}: {
  initialSearchQuery?: string;
  title?: string;
  subtitle?: string;
}) {
  const today = day(new Date());
  const dates = Array.from({ length: 9 }, (_, index) => shift(today, index - 3));
  const [date, setDate] = useState(today);
  const [league, setLeague] = useState('ALL');
  const bounds = useMemo(() => localDayBounds(date), [date]);
  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: true, limit: 1000 } },
    { staleTime: 30 * 60_000, retry: 1, refetchOnWindowFocus: false },
  );
  const fixturesQuery = useGetV2FixturesQuery(
    { query: { ...bounds, limit: 500 } },
    {
      staleTime: 2 * 60_000,
      refetchInterval: 3 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const fixtures = useMemo(
    () => [...(fixturesQuery.data?.items ?? [])].sort(
      (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
    ),
    [fixturesQuery.data?.items],
  );
  const competitions = useMemo(() => competitionsQuery.data ?? [], [competitionsQuery.data]);
  const leagueById = useMemo(() => createCompetitionLookup(competitions), [competitions]);
  const teamsQuery = useGetV2TeamsQuery(
    { query: {} },
    {
      staleTime: 30 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
  const teams: SportsTeam[] = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
  const teamsById = useMemo(() => {
    const map = new Map<string, SportsTeam>();
    for (const team of teams) {
      map.set(team.id, team);
      if (team.espnId) map.set(team.espnId, team);
    }
    return map;
  }, [teams]);

  const leagues = useMemo<HomeLeague[]>(() => {
    const map = new Map<string, HomeLeague>();
    for (const fixture of fixtures) {
      const sourceId = fixture.competitionId;
      if (!sourceId) continue;
      const competition = findCompetition(leagueById, sourceId, fixture.espnCompetitionId);
      const id = leagueFilterId(sourceId, competition);
      if (!id) continue;
      map.set(id, {
        id,
        name: resolveLeagueName(competition?.slug ?? sourceId, [
          competition?.displayName,
          competition?.name,
          competition?.slug,
        ]),
        logo: resolveLeagueLogo(competition?.logo),
      });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [fixtures, leagueById]);

  const effectiveLeague = league !== 'ALL' && !leagues.some((item) => item.id === league) ? 'ALL' : league;

  const normalizedSearch = initialSearchQuery.trim().toLocaleLowerCase();
  const visible = useMemo(() => fixtures.filter((fixture) => {
    const competition = findCompetition(leagueById, fixture.competitionId, fixture.espnCompetitionId);
    if (effectiveLeague !== 'ALL' && leagueFilterId(fixture.competitionId, competition) !== effectiveLeague) return false;
    if (!normalizedSearch) return true;

    const home = fixtureTeam(fixture, 'HOME', teamsById);
    const away = fixtureTeam(fixture, 'AWAY', teamsById);
    const searchable = [
      home.name,
      away.name,
      competition?.displayName,
      competition?.name,
      competition?.slug,
      fixture.id,
    ].filter(Boolean).join(' ').toLocaleLowerCase();
    return searchable.includes(normalizedSearch);
  }), [effectiveLeague, fixtures, leagueById, normalizedSearch, teamsById]);

  const loading = fixturesQuery.isLoading || competitionsQuery.isLoading || teamsQuery.isLoading;

  return (
    <section className="px-2.5 py-2 sm:px-5 sm:py-3">
      <div className="mx-auto max-w-6xl">
        <header className="mb-1 text-center">
          <h2 className="font-serif text-2xl font-semibold italic tracking-tight text-primary sm:text-3xl">{title}</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">{subtitle}</p>
        </header>

        <HomeDateSelector
          dates={dates}
          selected={date}
          today={today}
          onSelect={setDate}
          getLabel={dateChipLabel}
          showCalendarIcon
          className="mb-1.5"
        />

        <LeagueSelector
          leagues={leagues}
          selected={league}
          onSelect={setLeague}
          allLabel="All"
          className="mb-2"
        />

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-5 text-center text-xs text-muted-foreground">Loading fixtures…</div>
        ) : fixturesQuery.isError ? (
          <div className="rounded-lg border border-border bg-card p-5 text-center text-xs">Fixtures are temporarily unavailable.</div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-5 text-center text-xs text-muted-foreground">{normalizedSearch ? `No fixtures match “${initialSearchQuery.trim()}” on this date.` : 'No fixtures available for this date.'}</div>
        ) : (
          <div className="w-full overflow-hidden rounded-lg border border-border/70 bg-card">
            <div className="grid grid-cols-[34px_minmax(0,1fr)_minmax(0,1fr)_58px] items-center gap-1 border-b border-border bg-muted/40 px-1.5 py-1 text-[8px] font-bold uppercase tracking-wide text-muted-foreground sm:grid-cols-[58px_minmax(0,1fr)_minmax(0,1fr)_76px_minmax(76px,.7fr)] sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[9px]">
              <span>Time</span><span>Home</span><span>Away</span><span>Status</span><span className="hidden sm:block">Venue</span>
            </div>
            <div className="divide-y divide-border/60">
              {visible.map((fixture, index) => {
                const kickoff = new Date(fixture.kickoffAt);
                const status = statusFor(fixture);
                const label = statusLabel(fixture, status);
                const home = fixtureTeam(fixture, 'HOME', teamsById);
                const away = fixtureTeam(fixture, 'AWAY', teamsById);
                const showScore = status === 'LIVE' || status === 'FINISHED';
                const homeScore = showScore ? (home.score ?? '–') : '–';
                const awayScore = showScore ? (away.score ?? '–') : '–';
                const time = Number.isNaN(kickoff.getTime()) ? '—' : kickoff.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
                const venue = firstText(asRecord(fixture.rawPayload).venueName, asRecord(asRecord(fixture.rawPayload).venue).fullName) ?? '—';
                const detail = fixture.status.displayClock ?? fixture.status.shortDescription ?? fixture.status.description;

                return (
                  <Link
                    key={fixture.id}
                    href={`/matches/${encodeURIComponent(fixture.id)}`}
                    aria-label={`${home.name} versus ${away.name}, ${label}. View match details.`}
                    className="grid grid-cols-[34px_minmax(0,1fr)_minmax(0,1fr)_58px] items-center gap-1 px-1.5 py-1.5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:grid-cols-[58px_minmax(0,1fr)_minmax(0,1fr)_76px_minmax(76px,.7fr)] sm:gap-2 sm:px-3 sm:py-1.5"
                  >
                    <span className="text-[9px] font-bold tabular-nums sm:text-[10px]">{time}</span>
                    <div className="flex min-w-0 items-center gap-1">
                      <Logo src={home.logo} name={home.name} size="h-3.5 w-3.5 sm:h-5 sm:w-5" eager={index < 5} />
                      <span className="min-w-0 flex-1 truncate text-[9px] font-semibold leading-tight sm:text-[11px]">{home.name}</span>
                      <strong className="shrink-0 text-[10px] font-bold tabular-nums sm:text-[11px]">{homeScore}</strong>
                    </div>
                    <div className="flex min-w-0 items-center justify-end gap-1">
                      <strong className="shrink-0 text-[10px] font-bold tabular-nums sm:text-[11px]">{awayScore}</strong>
                      <span className="min-w-0 flex-1 truncate text-right text-[9px] font-semibold leading-tight sm:text-[11px]">{away.name}</span>
                      <Logo src={away.logo} name={away.name} size="h-3.5 w-3.5 sm:h-5 sm:w-5" eager={index < 5} />
                    </div>
                    <div className="min-w-0"><Status value={status} label={label} detail={detail} /></div>
                    <span className="hidden min-w-0 truncate text-[8px] text-muted-foreground sm:block sm:text-[10px]" title={venue}>{venue}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
