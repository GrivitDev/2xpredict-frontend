'use client';

import {
  motion,
} from 'framer-motion';

import type {
  CommunityReply,
} from '@/services/community.service';

interface Props {
  reply?: CommunityReply;
}


function formatReplyDate(
  date: Date,
): string {

  const now =
    new Date();


  const diffMs =
    now.getTime() -
    date.getTime();


  const diffHours =
    diffMs /
    (
      1000 *
      60 *
      60
    );


  /*
   * Less than 12 hours:
   *
   * Just now
   * 1 hr ago
   * 2 hrs ago
   * 5 hrs ago
   */
  if (
    diffHours >= 0 &&
    diffHours < 12
  ) {

    const hours =
      Math.floor(
        diffHours,
      );


    if (
      hours < 1
    ) {

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
      ) /
      (
        1000 *
        60 *
        60 *
        24
      ),
    );


  /*
   * Today
   */
  if (
    dayDifference === 0
  ) {

    return `Today, ${
      new Intl.DateTimeFormat(
        'en-US',
        {
          hour: 'numeric',
          minute: '2-digit',
        },
      ).format(date)
    }`;

  }


  /*
   * Yesterday
   */
  if (
    dayDifference === 1
  ) {

    return `Yesterday, ${
      new Intl.DateTimeFormat(
        'en-US',
        {
          hour: 'numeric',
          minute: '2-digit',
        },
      ).format(date)
    }`;

  }


  /*
   * Two or more days old
   */
  return new Intl.DateTimeFormat(
    'en-US',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(date);

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
      .toUpperCase() ||
    '?';


  const createdAt =
    new Date(
      reply.createdAt,
    );


  const formattedTime =
    formatReplyDate(
      createdAt,
    );


  return (

    <motion.article

      initial={{
        opacity: 0,
        x: -6,
      }}

      animate={{
        opacity: 1,
        x: 0,
      }}

      transition={{
        duration: 0.2,
      }}

      className="
        rounded-lg
        border
        border-border
        bg-muted/30
        px-3
        py-2.5
      "

    >

      <div
        className="
          flex
          items-start
          gap-2.5
        "
      >

        {/* AVATAR */}

        <div
          className="
            flex
            size-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-primary/10
            text-xs
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
              gap-x-1.5
              gap-y-0.5
            "
          >

            <p
              className="
                truncate
                text-xs
                font-semibold
                text-foreground
              "
            >
              @{reply.username}
            </p>


            <span
              className="
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
                text-[11px]
                text-muted-foreground
              "
              title={
                createdAt.toLocaleString()
              }
            >
              {formattedTime}
            </time>

          </div>


          {/* MESSAGE */}

          <p
            className="
              mt-1.5
              whitespace-pre-wrap
              break-words
              text-sm
              leading-5
              text-foreground/85
            "
          >
            {reply.message}
          </p>

        </div>

      </div>

    </motion.article>

  );

}