'use client';

import {
  useState,
  type ReactNode,
} from 'react';

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import {
  PredictionMarkets,
} from '@/lib/prediction-enums';


/* =========================================================
   TYPES
========================================================= */

export type PredictionDateRange =
  | 'day'
  | 'week'
  | 'month';

export interface PredictionFilterState {
  search: string;
  league: string;

  /**
   * Anchor date for the current date selection.
   *
   * day:
   *   exact selected date
   *
   * week:
   *   date inside the selected week
   *
   * month:
   *   date inside the selected month
   */
  date: string;

  dateRange: PredictionDateRange;

  minConfidence: number;

  market: string;

  plan:
    | 'all'
    | 'free'
    | 'regular'
    | 'vip';

  status:
    | 'all'
    | 'pending'
    | 'won'
    | 'lost'
    | 'void';
}

interface Props {
  value: PredictionFilterState;

  onChange: (
    value: PredictionFilterState,
  ) => void;

  leagues: string[];

  availableMarkets?: string[];

  totalResults?: number;
}


/* =========================================================
   MARKET LABELS
========================================================= */

const MARKET_LABELS: Record<string, string> = {
  DOUBLE_CHANCE: 'Double Chance',
  DRAW_NO_BET: 'Draw No Bet',
  OVER_UNDER: 'Over / Under',
  BOTH_TEAMS_TO_SCORE: 'Both Teams To Score',
  BTTS_GOALS: 'BTTS Goals',
  GOAL_RANGE: 'Goal Range',
  TEAM_TOTAL_GOALS: 'Team Total Goals',
  EXACT_GOALS: 'Exact Goals',
  CLEAN_SHEET: 'Clean Sheet',

  HALF_TIME_RESULT: 'Half Time Result',
  SECOND_HALF_RESULT: 'Second Half Result',
  HALF_TIME_FULL_TIME: 'Half Time / Full Time',

  ASIAN_HANDICAP: 'Asian Handicap',
  EUROPEAN_HANDICAP: 'European Handicap',

  CORNERS_TOTAL: 'Total Corners',
  TEAM_CORNERS: 'Team Corners',
  CORNER_HANDICAP: 'Corner Handicap',
  FIRST_HALF_CORNERS: 'First Half Corners',

  CARDS_TOTAL: 'Total Cards',
  TEAM_CARDS: 'Team Cards',
  CARD_HANDICAP: 'Card Handicap',
  FIRST_HALF_CARDS: 'First Half Cards',

  ANYTIME_GOALSCORER: 'Anytime Goalscorer',
  FIRST_GOALSCORER: 'First Goalscorer',
  PLAYER_SHOTS: 'Player Shots',
  PLAYER_SHOTS_ON_TARGET: 'Player Shots on Target',
  PLAYER_ASSISTS: 'Player Assists',

  FIRST_GOAL: 'First Goal',
  LAST_GOAL: 'Last Goal',
  WIN_TO_NIL: 'Win to Nil',
  CORRECT_SCORE: 'Correct Score',

  POSSESSION_WINNER: 'Possession Winner',
  MOST_SHOTS: 'Most Shots',
  MOST_SHOTS_ON_TARGET: 'Most Shots on Target',
  GOAL_TIMING: 'Goal Timing',
  OFFSIDES_TOTAL: 'Total Offsides',
  TEAM_OFFSIDES: 'Team Offsides',
  FOULS_TOTAL: 'Total Fouls',
  TEAM_FOULS: 'Team Fouls',
  FIRST_HALF_GOALS: 'First Half Goals',
  SECOND_HALF_GOALS: 'Second Half Goals',
};


/* =========================================================
   MARKET GROUPS
========================================================= */

