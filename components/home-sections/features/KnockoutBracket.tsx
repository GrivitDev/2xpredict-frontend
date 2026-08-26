'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import {
  Clock3,
  GitBranch,
  Trophy,
} from 'lucide-react';

import type {
  KnockoutMatch,
  KnockoutStage,
} from '@/services/sports.service';

interface Props {
  stages: KnockoutStage[];
}

type BracketRound =
  | 'FINAL'
  | 'THIRD_PLACE'
  | 'SEMI_FINALS'
  | 'QUARTER_FINALS'
  | 'ROUND_OF_16'
  | 'ROUND_OF_32';

const LIVE_STATUSES = new Set([
  'IN_PLAY',
  'PAUSED',
  'LIVE',
]);

const ROUND_LABELS: Record<BracketRound, string> = {
  FINAL: 'Final',
  THIRD_PLACE: 'Third Place',
  SEMI_FINALS: 'Semi-finals',
  QUARTER_FINALS: 'Quarter-finals',
  ROUND_OF_16: 'Round of 16',
  ROUND_OF_32: 'Round of 32',
};

const ROUND_ORDER: BracketRound[] = [
  'FINAL',
  'THIRD_PLACE',
  'SEMI_FINALS',
  'QUARTER_FINALS',
  'ROUND_OF_16',
  'ROUND_OF_32',
];

const getRoundType = (
  stage?: string,
): BracketRound | null => {
  switch (stage) {
    case 'FINAL':
      return 'FINAL';
    case 'THIRD_PLACE':
      return 'THIRD_PLACE';
    case 'SEMI_FINALS':
      return 'SEMI_FINALS';
    case 'QUARTER_FINALS':
      return 'QUARTER_FINALS';
    case 'LAST_16':
    case 'ROUND_OF_16':
      return 'ROUND_OF_16';
    case 'ROUND_OF_32':
      return 'ROUND_OF_32';
    default:
      return null;
  }
};

const isLiveStatus = (status?: string) =>
  !!status && LIVE_STATUSES.has(status);

const isFinishedStatus = (status?: string) =>
  status === 'FINISHED';

const formatDate = (
  date: string,
  options: Intl.DateTimeFormatOptions,
  fallback: string,
) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'UTC',
      ...options,
    },
  ).format(parsed);
};

const formatMatchDate = (date: string) =>
  formatDate(
    date,
    {
      day: '2-digit',
      month: 'short',
    },
    '--',
  );

const formatKickoffTime = (date: string) =>
  `${formatDate(
    date,
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    '--:--',
  )} UTC`;

const getStatusLabel = (
  match: KnockoutMatch,
) => {
  if (isLiveStatus(match.status)) {
    if (match.minute != null) {
      return match.injuryTime &&
        match.injuryTime > 0
        ? `${match.minute}'+${match.injuryTime}`
        : `${match.minute}'`;
    }

    return 'LIVE';
  }

  return isFinishedStatus(match.status)
    ? 'FT'
    : 'Upcoming';
};

const getWinner = (
  match: KnockoutMatch,
): 'home' | 'away' | null => {
  if (!isFinishedStatus(match.status)) {
    return null;
  }

  const home = match.homeScore ?? 0;
  const away = match.awayScore ?? 0;

  if (home > away) return 'home';
  if (away > home) return 'away';

  return null;
};

