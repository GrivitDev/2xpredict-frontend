'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  FaArrowRight,
  FaPlay,
  FaVideo,
} from 'react-icons/fa6';

import { useGetV2HighlightsQuery } from '@/hooks/use-sports';
import type { SportsYoutubeHighlightSummary } from '@/types/sports-v2';

const PREVIEW_COUNT = 10;
const HIGHLIGHT_QUERY_LIMIT = 30;

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

function getYoutubeVideoId(
  highlight: SportsYoutubeHighlightSummary,
): string | undefined {
  if (highlight.videoId?.trim()) {
    return highlight.videoId.trim();
  }

  if (!highlight.videoUrl) {
    return undefined;
  }

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

      if (queryId) {
        return queryId;
      }

      return url.pathname.match(
        /\/(?:embed|shorts|live)\/([^/?]+)/i,
      )?.[1];
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getHighlightKey(
  highlight: SportsYoutubeHighlightSummary,
): string {
  return getYoutubeVideoId(highlight) ?? highlight.fixtureId;
}

function getHighlightTitle(
  highlight: SportsYoutubeHighlightSummary,
): string {
  return (
    highlight.title?.trim() ||
    `${highlight.homeTeam} vs ${highlight.awayTeam}`
  );
}

function getThumbnailUrl(
  highlight: SportsYoutubeHighlightSummary,
): string | undefined {
  if (highlight.thumbnailUrl?.trim()) {
    return highlight.thumbnailUrl;
  }

  const videoId = getYoutubeVideoId(highlight);

  return videoId
    ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`
    : undefined;
}

function formatDate(value: string): string {
  const date = getValidDate(value);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getUniqueLatestHighlights(
  highlights: SportsYoutubeHighlightSummary[],
): SportsYoutubeHighlightSummary[] {
  const seenVideos = new Set<string>();
  const seenFallbacks = new Set<string>();
  const unique: SportsYoutubeHighlightSummary[] = [];

  const sorted = [...highlights].sort((left, right) => {
    const leftTime =
      getValidDate(getHighlightDate(left))?.getTime() ?? 0;

    const rightTime =
      getValidDate(getHighlightDate(right))?.getTime() ?? 0;

    return rightTime - leftTime;
  });

  for (const highlight of sorted) {
    const videoId = getYoutubeVideoId(highlight);

    if (videoId) {
      const normalizedVideoId = videoId.toLowerCase();

      if (seenVideos.has(normalizedVideoId)) {
        continue;
      }

      seenVideos.add(normalizedVideoId);
      unique.push(highlight);

      continue;
    }

    const fallbackKey = [
      highlight.title ?? '',
      highlight.videoUrl ?? '',
      highlight.fixtureId,
    ]
      .join('|')
      .trim()
      .toLowerCase();

    if (!fallbackKey || seenFallbacks.has(fallbackKey)) {
      continue;
    }

    seenFallbacks.add(fallbackKey);
    unique.push(highlight);
  }

  return unique.slice(0, PREVIEW_COUNT);
}

/* -------------------------------------------------------------------------- */
/* Highlight Card                                                             */
/* -------------------------------------------------------------------------- */

function HighlightCard({
  highlight,
}: {
  highlight: SportsYoutubeHighlightSummary;
}) {
  const videoId = getYoutubeVideoId(highlight);
  const thumbnailUrl = getThumbnailUrl(highlight);
  const title = getHighlightTitle(highlight);
  const publishedAt = getHighlightDate(highlight);
  const formattedDate = publishedAt
    ? formatDate(publishedAt)
    : '';

  return (
    <Link
      href="/highlights"
      aria-label={`View ${title} on highlights page`}
      className="
        group
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[10px]
        border
        border-[#dfd1bd]/80
        bg-[#fffdf9]
        shadow-[0_2px_10px_rgba(47,36,32,0.04)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#702b3d]/40
        hover:shadow-[0_7px_20px_rgba(47,36,32,0.10)]
        dark:border-border/70
        dark:bg-card
      "
    >
      {/* Thumbnail */}

      <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-[#e9e2d8] dark:bg-muted">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.045]
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#8a7771] dark:text-muted-foreground">
            <FaVideo className="size-7" aria-hidden="true" />
          </div>
        )}

        {/* Cinematic overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />

        {/* Top badge */}

        <span
          className="
            absolute
            left-2
            top-2
            rounded-[3px]
            border
            border-white/20
            bg-black/45
            px-1.5
            py-1
            text-[7px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-white
            backdrop-blur-sm
          "
        >
          Match highlights
        </span>

        {/* Play button */}

        {videoId ? (
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
                size-9
                items-center
                justify-center
                rounded-full
                border
                border-white/65
                bg-[#702b3d]/95
                text-white
                shadow-lg
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:bg-[#8a394d]
              "
            >
              <FaPlay className="ml-0.5 size-3" aria-hidden="true" />
            </span>
          </span>
        ) : null}

        {/* Competition */}

        <div className="absolute bottom-2 left-2 right-2">
          <span
            className="
              inline-block
              max-w-full
              truncate
              rounded-sm
              bg-black/45
              px-1.5
              py-0.5
              text-[8px]
              font-medium
              tracking-wide
              text-white/95
              backdrop-blur-sm
            "
          >
            {highlight.competitionId || 'Football'}
          </span>
        </div>
      </div>

      {/* Card information */}

      <div className="flex min-w-0 flex-1 flex-col p-2">
        {/* Date */}

        <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
          <span
            className="
              truncate
              text-[8px]
              font-bold
              uppercase
              tracking-[0.13em]
              text-[#873d4e]
              dark:text-primary
            "
          >
            Football highlights
          </span>

          {formattedDate ? (
            <time
              dateTime={publishedAt}
              className="shrink-0 text-[8px] text-[#8a8179] dark:text-muted-foreground"
            >
              {formattedDate}
            </time>
          ) : null}
        </div>

        {/* Title */}

        <h3
          className="
            line-clamp-2
            min-h-[2.65em]
            break-words
            text-[11px]
            font-semibold
            leading-[1.35]
            tracking-[-0.02em]
            text-[#332c2b]
            transition-colors
            group-hover:text-[#702b3d]
            dark:text-foreground
            dark:group-hover:text-primary
          "
        >
          {title}
        </h3>

        {/* Match information */}

        <p
          className="
            mt-1
            truncate
            text-[9px]
            font-medium
            text-[#827670]
            dark:text-muted-foreground
          "
        >
          {highlight.homeTeam} <span className="px-0.5">vs</span>{' '}
          {highlight.awayTeam}
        </p>

        {/* Footer */}

        <div
          className="
            mt-auto
            flex
            min-w-0
            items-center
            justify-between
            gap-2
            border-t
            border-[#e9dfd2]
            pt-1.5
            dark:border-border/70
          "
        >
          <span
            className="
              min-w-0
              truncate
              text-[8px]
              text-[#928780]
              dark:text-muted-foreground
            "
          >
            {highlight.channelTitle || 'YouTube'}
          </span>

          <span
            className="
              inline-flex
              shrink-0
              items-center
              gap-1
              text-[8px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-[#702b3d]
              transition-all
              group-hover:gap-1.5
              dark:text-primary
            "
          >
            Watch
            <FaArrowRight className="size-2" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function HighlightCardSkeleton() {
  return (
    <div
      className="
        min-w-0
        overflow-hidden
        rounded-[10px]
        border
        border-[#dfd1bd]/70
        bg-[#fffdf9]
        dark:border-border/70
        dark:bg-card
      "
    >
      <div className="aspect-[16/9] animate-pulse bg-[#e9e2d8] dark:bg-muted" />

      <div className="space-y-2 p-2">
        <div className="h-2 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-2 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Heading                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading() {
  return (
    <header
      className="
        mb-3
        grid
        grid-cols-[minmax(0,1fr)_auto]
        items-end
        gap-3
        border-b
        border-[#ddcfbd]
        pb-2.5
        dark:border-border/70
      "
    >
      <div className="min-w-0">
        <p
          className="
            mb-0.5
            text-[8px]
            font-bold
            uppercase
            tracking-[0.22em]
            text-[#956b57]
            dark:text-primary
          "
        >
          The matchday collection
        </p>

        <h2
          id="latest-football-highlights-title"
          className="
            font-serif
            text-[17px]
            font-semibold
            leading-tight
            tracking-tight
            text-[#382b2b]
            sm:text-lg
            dark:text-foreground
          "
        >
          Latest Football Highlights
        </h2>

        <p className="mt-0.5 text-[9px] text-[#8b807a] sm:text-[10px] dark:text-muted-foreground">
          Relive the moments that matter.
        </p>
      </div>

      <Link
        href="/highlights"
        className="
          inline-flex
          min-h-7
          shrink-0
          items-center
          justify-center
          gap-1.5
          rounded-md
          bg-[#702b3d]
          px-2.5
          py-1.5
          text-[8px]
          font-bold
          uppercase
          tracking-[0.1em]
          text-white
          shadow-sm
          transition-colors
          hover:bg-[#572130]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#702b3d]
          focus-visible:ring-offset-2
        "
      >
        <span className="sm:hidden">All</span>
        <span className="hidden sm:inline">View all</span>
        <FaArrowRight className="size-2" aria-hidden="true" />
      </Link>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section                                                               */
/* -------------------------------------------------------------------------- */

export default function LatestHighlightsPreviewSection() {
  const highlightsQuery = useGetV2HighlightsQuery({
    query: { limit: HIGHLIGHT_QUERY_LIMIT, sortBy: 'publishedAt', sortOrder: 'desc' },
  });

  const highlights = useMemo(
    () =>
      getUniqueLatestHighlights(
        highlightsQuery.data?.data ?? [],
      ),
    [highlightsQuery.data?.data],
  );

  return (
    <section
      aria-labelledby="latest-football-highlights-title"
      className="px-3 py-3.5 sm:px-4 sm:py-4 lg:py-5"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading />

        {/* Loading */}

        {highlightsQuery.isLoading ? (
          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
              lg:grid-cols-5
              lg:gap-2.5
            "
          >
            {Array.from({ length: PREVIEW_COUNT }, (_, index) => (
              <HighlightCardSkeleton key={index} />
            ))}
          </div>
        ) : highlightsQuery.isError ? (
          <div
            className="
              rounded-lg
              border
              border-[#dfd1bd]/70
              bg-[#fffdf9]
              px-3
              py-5
              text-center
              dark:border-border/70
              dark:bg-card
            "
          >
            <p className="text-xs font-medium text-foreground">
              Highlights are temporarily unavailable.
            </p>

            <button
              type="button"
              onClick={() => void highlightsQuery.refetch()}
              className="mt-2 text-[10px] font-bold text-[#702b3d] hover:underline dark:text-primary"
            >
              Try again
            </button>
          </div>
        ) : highlights.length === 0 ? (
          <div
            className="
              rounded-lg
              border
              border-dashed
              border-[#d9c7b2]
              bg-[#fffdf9]
              px-3
              py-6
              text-center
              dark:border-border
              dark:bg-card
            "
          >
            <FaVideo
              className="mx-auto size-5 text-[#9b897c] dark:text-muted-foreground"
              aria-hidden="true"
            />

            <p className="mt-2 text-[11px] font-medium text-foreground">
              No recent highlights available.
            </p>

            <p className="mt-0.5 text-[9px] text-muted-foreground">
              New match highlights will appear here.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
              lg:grid-cols-5
              lg:gap-2.5
            "
          >
            {highlights.map((highlight) => (
              <HighlightCard
                key={getHighlightKey(highlight)}
                highlight={highlight}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
