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


// ============================================================
// TYPES
// ============================================================

interface Props {
  fixtures: Match[];
}


// ============================================================
// CONSTANTS
// ============================================================

const MAX_VISIBLE_FIXTURES = 10;


// ============================================================
// COMPONENT
// ============================================================

export default function UpcomingFixtures({
  fixtures,
}: Props) {

  const [
    expanded,
    setExpanded,
  ] = useState(false);


  // ==========================================================
  // VISIBLE FIXTURES
  // ==========================================================

  const visibleFixtures = expanded
    ? fixtures
    : fixtures.slice(
        0,
        MAX_VISIBLE_FIXTURES,
      );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        sm:rounded-3xl
      "
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-border
          p-3
          sm:gap-3
          sm:p-5
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
            sm:h-10
            sm:w-10
          "
        >

          <CalendarClock
            size={19}
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
            Match Fixtures
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


      {/* ====================================================
          CONTENT
      ==================================================== */}

      {fixtures.length === 0 ? (

        <div
          className="
            p-6
            text-center
            text-xs
            text-muted-foreground
            sm:p-8
          "
        >
          No upcoming fixtures
        </div>

      ) : (

        <>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[500px]
                text-[11px]
                sm:text-xs
              "
            >

              <thead>

                <tr
                  className="
                    border-b
                    border-border
                    text-left
                    text-[9px]
                    uppercase
                    tracking-wide
                    text-muted-foreground
                    sm:text-[10px]
                  "
                >

                  <th
                    className="
                      px-2
                      py-2.5
                      font-medium
                      sm:px-4
                      sm:py-3
                    "
                  >
                    Date
                  </th>


                  <th
                    className="
                      px-2
                      py-2.5
                      font-medium
                      sm:px-4
                      sm:py-3
                    "
                  >
                    Time
                  </th>


                  <th
                    className="
                      px-2
                      py-2.5
                      font-medium
                      sm:px-4
                      sm:py-3
                    "
                  >
                    Home
                  </th>


                  <th
                    className="
                      px-2
                      py-2.5
                      font-medium
                      sm:px-4
                      sm:py-3
                    "
                  >
                    Away
                  </th>

                </tr>

              </thead>


              <tbody>

                {visibleFixtures.map(
                  (match) => (

                    <tr
                      key={match.id}
                      className="
                        border-b
                        border-border/50
                        last:border-0
                        hover:bg-muted/30
                      "
                    >

                      {/* DATE */}

                      <td
                        className="
                          whitespace-nowrap
                          px-2
                          py-2.5
                          font-medium
                          text-foreground
                          sm:px-4
                          sm:py-3
                        "
                      >

                        {new Date(
                          match.date,
                        ).toLocaleDateString(
                          'en-NG',
                          {
                            day: 'numeric',
                            month: 'short',
                          },
                        )}

                      </td>


                      {/* TIME */}

                      <td
                        className="
                          whitespace-nowrap
                          px-2
                          py-2.5
                          font-semibold
                          text-foreground
                          sm:px-4
                          sm:py-3
                        "
                      >

                        {match.time}

                      </td>


                      {/* HOME */}

                      <td
                        className="
                          px-2
                          py-2.5
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
                          "
                        >

                          {match.homeTeamBadge ? (

                            <Image
                              src={
                                match.homeTeamBadge
                              }
                              alt=""
                              width={24}
                              height={24}
                              className="
                                h-6
                                w-6
                                shrink-0
                                object-contain
                              "
                            />

                          ) : (

                            <div
                              className="
                                h-6
                                w-6
                                shrink-0
                                rounded-full
                                bg-muted
                              "
                            />

                          )}


                          <span
                            className="
                              min-w-0
                              max-w-[130px]
                              truncate
                              font-medium
                              text-foreground
                              sm:max-w-none
                            "
                          >
                            {match.homeTeam}
                          </span>

                        </div>

                      </td>


                      {/* AWAY */}

                      <td
                        className="
                          px-2
                          py-2.5
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
                          "
                        >

                          {match.awayTeamBadge ? (

                            <Image
                              src={
                                match.awayTeamBadge
                              }
                              alt=""
                              width={24}
                              height={24}
                              className="
                                h-6
                                w-6
                                shrink-0
                                object-contain
                              "
                            />

                          ) : (

                            <div
                              className="
                                h-6
                                w-6
                                shrink-0
                                rounded-full
                                bg-muted
                              "
                            />

                          )}


                          <span
                            className="
                              min-w-0
                              max-w-[130px]
                              truncate
                              font-medium
                              text-foreground
                              sm:max-w-none
                            "
                          >
                            {match.awayTeam}
                          </span>

                        </div>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>


          {/* ==================================================
              SHOW MORE
          ================================================== */}

          {fixtures.length >
            MAX_VISIBLE_FIXTURES && (

            <button
              type="button"
              onClick={() =>
                setExpanded(
                  current => !current,
                )
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                border-t
                border-border
                py-2.5
                text-xs
                font-semibold
                text-foreground
                hover:bg-muted/30
                sm:py-3
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

        </>

      )}

    </section>

  );

}