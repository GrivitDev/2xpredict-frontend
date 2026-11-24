'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { IconType } from 'react-icons';
import {
  FaArrowRight,
  FaChartLine,
  FaCoins,
  FaFutbol,
  FaMagnifyingGlass,
  FaNewspaper,
  FaPlay,
  FaXmark,
} from 'react-icons/fa6';
import { sportsService } from '@/services/sports.service';
import { predictionEngineService } from '@/services/prediction-engine.service';
import { betLabService } from '@/services/bet-lab.service';
import { resolveLeagueDisplayName, resolveTeamDisplayName } from '@/hooks/use-match-presentation';

type SearchKind = 'page' | 'matches' | 'teams' | 'predictions' | 'news' | 'highlights' | 'bet-lab';
type SearchContext = 'all' | 'matches' | 'predictions' | 'news' | 'highlights' | 'bet-lab' | 'account' | 'admin' | 'pages';
type SearchResult = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
  searchText: string;
};
type RecordLike = Record<string, unknown>;

const PUBLIC_PAGES: SearchResult[] = [
  makePage('home', 'Home', 'Football home, scores and match coverage', '/'),
  makePage('predictions', 'Predictions', 'Football predictions and Pick Center', '/predictions'),
  makePage('bet-lab', 'Bet Lab', 'Virtual football simulator and wallet', '/bet-lab'),
  makePage('news', 'News', 'Latest football news and stories', '/news'),
  makePage('highlights', 'Highlights', 'Recent football match highlights', '/highlights'),
  makePage('matches', 'Matches', 'Live, upcoming and finished fixtures', '/matches'),
  makePage('account', 'Account', 'Profile, dashboard and account settings', '/profile'),
  makePage('subscriptions', 'Subscriptions', 'Plans, renewals and payments', '/subscriptions'),
  makePage('pricing', 'Pricing', 'Subscription plans and pricing', '/pricing'),
  makePage('bonuses', 'Bonuses', 'Available bonuses and rewards', '/bonuses'),
  makePage('referrals', 'Referrals', 'Referral links and rewards', '/referrals'),
  makePage('profile', 'Profile', 'Personal details and account settings', '/profile'),
  makePage('purchases', 'Purchases', 'Payment and purchase history', '/purchases'),
  makePage('notifications', 'Notifications', 'Your in-app notifications', '/notifications'),
  makePage('terms', 'Terms of Use', 'Terms for using 2xPredict', '/terms-of-use'),
  makePage('login', 'Sign In', 'Sign in to your 2xPredict account', '/login'),
  makePage('register', 'Create Account', 'Join 2xPredict', '/register'),
];

const ADMIN_PAGES: SearchResult[] = [
  makePage('admin-homepage', 'Home', 'Public homepage', '/'),
  makePage('admin-home', 'Admin dashboard', 'Administrative overview', '/admin'),
  makePage('admin-analytics', 'Website analytics', 'Traffic and user engagement', '/admin/website-analytics'),
  makePage('admin-monitor', 'System monitor', 'Backend health and module activity', '/admin/system-monitor'),
  makePage('admin-odds', 'Odds Center', 'Fixture odds collection and readiness', '/admin/odds-center'),
  makePage('admin-pick-center', 'Pick Center', 'Review market selections', '/admin/pick-center'),
  makePage('admin-predictions', 'Predictions Center', 'Published predictions and markets', '/admin/predictions-center'),
  makePage('admin-slips', 'Slip Center', 'Curated slips and products', '/admin/slip-center'),
  makePage('admin-users', 'Users', 'Manage platform users', '/admin/users'),
  makePage('admin-bonuses', 'Bonuses', 'Manage user bonuses', '/admin/bonuses'),
  makePage('admin-promos', 'Promos', 'Manage promotions', '/admin/promos'),
  makePage('admin-referrals', 'Referrals', 'Manage referral activity', '/admin/referrals'),
  makePage('admin-subscriptions', 'Plans & payments', 'Manage plans and payments', '/admin/subscriptions'),
  makePage('admin-ads', 'Ads', 'Manage advertising', '/admin/ads'),
];

