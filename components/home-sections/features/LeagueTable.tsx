'use client';

import Image from 'next/image';

import {
  Trophy,
} from 'lucide-react';

import type {
  Standing,
} from '@/services/sports.service';


// ============================================================
// TYPES
// ============================================================

interface Props {

  table: Standing[];

  title?: string;

  subtitle?: string;

}


// ============================================================
// COMPONENT
// ============================================================

export default function LeagueTable({

  table,

  title = 'League Table',

  subtitle = 'Current standings',

}: Props) {

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

      {/* ======================================================
          GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          bottom-0
          h-56
          w-56
          rounded-full
          bg-yellow-500/10
          blur-3xl
        "
      />


      {/* ======================================================
          HEADER
      ====================================================== */}

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
              sm:h-[21px]
              sm:w-[21px]
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
              truncate
              text-base
              font-bold
              text-foreground
              sm:text-lg
            "
          >
            {title}
          </h2>


          <p
            className="
              truncate
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            {subtitle}
          </p>

        </div>

      </div>


      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {table.length === 0 ? (

        <div
          className="
            relative
            rounded-2xl
            border
            border-border
            bg-background/40
            p-5
            text-center
            text-xs
            text-muted-foreground
            sm:p-6
          "
        >
          No standings available
        </div>

      ) : (

        /* ====================================================
           TABLE
        ==================================================== */

        <div
          className="
            relative
            overflow-x-auto
            rounded-xl
            border
            border-border/60
            sm:rounded-2xl
          "
        >

          <table
            className="
              w-full
              min-w-[390px]
              text-[11px]
              sm:min-w-[480px]
              sm:text-xs
            "
          >

            {/* ==================================================
                HEADER
            ================================================== */}

            <thead>

              <tr
                className="
                  border-b
                  border-border
                  bg-muted/30
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                  sm:text-xs
                "
              >

                <th
                  scope="col"
                  className="
                    w-7
                    px-1.5
                    py-2
                    text-left
                    sm:w-auto
                    sm:px-3
                    sm:py-3
                  "
                >
                  #
                </th>


                <th
                  scope="col"
                  className="
                    px-2
                    py-2
                    text-left
                    sm:px-4
                    sm:py-3
                  "
                >
                  Team
                </th>


                <th
                  scope="col"
                  title="Played"
                  className="
                    w-8
                    px-1
                    py-2
                    text-center
                    sm:w-auto
                    sm:px-2
                    sm:py-3
                  "
                >
                  P
                </th>


                <th
                  scope="col"
                  title="Won"
                  className="
                    w-8
                    px-1
                    py-2
                    text-center
                    sm:w-auto
                    sm:px-2
                    sm:py-3
                  "
                >
                  W
                </th>


                <th
                  scope="col"
                  title="Drawn"
                  className="
                    w-8
                    px-1
                    py-2
                    text-center
                    sm:w-auto
                    sm:px-2
                    sm:py-3
                  "
                >
                  D
                </th>


                <th
                  scope="col"
                  title="Lost"
                  className="
                    w-8
                    px-1
                    py-2
                    text-center
                    sm:w-auto
                    sm:px-2
                    sm:py-3
                  "
                >
                  L
                </th>


                <th
                  scope="col"
                  title="Goal Difference"
                  className="
                    w-9
                    px-1
                    py-2
                    text-center
                    sm:w-auto
                    sm:px-2
                    sm:py-3
                  "
                >
                  GD
                </th>


                <th
                  scope="col"
                  title="Points"
                  className="
                    w-10
                    px-1.5
                    py-2
                    text-center
                    sm:w-auto
                    sm:px-3
                    sm:py-3
                  "
                >
                  PTS
                </th>

              </tr>

            </thead>


            {/* ==================================================
                BODY
            ================================================== */}

            <tbody>

              {table.map(
                (
                  team,
                  index,
                ) => (

                  <tr
                    key={
                      team.teamId ??
                      `${team.team}-${team.position}-${index}`
                    }
                    className={`
                      border-b
                      border-border/50
                      transition-colors
                      hover:bg-muted/40
                      ${
                        index % 2 === 0
                          ? 'bg-background/60'
                          : 'bg-muted/20'
                      }
                    `}
                  >

                    {/* ========================================
                        POSITION
                    ======================================== */}

                    <td
                      className="
                        px-1.5
                        py-2
                        font-bold
                        text-foreground
                        sm:px-3
                        sm:py-3
                      "
                    >
                      {team.position}
                    </td>


                    {/* ========================================
                        TEAM
                    ======================================== */}

                    <td
                      className="
                        px-2
                        py-2
                        sm:px-4
                        sm:py-3
                      "
                    >

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-2
                          sm:gap-3
                        "
                      >

                        {team.crest ? (

                          <Image
                            src={team.crest}
                            alt={`${team.team} crest`}
                            width={32}
                            height={32}
                            className="
                              h-6
                              w-6
                              shrink-0
                              object-contain
                              sm:h-8
                              sm:w-8
                            "
                          />

                        ) : (

                          <div
                            className="
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-muted
                              sm:h-8
                              sm:w-8
                            "
                            aria-hidden="true"
                          >

                            <Trophy
                              size={11}
                              className="
                                text-muted-foreground
                                sm:h-[14px]
                                sm:w-[14px]
                              "
                            />

                          </div>

                        )}


                        <div
                          className="
                            min-w-0
                          "
                        >

                          <span
                            className="
                              block
                              max-w-[120px]
                              truncate
                              font-semibold
                              text-foreground
                              sm:max-w-none
                            "
                          >
                            {team.team}
                          </span>


                          {team.tla && (

                            <span
                              className="
                                hidden
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-wide
                                text-muted-foreground
                                sm:block
                              "
                            >
                              {team.tla}
                            </span>

                          )}

                        </div>

                      </div>

                    </td>


                    {/* ========================================
                        PLAYED
                    ======================================== */}

                    <td
                      className="
                        px-1
                        py-2
                        text-center
                        text-muted-foreground
                        sm:px-2
                        sm:py-3
                      "
                    >
                      {team.playedGames}
                    </td>


                    {/* ========================================
                        WON
                    ======================================== */}

                    <td
                      className="
                        px-1
                        py-2
                        text-center
                        text-muted-foreground
                        sm:px-2
                        sm:py-3
                      "
                    >
                      {team.won}
                    </td>


                    {/* ========================================
                        DRAW
                    ======================================== */}

                    <td
                      className="
                        px-1
                        py-2
                        text-center
                        text-muted-foreground
                        sm:px-2
                        sm:py-3
                      "
                    >
                      {team.draw}
                    </td>


                    {/* ========================================
                        LOST
                    ======================================== */}

                    <td
                      className="
                        px-1
                        py-2
                        text-center
                        text-muted-foreground
                        sm:px-2
                        sm:py-3
                      "
                    >
                      {team.lost}
                    </td>


                    {/* ========================================
                        GOAL DIFFERENCE
                    ======================================== */}

                    <td
                      className={`
                        px-1
                        py-2
                        text-center
                        font-medium
                        sm:px-2
                        sm:py-3
                        ${
                          team.goalDifference > 0
                            ? 'text-emerald-500'
                            : team.goalDifference < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                        }
                      `}
                    >
                      {team.goalDifference > 0
                        ? `+${team.goalDifference}`
                        : team.goalDifference}
                    </td>


                    {/* ========================================
                        POINTS
                    ======================================== */}

                    <td
                      className="
                        px-1.5
                        py-2
                        text-center
                        font-black
                        text-foreground
                        sm:px-3
                        sm:py-3
                      "
                    >
                      {team.points}
                    </td>

                  </tr>

                ),
              )}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );
}