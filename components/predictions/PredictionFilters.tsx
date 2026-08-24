'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  CalendarDays,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import {
  PredictionMarkets,
  type PredictionMarket,
} from '@/lib/prediction-enums';

export type PredictionDateFilter =
  | 'all'
  | 'today'
  | 'week'
  | 'month'
  | 'custom';

export interface PredictionFilterState {
  search: string;

  league: string;

  date: PredictionDateFilter;

  customDate: string;

  minConfidence: number;

  market: string;

  plan: 'all' | 'free' | 'regular' | 'vip';

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

const MARKET_LABELS: Record<
  string,
  string
> = {
  DOUBLE_CHANCE: 'Double Chance',
  DRAW_NO_BET: 'Draw No Bet',

  OVER_UNDER: 'Over / Under',
  BOTH_TEAMS_TO_SCORE:
    'Both Teams To Score',
  BTTS_GOALS: 'BTTS Goals',
  GOAL_RANGE: 'Goal Range',
  TEAM_TOTAL_GOALS:
    'Team Total Goals',
  EXACT_GOALS: 'Exact Goals',
  CLEAN_SHEET: 'Clean Sheet',

  HALF_TIME_RESULT:
    'Half Time Result',
  SECOND_HALF_RESULT:
    'Second Half Result',
  HALF_TIME_FULL_TIME:
    'Half Time / Full Time',

  ASIAN_HANDICAP:
    'Asian Handicap',
  EUROPEAN_HANDICAP:
    'European Handicap',

  CORNERS_TOTAL:
    'Total Corners',
  TEAM_CORNERS:
    'Team Corners',
  CORNER_HANDICAP:
    'Corner Handicap',

  CARDS_TOTAL:
    'Total Cards',
  TEAM_CARDS:
    'Team Cards',
  CARD_HANDICAP:
    'Card Handicap',

  ANYTIME_GOALSCORER:
    'Anytime Goalscorer',
  FIRST_GOALSCORER:
    'First Goalscorer',
  PLAYER_SHOTS:
    'Player Shots',
  PLAYER_SHOTS_ON_TARGET:
    'Player Shots on Target',
  PLAYER_ASSISTS:
    'Player Assists',

  FIRST_GOAL:
    'First Goal',
  LAST_GOAL:
    'Last Goal',
  WIN_TO_NIL:
    'Win to Nil',
  CORRECT_SCORE:
    'Correct Score',

  POSSESSION_WINNER:
    'Possession Winner',
  MOST_SHOTS:
    'Most Shots',
  MOST_SHOTS_ON_TARGET:
    'Most Shots on Target',
  GOAL_TIMING:
    'Goal Timing',
  OFFSIDES_TOTAL:
    'Total Offsides',
  TEAM_OFFSIDES:
    'Team Offsides',
  FOULS_TOTAL:
    'Total Fouls',
  TEAM_FOULS:
    'Team Fouls',

  FIRST_HALF_GOALS:
    'First Half Goals',
  SECOND_HALF_GOALS:
    'Second Half Goals',
  FIRST_HALF_CORNERS:
    'First Half Corners',
  FIRST_HALF_CARDS:
    'First Half Cards',
};

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

