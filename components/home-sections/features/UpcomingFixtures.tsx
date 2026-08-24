'use client';

import {
  useState,
} from 'react';

import Image from 'next/image';

import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import type {
  Match,
} from '@/services/sports.service';


interface Props {
  fixtures: Match[];
}


export default function UpcomingFixtures({
  fixtures,
}: Props) {

  const [expanded, setExpanded] = useState(false);

  const visibleFixtures = expanded
    ? fixtures
    : fixtures.slice(0, 10);


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

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-56
          w-56
          rounded-full
          bg-green-500/10
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
            bg-green-500/10
            text-green-500
            sm:h-11
            sm:w-11
            sm:rounded-2xl
          "
        >

          <CalendarClock
            size={19}
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
              sm:text-lg
            "
          >
            Upcoming Fixtures
          </h2>


          <p
            className="
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            Scheduled matches
          </p>

        </div>

      </div>


      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {fixtures.length === 0 ? (

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
          No upcoming fixtures
        </div>

      ) : (

        /* ====================================================
           TABLE
        ==================================================== */

        <div
          className="
            overflow-x-auto
            rounded-xl
            border
            border-border
            sm:rounded-2xl
          "
        >

          <table
            className="
              w-full
              min-w-[500px]
              text-[11px]
              sm:min-w-[700px]
              sm:text-s
            "
          >

            <thead>

              <tr
                className="
                  border-b
                  border-border
                  text-[9px]
                  uppercase
                  text-muted-foreground
                  sm:text-xs
                "
              >

                {/* DATE */}

                <th
                  className="
                    w-[60px]
                    bg-background/40
                    px-1
                    py-1.5
                    text-left
                    sm:w-auto
                    sm:px-2
                    sm:py-2
                  "
                >
                  Date
                </th>


                {/* TIME */}

                <th
                  className="
                    w-[65px]
                    bg-muted/30
                    px-2
                    py-2.5
                    text-left
                    sm:w-auto
                    sm:px-2
                    sm:py-2
                  "
                >
                  Time
                </th>


                {/* HOME */}

                <th
                  className="
                    w-[165px]
                    bg-background/40
                    px-1.5
                    py-2
                    text-left
                    sm:w-auto
                    sm:px-2
                    sm:py-2
                  "
                >
                  Home
                </th>


                {/* AWAY */}

                <th
                  className="
                    w-[165px]
                    bg-muted/30
                    px-1.5
                    py-2
                    text-left
                    sm:w-auto
                    sm:px-2
                    sm:py-2
                  "
                >
                  Away
                </th>

              </tr>

            </thead>


            <tbody>

              {visibleFixtures.map(
                (match, index) => (

                  <tr
                    key={match.id}
                    className={`
                      border-b
                      border-border/50
                      transition
                      hover:bg-primary/5
                      ${
                        index % 2 === 0
                          ? 'bg-background/60'
                          : 'bg-muted/20'
                      }
                    `}
                  >

                    {/* ========================================
                        DATE
                    ======================================== */}

                    <td
                      className="
                        bg-background/40
                        px-1
                        py-1.5
                        font-medium
                        sm:px-2
                        sm:py-2
                      "
                    >

                      {new Date(
                        match.date
                      ).toLocaleDateString(
                        'en-NG',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}

                    </td>


                    {/* ========================================
                        TIME
                    ======================================== */}

                    <td
                      className="
                        bg-muted/30
                        px-2
                        py-2.5
                        font-semibold
                        sm:px-2
                        sm:py-2
                      "
                    >

                      {match.time}

                    </td>


                    {/* ========================================
                        HOME
                    ======================================== */}

                    <td
                      className="
                        w-[165px]
                        bg-background/40
                        px-1.5
                        py-2
                        sm:w-auto
                        sm:px-2
                        sm:py-2
                      "
                    >

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-1.5
                          sm:gap-1
                        "
                      >

                        {match.homeTeamBadge && (

                          <Image
                            src={match.homeTeamBadge}
                            alt={match.homeTeam}
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

                        )}


                        <span
                          className="
                            min-w-0
                            max-w-[115px]
                            truncate
                            font-semibold
                            sm:max-w-none
                          "
                        >
                          {match.homeTeam}
                        </span>

                      </div>

                    </td>


                    {/* ========================================
                        AWAY
                    ======================================== */}

                    <td
                      className="
                        w-[165px]
                        bg-muted/30
                        px-1.5
                        py-2
                        sm:w-auto
                        sm:px-2
                        sm:py-2
                      "
                    >

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-1.5
                          sm:gap-1
                        "
                      >

                        {match.awayTeamBadge && (

                          <Image
                            src={match.awayTeamBadge}
                            alt={match.awayTeam}
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

                        )}


                        <span
                          className="
                            min-w-0
                            max-w-[115px]
                            truncate
                            font-semibold
                            sm:max-w-none
                          "
                        >
                          {match.awayTeam}
                        </span>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}


      {/* ======================================================
          SHOW ALL
      ====================================================== */}

      {fixtures.length > 10 && (

        <button
          onClick={() =>
            setExpanded(!expanded)
          }
          className="
            mt-4
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
              Show All Fixtures
              <ChevronDown size={15} />
            </>

          )}

        </button>

      )}

    </section>

  );

}