function Team({
  name,
  crest,
  winner,
}: {
  name?: string;
  crest?: string;
  winner?: boolean;
}) {
  return (
    <div
      className="
        flex
        min-w-0
        flex-col
        items-center
        gap-1
      "
    >
      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          border
          ${
            winner
              ? 'border-yellow-500/30 bg-yellow-500/10'
              : 'border-border/50 bg-muted/30'
          }
        `}
      >
        {crest ? (
          <Image
            src={crest}
            alt=""
            width={32}
            height={32}
            className="
              h-8
              w-8
              object-contain
            "
          />
        ) : (
          <Trophy
            className="
              h-4
              w-4
              text-muted-foreground
            "
          />
        )}
      </div>

      <span
        className="
          line-clamp-2
          min-h-[2rem]
          w-full
          text-center
          text-xs
          font-semibold
          leading-tight
          text-foreground
        "
      >
        {name?.trim() || 'TBD'}
      </span>
    </div>
  );
}

function MatchCard({
  match,
}: {
  match?: KnockoutMatch;
}) {
  if (!match) {
    return (
      <div
        className="
          flex
          min-h-[136px]
          w-full
          items-center
          justify-center
          rounded-xl
          border
          border-dashed
          border-border/60
          bg-background/20
          text-xs
          text-muted-foreground
        "
      >
        Match pending
      </div>
    );
  }

  const live = isLiveStatus(match.status);
  const finished = isFinishedStatus(match.status);
  const winner = getWinner(match);

  return (
    <article
      className="
        w-full
        rounded-xl
        border
        border-border
        bg-card/95
        p-2.5
        shadow-sm
        backdrop-blur-xl
        transition
        hover:border-primary/30
        hover:shadow-md
      "
    >
      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <div
          className="
            flex
            items-center
            gap-1
            text-[10px]
            text-muted-foreground
          "
        >
          <Clock3 className="h-3 w-3" />
          {formatMatchDate(match.date)}
        </div>

        <span
          className={`
            inline-flex
            items-center
            gap-1
            rounded-full
            px-1.5
            py-0.5
            text-[10px]
            font-bold
            ${
              live
                ? 'bg-red-500/10 text-red-500'
                : finished
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-yellow-500/10 text-yellow-500'
            }
          `}
        >
          {live && (
            <span
              className="
                h-1.5
                w-1.5
                animate-pulse
                rounded-full
                bg-current
              "
            />
          )}

          {getStatusLabel(match)}
        </span>
      </div>

      <div
        className="
          mb-2
          text-center
          text-[10px]
          font-medium
          tabular-nums
          text-muted-foreground
        "
      >
        {formatKickoffTime(match.date)}
      </div>

      <div
        className="
          grid
          grid-cols-[1fr_auto_1fr]
          items-start
          gap-2
        "
      >
        <Team
          name={match.homeTeam}
          crest={match.homeTeamBadge}
          winner={winner === 'home'}
        />

        <div
          className="
            flex
            min-w-[64px]
            flex-col
            items-center
            pt-2
          "
        >
          <span
            className="
              whitespace-nowrap
              text-xl
              font-black
              leading-none
              tracking-tight
              text-foreground
            "
          >
            {match.homeScore ?? 0}

            <span
              className="
                mx-1
                text-muted-foreground
              "
            >
              :
            </span>

            {match.awayScore ?? 0}
          </span>
        </div>

        <Team
          name={match.awayTeam}
          crest={match.awayTeamBadge}
          winner={winner === 'away'}
        />
      </div>
    </article>
  );
}

function RoundHeader({
  round,
  count,
  active,
  onClick,
}: {
  round: BracketRound;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const isFinal = round === 'FINAL';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        mx-auto
        flex
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        px-3
        py-1.5
        transition
        ${
          isFinal
            ? 'border-yellow-500/30 bg-yellow-500/[0.08]'
            : active
              ? 'border-primary/30 bg-primary/[0.06]'
              : 'border-border/60 bg-muted/20 hover:bg-muted/40'
        }
      `}
    >
      {isFinal ? (
        <Trophy className="h-4 w-4 text-yellow-500" />
      ) : (
        <GitBranch className="h-4 w-4 text-muted-foreground" />
      )}

      <span
        className="
          text-xs
          font-bold
          text-foreground
        "
      >
        {ROUND_LABELS[round]}
      </span>

      <span
        className="
          rounded-full
          bg-muted
          px-1.5
          py-0.5
          text-[10px]
          text-muted-foreground
        "
      >
        {count}
      </span>
    </button>
  );
}

function BranchConnector({
  childCount,
}: {
  childCount: number;
}) {
  const branchPositions = Array.from(
    { length: childCount },
    (_, index) =>
      `${((index + 0.5) / childCount) * 100}%`,
  );

  return (
    <div
      aria-hidden="true"
      className="
        relative
        mx-auto
        h-6
        min-w-[760px]
        max-w-6xl
      "
    >
      <div
        className="
          absolute
          left-1/2
          top-0
          h-3
          w-px
          -translate-x-1/2
          bg-border
        "
      />

      <div
        className="
          absolute
          left-1/2
          top-3
          h-px
          -translate-x-1/2
          bg-border
        "
        style={{
          width:
            childCount === 2
              ? '50%'
              : '75%',
        }}
      />

      {branchPositions.map((left) => (
        <div
          key={left}
          className="
            absolute
            top-3
            h-3
            w-px
            bg-border
          "
          style={{ left }}
        />
      ))}
    </div>
  );
}

function RoundGrid({
  matches,
  columns,
}: {
  matches: KnockoutMatch[];
  columns: number;
}) {
  const visibleMatches = Array.from(
    { length: columns },
    (_, index) => matches[index],
  );

  return (
    <div
      className="
        mx-auto
        grid
        min-w-[760px]
        max-w-6xl
        gap-2
      "
      style={{
        gridTemplateColumns:
          `repeat(${columns}, minmax(140px, 1fr))`,
      }}
    >
      {visibleMatches.map((match, index) => (
        <div
          key={
            match?.id ??
            `empty-${index}`
          }
        >
          <MatchCard match={match} />
        </div>
      ))}
    </div>
  );
}

const ROUND_CONFIG: {
  round: BracketRound;
  columns: number;
  connector?: number;
}[] = [
  {
    round: 'SEMI_FINALS',
    columns: 2,
    connector: 2,
  },
  {
    round: 'QUARTER_FINALS',
    columns: 4,
    connector: 4,
  },
  {
    round: 'ROUND_OF_16',
    columns: 8,
    connector: 8,
  },
  {
    round: 'ROUND_OF_32',
    columns: 16,
    connector: 16,
  },
];

