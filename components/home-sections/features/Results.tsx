'use client';

import {
  useState,
} from 'react';

import Image from 'next/image';

import {
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import type {
  Match,
} from '@/services/sports.service';


// ============================================================
// TYPES
// ============================================================

interface Props {
  results: Match[];
}


// ============================================================
// COMPONENT
// ============================================================

export default function Results({
  results,
}: Props) {

  const [
    expanded,
    setExpanded,
  ] = useState(false);


  // ==========================================================
  // SORT RESULTS — NEWEST TO OLDEST
  // ==========================================================

  const sortedResults = [
    ...results,
  ].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime(),
  );


  // ==========================================================
  // VISIBLE RESULTS
  // ==========================================================

  const visibleResults =
    expanded
      ? sortedResults
      : sortedResults.slice(0, 10);


  // ==========================================================
  // RENDER
  // ==========================================================

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
        sm:p-6
      "
    >

      {/* ====================================================
          DECORATIVE GLOW
      ==================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -left-20
          h-56
          w-56
          rounded-full
          bg-yellow-500/10
          blur-3xl
        "
      />


      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          relative
          mb-4
          flex
          items-center
          gap-2.5
          sm:mb-6
          sm:gap-3
        "
      >

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-yellow-500/10
            text-yellow-500
            sm:h-11
            sm:w-11
            sm:rounded-2xl
          "
        >

          <Trophy
            size={19}
            strokeWidth={2}
            className="
              sm:h-[22px]
              sm:w-[22px]
            "
          />

        </div>


        <div>

          <h2
            className="
              text-base
              font-bold
              text-foreground
              sm:text-lg
            "
          >
            Recent Results
          </h2>


          <p
            className="
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            Completed matches
          </p>

        </div>

      </div>


      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {results.length === 0 ? (

        <div
          className="
            rounded-2xl
            border
            border-border
            bg-background/40
            p-5
            text-center
            text-s
            text-muted-foreground
            sm:p-6
          "
        >
          No completed matches
        </div>

      ) : (

        <>

          {/* ==================================================
              RESULTS GRID
          ================================================== */}

          <div
            className="
              relative
              grid
              grid-cols-2
              gap-1
              sm:grid-cols-2
              sm:gap-3
              lg:grid-cols-5
            "
          >

            {visibleResults.map(
              (match) => (

                <div
                  key={match.id}
                  className="
                    min-w-0
                    rounded-xl
                    border
                    border-border
                    bg-background/40
                    p-1
                    transition
                    hover:-translate-y-1
                    hover:bg-muted/40
                    sm:rounded-2xl
                    sm:p-2
                  "
                >

                  {/* ========================================
                      DATE
                  ======================================== */}

                  <div
                    className="
                      mb-2
                      truncate
                      text-center
                      text-[9px]
                      text-muted-foreground
                      sm:mb-2
                      sm:text-xs
                    "
                  >
                    {new Date(
                      match.date,
                    ).toLocaleDateString(
                      'en-NG',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      },
                    )}
                  </div>


                  {/* ========================================
                      TEAMS + SCORE
                  ======================================== */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-start
                      justify-between
                      gap-1
                      sm:gap-2
                    "
                  >

                    {/* ======================================
                        HOME TEAM
                    ====================================== */}

                    <div
                      className="
                        flex
                        min-w-0
                        flex-1
                        flex-col
                        items-center
                        gap-1
                        sm:gap-2
                      "
                    >

                      {match.homeTeamBadge ? (

                        <Image
                          src={
                            match.homeTeamBadge
                          }
                          alt={
                            `${match.homeTeam} badge`
                          }
                          width={38}
                          height={38}
                          className="
                            h-7
                            w-7
                            object-contain
                            sm:h-9
                            sm:w-9
                          "
                        />

                      ) : (

                        <div
                          className="
                            h-7
                            w-7
                            rounded-full
                            bg-muted
                            sm:h-9
                            sm:w-9
                          "
                        />

                      )}


                      <span
                        className="
                          line-clamp-2
                          w-full
                          text-center
                          text-[9px]
                          font-semibold
                          leading-tight
                          text-foreground
                          sm:text-xs
                        "
                      >
                        {match.homeTeam}
                      </span>

                    </div>


                    {/* ======================================
                        SCORE
                    ====================================== */}

                    <div
                      className="
                        flex
                        shrink-0
                        flex-col
                        items-center
                        pt-0.5
                        text-center
                        sm:pt-0
                      "
                    >

                      <div
                        className="
                          whitespace-nowrap
                          text-base
                          font-black
                          tracking-tight
                          text-foreground
                          sm:text-xl
                        "
                      >

                        {match.homeScore ?? 0}

                        <span
                          className="
                            mx-0.5
                            text-muted-foreground
                            sm:mx-1
                          "
                        >
                          -
                        </span>

                        {match.awayScore ?? 0}

                      </div>


                      <span
                        className="
                          mt-0.5
                          inline-flex
                          rounded-full
                          bg-yellow-500/10
                          px-1.5
                          py-0.5
                          text-[8px]
                          font-bold
                          text-yellow-500
                          sm:mt-1
                          sm:px-2
                          sm:py-1
                          sm:text-[10px]
                        "
                      >
                        FT
                      </span>

                    </div>


                    {/* ======================================
                        AWAY TEAM
                    ====================================== */}

                    <div
                      className="
                        flex
                        min-w-0
                        flex-1
                        flex-col
                        items-center
                        gap-1
                        sm:gap-2
                      "
                    >

                      {match.awayTeamBadge ? (

                        <Image
                          src={
                            match.awayTeamBadge
                          }
                          alt={
                            `${match.awayTeam} badge`
                          }
                          width={38}
                          height={38}
                          className="
                            h-7
                            w-7
                            object-contain
                            sm:h-9
                            sm:w-9
                          "
                        />

                      ) : (

                        <div
                          className="
                            h-7
                            w-7
                            rounded-full
                            bg-muted
                            sm:h-9
                            sm:w-9
                          "
                        />

                      )}


                      <span
                        className="
                          line-clamp-2
                          w-full
                          text-center
                          text-[9px]
                          font-semibold
                          leading-tight
                          text-foreground
                          sm:text-xs
                        "
                      >
                        {match.awayTeam}
                      </span>

                    </div>

                  </div>


                  {/* ========================================
                      LEAGUE
                  ======================================== */}

                  {match.league?.name && (

                    <div
                      className="
                        mt-2
                        truncate
                        border-t
                        border-border/50
                        pt-1.5
                        text-center
                        text-[8px]
                        text-muted-foreground
                        sm:mt-4
                        sm:border-0
                        sm:pt-0
                        sm:text-[11px]
                      "
                    >
                      {match.league.name}
                    </div>

                  )}

                </div>

              ),
            )}

          </div>


          {/* ==================================================
              SHOW MORE / LESS
          ================================================== */}

          {results.length > 8 && (

            <button
              type="button"
              onClick={() =>
                setExpanded(
                  current => !current,
                )
              }
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-border
                bg-background/40
                py-2.5
                text-xs
                font-semibold
                text-foreground
                transition
                hover:bg-muted/40
                sm:mt-5
                sm:py-3
                sm:text-s
              "
            >

              {expanded ? (

                <>
                  Show Less
                  <ChevronUp size={15} />
                </>

              ) : (

                <>
                  Show All Results
                  <ChevronDown size={15} />
                </>

              )}

            </button>

          )}

        </>

      )}

    </section>

  );

}