const MARKET_GROUPS: {
  label: string;
  markets: string[];
}[] = [
  {
    label: 'Match Result',
    markets: [
      'DOUBLE_CHANCE',
      'DRAW_NO_BET',
    ],
  },

  {
    label: 'Goals',
    markets: [
      'OVER_UNDER',
      'BOTH_TEAMS_TO_SCORE',
      'BTTS_GOALS',
      'GOAL_RANGE',
      'TEAM_TOTAL_GOALS',
      'EXACT_GOALS',
      'CLEAN_SHEET',
    ],
  },

  {
    label: 'Half Markets',
    markets: [
      'HALF_TIME_RESULT',
      'SECOND_HALF_RESULT',
      'HALF_TIME_FULL_TIME',
    ],
  },

  {
    label: 'Handicap',
    markets: [
      'ASIAN_HANDICAP',
      'EUROPEAN_HANDICAP',
    ],
  },

  {
    label: 'Corners',
    markets: [
      'CORNERS_TOTAL',
      'TEAM_CORNERS',
      'CORNER_HANDICAP',
      'FIRST_HALF_CORNERS',
    ],
  },

  {
    label: 'Cards',
    markets: [
      'CARDS_TOTAL',
      'TEAM_CARDS',
      'CARD_HANDICAP',
      'FIRST_HALF_CARDS',
    ],
  },

  {
    label: 'Player Markets',
    markets: [
      'ANYTIME_GOALSCORER',
      'FIRST_GOALSCORER',
      'PLAYER_SHOTS',
      'PLAYER_SHOTS_ON_TARGET',
      'PLAYER_ASSISTS',
    ],
  },

  {
    label: 'Match Events',
    markets: [
      'FIRST_GOAL',
      'LAST_GOAL',
      'WIN_TO_NIL',
      'CORRECT_SCORE',
    ],
  },

  {
    label: 'Statistics',
    markets: [
      'POSSESSION_WINNER',
      'MOST_SHOTS',
      'MOST_SHOTS_ON_TARGET',
      'GOAL_TIMING',
      'OFFSIDES_TOTAL',
      'TEAM_OFFSIDES',
      'FOULS_TOTAL',
      'TEAM_FOULS',
      'FIRST_HALF_GOALS',
      'SECOND_HALF_GOALS',
    ],
  },
];


/* =========================================================
   STATIC LOOKUPS
========================================================= */

const GROUPED_MARKETS = new Set(
  MARKET_GROUPS.flatMap(
    ({ markets }) => markets,
  ),
);

const DEFAULT_MARKETS = Object.values(
  PredictionMarkets,
);


/* =========================================================
   DATE HELPERS
========================================================= */

function startOfDay(
  value: Date,
): Date {
  const date = new Date(value);

  date.setHours(
    0,
    0,
    0,
    0,
  );

  return date;
}


function dateKey(
  value: Date,
): string {
  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() + 1,
    ).padStart(2, '0');

  const day =
    String(
      value.getDate(),
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function parseDateKey(
  value: string,
): Date | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      `${value}T00:00:00`,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}


function addDays(
  value: Date,
  amount: number,
): Date {
  const result =
    new Date(value);

  result.setDate(
    result.getDate() + amount,
  );

  return startOfDay(result);
}


function startOfWeek(
  value: Date,
): Date {
  const date =
    startOfDay(value);

  const day =
    date.getDay();

  /**
   * Monday = 0
   * Tuesday = 1
   * ...
   * Sunday = 6
   */
  const mondayOffset =
    day === 0
      ? -6
      : 1 - day;

  date.setDate(
    date.getDate() +
      mondayOffset,
  );

  return date;
}


function endOfWeek(
  value: Date,
): Date {
  return addDays(
    startOfWeek(value),
    6,
  );
}


function startOfMonth(
  value: Date,
): Date {
  const date =
    startOfDay(value);

  date.setDate(1);

  return date;
}


function endOfMonth(
  value: Date,
): Date {
  const date =
    startOfMonth(value);

  date.setMonth(
    date.getMonth() + 1,
  );

  date.setDate(0);

  return date;
}


function shiftWeek(
  value: Date,
  amount: number,
): Date {
  const date =
    startOfWeek(value);

  date.setDate(
    date.getDate() +
      amount * 7,
  );

  return date;
}


