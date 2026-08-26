'use client';

import type {
  CommunityReply,
} from '@/services/community.service';

interface Props {
  reply?: CommunityReply;
}

const HOUR =
  60 * 60 * 1000;

const DAY =
  24 * HOUR;

const timeFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  );

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );

function formatReplyDate(
  date: Date,
): string {
  const now = new Date();

  const diffMs =
    now.getTime() -
    date.getTime();

  const diffHours =
    diffMs / HOUR;

  if (
    diffHours >= 0 &&
    diffHours < 12
  ) {
    const hours =
      Math.floor(diffHours);

    if (hours < 1) {
      return 'Just now';
    }

    return `${hours} ${
      hours === 1
        ? 'hr'
        : 'hrs'
    } ago`;
  }

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

  const replyDateStart =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

  const dayDifference =
    Math.floor(
      (
        todayStart.getTime() -
        replyDateStart.getTime()
      ) / DAY,
    );

  if (dayDifference === 0) {
    return `Today, ${timeFormatter.format(
      date,
    )}`;
  }

  if (dayDifference === 1) {
    return `Yesterday, ${timeFormatter.format(
      date,
    )}`;
  }

  return dateFormatter.format(date);
}

export default function ReplyCard({
  reply,
}: Props) {
  if (!reply) {
    return null;
  }

  const displayName =
    reply.fullName?.trim() ||
    reply.username ||
    'Anonymous';

  const initial =
    displayName
      .charAt(0)
      .toUpperCase() || '?';

  const createdAt =
    new Date(reply.createdAt);

  const formattedTime =
    formatReplyDate(createdAt);

  return (
    <article
      className="
        rounded-md
        border
        border-border/70
        bg-muted/30
        px-2.5
        py-2
      "
    >
      <div
        className="
          flex
          items-start
          gap-2
        "
      >
        {/* AVATAR */}

        <div
          className="
            flex
            size-7
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-primary/10
            text-[11px]
            font-semibold
            text-primary
          "
          aria-hidden="true"
        >
          {initial}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          {/* USER + TIME */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-1
            "
          >
            <p
              className="
                truncate
                text-[11px]
                font-semibold
                leading-tight
                text-foreground
              "
            >
              @{reply.username}
            </p>

            <span
              className="
                text-[10px]
                text-muted-foreground/40
              "
              aria-hidden="true"
            >
              ·
            </span>

            <time
              dateTime={
                createdAt.toISOString()
              }
              className="
                text-[10px]
                leading-tight
                text-muted-foreground
              "
              title={createdAt.toLocaleString()}
            >
              {formattedTime}
            </time>
          </div>

          {/* MESSAGE */}

          <p
            className="
              mt-1
              whitespace-pre-wrap
              break-words
              text-xs
              leading-[1.35rem]
              text-foreground/85
            "
          >
            {reply.message}
          </p>
        </div>
      </div>
    </article>
  );
}