export default function KnockoutBracket({
  stages,
}: Props) {
  const rounds = useMemo(() => {
    const grouped = Object.fromEntries(
      ROUND_ORDER.map((round) => [round, []])
    ) as unknown as Record<
      BracketRound,
      KnockoutMatch[]
    >;

    for (const stage of stages) {
      const round = getRoundType(stage.stage);

      if (round) {
        grouped[round].push(
          ...(stage.matches ?? []),
        );
      }
    }

    return grouped;
  }, [stages]);

  const [activeRound, setActiveRound] =
    useState<BracketRound | null>(null);

  const hasAny = ROUND_ORDER.some(
    (round) => rounds[round].length > 0,
  );

  const scrollToRound = (
    round: BracketRound,
  ) => {
    setActiveRound(round);

    document
      .getElementById(`knockout-${round}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
  };

  if (!hasAny) {
    return (
      <section
        className="
          rounded-3xl
          border
          border-border
          bg-card/60
          p-4
          text-center
          shadow-xl
        "
      >
        <GitBranch
          className="
            mx-auto
            mb-3
            h-8
            w-8
            text-muted-foreground
          "
        />

        <p
          className="
            text-sm
            font-semibold
            text-foreground
          "
        >
          Knockout stage unavailable
        </p>

        <p
          className="
            mt-1
            text-xs
            text-muted-foreground
          "
        >
          No knockout matches have been published yet.
        </p>
      </section>
    );
  }

  const renderRound = (
    round: BracketRound,
    columns: number,
  ) => {
    const matches = rounds[round];

    if (!matches.length) {
      return null;
    }

    return (
      <div
        id={`knockout-${round}`}
        className="scroll-mt-24"
      >
        <RoundHeader
          round={round}
          count={matches.length}
          active={activeRound === round}
          onClick={() => scrollToRound(round)}
        />

        <div className="mt-2">
          <RoundGrid
            matches={matches}
            columns={columns}
          />
        </div>
      </div>
    );
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/60
        p-3
        shadow-xl
        backdrop-blur-xl
        sm:p-4
      "
    >
      <div
        className="
          relative
          mb-3
          flex
          items-center
          justify-center
          gap-2
        "
      >
        <div
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-yellow-500/10
            text-yellow-500
          "
        >
          <GitBranch className="h-4 w-4" />
        </div>

        <div>
          <h2
            className="
              text-base
              font-bold
              text-foreground
            "
          >
            Knockout Stage
          </h2>

          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            Follow the tournament path
          </p>
        </div>
      </div>

      <div
        className="
          overflow-x-auto
          overscroll-x-contain
          pb-2
        "
      >
        <div
          className="
            min-w-[760px]
            px-1
          "
        >
          <div
            id="knockout-FINAL"
            className="
              mx-auto
              w-[220px]
              scroll-mt-24
            "
          >
            <RoundHeader
              round="FINAL"
              count={rounds.FINAL.length}
              active={activeRound === 'FINAL'}
              onClick={() => scrollToRound('FINAL')}
            />

            <div className="mt-2">
              <MatchCard match={rounds.FINAL[0]} />
            </div>
          </div>

          {rounds.THIRD_PLACE.length > 0 && (
            <>
              <div
                className="
                  mx-auto
                  my-2
                  w-[220px]
                "
              >
                <RoundHeader
                  round="THIRD_PLACE"
                  count={rounds.THIRD_PLACE.length}
                  active={
                    activeRound === 'THIRD_PLACE'
                  }
                  onClick={() =>
                    scrollToRound('THIRD_PLACE')
                  }
                />
              </div>

              <div
                id="knockout-THIRD_PLACE"
                className="
                  mx-auto
                  w-[220px]
                  scroll-mt-24
                "
              >
                <MatchCard
                  match={rounds.THIRD_PLACE[0]}
                />
              </div>
            </>
          )}

          {ROUND_CONFIG.map(
            ({
              round,
              columns,
              connector,
            }) => {
              const matches = rounds[round];

              if (!matches.length) {
                return null;
              }

              return (
                <div key={round}>
                  <BranchConnector
                    childCount={
                      connector ?? columns
                    }
                  />

                  {renderRound(
                    round,
                    columns,
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      <div
        className="
          mt-3
          flex
          flex-wrap
          items-center
          justify-center
          gap-x-4
          gap-y-2
          border-t
          border-border/50
          pt-2.5
          text-xs
          text-muted-foreground
        "
      >
        <span
          className="
            flex
            items-center
            gap-1.5
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-yellow-500
            "
          />
          Winner
        </span>

        <span
          className="
            flex
            items-center
            gap-1.5
          "
        >
          <span
            className="
              h-2
              w-2
              animate-pulse
              rounded-full
              bg-red-500
            "
          />
          Live
        </span>

        <span
          className="
            flex
            items-center
            gap-1.5
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-muted-foreground
            "
          />
          Upcoming
        </span>
      </div>
    </section>
  );
}