function shiftMonth(
  value: Date,
  amount: number,
): Date {
  const date =
    startOfMonth(value);

  date.setMonth(
    date.getMonth() + amount,
  );

  return date;
}


function isToday(
  value: Date,
): boolean {
  return (
    dateKey(value) ===
    dateKey(new Date())
  );
}


function formatDayLabel(
  value: Date,
): string {
  if (isToday(value)) {
    return 'Today';
  }

  const tomorrow =
    addDays(
      new Date(),
      1,
    );

  if (
    dateKey(value) ===
    dateKey(tomorrow)
  ) {
    return 'Tomorrow';
  }

  const yesterday =
    addDays(
      new Date(),
      -1,
    );

  if (
    dateKey(value) ===
    dateKey(yesterday)
  ) {
    return 'Yesterday';
  }

  return value.toLocaleDateString(
    'en-GB',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    },
  );
}


function formatWeekLabel(
  value: Date,
): string {
  const start =
    startOfWeek(value);

  const end =
    endOfWeek(value);

  const sameMonth =
    start.getMonth() ===
    end.getMonth();

  if (sameMonth) {
    return `${start.toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
      },
    )}–${end.toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'short',
      },
    )}`;
  }

  return `${start.toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
    },
  )}–${end.toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
    },
  )}`;
}


function formatMonthLabel(
  value: Date,
): string {
  return value.toLocaleDateString(
    'en-GB',
    {
      month: 'long',
      year: 'numeric',
    },
  );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function PredictionFilters({
  value,
  onChange,
  leagues,
  availableMarkets = [],
  totalResults,
}: Props) {
  const [
    open,
    setOpen,
  ] = useState(false);


  /* =======================================================
     UPDATE
  ======================================================= */

  const update = (
    patch: Partial<PredictionFilterState>,
  ) => {
    onChange({
      ...value,
      ...patch,
    });
  };


  /* =======================================================
     DATE
  ======================================================= */

  const selectedDate =
    parseDateKey(value.date) ??
    startOfDay(new Date());


  const selectDay = (
    date: Date,
  ) => {
    update({
      date: dateKey(
        startOfDay(date),
      ),
      dateRange: 'day',
    });
  };


  const handlePreviousDay = () => {
    selectDay(
      addDays(
        selectedDate,
        -1,
      ),
    );
  };


  const handleNextDay = () => {
    selectDay(
      addDays(
        selectedDate,
        1,
      ),
    );
  };


  const handleToday = () => {
    selectDay(
      new Date(),
    );
  };


  const handleLastWeek = () => {
    const date =
      shiftWeek(
        new Date(),
        -1,
      );

    update({
      date: dateKey(date),
      dateRange: 'week',
    });
  };


  const handleThisWeek = () => {
    const date =
      startOfWeek(
        new Date(),
      );

    update({
      date: dateKey(date),
      dateRange: 'week',
    });
  };


  const handleLastMonth = () => {
    const date =
      shiftMonth(
        new Date(),
        -1,
      );

    update({
      date: dateKey(date),
      dateRange: 'month',
    });
  };


  const handleThisMonth = () => {
    const date =
      startOfMonth(
        new Date(),
      );

    update({
      date: dateKey(date),
      dateRange: 'month',
    });
  };


  /* =======================================================
     ACTIVE FILTER COUNT
  ======================================================= */

  let activeFilterCount = 0;

  if (
    value.league !== 'all'
  ) {
    activeFilterCount++;
  }

  if (
    value.minConfidence > 0
  ) {
    activeFilterCount++;
  }

  if (
    value.market !== 'all'
  ) {
    activeFilterCount++;
  }

  if (
    value.plan !== 'all'
  ) {
    activeFilterCount++;
  }

  if (
    value.status !== 'all'
  ) {
    activeFilterCount++;
  }


  /* =======================================================
     CLEAR
  ======================================================= */

  const clearFilters = () => {
    onChange({
      search: '',
      league: 'all',
      date:
        dateKey(
          new Date(),
        ),
      dateRange: 'day',
      minConfidence: 0,
      market: 'all',
      plan: 'all',
      status: 'all',
    });
  };


  /* =======================================================
     MARKETS
  ======================================================= */

  const normalizedAvailableMarkets =
    availableMarkets.length > 0
      ? Array.from(
          new Set(
            availableMarkets.filter(
              Boolean,
            ),
          ),
        )
      : DEFAULT_MARKETS;


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-3">

      {/* ===================================================
          SEARCH + FILTER BUTTON
      =================================================== */}

      <div className="flex w-full items-center gap-2">

        <div className="relative min-w-0 flex-1">

          <Search
            size={17}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <input
            value={value.search}
            onChange={(event) =>
              update({
                search:
                  event.target.value,
              })
            }
            placeholder="Search teams..."
            className="
              h-12
              w-full
              rounded-2xl
              border
              border-border
              bg-card
              pl-11
              pr-10
              text-sm
              outline-none
              transition
              placeholder:text-muted-foreground
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
            "
          />

          {value.search && (
            <button
              type="button"
              onClick={() =>
                update({
                  search: '',
                })
              }
              aria-label="Clear search"
              className="
                absolute
                right-3
                top-1/2
                flex
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                text-muted-foreground
                transition
                hover:bg-muted
                hover:text-foreground
              "
            >
              <X size={14} />
            </button>
          )}

        </div>


        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) =>
                !current,
            )
          }
          className="
            relative
            flex
            h-12
            shrink-0
            items-center
            gap-2
            rounded-2xl
            border
            border-border
            bg-card
            px-4
            text-sm
            font-semibold
            transition
            hover:border-primary/50
            hover:bg-muted/50
            focus:outline-none
            focus:ring-2
            focus:ring-primary/20
          "
        >

          <SlidersHorizontal
            size={17}
          />

          <span className="hidden sm:inline">
            Filters
          </span>

          {activeFilterCount > 0 && (
            <span
              className="
                flex
                h-5
                min-w-5
                items-center
                justify-center
                rounded-full
                bg-primary
                px-1
                text-[10px]
                font-bold
                text-primary-foreground
              "
            >
              {activeFilterCount}
            </span>
          )}

          <ChevronDown
            size={15}
            className={`
              hidden
              transition-transform
              sm:block
              ${
                open
                  ? 'rotate-180'
                  : ''
              }
            `}
          />

        </button>

      </div>


