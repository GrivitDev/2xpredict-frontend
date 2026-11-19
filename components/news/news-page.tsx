'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  FaArrowUpRightFromSquare,
  FaNewspaper,
  FaPlay,
  FaVideo,
  FaXmark,
} from 'react-icons/fa6';

import { useGetV2SportsNewsQuery } from '@/hooks/use-sports';
import { toFootballNewsFeedItem } from '@/components/news/sports-news-v2.adapter';

import type {
  FootballNewsFeedItem,
} from '@/types/sports';

type UnknownRecord = Record<string, unknown>;

const NEWS_PAGE_SIZE = 24;

interface FeedImage {
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
}

interface NormalizedFeedItem {
  key: string;
  kind: FootballNewsFeedItem['kind'];
  title: string;
  description?: string;
  story?: string;
  publishedAt?: string;
  link?: string;
  images: FeedImage[];
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  source?: string;
}

/* -------------------------------------------------------------------------- */
/* General Helpers                                                            */
/* -------------------------------------------------------------------------- */

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
  );
}

function getObject(
  value: unknown,
): UnknownRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return undefined;
}

function stripHtml(value?: string): string {
  if (!value) return '';

  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatDateTime(value?: string): string {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDuration(value?: number): string {
  if (
    value === undefined ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return '';
  }

  const totalSeconds = Math.round(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/* -------------------------------------------------------------------------- */
/* Image Helpers                                                              */
/* -------------------------------------------------------------------------- */

function firstUrl(
  value: unknown,
  depth = 0,
): string | undefined {
  if (depth > 8) return undefined;

  if (
    typeof value === 'string' &&
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstUrl(item, depth + 1);

      if (found) return found;
    }

    return undefined;
  }

  if (!isRecord(value)) return undefined;

  for (const key of [
    'href',
    'url',
    'src',
    'contentUrl',
    'playbackUrl',
    'file',
  ]) {
    const found = firstUrl(value[key], depth + 1);

    if (found) return found;
  }

  return firstUrl(value.links, depth + 1);
}

function getImages(
  payload: UnknownRecord,
  fallback?: string,
): FeedImage[] {
  const result: FeedImage[] = [];
  const seen = new Set<string>();

  const rawImages = getArray(payload.images);

  for (const value of rawImages) {
    if (!isRecord(value)) continue;

    const urls = Array.isArray(value.url)
      ? value.url
      : [value.url];

    for (const rawUrl of urls) {
      const url = stringValue(rawUrl);

      if (!url || seen.has(url)) continue;

      seen.add(url);

      result.push({
        url,
        alt: stringValue(value.alt),
        caption: stringValue(value.caption),
        credit: stringValue(value.credit),
      });
    }
  }

  if (result.length === 0 && fallback) {
    result.push({ url: fallback });
  }

  return result.slice(0, 6);
}

/* -------------------------------------------------------------------------- */
/* Video Helpers                                                              */
/* -------------------------------------------------------------------------- */

function getVideoUrl(
  payload: UnknownRecord,
): string | undefined {
  const links = getObject(payload.links);
  const source = getObject(links?.source);
  const mobile = getObject(links?.mobile);
  const mobileSource = getObject(mobile?.source);
  const progressive = getObject(links?.progressiveDownload);
  const streaming = getObject(links?.streaming);

  const directCandidates = [
    source?.href,
    getObject(source?.HD)?.href,
    getObject(source?.full)?.href,
    getObject(source?.hds)?.href,
    getObject(source?.mezzanine)?.href,
    mobileSource?.href,
    getObject(mobileSource?.HD)?.href,
  ];

  for (const candidate of directCandidates) {
    const url = stringValue(candidate);

    if (url && /\.(?:mp4|m4v)(?:$|[?#])/i.test(url)) {
      return url;
    }
  }

  return (
    firstUrl(progressive) ??
    firstUrl(source) ??
    firstUrl(streaming)
  );
}

function getVideoThumbnail(
  payload: UnknownRecord,
): string | undefined {
  return (
    stringValue(payload.thumbnail) ??
    firstUrl(payload.image) ??
    firstUrl(payload.images)
  );
}

/* -------------------------------------------------------------------------- */
/* Feed Normalization                                                         */
/* -------------------------------------------------------------------------- */

function linksForArticle(
  payload: UnknownRecord,
): UnknownRecord | undefined {
  const links = getObject(payload.links);

  return getObject(links?.web);
}

function normalizeItem(
  item: FootballNewsFeedItem,
): NormalizedFeedItem {
  const payload = getObject(item.payload) ?? {};

  const isVideo = item.kind === 'VIDEO';

  const title = isVideo
    ? (
        stringValue(payload.headline) ??
        stringValue(payload.title) ??
        'Football video'
      )
    : (
        stringValue(payload.headline) ??
        stringValue(payload.description) ??
        'Football news'
      );

  const description = stringValue(payload.description);
  const story = stringValue(payload.story);

  const publishedAt =
    item.publishedAt ??
    (
      isVideo
        ? stringValue(payload.originalPublishDate)
        : stringValue(payload.published)
    );

  const link =
    stringValue(getObject(linksForArticle(payload))?.href) ??
    firstUrl(payload.links);

  const fallbackImage = isVideo
    ? getVideoThumbnail(payload)
    : stringValue(payload.imageUrl);

  const images = getImages(payload, fallbackImage);

  const videoUrl = isVideo
    ? getVideoUrl(payload)
    : undefined;

  const videoDuration =
    isVideo &&
    typeof payload.duration === 'number' &&
    Number.isFinite(payload.duration)
      ? payload.duration
      : undefined;

  return {
    key: `${item.kind}:${title.trim().toLowerCase()}`,
    kind: item.kind,
    title,
    description,
    story,
    publishedAt,
    link,
    images,
    videoUrl,
    videoThumbnail: fallbackImage,
    videoDuration,
    source:
      stringValue(payload.source) ??
      stringValue(payload.byline),
  };
}

function openInNewTab(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/* -------------------------------------------------------------------------- */
/* Compact News Card                                                          */
/* -------------------------------------------------------------------------- */

function FeedCard({
  item,
  onPlay,
}: {
  item: NormalizedFeedItem;
  onPlay: () => void;
}) {
  const primaryImage = item.images[0];

  const articleText =
    stripHtml(item.story) ||
    stripHtml(item.description);

  const dateLabel = formatDateTime(item.publishedAt);

  return (
    <article
      className="
        group
        flex
        h-full
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
      {/* Media */}

      <div className="relative aspect-video shrink-0 overflow-hidden bg-[#292324]">
        {primaryImage?.url ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.04]
            "
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[#eee7de] text-[#998a80] dark:bg-muted dark:text-muted-foreground">
            {item.kind === 'VIDEO' ? (
              <FaVideo className="size-6" />
            ) : (
              <FaNewspaper className="size-6" />
            )}
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />

        {/* Category */}

        <span
          className="
            absolute
            left-1.5
            top-1.5
            rounded-[3px]
            border
            border-white/20
            bg-[#702b3d]/95
            px-1.5
            py-0.5
            text-[7px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-white
            shadow-sm
          "
        >
          {item.kind === 'VIDEO' ? 'Video' : 'News'}
        </span>

        {/* Video Play */}

        {item.kind === 'VIDEO' ? (
          item.videoUrl ? (
            <button
              type="button"
              onClick={onPlay}
              aria-label={`Play ${item.title}`}
              className="
                absolute
                inset-0
                grid
                place-items-center
                bg-black/5
                transition
                hover:bg-black/20
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-inset
                focus-visible:ring-[#b58b73]
              "
            >
              <span className="grid size-8 place-items-center rounded-full border border-white/70 bg-[#702b3d]/95 text-white shadow-lg transition group-hover:scale-110">
                <FaPlay className="ml-0.5 size-3" />
              </span>

              {item.videoDuration ? (
                <span className="absolute bottom-1.5 right-1.5 rounded-[3px] bg-black/80 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                  {formatDuration(item.videoDuration)}
                </span>
              ) : null}
            </button>
          ) : item.link && openInNewTab(item.link) ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`Watch ${item.title}`}
              className="absolute inset-0 grid place-items-center bg-black/10 transition hover:bg-black/25"
            >
              <span className="grid size-8 place-items-center rounded-full bg-[#702b3d]/95 text-white shadow-lg">
                <FaPlay className="ml-0.5 size-3" />
              </span>
            </a>
          ) : null
        ) : null}

        {/* Date */}

        {dateLabel ? (
          <span className="absolute bottom-1.5 right-1.5 max-w-[85%] truncate rounded-[3px] bg-black/50 px-1.5 py-0.5 text-[7px] font-medium text-white/95 backdrop-blur-sm">
            {dateLabel}
          </span>
        ) : null}
      </div>

      {/* Details */}

      <div className="flex min-w-0 flex-1 flex-col p-1.5 sm:p-2">
        <div className="mb-1 flex min-w-0 items-center gap-1">
          <span className="size-1 shrink-0 rounded-full bg-[#a77b62]" />

          <span className="min-w-0 truncate text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8d6455] dark:text-primary">
            {item.source || 'Football desk'}
          </span>
        </div>

        <h2
          className="
            line-clamp-2
            min-h-[2.65em]
            break-words
            text-[10px]
            font-bold
            leading-[1.35]
            tracking-[-0.015em]
            text-[#352c2b]
            transition-colors
            group-hover:text-[#702b3d]
            sm:text-[11px]
            dark:text-foreground
            dark:group-hover:text-primary
          "
        >
          {item.link &&
          openInNewTab(item.link) &&
          item.kind !== 'VIDEO' ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="decoration-[#702b3d]/40 underline-offset-2 hover:underline"
            >
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h2>

        {item.description ? (
          <p className="mt-1 line-clamp-2 text-[9px] leading-[1.4] text-[#82776f] dark:text-muted-foreground">
            {stripHtml(item.description)}
          </p>
        ) : articleText && item.kind !== 'VIDEO' ? (
          <p className="mt-1 line-clamp-2 text-[9px] leading-[1.4] text-[#82776f] dark:text-muted-foreground">
            {articleText}
          </p>
        ) : null}

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
          <span className="min-w-0 truncate text-[7px] font-bold uppercase tracking-[0.11em] text-[#9b8d83] dark:text-muted-foreground">
            {item.kind === 'VIDEO' ? 'Video report' : 'News report'}
          </span>

          {item.link && openInNewTab(item.link) ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex
                shrink-0
                items-center
                gap-1
                text-[8px]
                font-bold
                uppercase
                tracking-[0.06em]
                text-[#702b3d]
                transition
                hover:underline
                dark:text-primary
              "
            >
              {item.kind === 'VIDEO' ? 'Watch' : 'Read'}
              <FaArrowUpRightFromSquare className="size-2" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Expanded Video Card                                                        */
/* -------------------------------------------------------------------------- */

function FeaturedVideoCard({
  item,
  onClose,
}: {
  item: NormalizedFeedItem;
  onClose: () => void;
}) {
  const dateLabel = formatDateTime(item.publishedAt);
  const articleText =
    stripHtml(item.description) ||
    stripHtml(item.story);

  return (
    <article
      className="
        grid
        min-w-0
        overflow-hidden
        rounded-lg
        border
        border-[#d6c4b0]
        bg-[#fffdf9]
        shadow-[0_5px_20px_rgba(43,32,29,0.09)]
        dark:border-border/70
        dark:bg-card
        lg:grid-cols-[minmax(0,1.75fr)_minmax(260px,0.85fr)]
      "
    >
      {/* Large Video Player */}

      <div className="relative aspect-video min-w-0 overflow-hidden bg-black">
        {item.videoUrl ? (
          <video
            className="h-full w-full bg-black object-contain"
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={item.videoThumbnail}
            src={item.videoUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-[11px] text-white/70">
            This video is no longer available.
          </div>
        )}

        {/* Playing Badge */}

        <span className="absolute left-2 top-2 rounded-[3px] border border-white/20 bg-[#702b3d]/95 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-white shadow backdrop-blur-sm">
          Now playing
        </span>

        {/* Duration */}

        {item.videoDuration ? (
          <span className="absolute bottom-2 right-2 rounded-[3px] bg-black/70 px-2 py-1 text-[9px] font-semibold text-white">
            {formatDuration(item.videoDuration)}
          </span>
        ) : null}
      </div>

      {/* Video Information */}

      <div className="flex min-w-0 flex-col p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="size-1.5 shrink-0 rounded-full bg-[#702b3d] dark:bg-primary" />

            <span className="truncate text-[8px] font-bold uppercase tracking-[0.17em] text-[#956b57] dark:text-primary">
              Football video report
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="
              flex
              size-7
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              border-[#ded2c2]
              text-[#74645c]
              transition
              hover:border-[#702b3d]/40
              hover:bg-[#f0e9df]
              hover:text-[#702b3d]
              dark:border-border
              dark:text-muted-foreground
              dark:hover:bg-muted
              dark:hover:text-foreground
            "
          >
            <FaXmark className="size-3" />
          </button>
        </div>

        <h2 className="mt-2 font-serif text-base font-semibold leading-snug tracking-tight text-[#382b2b] sm:text-lg dark:text-foreground">
          {item.title}
        </h2>

        {dateLabel ? (
          <p className="mt-1 text-[9px] text-[#93867c] dark:text-muted-foreground">
            {dateLabel}
          </p>
        ) : null}

        {articleText ? (
          <p className="mt-2 line-clamp-4 text-[10px] leading-relaxed text-[#756a64] sm:text-[11px] dark:text-muted-foreground">
            {articleText}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#e9dfd2] pt-3 dark:border-border/70">
          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-[#a08d80] dark:text-muted-foreground">
              Presented by
            </p>

            <p className="mt-0.5 truncate text-[10px] font-semibold text-[#5b4945] dark:text-foreground">
              {item.source || 'Football desk'}
            </p>
          </div>

          {item.link && openInNewTab(item.link) ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-md
                bg-[#702b3d]
                px-2.5
                py-1.5
                text-[8px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-white
                transition
                hover:bg-[#572130]
              "
            >
              Open source
              <FaArrowUpRightFromSquare className="size-2" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function FeedSkeleton({
  count = 10,
}: {
  count?: number;
}) {
  return (
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
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="min-w-0 overflow-hidden rounded-lg border border-[#ded2c2]/70 bg-[#fffdf9] dark:border-border/70 dark:bg-card"
        >
          <div className="aspect-video animate-pulse bg-[#e9e1d7] dark:bg-muted" />

          <div className="space-y-1.5 p-1.5 sm:p-2">
            <div className="h-2 w-2/5 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[#d8c9b8] bg-[#fffdf9] px-3 py-8 text-center dark:border-border dark:bg-card">
      <div className="mx-auto grid size-9 place-items-center rounded-full bg-[#eee5dc] text-[#8d6455] dark:bg-muted dark:text-muted-foreground">
        <FaNewspaper className="size-4" />
      </div>

      <p className="mt-2 font-serif text-base font-semibold text-[#463536] dark:text-foreground">
        No football stories
      </p>

      <p className="mt-1 text-[10px] text-[#92867d] dark:text-muted-foreground">
        New football stories will appear here.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* News Feed Helpers                                                          */
/* -------------------------------------------------------------------------- */

function getTitleKey(item: FootballNewsFeedItem): string {
  return normalizeItem(item).title.trim().toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Page Header                                                                */
/* -------------------------------------------------------------------------- */

function NewsHeader({
  newsCount,
  videoCount,
  search,
}: {
  newsCount: number;
  videoCount: number;
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
          2XP / Football newsroom
        </p>

        <h1 className="font-serif text-[18px] font-semibold leading-tight tracking-tight text-[#392b2d] sm:text-xl dark:text-foreground">
          The Football Desk
        </h1>

        <p className="mt-0.5 text-[9px] text-[#897d74] sm:text-[10px] dark:text-muted-foreground">
          News, analysis and matchday coverage.
        </p>

        {search ? (
          <p className="mt-1 truncate text-[9px] text-[#702b3d] dark:text-primary">
            Search: <span className="font-semibold">{search}</span>
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="min-w-[48px] rounded-md border border-[#dfd1c0] bg-[#fffdf9] px-2 py-1.5 text-center dark:border-border dark:bg-card">
          <p className="font-serif text-base font-semibold leading-none text-[#702b3d] dark:text-primary">
            {newsCount}
          </p>

          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em] text-[#8d8077] dark:text-muted-foreground">
            News
          </p>
        </div>

        <div className="min-w-[48px] rounded-md border border-[#dfd1c0] bg-[#fffdf9] px-2 py-1.5 text-center dark:border-border dark:bg-card">
          <p className="font-serif text-base font-semibold leading-none text-[#702b3d] dark:text-primary">
            {videoCount}
          </p>

          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em] text-[#8d8077] dark:text-muted-foreground">
            Videos
          </p>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function NewsPage({
  className,
}: {
  className?: string;
}) {
  const searchParams = useSearchParams();

  const search = searchParams.get('q') ?? '';

  const newsQuery = useGetV2SportsNewsQuery(
    { query: { limit: 100 } },
    {
      staleTime: 60_000,
      refetchInterval: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  );

  const streamItems = useMemo(
    () => (newsQuery.data ?? []).map(toFootballNewsFeedItem),
    [newsQuery.data],
  );
  const streamLoading = newsQuery.isLoading;
  const streamError = newsQuery.isError;

  const [playingVideoKey, setPlayingVideoKey] = useState<
    string | null
  >(null);

  const [visibleCount, setVisibleCount] = useState(
    NEWS_PAGE_SIZE,
  );

  const activeVideoRef = useRef<HTMLElement | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Scroll to Expanded Player                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!playingVideoKey || !activeVideoRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      activeVideoRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [playingVideoKey]);

  /* ---------------------------------------------------------------------- */
  /* Search and Feed                                                        */
  /* ---------------------------------------------------------------------- */

  const feedItems = streamItems;

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return feedItems;

    return feedItems.filter((item) =>
      [
        normalizeItem(item).title,
        normalizeItem(item).description,
        normalizeItem(item).story,
        normalizeItem(item).source,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [feedItems, search]);

  const hasItems = filteredItems.length > 0;

  const visibleItems = filteredItems.slice(
    0,
    visibleCount,
  );

  const getStableCardKey = (item: FootballNewsFeedItem) => {
    const normalized = normalizeItem(item);

    return normalized.key || `${item.kind}:${getTitleKey(item)}`;
  };

  /* ---------------------------------------------------------------------- */
  /* Active Video                                                           */
  /* ---------------------------------------------------------------------- */

  const activeVideoItem = visibleItems.find(
    (item) =>
      item.kind === 'VIDEO' &&
      getStableCardKey(item) === playingVideoKey,
  );

  /*
   * Remove the selected video from the compact grid while
   * displaying it in the larger player at the top.
   */

  const remainingItems = activeVideoItem
    ? visibleItems.filter(
        (item) =>
          getStableCardKey(item) !==
          getStableCardKey(activeVideoItem),
      )
    : visibleItems;

  const newsCount = filteredItems.filter(
    (item) => item.kind !== 'VIDEO',
  ).length;

  const videoCount = filteredItems.filter(
    (item) => item.kind === 'VIDEO',
  ).length;

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main
      className={[
        'min-h-screen bg-[#f8f5ef] dark:bg-background',
        className ?? '',
      ].join(' ')}
    >
      <div className="mx-auto w-full max-w-[1440px] px-2.5 py-2 sm:px-3 sm:py-3 lg:px-4">

        {/* Header */}

        <NewsHeader
          newsCount={newsCount}
          videoCount={videoCount}
          search={search}
        />

        {/* Stream Error */}

        {streamError ? (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-[9px] text-red-700 dark:text-red-300">
              Football news could not be loaded.
            </p>

            <span className="shrink-0 text-[8px] font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
              Connection issue
            </span>
          </div>
        ) : null}

        {/* Loading */}

        {!hasItems && streamLoading ? (
          <FeedSkeleton count={10} />
        ) : !hasItems ? (
          <EmptyState />
        ) : (
          <>
            {/* Expanded Video Player */}

            {activeVideoItem ? (
              <section
                ref={activeVideoRef}
                aria-label="Now playing"
                className="mb-3 scroll-mt-28"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#702b3d] dark:bg-primary" />

                    <h2 className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[#702b3d] dark:text-primary">
                      Now playing
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPlayingVideoKey(null)}
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-md
                      border
                      border-[#ded2c2]
                      bg-[#fffdf9]
                      px-2
                      py-1
                      text-[9px]
                      font-semibold
                      text-[#74645c]
                      transition
                      hover:border-[#702b3d]/40
                      hover:bg-[#f0e9df]
                      hover:text-[#702b3d]
                      dark:border-border
                      dark:bg-card
                      dark:text-muted-foreground
                      dark:hover:bg-muted
                    "
                  >
                    <FaXmark className="size-2.5" />
                    Close player
                  </button>
                </div>

                <FeaturedVideoCard
                  item={normalizeItem(activeVideoItem)}
                  onClose={() => setPlayingVideoKey(null)}
                />
              </section>
            ) : null}

            {/* Feed Caption */}

            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="size-1.5 shrink-0 rounded-full bg-[#702b3d]" />

                <p className="truncate text-[8px] font-bold uppercase tracking-[0.16em] text-[#8d786c] dark:text-muted-foreground">
                  {activeVideoItem
                    ? 'More from the newsroom'
                    : 'Latest from the football desk'}
                </p>
              </div>

              <span className="shrink-0 text-[8px] text-[#94877d] dark:text-muted-foreground">
                {remainingItems.length} stories
              </span>
            </div>

            {/* Compact News Grid */}

            {remainingItems.length > 0 ? (
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
                {remainingItems.map((item) => {
                  const normalized = normalizeItem(item);

                  const itemKey = getStableCardKey(item);

                  return (
                    <div
                      key={itemKey}
                      className="min-w-0"
                    >
                      <FeedCard
                        item={{
                          ...normalized,
                          key: itemKey,
                        }}
                        onPlay={() => setPlayingVideoKey(itemKey)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : activeVideoItem ? null : (
              <EmptyState />
            )}

            {/* Show More */}

            {visibleCount < filteredItems.length ? (
              <div className="flex justify-center py-3">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) =>
                      Math.min(
                        count + NEWS_PAGE_SIZE,
                        filteredItems.length,
                      ),
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-md
                    border
                    border-[#d9cbbb]
                    bg-[#fffdf9]
                    px-3
                    py-1.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    text-[#702b3d]
                    transition
                    hover:border-[#702b3d]/50
                    hover:bg-[#f0e9df]
                    dark:border-border
                    dark:bg-card
                    dark:text-primary
                    dark:hover:bg-muted
                  "
                >
                  Show more

                  <span className="text-[8px] opacity-65">
                    {filteredItems.length - visibleCount} remaining
                  </span>
                </button>
              </div>
            ) : null}

            {/* Streaming Indicator */}

            {streamLoading ? (
              <div className="flex items-center justify-center gap-1.5 py-2 text-[9px] text-[#93877e] dark:text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-[#702b3d]" />
                Refreshing football news...
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}