const ACCOUNT_PATHS = ['/dashboard', '/profile', '/purchases', '/subscriptions', '/referrals', '/bonuses'];

function makePage(id: string, title: string, subtitle: string, href: string): SearchResult {
  return { id, kind: 'page', title, subtitle, href, searchText: `${title} ${subtitle}`.toLowerCase() };
}

function isRecord(value: unknown): value is RecordLike {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function displayValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (isRecord(value)) {
    for (const key of ['name', 'displayName', 'shortName', 'title', 'fullName', 'label']) {
      const found = value[key];
      if (typeof found === 'string' && found.trim()) return found.trim();
    }
  }
  return '';
}

function firstText(record: RecordLike, keys: string[]): string {
  for (const key of keys) {
    const text = displayValue(record[key]);
    if (text) return text;
  }
  return '';
}

function rowsFromResponse(value: unknown, preferredKeys: string[], depth = 0): RecordLike[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value) || depth > 4) return [];

  for (const key of preferredKeys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate.filter(isRecord);
  }

  for (const key of ['data', 'result', 'payload', 'response']) {
    const candidate: unknown = value[key];
    if (candidate && candidate !== value) {
      const rows = rowsFromResponse(candidate, preferredKeys, depth + 1);
      if (rows.length) return rows;
    }
  }
  return [];
}

function flattenSearchText(value: unknown, depth = 0, key = ''): string[] {
  if (depth > 4 || /(^|_)(logo|image|thumbnail|avatar|token|secret|password|odds|statistics|assets)(_|$)/i.test(key)) return [];
  if (typeof value === 'string') {
    const clean = value.trim();
    return clean && !/^https?:\/\//i.test(clean) ? [clean] : [];
  }
  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)];
  if (Array.isArray(value)) return value.slice(0, 20).flatMap((item) => flattenSearchText(item, depth + 1, key));
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([childKey, child]) => flattenSearchText(child, depth + 1, childKey)).slice(0, 100);
}

function externalHref(value: string): string | undefined {
  return /^https?:\/\//i.test(value) ? value : undefined;
}

function safeTeamName(value: unknown): string {
  const resolved = resolveTeamDisplayName(value);
  return resolved === 'Team name unavailable' ? '' : resolved;
}

function safeLeagueName(value: unknown): string {
  const resolved = resolveLeagueDisplayName(value);
  return resolved === 'League name unavailable' ? '' : resolved;
}

function makeMatchResult(record: RecordLike, id: string, index: number): SearchResult {
  const competitors = Array.isArray(record.competitors)
    ? record.competitors.filter(isRecord)
    : [];
  const homeCompetitor = competitors.find((item) => String(item.homeAway ?? '').toUpperCase() === 'HOME');
  const awayCompetitor = competitors.find((item) => String(item.homeAway ?? '').toUpperCase() === 'AWAY');
  const home = safeTeamName(firstText(record, ['homeTeamName', 'homeName', 'homeTeam', 'home']) || firstText(homeCompetitor ?? {}, ['displayName', 'name']));
  const away = safeTeamName(firstText(record, ['awayTeamName', 'awayName', 'awayTeam', 'away']) || firstText(awayCompetitor ?? {}, ['displayName', 'name']));
  const title = home && away
    ? `${home} vs ${away}`
    : firstText(record, ['eventName', 'shortName', 'name', 'title']) || 'Football fixture';
  const league = safeLeagueName(firstText(record, ['leagueName', 'competitionName', 'league']) || firstText(record, ['competitionId']));
  const date = firstText(record, ['kickoffAt', 'fixtureDate', 'matchDate', 'startTime', 'kickoff', 'date', 'dateUtc']);
  const subtitle = [league, date].filter(Boolean).join(' · ') || 'Match details and statistics';
  return {
    id: `match-${id || index}`,
    kind: 'matches',
    title,
    subtitle,
    href: id ? `/matches/${encodeURIComponent(id)}` : `/matches?q=${encodeURIComponent(title)}`,
    searchText: `${title} ${subtitle} ${flattenSearchText(record).join(' ')}`.toLowerCase(),
  };
}