{/* ===================================================
    DATE NAVIGATION
=================================================== */}

<div
  className="
    overflow-x-auto
    rounded-xl
    border
    border-border
    bg-card
    p-1
    shadow-sm
    scrollbar-hide
  "
>
  <div
    className="
      flex
      min-w-max
      items-center
      justify-center
      gap-0.5
    "
  >

    {/* LAST MONTH */}

    <DatePresetButton
      label="Last month"
      onClick={handleLastMonth}
      active={
        value.dateRange === 'month' &&
        dateKey(
          startOfMonth(selectedDate),
        ) ===
          dateKey(
            shiftMonth(new Date(), -1),
          )
      }
    />


    {/* LAST WEEK */}

    <DatePresetButton
      label="Last week"
      onClick={handleLastWeek}
      active={
        value.dateRange === 'week' &&
        dateKey(
          startOfWeek(selectedDate),
        ) ===
          dateKey(
            shiftWeek(new Date(), -1),
          )
      }
    />


    {/* PREVIOUS DAY */}

    <DateArrowButton
      direction="left"
      onClick={handlePreviousDay}
      ariaLabel="Previous day"
    />


    {/* SELECTED DAY */}

    <button
      type="button"
      onClick={handleToday}
      className={`
        flex
        min-w-[72px]
        shrink-0
        items-center
        justify-center
        rounded-lg
        px-2
        py-1.5
        text-[11px]
        font-bold
        transition
        ${
          value.dateRange === 'day' &&
          isToday(selectedDate)
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-foreground hover:bg-muted'
        }
      `}
    >
      {value.dateRange === 'day'
        ? formatDayLabel(selectedDate)
        : 'Today'}
    </button>


    {/* NEXT DAY */}

    <DateArrowButton
      direction="right"
      onClick={handleNextDay}
      ariaLabel="Next day"
    />


    {/* THIS WEEK */}

    <DatePresetButton
      label="This week"
      onClick={handleThisWeek}
      active={
        value.dateRange === 'week' &&
        dateKey(
          startOfWeek(selectedDate),
        ) ===
          dateKey(
            startOfWeek(new Date()),
          )
      }
    />


    {/* THIS MONTH */}

    <DatePresetButton
      label="This month"
      onClick={handleThisMonth}
      active={
        value.dateRange === 'month' &&
        dateKey(
          startOfMonth(selectedDate),
        ) ===
          dateKey(
            startOfMonth(new Date()),
          )
      }
    />

  </div>
