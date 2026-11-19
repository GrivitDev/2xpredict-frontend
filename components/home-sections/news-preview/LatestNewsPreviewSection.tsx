'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  FaArrowRight,
  FaNewspaper,
} from 'react-icons/fa6';

import { useGetV2SportsNewsQuery } from '@/hooks/use-sports';
import { toFootballNewsFeedItem } from '@/components/news/sports-news-v2.adapter';
import type { FootballNewsFeedItem } from '@/types/sports';

type UnknownRecord = Record<string, unknown>;

const PREVIEW_COUNT = 10;
const NEWS_QUERY_LIMIT = 100;

/* -------------------------------------------------------------------------- */
/* Data Helpers                                                               */
/* -------------------------------------------------------------------------- */

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
  );
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return undefined;
}

function safeHttpUrl(value: unknown): string | undefined {
  const url = readString(value);

  return url && /^https?:\/\//i.test(url)
    ? url
    : undefined;
}

function getPayload(
  item: FootballNewsFeedItem,
): UnknownRecord {
  return isRecord(item.payload) ? item.payload : {};
}

function getTitle(item: FootballNewsFeedItem): string {
  const payload = getPayload(item);

  return (
    readString(payload.headline) ??
    readString(payload.description) ??
    'Football news'
  );
}

function getImageUrl(
  item: FootballNewsFeedItem,
): string | undefined {
  const payload = getPayload(item);

  const direct =
    safeHttpUrl(payload.imageUrl) ??
    safeHttpUrl(payload.thumbnail) ??
    safeHttpUrl(payload.image);

  if (direct) {
    return direct;
  }

  const candidates = Array.isArray(payload.images)
    ? payload.images
    : payload.images !== undefined
      ? [payload.images]
      : [];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const url = safeHttpUrl(candidate);

      if (url) {
        return url;
      }

      continue;
    }

    if (!isRecord(candidate)) {
      continue;
    }

    const candidateUrls = Array.isArray(candidate.url)
      ? candidate.url
      : [candidate.url, candidate.href];

    for (const candidateUrl of candidateUrls) {
      const url = safeHttpUrl(candidateUrl);

      if (url) {
        return url;
      }
    }
  }

  return undefined;
}

function getPublishedAt(
  item: FootballNewsFeedItem,
): string | undefined {
  const payload = getPayload(item);

  return (
    readString(item.publishedAt) ??
    readString(payload.published) ??
    readString(payload.lastModified) ??
    readString(item.fixtureDate)
  );
}

function getPublishedTime(
  item: FootballNewsFeedItem,
): number {
  const publishedAt = getPublishedAt(item);

  if (!publishedAt) {
    return 0;
  }

  const value = new Date(publishedAt).getTime();

  return Number.isFinite(value) ? value : 0;
}

function formatDate(value?: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/* News Card                                                                  */
/* -------------------------------------------------------------------------- */

function NewsCard({
  item,
}: {
  item: FootballNewsFeedItem;
}) {
  const title = getTitle(item);
  const imageUrl = getImageUrl(item);
  const publishedAt = getPublishedAt(item);
  const formattedDate = formatDate(publishedAt);

  return (
    <Link
      href="/news"
      aria-label={`View ${title} on news page`}
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
      {/* Article Image */}

      <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-[#e9e2d8] dark:bg-muted">
        {imageUrl ? (
          // ESPN image URLs are dynamic, so use a native image instead of requiring remotePatterns config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
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
            <FaNewspaper className="size-7" aria-hidden="true" />
          </div>
        )}

        {/* Image Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* News Badge */}

        <span
          className="
            absolute
            left-2
            top-2
            rounded-[3px]
            border
            border-white/25
            bg-[#702b3d]/90
            px-1.5
            py-1
            text-[7px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-white
            shadow-sm
            backdrop-blur-sm
          "
        >
          Latest news
        </span>

        {/* Date Overlay */}

        {formattedDate ? (
          <span
            className="
              absolute
              bottom-2
              right-2
              rounded-[3px]
              border
              border-white/20
              bg-black/45
              px-1.5
              py-1
              text-[8px]
              font-medium
              text-white
              backdrop-blur-sm
            "
          >
            {formattedDate}
          </span>
        ) : null}
      </div>

      {/* Article Details */}

      <div className="flex min-w-0 flex-1 flex-col p-2">
        {/* Editorial Category */}

        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="size-1 rounded-full bg-[#9b6b54]" />

          <span
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-[#956b57]
              dark:text-primary
            "
          >
            Football desk
          </span>

          {publishedAt ? (
            <>
              <span className="text-[8px] text-[#b9a99a]">/</span>

              <time
                dateTime={publishedAt}
                className="truncate text-[8px] text-[#8a8179] dark:text-muted-foreground"
              >
                {formattedDate}
              </time>
            </>
          ) : null}
        </div>

        {/* Article Title */}

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

        {/* Footer */}

        <div
          className="
            mt-auto
            flex
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
              truncate
              text-[8px]
              text-[#928780]
              dark:text-muted-foreground
            "
          >
            Latest football reports
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
            Read story
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

function NewsCardSkeleton() {
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
          The football newsroom
        </p>

        <h2
          id="latest-football-news-title"
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
          Latest Football News
        </h2>

        <p className="mt-0.5 text-[9px] text-[#8b807a] sm:text-[10px] dark:text-muted-foreground">
          Important stories. Key developments. All the latest.
        </p>
      </div>

      <Link
        href="/news"
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

export default function LatestNewsPreviewSection() {
  const newsQuery = useGetV2SportsNewsQuery(
    { query: { limit: NEWS_QUERY_LIMIT } },
    {
      staleTime: 60_000,
      refetchInterval: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  );

  const news = useMemo(() => {
    const latestNews = (newsQuery.data ?? [])
      .map(toFootballNewsFeedItem)
      .sort((left, right) => getPublishedTime(right) - getPublishedTime(left));
    const seenTitles = new Set<string>();

    return latestNews.filter((item) => {
      const key = getTitle(item).trim().toLowerCase();
      if (!key || seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    }).slice(0, PREVIEW_COUNT);
  }, [newsQuery.data]);

  return (
    <section
      aria-labelledby="latest-football-news-title"
      className="px-3 py-3.5 sm:px-4 sm:py-4 lg:py-5"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading />

        {/* Loading */}

        {newsQuery.isLoading ? (
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
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        ) : newsQuery.isError ? (
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
              Football news is temporarily unavailable.
            </p>

            <button
              type="button"
              onClick={() => void newsQuery.refetch()}
              className="mt-2 text-[10px] font-bold text-[#702b3d] hover:underline dark:text-primary"
            >
              Try again
            </button>
          </div>
        ) : news.length === 0 ? (
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
            <FaNewspaper
              className="mx-auto size-5 text-[#9b897c] dark:text-muted-foreground"
              aria-hidden="true"
            />

            <p className="mt-2 text-[11px] font-medium text-foreground">
              No recent football news available.
            </p>

            <p className="mt-0.5 text-[9px] text-muted-foreground">
              New football stories will appear here.
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
            {news.map((item) => (
              <NewsCard
                key={`${item.eventId}:${getTitle(item).toLowerCase()}`}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}