  const update = (
    patch: Partial<PredictionFilterState>,
  ) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      league: 'all',
      date: 'all',
      customDate: '',
      minConfidence: 0,
      market: 'all',
      plan: 'all',
      status: 'all',
    });
  };

  const activeFilterCount =
    useMemo(() => {
      let count = 0;

      if (value.league !== 'all') {
        count++;
      }

      if (value.date !== 'all') {
        count++;
      }

      if (value.minConfidence > 0) {
        count++;
      }

      if (value.market !== 'all') {
        count++;
      }

      if (value.plan !== 'all') {
        count++;
      }

      if (value.status !== 'all') {
        count++;
      }

      return count;
    }, [value]);

  const normalizedAvailableMarkets =
    useMemo(() => {
      if (
        availableMarkets.length > 0
      ) {
        return Array.from(
          new Set(
            availableMarkets.filter(
              Boolean,
            ),
          ),
        );
      }

      return Object.values(
        PredictionMarkets,
      );
    }, [availableMarkets]);

  return (
    <div className="space-y-3">
      {/* =====================================================
          SEARCH + FILTER BUTTON
      ===================================================== */}

      <div
        className="
          flex
          w-full
          items-center
          gap-2
        "
      >
        <div
          className="
            relative
            min-w-0
            flex-1
          "
        >
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
              text-s
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
            setOpen((current) => !current)
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
            text-s
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
              ${open ? 'rotate-180' : ''}
            `}
          />
        </button>
      </div>

      {/* =====================================================
          FILTER PANEL
      ===================================================== */}

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
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
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
              onClick={clearFilters}
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
            {/* =================================================
                DATE
            ================================================= */}

            <FilterField
              label="Date"
              icon={<CalendarDays size={14} />}
            >
              <select
                value={value.date}
                onChange={(event) =>
                  update({
                    date:
                      event.target
                        .value as PredictionDateFilter,
                  })
                }
                className={selectClass}
              >
                <option value="all">
                  All dates
                </option>

                <option value="today">
                  Today
                </option>

                <option value="week">
                  This week
                </option>

                <option value="month">
                  This month
                </option>

                <option value="custom">
                  Custom date
                </option>
              </select>
            </FilterField>

            {/* =================================================
                CUSTOM DATE
            ================================================= */}

            {value.date === 'custom' && (
              <FilterField label="Custom date">
                <input
                  type="date"
                  value={
                    value.customDate
                  }
                  onChange={(event) =>
                    update({
                      customDate:
                        event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </FilterField>
            )}

            {/* =================================================
                CONFIDENCE
            ================================================= */}

            <FilterField label="Confidence">
              <select
                value={
                  value.minConfidence
                }
                onChange={(event) =>
                  update({
                    minConfidence:
                      Number(
                        event.target.value,
                      ),
                  })
                }
                className={selectClass}
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

            {/* =================================================
                LEAGUE
            ================================================= */}

            <FilterField label="League">
              <select
                value={value.league}
                onChange={(event) =>
                  update({
                    league:
                      event.target.value,
                  })
                }
                className={selectClass}
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

            {/* =================================================
                MARKET
            ================================================= */}

            <FilterField label="Market">
              <select
                value={value.market}
                onChange={(event) =>
                  update({
                    market:
                      event.target.value,
                  })
                }
                className={selectClass}
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
                      markets.length === 0
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

                {/* Fallback for any future
                    backend market not yet
                    added to MARKET_GROUPS */}
                {normalizedAvailableMarkets
                  .filter(
                    (market) =>
                      !Object.values(
                        MARKET_GROUPS.reduce(
                          (
                            acc,
                            group,
                          ) => {
                            return [
                              ...acc,
                              ...group.markets,
                            ];
                          },
                          [] as string[],
                        ),
                      ).includes(
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

            {/* =================================================
                PLAN
            ================================================= */}

            <FilterField label="Prediction plan">
              <select
                value={value.plan}
                onChange={(event) =>
                  update({
                    plan:
                      event.target
                        .value as PredictionFilterState['plan'],
                  })
                }
                className={selectClass}
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

            {/* =================================================
                STATUS
            ================================================= */}

            <FilterField label="Status">
              <select
                value={value.status}
                onChange={(event) =>
                  update({
                    status:
                      event.target
                        .value as PredictionFilterState['status'],
                  })
                }
                className={selectClass}
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

          {/* =================================================
              ACTIVE FILTERS
          ================================================= */}

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

              {value.date !== 'all' && (
                <FilterChip
                  label={getDateLabel(
                    value.date,
                    value.customDate,
                  )}
                  onRemove={() =>
                    update({
                      date: 'all',
                      customDate: '',
                    })
                  }
                />
              )}

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

          {typeof totalResults ===
            'number' && (
            <div
              className="
                border-t
                border-border
                px-4
                py-2.5
                text-[10px]
                text-muted-foreground
              "
            >
              Showing{' '}
              <span className="font-semibold text-foreground">
                {totalResults}
              </span>{' '}
              prediction
              {totalResults === 1
                ? ''
                : 's'}
            </div>
          )}
        </div>
      )}
    </div>
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
  icon?: React.ReactNode;
  children: React.ReactNode;
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

const inputClass = `
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

function getDateLabel(
  date: PredictionDateFilter,
  customDate: string,
) {
  if (date === 'today') {
    return 'Today';
  }

  if (date === 'week') {
    return 'This week';
  }

  if (date === 'month') {
    return 'This month';
  }

  if (
    date === 'custom' &&
    customDate
  ) {
    return new Date(
      `${customDate}T00:00:00`,
    ).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  }

  return 'Date';
}