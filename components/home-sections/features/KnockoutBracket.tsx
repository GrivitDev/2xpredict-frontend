'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  Clock3,
  GitBranch,
  Trophy,
} from 'lucide-react';

import type {
  KnockoutMatch,
  KnockoutStage,
} from '@/services/sports.service';


// ============================================================
// TYPES
// ============================================================

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


// ============================================================
// HELPERS
// ============================================================

const isLiveStatus = (
  status?: string,
): boolean => {

  return (
    status === 'IN_PLAY' ||
    status === 'PAUSED' ||
    status === 'LIVE'
  );

};


const isFinishedStatus = (
  status?: string,
): boolean => {

  return status === 'FINISHED';

};


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


const getRoundLabel = (
  round: BracketRound,
): string => {

  switch (round) {

    case 'FINAL':
      return 'Final';

    case 'THIRD_PLACE':
      return 'Third Place';

    case 'SEMI_FINALS':
      return 'Semi-finals';

    case 'QUARTER_FINALS':
      return 'Quarter-finals';

    case 'ROUND_OF_16':
      return 'Round of 16';

    case 'ROUND_OF_32':
      return 'Round of 32';

  }

};


const formatMatchDate = (
  date: string,
): string => {

  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {

    return '--';

  }


  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
    },
  ).format(parsed);

};


const formatKickoffTime = (
  date: string,
): string => {

  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {

    return '--:-- UTC';

  }


  return (
    new Intl.DateTimeFormat(
      'en-GB',
      {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
    ).format(parsed) +
    ' UTC'
  );

};


const getStatusLabel = (
  match: KnockoutMatch,
): string => {

  if (
    isLiveStatus(
      match.status,
    )
  ) {

    if (
      match.minute != null
    ) {

      if (
        match.injuryTime &&
        match.injuryTime > 0
      ) {

        return `${match.minute}'+${match.injuryTime}`;

      }

      return `${match.minute}'`;

    }

    return 'LIVE';

  }


  if (
    isFinishedStatus(
      match.status,
    )
  ) {

    return 'FT';

  }


  return 'Upcoming';

};


const getWinner = (
  match: KnockoutMatch,
): 'home' | 'away' | null => {

  if (
    !isFinishedStatus(
      match.status,
    )
  ) {

    return null;

  }


  const home =
    match.homeScore ?? 0;

  const away =
    match.awayScore ?? 0;


  if (
    home > away
  ) {

    return 'home';

  }


  if (
    away > home
  ) {

    return 'away';

  }


  return null;

};


// ============================================================
// TEAM
// ============================================================

function Team({
  name,
  crest,
  winner,
}: {
  name?: string;
  crest?: string;
  winner?: boolean;
}) {

  const teamName =
    name?.trim() ||
    'TBD';


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
              ? `
                border-yellow-500/30
                bg-yellow-500/10
              `
              : `
                border-border/50
                bg-muted/30
              `
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
        {teamName}
      </span>

    </div>

  );

}


// ============================================================
// MATCH CARD
// ============================================================

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


  const winner =
    getWinner(
      match,
    );


  const live =
    isLiveStatus(
      match.status,
    );


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

      {/* ==================================================
          DATE + STATUS
      ================================================== */}

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

          <Clock3
            className="
              h-3
              w-3
            "
          />

          {formatMatchDate(
            match.date,
          )}

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
                ? `
                  bg-red-500/10
                  text-red-500
                `
                : isFinishedStatus(
                    match.status,
                  )
                  ? `
                    bg-muted
                    text-muted-foreground
                  `
                  : `
                    bg-yellow-500/10
                    text-yellow-500
                  `
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

          {getStatusLabel(
            match,
          )}

        </span>

      </div>


      {/* ==================================================
          KICKOFF
      ================================================== */}

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
        {formatKickoffTime(
          match.date,
        )}
      </div>


      {/* ==================================================
          TEAMS + SCORE
      ================================================== */}

      <div
        className="
          grid
          grid-cols-[1fr_auto_1fr]
          items-start
          gap-2
        "
      >

        <Team
          name={
            match.homeTeam
          }
          crest={
            match.homeTeamBadge
          }
          winner={
            winner === 'home'
          }
        />


        {/* SCORE */}

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
          name={
            match.awayTeam
          }
          crest={
            match.awayTeamBadge
          }
          winner={
            winner === 'away'
          }
        />

      </div>

    </article>

  );

}


