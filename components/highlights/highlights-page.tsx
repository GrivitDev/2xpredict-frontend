'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useSearchParams } from 'next/navigation';

import {
  useGetV2HighlightsQuery,
  useGetV2CompetitionsQuery,
} from '@/hooks/use-sports';

import type { SportsYoutubeHighlightSummary } from '@/types/sports-v2';
import type { SportsCompetition } from '@/types/sports-v2';

const HIGHLIGHT_LIMIT = 50;

type DateFilter =
  | 'all'
  | 'today'
  | 'yesterday'
  | '7-days'
  | '30-days';

/* -------------------------------------------------------------------------- */
/* Date Helpers                                                               */
/* -------------------------------------------------------------------------- */

function getValidDate(value?: string): Date | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getHighlightDate(
  highlight: SportsYoutubeHighlightSummary,
): string {
  return (
    highlight.publishedAt ??
    highlight.searchedAt ??
    highlight.createdAt ??
    ''
  );
}

function getDateKey(value?: string): string {
  const date = getValidDate(value);

  if (!date) return '';

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getTodayDate(): Date {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
}

function getDayOffset(days: number): Date {
  const date = getTodayDate();

  date.setDate(date.getDate() - days);

  return date;
}

function getDateFilterStart(
  filter: DateFilter,
): Date | null {
  switch (filter) {
    case 'today':
      return getTodayDate();

    case 'yesterday':
      return getDayOffset(1);

    case '7-days':
      return getDayOffset(6);

    case '30-days':
      return getDayOffset(29);

    default:
      return null;
  }
}

function isWithinDateFilter(
  value: string,
  filter: DateFilter,
): boolean {
  if (filter === 'all') return true;

  const date = getValidDate(value);

  if (!date) return false;

  const start = getDateFilterStart(filter);

  if (!start) return true;

  const dateKey = getDateKey(date.toISOString());
  const startKey = getDateKey(start.toISOString());

  if (filter === 'today' || filter === 'yesterday') {
    return dateKey === startKey;
  }

  return date >= start;
}

function formatDate(value: string): string {
  const date = getValidDate(value);

  if (!date) return '';

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/* YouTube Helpers                                                            */
/* -------------------------------------------------------------------------- */

function getYoutubeVideoId(
  highlight: SportsYoutubeHighlightSummary,
): string | undefined {
  if (highlight.videoId?.trim()) {
    return highlight.videoId.trim();
  }

  if (!highlight.videoUrl) return undefined;

  try {
    const url = new URL(highlight.videoUrl);

    if (
      url.hostname === 'youtu.be' ||
      url.hostname.endsWith('.youtu.be')
    ) {
      return (
        url.pathname.replace(/^\/+/, '').split('/')[0] ||
        undefined
      );
    }

    if (url.hostname.includes('youtube.com')) {
      const queryId = url.searchParams.get('v');

      if (queryId) return queryId;

      return url.pathname.match(
        /\/(?:embed|shorts|live)\/([^/?]+)/i,
      )?.[1];
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getYoutubeWatchUrl(
  highlight: SportsYoutubeHighlightSummary,
): string | undefined {
  const videoId = getYoutubeVideoId(highlight);

  if (!videoId) return highlight.videoUrl;

  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function getYoutubeEmbedUrl(
  highlight: SportsYoutubeHighlightSummary,
): string | undefined {
  const videoId = getYoutubeVideoId(highlight);

  if (!videoId) return undefined;

  const query = new URLSearchParams({
    autoplay: '1',
    controls: '1',
    enablejsapi: '1',
    fs: '1',
    iv_load_policy: '3',
    playsinline: '1',
    rel: '0',
  });

  return `https://www.youtube.com/embed/${encodeURIComponent(
    videoId,
  )}?${query.toString()}`;
}

function getFallbackThumbnail(
  highlight: SportsYoutubeHighlightSummary,
): string | undefined {
  const videoId = getYoutubeVideoId(highlight);

  return videoId
    ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`
    : undefined;
}

/* -------------------------------------------------------------------------- */
/* Competition Helpers                                                        */
/* -------------------------------------------------------------------------- */

function getLeagueName(
  highlight: SportsYoutubeHighlightSummary,
  competitionMap: Map<string, string>,
): string {
  if (!highlight.competitionId) return 'Football';

  return (
    competitionMap.get(highlight.competitionId.toLowerCase()) ??
    highlight.competitionId
  );
}

function getSearchText(
  highlight: SportsYoutubeHighlightSummary,
  leagueName: string,
): string {
  return [
    highlight.title,
    highlight.homeTeam,
    highlight.awayTeam,
    highlight.channelTitle,
    leagueName,
    highlight.competitionId,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Deduplication                                                              */
/* -------------------------------------------------------------------------- */

function getUniqueHighlights(
  highlights: SportsYoutubeHighlightSummary[],
): SportsYoutubeHighlightSummary[] {
  const seenVideoIds = new Set<string>();
  const seenFallbackKeys = new Set<string>();
  const unique: SportsYoutubeHighlightSummary[] = [];

  for (const highlight of highlights) {
    const videoId = getYoutubeVideoId(highlight);

    if (videoId) {
      const normalizedVideoId = videoId.trim().toLowerCase();

      if (!normalizedVideoId || seenVideoIds.has(normalizedVideoId)) {
        continue;
      }

      seenVideoIds.add(normalizedVideoId);
      unique.push(highlight);

      continue;
    }

    const fallbackKey = [
      highlight.title ?? '',
      highlight.videoUrl ?? '',
      highlight.fixtureId ?? '',
    ]
      .join('|')
      .trim()
      .toLowerCase();

    if (!fallbackKey || seenFallbackKeys.has(fallbackKey)) {
      continue;
    }

    seenFallbackKeys.add(fallbackKey);
    unique.push(highlight);
  }

  return unique;
}

/* -------------------------------------------------------------------------- */
/* Video Player                                                               */
/* -------------------------------------------------------------------------- */

function HighlightPlayer({
  highlight,
}: {
  highlight: SportsYoutubeHighlightSummary;
}) {
  const embedUrl = getYoutubeEmbedUrl(highlight);
  const watchUrl = getYoutubeWatchUrl(highlight);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center bg-[#211c1d] p-4 text-center text-[11px] text-white/70">
        <div>
          <p>This highlight cannot be embedded here.</p>

          {watchUrl ? (
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-[10px] font-semibold text-white underline underline-offset-4"
            >
              Open on YouTube
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        title={
          highlight.title ??
          `${highlight.homeTeam} vs ${highlight.awayTeam}`
        }
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Highlight Card                                                             */
/* -------------------------------------------------------------------------- */

function HighlightCard({
  highlight,
  leagueName,
  isOpen,
  onToggle,
}: {
  highlight: SportsYoutubeHighlightSummary;
  leagueName: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const thumbnailUrl =
    highlight.thumbnailUrl ??
    getFallbackThumbnail(highlight);

  const watchUrl = getYoutubeWatchUrl(highlight);

  const title =
    highlight.title ??
    `${highlight.homeTeam} vs ${highlight.awayTeam}`;

  const publishedAt = getHighlightDate(highlight);

  return (
    <article
      className="
        group
        flex
        min-w-0
        flex-col
        overflow-hidden
        rounded-lg
        border
        border-[#ded2c2]
        bg-[#fffdf9]
        shadow-[0_1px_5px_rgba(43,32,29,0.035)]
        transition-all
        duration-200
        hover:border-[#702b3d]/45
        hover:shadow-[0_5px_15px_rgba(43,32,29,0.09)]
        dark:border-border/70
        dark:bg-card
      "
    >
      {/* Video */}

      {isOpen ? (
        <HighlightPlayer highlight={highlight} />
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="
            group/media
            relative
            block
            aspect-video
            w-full
            shrink-0
            overflow-hidden
            bg-[#272122]
            text-left
          "
          aria-label={`Play ${title}`}
          aria-pressed={false}
        >
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover/media:scale-[1.04]
              "
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-white/60">
              {highlight.homeTeam} vs {highlight.awayTeam}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/20" />

          <span
            className="
              absolute
              left-1.5
              top-1.5
              rounded-[3px]
              border
              border-white/20
              bg-black/45
              px-1.5
              py-0.5
              text-[7px]
              font-bold
              uppercase
              tracking-[0.13em]
              text-white
              backdrop-blur-sm
            "
          >
            Highlights
          </span>

          <span
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
          >
            <span
              className="
                flex
                size-8
                items-center
                justify-center
                rounded-full
                border
                border-white/60
                bg-[#702b3d]/95
                text-white
                shadow-lg
                transition
                group-hover/media:scale-110
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-0.5 size-3"
                aria-hidden="true"
              >
                <path d="M8 5.14v13.72c0 .73.79 1.19 1.43.84l10.2-5.72a.96.96 0 0 0 0-1.68L9.43 4.3A.96.96 0 0 0 8 5.14Z" />
              </svg>
            </span>
          </span>

          <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[8px] font-semibold text-white/90">
            {leagueName}
          </span>
        </button>
      )}

      {/* Details */}

      <div className="flex min-w-0 flex-1 flex-col p-1.5 sm:p-2">
        <div className="mb-1 flex min-w-0 items-center justify-between gap-1">
          <span
            className="
              min-w-0
              truncate
              text-[8px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-[#8a4957]
              dark:text-primary
            "
          >
            {leagueName}
          </span>

          <time className="shrink-0 text-[8px] text-[#94877d] dark:text-muted-foreground">
            {formatDate(publishedAt)}
          </time>
        </div>

        <h2
          className="
            line-clamp-2
            min-h-[2.6em]
            break-words
            text-[10px]
            font-bold
            leading-[1.3]
            tracking-tight
            text-[#372c2c]
            group-hover:text-[#702b3d]
            sm:text-[11px]
            dark:text-foreground
            dark:group-hover:text-primary
          "
        >
          {title}
        </h2>

        <p className="mt-1 truncate text-[9px] text-[#81766e] dark:text-muted-foreground">
          {highlight.homeTeam} <span className="px-0.5">vs</span>{' '}
          {highlight.awayTeam}
        </p>

        <div
          className="
            mt-auto
            flex
            min-w-0
            items-center
            justify-between
            gap-1
            border-t
            border-[#e9dfd2]
            pt-1.5
            dark:border-border/70
          "
        >
          <span className="min-w-0 truncate text-[8px] text-[#958980] dark:text-muted-foreground">
            {highlight.channelTitle || 'YouTube'}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onToggle}
              className="
                rounded-[3px]
                bg-[#702b3d]
                px-1.5
                py-1
                text-[8px]
                font-bold
                text-white
                transition
                hover:bg-[#582130]
              "
            >
              {isOpen ? 'Close' : 'Play'}
            </button>

            {watchUrl ? (
              <a
                href={watchUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  rounded-[3px]
                  border
                  border-[#ded2c2]
                  px-1.5
                  py-1
                  text-[8px]
                  font-semibold
                  text-[#665953]
                  transition
                  hover:bg-[#f0e9df]
                  dark:border-border
                  dark:text-muted-foreground
                  dark:hover:bg-muted
                "
              >
                YouTube
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function HighlightSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-[#ded2c2]/70 bg-[#fffdf9] dark:border-border/70 dark:bg-card">
      <div className="aspect-video animate-pulse bg-[#e9e1d7] dark:bg-muted" />

      <div className="space-y-1.5 p-1.5 sm:p-2">
        <div className="h-2 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page Header                                                                */
/* -------------------------------------------------------------------------- */

function HighlightsHeader({
  total,
  search,
}: {
  total: number;
  search: string;
}) {
  return (
    <header
      className="
        mb-3
        grid
        grid-cols-[minmax(0,1fr)_auto]
        items-center
        gap-2
        border-b
        border-[#d9cbbb]
        pb-2.5
        dark:border-border/70
      "
    >
      <div className="min-w-0">
        <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.22em] text-[#956b57] dark:text-primary">
          2XP / Matchday archive
        </p>

        <h1 className="font-serif text-[18px] font-semibold leading-tight tracking-tight text-[#392b2d] sm:text-xl dark:text-foreground">
          Football Highlights
        </h1>

        <p className="mt-0.5 text-[9px] text-[#897d74] sm:text-[10px] dark:text-muted-foreground">
          The moments, the goals and the drama.
        </p>

        {search ? (
          <p className="mt-1 text-[9px] text-[#702b3d] dark:text-primary">
            Search: <span className="font-semibold">{search}</span>
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="min-w-[62px] rounded-md border border-[#dfd1c0] bg-[#fffdf9] px-2 py-1.5 text-center dark:border-border dark:bg-card">
          <p className="font-serif text-base font-semibold leading-none text-[#702b3d] dark:text-primary">
            {total}
          </p>
          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.13em] text-[#8d8077] dark:text-muted-foreground">
            Videos
          </p>
        </div>

        <div className="hidden min-w-[62px] rounded-md bg-[#702b3d] px-2 py-1.5 text-center sm:block">
          <p className="font-serif text-base font-semibold leading-none text-white">
            2XP
          </p>
          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.13em] text-white/70">
            Replay
          </p>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function HighlightsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('q') ?? '';

  const dateFilter: DateFilter = 'all';

  const [
    openHighlightKey,
    setOpenHighlightKey,
  ] = useState<string | null>(null);

  const activeHighlightRef = useRef<HTMLElement | null>(null);

  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: true, limit: 1000 } },
    { staleTime: 30 * 60_000, retry: 1, refetchOnWindowFocus: false },
  );

  /*
   * The highlights query is the primary content request.
   * Competition data is intentionally excluded from loading state.
   */
  const highlightsQuery = useGetV2HighlightsQuery({
    query: { limit: HIGHLIGHT_LIMIT, sortBy: 'publishedAt', sortOrder: 'desc' },
  });

  const competitions = useMemo<SportsCompetition[]>(
    () => competitionsQuery.data ?? [],
    [competitionsQuery.data],
  );

  const competitionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const competition of competitions) {
      const name = competition.displayName?.trim() || competition.name;
      for (const identifier of [competition.id, competition.slug, competition.espnId]) {
        const key = identifier?.trim().toLowerCase();
        if (key && name) map.set(key, name);
      }
    }
    return map;
  }, [competitions]);

  const normalizedHighlights = useMemo(() => {
    const rawHighlights = highlightsQuery.data?.data ?? [];

    const unique = getUniqueHighlights(rawHighlights);

    return unique.sort((a, b) => {
      const aTime =
        getValidDate(getHighlightDate(a))?.getTime() ?? 0;

      const bTime =
        getValidDate(getHighlightDate(b))?.getTime() ?? 0;

      return bTime - aTime;
    });
  }, [highlightsQuery.data?.data]);

  const filteredHighlights = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return normalizedHighlights.filter((highlight) => {
      const leagueName = getLeagueName(
        highlight,
        competitionMap,
      );

      const highlightDate = getHighlightDate(highlight);

      if (!isWithinDateFilter(highlightDate, dateFilter)) {
        return false;
      }

      if (
        normalizedSearch &&
        !getSearchText(highlight, leagueName).includes(
          normalizedSearch,
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    normalizedHighlights,
    competitionMap,
    search,
    dateFilter,
  ]);

  /* Progressive reveal */

  const [revealState, setRevealState] = useState<{
    highlights: typeof filteredHighlights;
    count: number;
  } | null>(null);

  const visibleCount =
    revealState?.highlights === filteredHighlights
      ? revealState.count
      : filteredHighlights.length
        ? 1
        : 0;

  useEffect(() => {
    if (filteredHighlights.length <= 1) return;

    let current = 1;

    const timer = window.setInterval(() => {
      current += 1;

      const count = Math.min(
        current,
        filteredHighlights.length,
      );

      setRevealState({
        highlights: filteredHighlights,
        count,
      });

      if (current >= filteredHighlights.length) {
        window.clearInterval(timer);
      }
    }, 70);

    return () => window.clearInterval(timer);
  }, [filteredHighlights]);

  const visibleHighlights = filteredHighlights.slice(
    0,
    visibleCount,
  );

  const activeHighlight = openHighlightKey
    ? visibleHighlights.find((highlight) => {
        const key =
          getYoutubeVideoId(highlight) ??
          highlight.fixtureId;

        return key === openHighlightKey;
      }) ?? null
    : null;

  const remainingHighlights = activeHighlight
    ? visibleHighlights.filter((highlight) => {
        const key =
          getYoutubeVideoId(highlight) ??
          highlight.fixtureId;

        return key !== openHighlightKey;
      })
    : visibleHighlights;

  useEffect(() => {
    if (!openHighlightKey) return;

    const frame = window.requestAnimationFrame(() => {
      activeHighlightRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [openHighlightKey]);

  const loading = highlightsQuery.isLoading;
  const error = highlightsQuery.error;

  return (
    <main className="min-h-screen bg-[#f8f5ef] dark:bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-2.5 py-2 sm:px-3 sm:py-3 lg:px-4">
        <HighlightsHeader
          total={filteredHighlights.length}
          search={search}
        />

        {/* Loading */}

        {loading ? (
          <div
            className="
              grid
              grid-cols-2
              gap-1.5
              sm:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              xl:gap-2
            "
          >
            {Array.from({ length: 10 }, (_, index) => (
              <HighlightSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-[10px] text-red-700 dark:text-red-300">
              Unable to load highlights right now.
            </p>

            <button
              type="button"
              onClick={() => void highlightsQuery.refetch()}
              className="shrink-0 text-[9px] font-bold text-red-700 underline underline-offset-2 dark:text-red-300"
            >
              Try again
            </button>
          </div>
        ) : filteredHighlights.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#d8c9b8] bg-[#fffdf9] px-3 py-7 text-center dark:border-border dark:bg-card">
            <p className="font-serif text-base font-semibold text-[#463536] dark:text-foreground">
              No highlights found
            </p>

            <p className="mt-1 text-[10px] text-[#8b8078] dark:text-muted-foreground">
              Try another search.
            </p>
          </div>
        ) : (
          <>
            {/* Active Player */}

            {activeHighlight ? (
              <section
                ref={activeHighlightRef}
                aria-label="Now playing"
                className="mb-2.5 scroll-mt-32"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#702b3d] dark:text-primary">
                    Now playing
                  </h2>

                  <button
                    type="button"
                    onClick={() => setOpenHighlightKey(null)}
                    className="rounded border border-[#ded2c2] bg-[#fffdf9] px-2 py-1 text-[9px] font-semibold text-[#6d5d56] hover:bg-[#f0e9df] dark:border-border dark:bg-card dark:text-muted-foreground"
                  >
                    Close player
                  </button>
                </div>

                <div className="max-w-3xl">
                  <HighlightCard
                    highlight={activeHighlight}
                    leagueName={getLeagueName(
                      activeHighlight,
                      competitionMap,
                    )}
                    isOpen
                    onToggle={() => setOpenHighlightKey(null)}
                  />
                </div>
              </section>
            ) : null}

            {/* Video Grid */}

            {remainingHighlights.length > 0 ? (
              <section aria-label="Football highlights">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#8d786c] dark:text-muted-foreground">
                    {activeHighlight ? 'More highlights' : 'Latest collection'}
                  </p>

                  <span className="text-[8px] text-[#94877d] dark:text-muted-foreground">
                    {remainingHighlights.length} videos
                  </span>
                </div>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-1.5
                    sm:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                    xl:gap-2
                  "
                >
                  {remainingHighlights.map((highlight) => {
                    const key =
                      getYoutubeVideoId(highlight) ??
                      highlight.fixtureId;

                    return (
                      <HighlightCard
                        key={key}
                        highlight={highlight}
                        leagueName={getLeagueName(
                          highlight,
                          competitionMap,
                        )}
                        isOpen={false}
                        onToggle={() =>
                          setOpenHighlightKey(key ?? null)
                        }
                      />
                    );
                  })}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
