'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';

import {
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';

import {
  formatKickoffTime,
  formatLiveDate,
  getProviderMatchClock,
  type Match,
} from '@/services/sports.service';


// ============================================================
// TYPES
// ============================================================

interface Props {

  matches: Match[];

}


// ============================================================
// LIVE MATCH CLOCK
// ============================================================

function LiveMatchClock({
  match,
}: {
  match: Match;
}) {

  // ==========================================================
  // LOCAL TICK
  // ==========================================================

  const [
    now,
    setNow,
  ] = useState(
    () => Date.now(),
  );


  // ==========================================================
  // API ANCHOR
  //
  // Every API minute gets its own timestamp.
  //
  // Example:
  //
  // minute = 62
  // anchor = 22:10:00
  //
  // At 22:10:15:
  // elapsed = 15
  //
  // Display:
  // 62:15
  // ==========================================================

  const anchorRef =
    useRef<{
      minute: number | null;

      timestamp: number;
    }>({

      minute:
        match.minute ?? null,

      timestamp:
        Date.now(),

    });


  // ==========================================================
  // RE-ANCHOR WHEN API MINUTE CHANGES
  // ==========================================================

  useEffect(() => {

    const providerMinute =
      match.minute ?? null;


    if (
      anchorRef.current.minute !==
      providerMinute
    ) {

      anchorRef.current = {

        minute:
          providerMinute,

        timestamp:
          Date.now(),

      };


      setNow(
        Date.now(),
      );

    }

  }, [
    match.minute,
  ]);


  // ==========================================================
  // ALSO RESET WHEN MATCH STATUS CHANGES
  //
  // This handles:
  //
  // IN_PLAY -> PAUSED
  // PAUSED  -> IN_PLAY
  // ==========================================================

  const statusRef =
    useRef(
      match.status,
    );


  useEffect(() => {

    if (
      statusRef.current !==
      match.status
    ) {

      statusRef.current =
        match.status;


      anchorRef.current = {

        minute:
          match.minute ?? null,

        timestamp:
          Date.now(),

      };


      setNow(
        Date.now(),
      );

    }

  }, [
    match.status,
    match.minute,
  ]);


  // ==========================================================
  // ONE SECOND TICK
  // ==========================================================

  useEffect(() => {

    const interval =
      window.setInterval(
        () => {

          setNow(
            Date.now(),
          );

        },
        1000,
      );


    return () => {

      window.clearInterval(
        interval,
      );

    };

  }, []);


  // ==========================================================
  // ELAPSED SECONDS FROM API ANCHOR
  // ==========================================================

  const elapsedSeconds =
    Math.floor(
      Math.max(
        0,
        now -
        anchorRef.current.timestamp,
      ) /
      1000,
    );


  // ==========================================================
  // PROVIDER CLOCK
  // ==========================================================

  const clock =
    getProviderMatchClock(
      match,
      elapsedSeconds,
    );


  // ==========================================================
  // PHASE LABEL
  // ==========================================================

  let phaseLabel =
    '';


  switch (
    clock.phase
  ) {

    case 'FIRST_HALF':

      phaseLabel =
        '1st Half';

      break;


    case 'HALFTIME':

      phaseLabel =
        'Half Time';

      break;


    case 'SECOND_HALF':

      phaseLabel =
        '2nd Half';

      break;


    case 'EXTRA_TIME_FIRST_HALF':

      phaseLabel =
        'ET 1st Half';

      break;


    case 'EXTRA_TIME_HALFTIME':

      phaseLabel =
        'ET Half Time';

      break;


    case 'EXTRA_TIME_SECOND_HALF':

      phaseLabel =
        'ET 2nd Half';

      break;


    case 'PENALTIES':

      phaseLabel =
        'Penalties';

      break;


    case 'FULL_TIME':

      phaseLabel =
        'Full Time';

      break;


    case 'NOT_STARTED':

      phaseLabel =
        'Not Started';

      break;

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        flex
        flex-col
        items-end
        text-right
      "
    >

      <span
        className="
          text-sm
          font-bold
          leading-none
          tabular-nums
          text-foreground
          sm:text-base
        "
      >
        {
          clock.display
        }
      </span>


      <span
        className="
          mt-0.5
          text-xs
          font-medium
          text-muted-foreground
        "
      >
        {phaseLabel}
      </span>

    </div>

  );

}


// ============================================================
// COMPONENT
// ============================================================

export default function LiveMatches({
  matches,
}: Props) {

  const [
    expanded,
    setExpanded,
  ] = useState(false);


  // ==========================================================
  // SORT
  // ==========================================================

  const sortedMatches =
    useMemo(() => {

      return [
        ...matches,
      ].sort(
        (
          a,
          b,
        ) =>
          a.kickoffTimestamp -
          b.kickoffTimestamp,
      );

    }, [
      matches,
    ]);


  // ==========================================================
  // DATE HEADER
  // ==========================================================

  const dateHeader =
    useMemo(() => {

      const firstMatch =
        sortedMatches[0];


      if (!firstMatch) {

        return '';

      }


      return formatLiveDate(
        firstMatch.date,
      );

    }, [
      sortedMatches,
    ]);


  // ==========================================================
  // VISIBLE MATCHES
  // ==========================================================

  const visibleMatches =
    expanded
      ? sortedMatches
      : sortedMatches.slice(
          0,
          6,
        );


  // ==========================================================
  // EMPTY
  // ==========================================================

  if (
    !matches.length
  ) {

    return null;

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
          GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-red-500/10
          blur-3xl
        "
      />


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative
          mb-2
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-red-500/10
              text-red-500
              sm:h-9
              sm:w-9
            "
          >

            <Radio
              className="
                h-4
                w-4
              "
            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <h2
              className="
                text-sm
                font-bold
                text-foreground
                sm:text-base
              "
            >
              Live Now
            </h2>


            <p
              className="
                text-xs
                text-muted-foreground
              "
            >
              Matches currently in play
            </p>

          </div>

        </div>


        <span
          className="
            shrink-0
            rounded-full
            bg-red-500/10
            px-2
            py-1
            text-xs
            font-semibold
            text-red-500
          "
        >
          {matches.length} Live
        </span>

      </div>


      {/* ======================================================
          UTC DATE
      ====================================================== */}

      {dateHeader && (

        <div
          className="
            relative
            mb-3
            border-b
            border-border/50
            pb-2
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-muted-foreground
          "
        >
          {dateHeader}
        </div>

      )}


      {/* ======================================================
          MATCH GRID
      ====================================================== */}

      <div
        className="
          relative
          grid
          grid-cols-1
          gap-2
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >

        {visibleMatches.map(
          match => (

            <article
              key={
                match.id
              }
              className="
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-border
                bg-background/40
                transition-colors
                hover:bg-muted/30
              "
            >

              <div
                className="
                  p-2.5
                "
              >

                {/* ==================================================
                    STATUS + CLOCK
                ================================================== */}

                <div
                  className="
                    mb-2.5
                    flex
                    items-start
                    justify-between
                    gap-2
                  "
                >

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-red-500/10
                      px-2
                      py-0.5
                      text-xs
                      font-semibold
                      text-red-500
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        animate-pulse
                        rounded-full
                        bg-red-500
                      "
                    />

                    LIVE

                  </div>


                  <LiveMatchClock
                    match={
                      match
                    }
                  />

                </div>


                {/* ==================================================
                    TEAMS
                ================================================== */}

                <div
                  className="
                    grid
                    grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
                    items-center
                    gap-1.5
                  "
                >

                  {/* HOME */}

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
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                      "
                    >

                      {match.homeTeamBadge ? (

                        <Image
                          src={
                            match.homeTeamBadge
                          }
                          alt={
                            match.homeTeam
                          }
                          width={32}
                          height={32}
                          className="
                            h-8
                            w-8
                            object-contain
                          "
                        />

                      ) : (

                        <span
                          className="
                            h-2
                            w-2
                            rounded-full
                            bg-muted-foreground/40
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
                      {
                        match.homeTeam
                      }
                    </span>

                  </div>


                  {/* SCORE */}

                  <div
                    className="
                      flex
                      min-w-[58px]
                      items-center
                      justify-center
                    "
                  >

                    <span
                      className="
                        text-lg
                        font-black
                        leading-none
                        tabular-nums
                        text-foreground
                        sm:text-xl
                      "
                    >

                      {
                        match.homeScore ??
                        0
                      }

                      <span
                        className="
                          mx-1
                          text-muted-foreground
                        "
                      >
                        -
                      </span>

                      {
                        match.awayScore ??
                        0
                      }

                    </span>

                  </div>


                  {/* AWAY */}

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
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                      "
                    >

                      {match.awayTeamBadge ? (

                        <Image
                          src={
                            match.awayTeamBadge
                          }
                          alt={
                            match.awayTeam
                          }
                          width={32}
                          height={32}
                          className="
                            h-8
                            w-8
                            object-contain
                          "
                        />

                      ) : (

                        <span
                          className="
                            h-2
                            w-2
                            rounded-full
                            bg-muted-foreground/40
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
                      {
                        match.awayTeam
                      }
                    </span>

                  </div>

                </div>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div
                  className="
                    mt-2.5
                    flex
                    min-w-0
                    items-center
                    justify-between
                    gap-2
                    border-t
                    border-border/40
                    pt-2
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-1.5
                    "
                  >

                    <div
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-md
                        bg-muted/50
                      "
                    >

                      {match.league?.emblem ? (

                        <Image
                          src={
                            match.league.emblem
                          }
                          alt=""
                          width={20}
                          height={20}
                          className="
                            h-5
                            w-5
                            object-contain
                          "
                        />

                      ) : (

                        <span
                          className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-muted-foreground/40
                          "
                        />

                      )}

                    </div>


                    <span
                      className="
                        min-w-0
                        truncate
                        text-xs
                        font-medium
                        text-muted-foreground
                      "
                    >
                      {
                        match.league?.name ||
                        'Football'
                      }
                    </span>

                  </div>


                  <span
                    className="
                      shrink-0
                      text-xs
                      font-semibold
                      tabular-nums
                      text-foreground
                    "
                    title={
                      formatKickoffTime(
                        match.date,
                      )
                    }
                  >
                    {
                      formatKickoffTime(
                        match.date,
                      )
                    }
                  </span>

                </div>

              </div>

            </article>

          ),
        )}

      </div>


      {/* ======================================================
          SHOW MORE / LESS
      ====================================================== */}

      {matches.length > 6 && (

        <button
          type="button"
          onClick={() =>
            setExpanded(
              current =>
                !current,
            )
          }
          className="
            mt-2.5
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-border
            bg-background/40
            py-2
            text-xs
            font-semibold
            text-foreground
            transition-colors
            hover:bg-muted/40
          "
        >

          {expanded ? (

            <>

              Show Less

              <ChevronUp
                className="
                  h-4
                  w-4
                "
              />

            </>

          ) : (

            <>

              Show All
              {' '}
              {matches.length}
              {' '}
              Live Matches

              <ChevronDown
                className="
                  h-4
                  w-4
                "
              />

            </>

          )}

        </button>

      )}

    </section>

  );

}