// ============================================================
// ROUND HEADER
// ============================================================

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

  const isFinal =
    round === 'FINAL';


  return (

    <button
      type="button"
      onClick={
        onClick
      }
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
            ? `
              border-yellow-500/30
              bg-yellow-500/[0.08]
            `
            : active
              ? `
                border-primary/30
                bg-primary/[0.06]
              `
              : `
                border-border/60
                bg-muted/20
                hover:bg-muted/40
              `
        }
      `}
    >

      {isFinal ? (

        <Trophy
          className="
            h-4
            w-4
            text-yellow-500
          "
        />

      ) : (

        <GitBranch
          className="
            h-4
            w-4
            text-muted-foreground
          "
        />

      )}


      <span
        className="
          text-xs
          font-bold
          text-foreground
        "
      >
        {getRoundLabel(
          round,
        )}
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


// ============================================================
// CONNECTOR
// ============================================================

function BranchConnector({
  childCount,
}: {
  childCount: number;
}) {

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

      {/* Parent vertical */}

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


      {/* Horizontal branch */}

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


      {/* Child branches */}

      {Array.from({
        length:
          childCount,
      }).map(
        (_, index) => {

          const left =
            (
              index +
              0.5
            ) /
            childCount *
            100;


          return (

            <div
              key={
                index
              }
              className="
                absolute
                top-3
                h-3
                w-px
                bg-border
              "
              style={{
                left:
                  `${left}%`,
              }}
            />

          );

        },
      )}

    </div>

  );

}


// ============================================================
// ROUND GRID
// ============================================================

function RoundGrid({
  matches,
  columns,
}: {
  matches: KnockoutMatch[];
  columns: number;
}) {

  const safeMatches =
    Array.from(
      {
        length:
          columns,
      },
      (_, index) =>
        matches[index],
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

      {safeMatches.map(
        (
          match,
          index,
        ) => (

          <div
            key={
              match?.id ??
              `empty-${index}`
            }
          >

            <MatchCard
              match={
                match
              }
            />

          </div>

        ),
      )}

    </div>

  );

}


// ============================================================
// COMPONENT
// ============================================================

export default function KnockoutBracket({
  stages,
}: Props) {

  const rounds =
    useMemo(() => {

      const grouped: Record<
        BracketRound,
        KnockoutMatch[]
      > = {

        FINAL: [],

        THIRD_PLACE: [],

        SEMI_FINALS: [],

        QUARTER_FINALS: [],

        ROUND_OF_16: [],

        ROUND_OF_32: [],

      };


      for (
        const stage of stages
      ) {

        const round =
          getRoundType(
            stage.stage,
          );


        if (!round) {
          continue;
        }


        grouped[
          round
        ].push(
          ...(
            stage.matches ??
            []
          ),
        );

      }


      return grouped;

    }, [
      stages,
    ]);


  const [
    activeRound,
    setActiveRound,
  ] = useState<
    BracketRound | null
  >(null);


  const hasAny =
    Object.values(
      rounds,
    ).some(
      value =>
        value.length > 0,
    );


  const scrollToRound = (
    round: BracketRound,
  ) => {

    setActiveRound(
      round,
    );


    document
      .getElementById(
        `knockout-${round}`,
      )
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

      {/* ======================================================
          HEADER
      ====================================================== */}

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

          <GitBranch
            className="
              h-4
              w-4
            "
          />

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


      {/* ======================================================
          BRACKET SCROLLER
      ====================================================== */}

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

          {/* ==================================================
              FINAL
          ================================================== */}

          <div
            id="knockout-FINAL"
            className="
              scroll-mt-24
              mx-auto
              w-[220px]
            "
          >

            <RoundHeader
              round="FINAL"
              count={
                rounds.FINAL.length
              }
              active={
                activeRound ===
                'FINAL'
              }
              onClick={() =>
                scrollToRound(
                  'FINAL',
                )
              }
            />


            <div
              className="
                mt-2
              "
            >

              <MatchCard
                match={
                  rounds.FINAL[0]
                }
              />

            </div>

          </div>


          {/* ==================================================
              THIRD PLACE
          ================================================== */}

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
                  count={
                    rounds.THIRD_PLACE.length
                  }
                  active={
                    activeRound ===
                    'THIRD_PLACE'
                  }
                  onClick={() =>
                    scrollToRound(
                      'THIRD_PLACE',
                    )
                  }
                />

              </div>


              <div
                id="knockout-THIRD_PLACE"
                className="
                  scroll-mt-24
                  mx-auto
                  w-[220px]
                "
              >

                <MatchCard
                  match={
                    rounds
                      .THIRD_PLACE[0]
                  }
                />

              </div>

            </>

          )}


          {/* ==================================================
              TREE ROOT → SEMI FINALS
          ================================================== */}

          <BranchConnector
            childCount={2}
          />


          {/* ==================================================
              SEMI FINALS
          ================================================== */}

          <div
            id="knockout-SEMI_FINALS"
            className="
              scroll-mt-24
            "
          >

            <RoundHeader
              round="SEMI_FINALS"
              count={
                rounds.SEMI_FINALS.length
              }
              active={
                activeRound ===
                'SEMI_FINALS'
              }
              onClick={() =>
                scrollToRound(
                  'SEMI_FINALS',
                )
              }
            />


            <div
              className="
                mt-2
              "
            >

              <RoundGrid
                matches={
                  rounds.SEMI_FINALS
                }
                columns={2}
              />

            </div>

          </div>


          {/* ==================================================
              QUARTER FINALS
          ================================================== */}

          <BranchConnector
            childCount={4}
          />


          <div
            id="knockout-QUARTER_FINALS"
            className="
              scroll-mt-24
            "
          >

            <RoundHeader
              round="QUARTER_FINALS"
              count={
                rounds
                  .QUARTER_FINALS
                  .length
              }
              active={
                activeRound ===
                'QUARTER_FINALS'
              }
              onClick={() =>
                scrollToRound(
                  'QUARTER_FINALS',
                )
              }
            />


            <div
              className="
                mt-2
              "
            >

              <RoundGrid
                matches={
                  rounds
                    .QUARTER_FINALS
                }
                columns={4}
              />

            </div>

          </div>


          {/* ==================================================
              ROUND OF 16
          ================================================== */}

          {rounds.ROUND_OF_16.length > 0 && (

            <>

              <BranchConnector
                childCount={8}
              />


              <div
                id="knockout-ROUND_OF_16"
                className="
                  scroll-mt-24
                "
              >

                <RoundHeader
                  round="ROUND_OF_16"
                  count={
                    rounds
                      .ROUND_OF_16
                      .length
                  }
                  active={
                    activeRound ===
                    'ROUND_OF_16'
                  }
                  onClick={() =>
                    scrollToRound(
                      'ROUND_OF_16',
                    )
                  }
                />


                <div
                  className="
                    mt-2
                  "
                >

                  <RoundGrid
                    matches={
                      rounds
                        .ROUND_OF_16
                    }
                    columns={8}
                  />

                </div>

              </div>

            </>

          )}


          {/* ==================================================
              ROUND OF 32
          ================================================== */}

          {rounds.ROUND_OF_32.length > 0 && (

            <>

              <BranchConnector
                childCount={16}
              />


              <div
                id="knockout-ROUND_OF_32"
                className="
                  scroll-mt-24
                "
              >

                <RoundHeader
                  round="ROUND_OF_32"
                  count={
                    rounds
                      .ROUND_OF_32
                      .length
                  }
                  active={
                    activeRound ===
                    'ROUND_OF_32'
                  }
                  onClick={() =>
                    scrollToRound(
                      'ROUND_OF_32',
                    )
                  }
                />


                <div
                  className="
                    mt-2
                  "
                >

                  <RoundGrid
                    matches={
                      rounds
                        .ROUND_OF_32
                    }
                    columns={16}
                  />

                </div>

              </div>

            </>

          )}

        </div>

      </div>


      {/* ======================================================
          LEGEND
      ====================================================== */}

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