function makeTeamResult(record: RecordLike, index: number): SearchResult {
  const id = firstText(record, ['id', 'teamId', 'espnId']);
  const title = firstText(record, ['displayName', 'name', 'shortName', 'abbreviation']) || 'Football team';
  const subtitle = [
    firstText(record, ['location']),
    firstText(record, ['country']),
    firstText(record, ['abbreviation']),
  ].filter(Boolean).join(' · ') || 'Team profile and recent matches';
  return {
    id: `team-${id || index}`,
    kind: 'teams',
    title,
    subtitle,
    href: id ? `/teams/${encodeURIComponent(id)}` : '/teams',
    searchText: `${title} ${subtitle} ${flattenSearchText(record).join(' ')}`.toLowerCase(),
  };
}

function makePredictionResult(record: RecordLike, index: number): SearchResult {
  const home = safeTeamName(firstText(record, ['homeTeamName', 'homeName', 'homeTeam']));
  const away = safeTeamName(firstText(record, ['awayTeamName', 'awayName', 'awayTeam']));
  const title = home && away ? `${home} vs ${away}` : firstText(record, ['eventName', 'name', 'title']) || 'Football prediction';
  const league = safeLeagueName(firstText(record, ['leagueName', 'competitionName']));
  const eventId = firstText(record, ['eventId', 'fixtureId', 'id', '_id']);
  const subtitle = [league, firstText(record, ['marketName', 'marketKey', 'selectionName'])].filter(Boolean).join(' · ') || 'Published prediction';
  return {
    id: `prediction-${eventId || index}`,
    kind: 'predictions',
    title,
    subtitle,
    href: `/predictions?q=${encodeURIComponent(title)}${eventId ? `&eventId=${encodeURIComponent(eventId)}` : ''}`,
    searchText: `${title} ${subtitle} ${flattenSearchText(record).join(' ')}`.toLowerCase(),
  };
}

function makeNewsResult(record: RecordLike, index: number): SearchResult {
  const title = firstText(record, ['title', 'headline', 'name', 'storyTitle']) || 'Football news';
  const source = firstText(record, ['source', 'sourceName', 'publisher', 'author', 'byline', 'competitionName']);
  const url = firstText(record, ['canonicalUrl', 'link', 'articleUrl', 'url', 'webUrl']);
  const href = externalHref(url) ?? `/news?q=${encodeURIComponent(title)}`;
  return {
    id: `news-${firstText(record, ['id', '_id', 'guid']) || index}`,
    kind: 'news',
    title,
    subtitle: source || 'Football news story',
    href,
    external: Boolean(externalHref(url)),
    searchText: `${title} ${source} ${flattenSearchText(record).join(' ')}`.toLowerCase(),
  };
}

function makeHighlightResult(record: RecordLike, index: number): SearchResult {
  const home = safeTeamName(firstText(record, ['homeTeam', 'homeTeamName', 'homeName']));
  const away = safeTeamName(firstText(record, ['awayTeam', 'awayTeamName', 'awayName']));
  const title = firstText(record, ['title', 'videoTitle', 'name']) || (home && away ? `${home} vs ${away}` : 'Football highlight');
  const league = resolveLeagueDisplayName(firstText(record, ['competitionName', 'leagueName']));
  const videoUrl = firstText(record, ['videoUrl', 'youtubeUrl', 'watchUrl', 'url']);
  const href = externalHref(videoUrl) ?? `/highlights?q=${encodeURIComponent(title)}`;
  return {
    id: `highlight-${firstText(record, ['videoId', 'id', '_id', 'fixtureId']) || index}`,
    kind: 'highlights',
    title,
    subtitle: league || [home, away].filter(Boolean).join(' vs ') || 'Match highlights',
    href,
    external: Boolean(externalHref(videoUrl)),
    searchText: `${title} ${league} ${home} ${away} ${flattenSearchText(record).join(' ')}`.toLowerCase(),
  };
}

