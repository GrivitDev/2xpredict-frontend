'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  Check,
  ChevronDown,
  Search,
  Trophy,
  X,
} from 'lucide-react';

import type {
  League,
} from '@/services/sports.service';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';


// ============================================================
// TYPES
// ============================================================

interface Props {

  leagues: League[];

  selectedLeague: string;

  onLeagueChange: (
    leagueCode: string,
  ) => void;

}


// ============================================================
// HELPERS
// ============================================================

const getCompetitionTypeLabel = (
  type?: string,
): string => {

  switch (type) {

    case 'LEAGUE':
      return 'League';

    case 'CUP':
      return 'Cup';

    case 'LEAGUE_CUP':
      return 'League Cup';

    case 'PLAYOFFS':
      return 'Playoffs';

    default:
      return 'Competition';

  }

};


// ============================================================
// COMPONENT
// ============================================================

export default function LeagueSelector({

  leagues,

  selectedLeague,

  onLeagueChange,

}: Props) {


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    search,
    setSearch,
  ] = useState('');


  // ==========================================================
  // ACTIVE COMPETITION
  // ==========================================================

  const activeLeague =
    useMemo(() => {

      return leagues.find(
        league =>
          league.code ===
          selectedLeague,
      );

    }, [
      leagues,
      selectedLeague,
    ]);


  // ==========================================================
  // FILTER COMPETITIONS
  // ==========================================================

  const filteredLeagues =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {

        return leagues;

      }


      return leagues.filter(
        league => {

          const name =
            league.name
              ?.toLowerCase() ?? '';


          const country =
            league.country
              ?.toLowerCase() ?? '';


          const code =
            league.code
              ?.toLowerCase() ?? '';


          const type =
            league.type
              ?.toLowerCase() ?? '';


          return (
            name.includes(query) ||
            country.includes(query) ||
            code.includes(query) ||
            type.includes(query)
          );

        },
      );

    }, [
      leagues,
      search,
    ]);


  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (!leagues.length) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-border
          bg-card
          px-4
          py-4
          text-xs
          text-muted-foreground
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
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
              bg-muted
            "
          >

            <Trophy
              className="
                h-4
                w-4
              "
            />

          </div>

          No competitions available

        </div>

      </div>

    );

  }


  // ==========================================================
  // SELECT COMPETITION
  // ==========================================================

  const handleSelect = (
    leagueCode: string,
  ) => {

    onLeagueChange(
      leagueCode,
    );

    setSearch('');

    setOpen(false);

  };


  // ==========================================================
  // CLEAR
  // ==========================================================

  const handleClear = () => {

    onLeagueChange('');

    setSearch('');

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section
      className="
        relative
        w-full
      "
    >

      <div
        className="
          flex
          flex-col
        "
      >

        {/* ==================================================
            LABEL
        ================================================== */}

        <div
          className="
            ml-12
            space-y-1
          "
        >

          <label
            className="
              text-lg
              font-semibold
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            Competition
          </label>


          <p
            className="
              text-sm
              text-muted-foreground/80
            "
          >
            Select a football league or cup competition.
          </p>

        </div>


        {/* ==================================================
            SEARCH / SELECT
        ================================================== */}

        <Popover
          open={open}
          onOpenChange={setOpen}
        >

          <PopoverTrigger asChild>

            <button
              type="button"
              className="
                group
                flex
                h-13
                w-full
                items-center
                gap-3
                rounded-2xl
                border
                border-border
                bg-card
                px-3
                text-left
                shadow-sm
                outline-none
                transition-all
                duration-200
                hover:border-primary/40
                hover:shadow-md
                focus-visible:border-primary
                focus-visible:ring-4
                focus-visible:ring-primary/10
              "
            >

              {/* ==================================================
                  COMPETITION ICON
              ================================================== */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                "
              >

                {activeLeague?.emblem ? (

                  <Image
                    src={
                      activeLeague.emblem
                    }
                    alt=""
                    width={32}
                    height={32}
                    className="
                      h-10
                      w-10
                      object-contain
                    "
                  />

                ) : (

                  <Trophy
                    className="
                      h-4
                      w-4
                      text-primary
                    "
                  />

                )}

              </div>


              {/* ==================================================
                  TEXT
              ================================================== */}

              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                {activeLeague ? (

                  <>

                    <p
                      className="
                        truncate
                        text-xs
                        font-semibold
                        text-foreground
                        sm:text-sm
                      "
                    >
                      {
                        activeLeague.name
                      }
                    </p>


                    <p
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-1
                        truncate
                        text-[10px]
                        text-muted-foreground
                        sm:text-[11px]
                      "
                    >

                      <span className="truncate">
                        {
                          activeLeague.country
                        }
                      </span>

                      <span>
                        •
                      </span>

                      <span className="shrink-0">
                        {
                          getCompetitionTypeLabel(
                            activeLeague.type,
                          )
                        }
                      </span>

                    </p>

                  </>

                ) : (

                  <span
                    className="
                      text-xs
                      text-muted-foreground
                      sm:text-sm
                    "
                  >
                    Search or select a competition
                  </span>

                )}

              </div>


              {/* ==================================================
                  CLEAR
              ================================================== */}

              {activeLeague && (

                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {

                    event.stopPropagation();

                    handleClear();

                  }}
                  onKeyDown={(event) => {

                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {

                      event.preventDefault();

                      event.stopPropagation();

                      handleClear();

                    }

                  }}
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    hover:text-foreground
                  "
                  aria-label="Clear selected competition"
                >

                  <X
                    className="
                      h-4
                      w-4
                    "
                  />

                </span>

              )}


              {/* ==================================================
                  CHEVRON
              ================================================== */}

              <ChevronDown
                className={`
                  h-4
                  w-4
                  shrink-0
                  text-muted-foreground
                  transition-transform
                  duration-200
                  ${
                    open
                      ? 'rotate-180'
                      : ''
                  }
                `}
              />

            </button>

          </PopoverTrigger>


          {/* ==================================================
              DROPDOWN
          ================================================== */}

          <PopoverContent
            align="start"
            className="
              w-[var(--radix-popover-trigger-width)]
              min-w-[280px]
              overflow-hidden
              rounded-2xl
              border-border
              bg-popover
              p-0
              shadow-xl
            "
          >

            {/* ==================================================
                SEARCH
            ================================================== */}

            <div
              className="
                border-b
                border-border
                p-2
              "
            >

              <div
                className="
                  flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-border
                  bg-background
                  px-3
                  transition
                  focus-within:border-primary/50
                  focus-within:ring-4
                  focus-within:ring-primary/10
                "
              >

                <Search
                  className="
                    h-4
                    w-4
                    shrink-0
                    text-muted-foreground
                  "
                />


                <input
                  autoFocus
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search competitions..."
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-xs
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    sm:text-sm
                  "
                />


                {search && (

                  <button
                    type="button"
                    onClick={() =>
                      setSearch('')
                    }
                    className="
                      rounded-md
                      p-1
                      text-muted-foreground
                      transition
                      hover:bg-muted
                      hover:text-foreground
                    "
                    aria-label="Clear search"
                  >

                    <X
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                  </button>

                )}

              </div>

            </div>


            {/* ==================================================
                RESULTS
            ================================================== */}

            <div
              className="
                max-h-80
                overflow-y-auto
                p-2
              "
            >

              {filteredLeagues.length > 0 ? (

                <div
                  className="
                    space-y-1
                  "
                >

                  {filteredLeagues.map(
                    league => {

                      const isSelected =
                        league.code ===
                        selectedLeague;


                      return (

                        <button
                          key={
                            league.code
                          }
                          type="button"
                          onClick={() =>
                            handleSelect(
                              league.code,
                            )
                          }
                          className={`
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-left
                            transition
                            ${
                              isSelected
                                ? 'bg-primary/10'
                                : 'hover:bg-muted/70'
                            }
                          `}
                        >

                          {/* ==================================================
                              EMBLEM
                          ================================================== */}

                          <div
                            className="
                              flex
                              h-13
                              w-13
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                            "
                          >

                            {league.emblem ? (

                              <Image
                                src={
                                  league.emblem
                                }
                                alt=""
                                width={38}
                                height={38}
                                className="
                                  h-12
                                  w-12
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


                          {/* ==================================================
                              DETAILS
                          ================================================== */}

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <p
                              className="
                                truncate
                                text-xs
                                font-semibold
                                text-foreground
                                sm:text-sm
                              "
                            >
                              {
                                league.name
                              }
                            </p>


                            <div
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-1
                                truncate
                                text-[10px]
                                text-muted-foreground
                                sm:text-xs
                              "
                            >

                              <span className="truncate">
                                {
                                  league.country
                                }
                              </span>


                              {league.code && (

                                <>
                                  <span>
                                    •
                                  </span>

                                  <span className="shrink-0">
                                    {
                                      league.code
                                    }
                                  </span>
                                </>

                              )}


                              {league.type && (

                                <>
                                  <span>
                                    •
                                  </span>

                                  <span className="shrink-0">
                                    {
                                      getCompetitionTypeLabel(
                                        league.type,
                                      )
                                    }
                                  </span>
                                </>

                              )}

                            </div>

                          </div>


                          {/* ==================================================
                              SELECTED
                          ================================================== */}

                          {isSelected && (

                            <Check
                              className="
                                h-4
                                w-4
                                shrink-0
                                text-primary
                              "
                            />

                          )}

                        </button>

                      );

                    },
                  )}

                </div>

              ) : (

                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-5
                    py-10
                    text-center
                  "
                >

                  <div
                    className="
                      mb-3
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-muted
                    "
                  >

                    <Search
                      className="
                        h-5
                        w-5
                        text-muted-foreground
                      "
                    />

                  </div>


                  <p
                    className="
                      text-xs
                      font-semibold
                      text-foreground
                      sm:text-sm
                    "
                  >
                    No competitions found
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      text-muted-foreground
                    "
                  >
                    Try another competition name, country, or code.
                  </p>

                </div>

              )}

            </div>

          </PopoverContent>

        </Popover>

      </div>

    </section>

  );
}