</div>



      {/* ===================================================
          FILTER PANEL
      =================================================== */}

      {open && (
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-sm
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-border
              px-4
              py-3
            "
          >

            <div className="flex items-center gap-2">

              <Filter
                size={15}
                className="text-primary"
              />

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                "
              >
                Prediction Filters
              </span>

            </div>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="
                text-[11px]
                font-semibold
                text-muted-foreground
                transition
                hover:text-primary
              "
            >
              Clear all
            </button>

          </div>


          {/* FIELDS */}

          <div
            className="
              grid
              grid-cols-1
              gap-3
              p-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            <FilterField
              label="Confidence"
            >
              <select
                value={
                  value.minConfidence
                }
                onChange={(event) =>
                  update({
                    minConfidence:
                      Number(
                        event.target
                          .value,
                      ),
                  })
                }
                className={
                  selectClass
                }
              >
                <option value={0}>
                  Any confidence
                </option>
                <option value={50}>
                  50%+
                </option>
                <option value={60}>
                  60%+
                </option>
                <option value={70}>
                  70%+
                </option>
                <option value={80}>
                  80%+
                </option>
                <option value={90}>
                  90%+
                </option>
              </select>
            </FilterField>


            <FilterField
              label="League"
            >
              <select
                value={
                  value.league
                }
                onChange={(event) =>
                  update({
                    league:
                      event.target
                        .value,
                  })
                }
                className={
                  selectClass
                }
              >
                <option value="all">
                  All leagues
                </option>

                {leagues.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>
            </FilterField>


            <FilterField
              label="Market"
            >
              <select
                value={
                  value.market
                }
                onChange={(event) =>
                  update({
                    market:
                      event.target
                        .value,
                  })
                }
                className={
                  selectClass
                }
              >

                <option value="all">
                  All markets
                </option>

                {MARKET_GROUPS.map(
                  (group) => {

                    const markets =
                      group.markets.filter(
                        (market) =>
                          normalizedAvailableMarkets.includes(
                            market,
                          ),
                      );

                    if (
                      !markets.length
                    ) {
                      return null;
                    }

                    return (
                      <optgroup
                        key={
                          group.label
                        }
                        label={
                          group.label
                        }
                      >
                        {markets.map(
                          (market) => (
                            <option
                              key={
                                market
                              }
                              value={
                                market
                              }
                            >
                              {
                                MARKET_LABELS[
                                  market
                                ]
                              }
                            </option>
                          ),
                        )}
                      </optgroup>
                    );
                  },
                )}

                {normalizedAvailableMarkets
                  .filter(
                    (market) =>
                      !GROUPED_MARKETS.has(
                        market,
                      ),
                  )
                  .map(
                    (market) => (
                      <option
                        key={market}
                        value={market}
                      >
                        {formatMarketName(
                          market,
                        )}
                      </option>
                    ),
                  )}

              </select>
            </FilterField>


            <FilterField
              label="Prediction plan"
            >
              <select
                value={
                  value.plan
                }
                onChange={(event) =>
                  update({
                    plan:
                      event.target
                        .value as PredictionFilterState['plan'],
                  })
                }
                className={
                  selectClass
                }
              >
                <option value="all">
                  All plans
                </option>
                <option value="free">
                  Free
                </option>
                <option value="regular">
                  Regular
                </option>
                <option value="vip">
                  VIP
                </option>
              </select>
            </FilterField>


            <FilterField
              label="Status"
            >
              <select
                value={
                  value.status
                }
                onChange={(event) =>
                  update({
                    status:
                      event.target
                        .value as PredictionFilterState['status'],
                  })
                }
                className={
                  selectClass
                }
              >
                <option value="all">
                  All statuses
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="won">
                  Won
                </option>
                <option value="lost">
                  Lost
                </option>
                <option value="void">
                  Void
                </option>
              </select>
            </FilterField>

          </div>


          {/* ACTIVE FILTERS */}

          {activeFilterCount > 0 && (
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
                border-t
                border-border
                bg-muted/20
                px-4
                py-3
              "
            >

              <span
                className="
                  mr-1
                  text-[10px]
                  font-semibold
                  text-muted-foreground
                "
              >
                Active:
              </span>

              {value.league !==
                'all' && (
                <FilterChip
                  label={
                    value.league
                  }
                  onRemove={() =>
                    update({
                      league: 'all',
                    })
                  }
                />
              )}

              {value.minConfidence >
                0 && (
                <FilterChip
                  label={`${value.minConfidence}%+ confidence`}
                  onRemove={() =>
                    update({
                      minConfidence: 0,
                    })
                  }
                />
              )}

              {value.market !==
                'all' && (
                <FilterChip
                  label={
                    MARKET_LABELS[
                      value.market
                    ] ??
                    formatMarketName(
                      value.market,
                    )
                  }
                  onRemove={() =>
                    update({
                      market: 'all',
                    })
                  }
                />
              )}

              {value.plan !==
                'all' && (
                <FilterChip
                  label={`${capitalize(
                    value.plan,
                  )} predictions`}
                  onRemove={() =>
                    update({
                      plan: 'all',
                    })
                  }
                />
              )}

              {value.status !==
                'all' && (
                <FilterChip
                  label={capitalize(
                    value.status,
                  )}
                  onRemove={() =>
                    update({
                      status: 'all',
                    })
                  }
                />
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}


function DatePresetButton({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        shrink-0
        whitespace-nowrap
        rounded-lg
        px-2
        py-1.5
        text-[10px]
        font-semibold
        transition
        ${
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      `}
    >
      {label}
    </button>
  );
}

/* =========================================================
   DATE ARROW BUTTON
========================================================= */

function DateArrowButton({
  direction,
  onClick,
  ariaLabel,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="
        flex
        h-8
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
    >
      {direction === 'left' ? (
        <ChevronLeft size={15} />
      ) : (
        <ChevronRight size={15} />
      )}
    </button>
  );
}

/* =========================================================
   FILTER FIELD
========================================================= */

function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">

      <label
        className="
          flex
          items-center
          gap-1.5
          text-[10px]
          font-bold
          uppercase
          tracking-wider
          text-muted-foreground
        "
      >
        {icon}
        {label}
      </label>

      {children}

    </div>
  );
}


/* =========================================================
   FILTER CHIP
========================================================= */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        border-primary/20
        bg-primary/5
        px-2.5
        py-1
        text-[10px]
        font-medium
        text-primary
        transition
        hover:bg-primary/10
      "
    >
      {label}
      <X size={11} />
    </button>
  );
}


/* =========================================================
   HELPERS
========================================================= */

const selectClass = `
  h-10
  w-full
  rounded-xl
  border
  border-border
  bg-background
  px-3
  text-xs
  outline-none
  transition
  focus:border-primary
  focus:ring-2
  focus:ring-primary/20
`;


function capitalize(
  value: string,
) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


function formatMarketName(
  value: string,
) {
  return value
    .toLowerCase()
    .split('_')
    .map(capitalize)
    .join(' ');
}