function makeBetLabResult(record: RecordLike, index: number): SearchResult {
  const home = safeTeamName(firstText(record, ['homeTeamName', 'homeName', 'homeTeam']));
  const away = safeTeamName(firstText(record, ['awayTeamName', 'awayName', 'awayTeam']));
  const title = home && away ? `${home} vs ${away}` : firstText(record, ['eventName', 'name', 'title']) || 'Bet Lab fixture';
  const id = firstText(record, ['eventId', 'fixtureId', 'id', '_id']);
  const league = safeLeagueName(firstText(record, ['leagueName', 'competitionName']));
  return {
    id: `betlab-${id || index}`,
    kind: 'bet-lab',
    title,
    subtitle: league || 'Open fixture in Bet Lab',
    href: `/bet-lab?q=${encodeURIComponent(title)}${id ? `&eventId=${encodeURIComponent(id)}` : ''}`,
    searchText: `${title} ${league} ${flattenSearchText(record).join(' ')}`.toLowerCase(),
  };
}

function getSearchContext(pathname: string): SearchContext {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname === '/') return 'all';
  if (pathname.startsWith('/predictions')) return 'predictions';
  if (pathname.startsWith('/bet-lab')) return 'bet-lab';
  if (pathname.startsWith('/news')) return 'news';
  if (pathname.startsWith('/highlights')) return 'highlights';
  if (pathname.startsWith('/matches') || pathname.startsWith('/competitions') || pathname.startsWith('/teams')) return 'matches';
  if (ACCOUNT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return 'account';
  return 'pages';
}

function contextName(context: SearchContext): string {
  const names: Record<SearchContext, string> = {
    all: 'Everything',
    matches: 'Matches',
    predictions: 'Predictions',
    news: 'Football news',
    highlights: 'Highlights',
    'bet-lab': 'Bet Lab',
    account: 'Account',
    admin: 'Administration',
    pages: 'Site pages',
  };
  return names[context];
}

function contextDescription(context: SearchContext): string {
  const descriptions: Record<SearchContext, string> = {
    all: 'Search across matches, predictions, news and site pages.',
    matches: 'Find fixtures, teams and competitions.',
    predictions: 'Find predictions, teams, leagues and markets.',
    news: 'Find football stories and publishers.',
    highlights: 'Find match highlights and teams.',
    'bet-lab': 'Find Bet Lab fixtures and competitions.',
    account: 'Find account, subscription and reward pages.',
    admin: 'Find an administrative workspace.',
    pages: 'Find a page on 2xPredict.',
  };
  return descriptions[context];
}

function contextPlaceholder(context: SearchContext): string {
  const placeholders: Record<SearchContext, string> = {
    all: 'Search teams, predictions, news and more…',
    matches: 'Search teams, fixtures or competitions…',
    predictions: 'Search teams, leagues or predictions…',
    news: 'Search football news or publishers…',
    highlights: 'Search teams or match highlights…',
    'bet-lab': 'Search Bet Lab fixtures or teams…',
    account: 'Search account pages…',
    admin: 'Search admin workspaces…',
    pages: 'Search site pages…',
  };
  return placeholders[context];
}

function routeForContext(context: SearchContext, pathname: string, query: string): string {
  const q = encodeURIComponent(query.trim());
  const routes: Partial<Record<SearchContext, string>> = {
    matches: '/matches',
    predictions: '/predictions',
    news: '/news',
    highlights: '/highlights',
    'bet-lab': '/bet-lab',
  };
  const route = routes[context] ?? (context === 'all' ? '/matches' : pathname || '/');
  return q ? `${route}?q=${q}` : route;
}

function resultIcon(kind: SearchKind): IconType {
  const icons: Record<SearchKind, IconType> = {
    page: FaArrowRight,
    matches: FaFutbol,
    teams: FaFutbol,
    predictions: FaChartLine,
    news: FaNewspaper,
    highlights: FaPlay,
    'bet-lab': FaCoins,
  };
  return icons[kind];
}

function kindLabel(kind: SearchKind): string {
  if (kind === 'bet-lab') return 'Bet Lab';
  if (kind === 'page') return 'Page';
  if (kind === 'teams') return 'Team';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export default function UniversalSearch({
  open,
  onClose,
  isAdmin = false,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const loadedContextsRef = useRef<Set<SearchContext>>(new Set());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataResults, setDataResults] = useState<SearchResult[]>([]);
  const [loadMessage, setLoadMessage] = useState('');
  const context = isAdmin ? 'admin' : getSearchContext(pathname);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 45);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || loadedContextsRef.current.has(context) || (context !== 'all' && loadedContextsRef.current.has('all'))) return;
    loadedContextsRef.current.add(context);

    const wantsMatches = context === 'all' || context === 'matches';
    const wantsNews = context === 'all' || context === 'news';
    const wantsHighlights = context === 'all' || context === 'highlights';
    const wantsPredictions = context === 'all' || context === 'predictions';
    const wantsBetLab = context === 'all' || context === 'bet-lab';
    const needsLiveData = wantsMatches || wantsNews || wantsHighlights || wantsPredictions || wantsBetLab;

    if (!needsLiveData) {
      setLoading(false);
      setLoadMessage('');
      return;
    }

    setLoading(true);
    setLoadMessage('Loading suggestions…');

    const now = new Date();
    const dateOnly = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const from = dateOnly(new Date(now.getTime() - 2 * 86400000));
    const to = dateOnly(new Date(now.getTime() + 14 * 86400000));

    void Promise.allSettled([
      wantsMatches ? sportsService.getV2Fixtures({ query: { from, to, limit: 100 } }) : Promise.resolve(null),
      wantsNews ? sportsService.getV2News({ query: { limit: 50 } }) : Promise.resolve(null),
      wantsHighlights ? sportsService.getV2Highlights({ query: { page: 1, limit: 50, sortBy: 'publishedAt', sortOrder: 'desc' } }) : Promise.resolve(null),
      wantsPredictions ? predictionEngineService.listPickCenter({ query: { page: 1, pageSize: 50 } }) : Promise.resolve(null),
      wantsBetLab ? betLabService.getFixtures({ query: { page: 1, limit: 50, from, to } }) : Promise.resolve(null),
    ]).then((settled) => {
      const [fixtures, news, highlights, predictions, betLab] = settled;
      const results: SearchResult[] = [];

      if (wantsMatches && fixtures.status === 'fulfilled' && fixtures.value != null) {
        rowsFromResponse(fixtures.value, ['items', 'fixtures', 'matches', 'events', 'results', 'data'])
          .forEach((record, index) => {
            const id = firstText(record, ['id', 'eventId', 'fixtureId', '_id', 'uid']);
            results.push(makeMatchResult(record, id, index));
          });
      }

      if (wantsNews && news.status === 'fulfilled' && news.value != null) {
        rowsFromResponse(news.value, ['items', 'news', 'stories', 'articles', 'results', 'data'])
          .forEach((record, index) => results.push(makeNewsResult(record, index)));
      }
      if (wantsHighlights && highlights.status === 'fulfilled' && highlights.value != null) {
        rowsFromResponse(highlights.value, ['items', 'highlights', 'videos', 'results', 'data'])
          .forEach((record, index) => results.push(makeHighlightResult(record, index)));
      }
      if (wantsPredictions && predictions.status === 'fulfilled' && predictions.value != null) {
        rowsFromResponse(predictions.value, ['items', 'predictions', 'records', 'markets', 'results', 'data'])
          .forEach((record, index) => results.push(makePredictionResult(record, index)));
      }
      if (wantsBetLab && betLab.status === 'fulfilled' && betLab.value != null) {
        rowsFromResponse(betLab.value, ['items', 'fixtures', 'matches', 'results', 'data'])
          .forEach((record, index) => results.push(makeBetLabResult(record, index)));
      }

      const unique = new Map<string, SearchResult>();
      for (const result of results) unique.set(`${result.kind}:${result.id}`, result);
      setDataResults((current) => {
        const merged = new Map<string, SearchResult>();
        for (const result of [...current, ...unique.values()]) merged.set(`${result.kind}:${result.id}`, result);
        return Array.from(merged.values());
      });
      setLoadMessage(results.length ? '' : 'Live suggestions are unavailable. You can still search within this section.');
      setLoading(false);
    }).catch(() => {
      setLoadMessage('Live suggestions are unavailable. You can still search within this section.');
      setLoading(false);
    });
  }, [open, context]);

  useEffect(() => {
    const term = query.trim();
    const sportsContexts: SearchContext[] = ['all', 'matches', 'predictions', 'news', 'highlights', 'bet-lab'];
    if (!open || term.length < 2 || !sportsContexts.includes(context)) {
      setDataResults((current) => current.filter((item) => item.kind !== 'teams'));
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void sportsService.getV2Teams({ query: { search: term, limit: 20 } })
        .then((teams) => {
          if (cancelled) return;
          const teamResults = teams.map((team, index) => makeTeamResult(team as unknown as RecordLike, index));
          setDataResults((current) => [
            ...current.filter((item) => item.kind !== 'teams'),
            ...teamResults,
          ]);
        })
        .catch(() => {
          if (!cancelled) setDataResults((current) => current.filter((item) => item.kind !== 'teams'));
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, context]);

  const allData = useMemo(() => [...PUBLIC_PAGES, ...dataResults], [dataResults]);
  const contextResults = useMemo(() => {
    if (context === 'all') return allData;
    if (context === 'admin') return ADMIN_PAGES;
    if (context === 'account') {
      return PUBLIC_PAGES.filter((item) => ACCOUNT_PATHS.some((path) => item.href === path || item.href.startsWith(`${path}/`)) || item.href === '/pricing');
    }
    if (context === 'pages') return PUBLIC_PAGES;
    if (context === 'matches') return dataResults.filter((item) => item.kind === 'matches' || item.kind === 'teams');
    return dataResults.filter((item) => item.kind === context);
  }, [allData, context, dataResults]);

  const normalizedQuery = query.trim().toLowerCase();
  const canRouteQuery = ['all', 'matches', 'predictions', 'news', 'highlights', 'bet-lab'].includes(context);
  const filteredResults = useMemo(() => {
    const pool = contextResults.filter((item) => {
      if (!normalizedQuery) return true;
      return item.searchText.includes(normalizedQuery)
        || item.title.toLowerCase().includes(normalizedQuery)
        || item.subtitle.toLowerCase().includes(normalizedQuery);
    });
    const seen = new Set<string>();
    return pool.filter((item) => {
      const key = `${item.kind}:${item.title.toLowerCase()}:${item.href}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, normalizedQuery ? 8 : 6);
  }, [contextResults, normalizedQuery]);

  function openResult(result: SearchResult) {
    onClose();
    if (result.external) {
      window.open(result.href, '_blank', 'noopener,noreferrer');
      return;
    }
    router.push(result.href);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filteredResults[0]) {
      openResult(filteredResults[0]);
      return;
    }
    if (query.trim() && canRouteQuery) {
      const target = routeForContext(context, pathname, query);
      onClose();
      router.push(target);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') onClose();
  }

  if (!open) return null;

  const heading = normalizedQuery ? `Suggestions in ${contextName(context)}` : `Explore ${contextName(context)}`;

  return (
    <div ref={rootRef} className="relative z-10 flex w-full min-w-0 self-stretch items-center gap-2.5 sm:gap-4">
      <form onSubmit={handleSubmit} className="relative min-w-0 flex-1">
        <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--chrome-accent)]" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleInputKeyDown}
          type="search"
          placeholder={contextPlaceholder(context)}
          aria-label={`Search ${contextName(context)}`}
          aria-controls="navbar-search-suggestions"
          aria-expanded="true"
          autoComplete="off"
          className="h-12 w-full rounded-2xl border bg-white/[0.10] pl-11 pr-4 text-sm text-[var(--chrome-foreground)] outline-none transition-all duration-200 placeholder:text-white/65 focus:border-[var(--chrome-accent)]/60 focus:bg-white/[0.14] focus:shadow-[0_0_0_3px_rgba(244,225,205,0.12)] sm:h-[52px] sm:pl-12"
          style={{ borderColor: 'var(--chrome-border)' }}
        />
      </form>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        title="Close search (Esc)"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--chrome-foreground)] shadow-none outline-none transition-transform duration-200 hover:scale-110 hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]/75"
      >
        <FaXmark className="h-5 w-5" aria-hidden="true" />
      </button>


      <section
        id="navbar-search-suggestions"
        aria-label="Search suggestions"
        className="absolute left-0 right-0 top-[calc(100%_+_0.6rem)] z-[9999] mx-auto w-full max-w-4xl overflow-hidden rounded-[22px] border border-border/80 bg-popover/95 text-popover-foreground shadow-[0_24px_70px_rgba(19,8,14,0.28)] backdrop-blur-2xl"
        style={{ maxHeight: 'min(64vh, 560px)' }}
      >

        <div className="overflow-y-auto p-2 sm:p-3" style={{ maxHeight: 'calc(min(64vh, 560px) - 88px)' }}>
          {loading && normalizedQuery && filteredResults.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">Finding matching content…</p>
          ) : filteredResults.length ? (
            <div className="space-y-1" role="listbox" aria-label="Matching content">
              {filteredResults.map((result) => {
                const Icon = resultIcon(result.kind);
                return (
                  <button
                    key={`${result.kind}:${result.id}`}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => openResult(result)}
                    className="group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-primary/15 hover:bg-primary/[0.055] focus-visible:border-primary/20 focus-visible:bg-primary/[0.06] focus-visible:outline-none sm:px-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.08] text-brand-accent transition-all group-hover:border-primary/20 group-hover:bg-primary/[0.12]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold sm:text-sm">{result.title}</span>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">{result.subtitle}</span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-1.5 text-[10px] font-semibold text-muted-foreground transition-colors group-hover:text-brand-accent sm:inline-flex">
                      {kindLabel(result.kind)}
                      <FaArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : normalizedQuery ? (
            <div className="px-4 py-7 text-center sm:py-9">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FaMagnifyingGlass className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold">No matches in {contextName(context).toLowerCase()}</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                {canRouteQuery
                  ? `Try another spelling or press Enter to search this section for “${query.trim()}”.`
                  : 'Try another spelling or a shorter search term.'}
              </p>
            </div>
          ) : (
            <div className="px-3 py-4 text-xs text-muted-foreground">Suggestions will appear here as this section loads.</div>
          )}
          {loadMessage ? <p className="border-t border-border/60 px-3 py-2.5 text-[10px] text-muted-foreground">{loadMessage}</p> : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5 text-[10px] text-muted-foreground sm:px-5">
          <span>Suggestions stay within the current section.</span>
          <span className="shrink-0"><kbd className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 font-sans">Esc</kbd> to close</span>
        </div>
      </section>
    </div>
  );
}



