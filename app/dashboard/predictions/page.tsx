'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

import api from '@/lib/axios';

import PredictionTable from '@/components/predictions/PredictionTable';

import PredictionMobileCard from '@/components/predictions/PredictionMobileCard';

import PredictionPagination from '@/components/predictions/PredictionPagination';

import SubscriptionModal from '@/components/predictions/SubscriptionModal';

import PredictionFilters, {
  type PredictionFilterState,
} from '@/components/predictions/PredictionFilters';

import { InternalAds } from '@/components/ads/IntAds/InternalAds';

import { AdPage } from '@/constants/ads/ad-page';

import { AdPosition } from '@/constants/ads/ad-position';

import { PredictionsAds } from '@/components/ads/ExtAds/positions/PredictionsAds';

import {
  getApiErrorMessage,
} from '@/lib/getApiErrorMessage';

import {
  getPredictionAccess,
} from '@/services/prediction.service';
import { useNavbar } from '@/components/navbar/NavbarContext';


/* =========================================================
   TYPES
========================================================= */

type Plan =
  | 'free'
  | 'regular'
  | 'vip';

type RequiredPlan =
  | 'regular'
  | 'vip';

type Feature =
  | 'prediction'
  | 'markets';


type PredictionAccess = {
  allowed: boolean;
  state: string;
  purchased?: boolean;
  plan?: Plan;
  released?: boolean;
  releaseAt?: number | null;
  message?: string | null;
};


type Prediction = {
  _id?: string;
  id?: string;

  homeTeam?: string;
  awayTeam?: string;

  league?: {
    name?: string | null;
    country?: string | null;
    emblem?: string | null;
  } | null;

  leagueCode?: string | null;

  matchDate?: string | Date | null;
  date?: string | Date | null;
  kickoffTimestamp?: string | number | Date | null;

  confidence?: number | string | null;

  accessType?: Plan | string | null;

  status?: string | null;
  settled?: boolean;
  isSettled?: boolean;
  outcome?: string | null;
  result?: string | null;

  markets?: Array<
    | string
    | {
        market?: string | null;
        [key: string]: unknown;
      }
  > | null;

  access?: PredictionAccess;

  prediction?: unknown;
  probabilities?: unknown;

  [key: string]: unknown;
};


type SubscriptionModalState = {
  open: boolean;
  requiredPlan: RequiredPlan;
  feature: Feature;
  userPlan: Plan;
  predictionPlan: Plan;
  released: boolean;
  releaseAt: number | null;
  accessState: string;
  accessMessage: string | null;
};


type SubscriptionModalData = {
  predictionId?: string;
  prediction?: Prediction;
  requiredPlan: RequiredPlan;
  feature: Feature;
  userPlan: Plan;
  predictionPlan: Plan;
  released: boolean;
  releaseAt: number | null;
  accessState: string;
  accessMessage: string | null;
};


/* =========================================================
   CONSTANTS
========================================================= */

const ITEMS_PER_PAGE = 10;

const ACCESS_CONCURRENCY = 5;


/*
 * Date is intentionally empty initially.
 *
 * After predictions are loaded:
 *
 * 1. Today
 * 2. Nearest future date
 * 3. Latest past date
 */
const INITIAL_FILTERS: PredictionFilterState = {
  search: '',
  league: 'all',

  date: '',

  dateRange: 'day',

  minConfidence: 0,

  market: 'all',

  plan: 'all',

  status: 'all',
};


const INITIAL_MODAL_STATE: SubscriptionModalState = {
  open: false,

  requiredPlan: 'regular',

  feature: 'prediction',

  userPlan: 'free',

  predictionPlan: 'regular',

  released: true,

  releaseAt: null,

  accessState: '',

  accessMessage: null,
};


/* =========================================================
   DATE HELPERS
========================================================= */

function startOfDay(
  date: Date,
): Date {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}


function dateKey(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0');

  const day =
    String(
      date.getDate(),
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


function getPredictionDate(
  prediction: Prediction,
): Date | null {
  const value =
    prediction.matchDate ??
    prediction.date ??
    prediction.kickoffTimestamp;

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}


function getPredictionId(
  prediction: Prediction,
): string | null {
  const id =
    prediction._id ??
    prediction.id;

  return id
    ? String(id)
    : null;
}


function startOfWeek(
  date: Date,
): Date {
  const result =
    startOfDay(date);

  const day =
    result.getDay();

  const mondayOffset =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      mondayOffset,
  );

  return result;
}


function endOfWeek(
  date: Date,
): Date {
  const result =
    startOfWeek(date);

  result.setDate(
    result.getDate() + 6,
  );

  return result;
}


function startOfMonth(
  date: Date,
): Date {
  const result =
    startOfDay(date);

  result.setDate(1);

  return result;
}


function endOfMonth(
  date: Date,
): Date {
  const result =
    startOfMonth(date);

  result.setMonth(
    result.getMonth() + 1,
  );

  result.setDate(0);

  return result;
}


/* =========================================================
   DATE RANGE MATCHING
========================================================= */

function isPredictionInSelectedDateRange(
  prediction: Prediction,
  filters: PredictionFilterState,
): boolean {
  const matchDate =
    getPredictionDate(
      prediction,
    );

  if (!matchDate) {
    return false;
  }

  const selected =
    parseDateKey(
      filters.date,
    );

  if (!selected) {
    return false;
  }

  const matchDay =
    startOfDay(matchDate);


  /* =======================================================
     DAY
  ======================================================= */

  if (
    filters.dateRange ===
    'day'
  ) {
    return (
      dateKey(matchDay) ===
      dateKey(selected)
    );
  }


  /* =======================================================
     WEEK
  ======================================================= */

  if (
    filters.dateRange ===
    'week'
  ) {
    const weekStart =
      startOfWeek(selected);

    const weekEnd =
      endOfWeek(selected);

    return (
      matchDay.getTime() >=
        weekStart.getTime() &&
      matchDay.getTime() <=
        weekEnd.getTime()
    );
  }


  /* =======================================================
     MONTH
  ======================================================= */

  const monthStart =
    startOfMonth(selected);

  const monthEnd =
    endOfMonth(selected);

  return (
    matchDay.getTime() >=
      monthStart.getTime() &&
    matchDay.getTime() <=
      monthEnd.getTime()
  );
}


/* =========================================================
   ACCESS
========================================================= */

function createDefaultAccess(): PredictionAccess {
  return {
    allowed: false,

    state: 'login_required',

    purchased: false,

    plan: 'free',

    released: false,

    releaseAt: 0,

    message:
      'Please log in to view this prediction.',
  };
}


function normalizePlan(
  value: unknown,
): Plan {
  if (
    value === 'vip' ||
    value === 'regular'
  ) {
    return value;
  }

  return 'free';
}


function getPredictionMarketNames(
  prediction: Prediction,
): string[] {
  if (
    !Array.isArray(
      prediction.markets,
    )
  ) {
    return [];
  }

  return prediction.markets
    .map((market) => {
      if (
        typeof market === 'string'
      ) {
        return market;
      }

      return (
        market?.market ??
        ''
      );
    })
    .filter(Boolean)
    .map(String);
}


/* =========================================================
   PAGE CONTENT
========================================================= */

function PredictionsPageContent() {

    const {
      visible: navbarVisible,
    } = useNavbar();

  /* =======================================================
     STATE
  ======================================================= */

  const [
    predictions,
    setPredictions,
  ] = useState<Prediction[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    filters,
    setFilters,
  ] = useState<PredictionFilterState>(
    INITIAL_FILTERS,
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    highlightedId,
    setHighlightedId,
  ] = useState<string | null>(
    null,
  );

  const [
    subscriptionModal,
    setSubscriptionModal,
  ] = useState<SubscriptionModalState>(
    INITIAL_MODAL_STATE,
  );


  /* =======================================================
     URL
  ======================================================= */

  const searchParams =
    useSearchParams();

  const predictionId =
    searchParams.get(
      'prediction',
    );


  /* =======================================================
     LOAD PREDICTIONS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const fetchPredictions =
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await api.get(
              '/predictions',
            );

          if (cancelled) {
            return;
          }

          const data =
            Array.isArray(
              response.data,
            )
              ? response.data
              : response.data?.data ??
                [];

          const normalized =
            Array.isArray(data)
              ? data
              : [];

          setPredictions(
            normalized,
          );
        } catch (error: unknown) {
          if (cancelled) {
            return;
          }

          console.error(
            'Failed to load predictions:',
            error,
          );

          setPredictions([]);

          setError(
            getApiErrorMessage(
              error,
              'Unable to load predictions. Please try again.',
            ),
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void fetchPredictions();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =======================================================
     INDIVIDUAL ACCESS CHECKS
  ======================================================= */

  useEffect(() => {
    if (
      loading ||
      predictions.length === 0
    ) {
      return;
    }

    let cancelled = false;

    const checkAccess =
      async () => {
        let currentIndex = 0;

        const worker =
          async () => {
            while (!cancelled) {
              const index =
                currentIndex++;

              if (
                index >=
                predictions.length
              ) {
                return;
              }

              const prediction =
                predictions[index];

              const id =
                getPredictionId(
                  prediction,
                );

              if (!id) {
                continue;
              }

              if (
                prediction.access
              ) {
                continue;
              }

              try {
                const result =
                  await getPredictionAccess(
                    id,
                  );

                if (cancelled) {
                  return;
                }

                const access =
                  result?.access ??
                  createDefaultAccess();

                setPredictions(
                  (current) =>
                    current.map(
                      (item) => {
                        const itemId =
                          getPredictionId(
                            item,
                          );

                        if (
                          itemId !==
                          id
                        ) {
                          return item;
                        }

                        if (
                          access.allowed &&
                          result?.data
                        ) {
                          return {
                            ...item,

                            access,

                            prediction:
                              result
                                .data
                                ?.prediction ??
                              undefined,

                            probabilities:
                              result
                                .data
                                ?.probabilities ??
                              null,

                            markets:
                              (result
                                .data
                                ?.markets ??
                                null) as Prediction['markets'],
                          };
                        }

                        return {
                          ...item,

                          access,

                          prediction:
                            undefined,

                          probabilities:
                            null,

                          markets:
                            null as Prediction['markets'],
                        };
                      },
                    ),
                );
              } catch (error) {
                if (cancelled) {
                  return;
                }

                console.error(
                  `Failed to check access for prediction ${id}:`,
                  error,
                );

                setPredictions(
                  (current) =>
                    current.map(
                      (item) =>
                        getPredictionId(
                          item,
                        ) === id
                          ? {
                              ...item,
                              access:
                                createDefaultAccess(),
                            }
                          : item,
                    ),
                );
              }
            }
          };

        const workers =
          Math.min(
            ACCESS_CONCURRENCY,
            predictions.length,
          );

        await Promise.all(
          Array.from(
            {
              length: workers,
            },
            () => worker(),
          ),
        );
      };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    predictions,
  ]);


  /* =======================================================
     AVAILABLE DATE KEYS
  ======================================================= */

  const availableDates =
    useMemo(() => {
      const dates =
        new Map<
          string,
          Date
        >();

      for (
        const prediction of
          predictions
      ) {
        const date =
          getPredictionDate(
            prediction,
          );

        if (!date) {
          continue;
        }

        const day =
          startOfDay(date);

        dates.set(
          dateKey(day),
          day,
        );
      }

      return Array.from(
        dates.values(),
      ).sort(
        (a, b) =>
          a.getTime() -
          b.getTime(),
      );
    }, [
      predictions,
    ]);


  /* =======================================================
     DEFAULT DATE SELECTION
  ======================================================= */

  useEffect(() => {
    if (
      availableDates.length ===
      0
    ) {
      return;
    }

    /*
     * Do not overwrite a date the user
     * has already selected.
     */
    if (filters.date) {
      return;
    }

    const today =
      startOfDay(
        new Date(),
      );

    const todayKey =
      dateKey(today);


    /* -------------------------------------------------------
       1. TODAY
    ------------------------------------------------------- */

    const hasToday =
      availableDates.some(
        (date) =>
          dateKey(date) ===
          todayKey,
      );

    if (hasToday) {
      setFilters(
        (current) => ({
          ...current,

          date: todayKey,

          dateRange: 'day',
        }),
      );

      return;
    }


    /* -------------------------------------------------------
       2. NEXT FUTURE PREDICTION
    ------------------------------------------------------- */

    const nextFuture =
      availableDates.find(
        (date) =>
          date.getTime() >
          today.getTime(),
      );

    if (nextFuture) {
      setFilters(
        (current) => ({
          ...current,

          date:
            dateKey(
              nextFuture,
            ),

          dateRange: 'day',
        }),
      );

      return;
    }


    /* -------------------------------------------------------
       3. NO FUTURE PREDICTIONS
          USE LATEST PAST PREDICTION
    ------------------------------------------------------- */

    const latestPast =
      [...availableDates]
        .reverse()
        .find(
          (date) =>
            date.getTime() <
            today.getTime(),
        );

    if (latestPast) {
      setFilters(
        (current) => ({
          ...current,

          date:
            dateKey(
              latestPast,
            ),

          dateRange: 'day',
        }),
      );
    }
  }, [
    availableDates,
    filters.date,
  ]);


  /* =======================================================
     FILTER HANDLER
  ======================================================= */

  const handleFiltersChange =
    (
      nextFilters:
        PredictionFilterState,
    ) => {
      setFilters(
        nextFilters,
      );

      setPage(1);
    };


  /* =======================================================
     AVAILABLE LEAGUES
  ======================================================= */

  const leagues =
    useMemo(() => {
      const values =
        new Set<string>();

      for (
        const prediction of
          predictions
      ) {
        const league =
          prediction.league
            ?.name ??
          prediction.leagueCode;

        if (league) {
          values.add(
            String(league),
          );
        }
      }

      return Array.from(
        values,
      ).sort(
        (a, b) =>
          a.localeCompare(b),
      );
    }, [
      predictions,
    ]);


  /* =======================================================
     AVAILABLE MARKETS
  ======================================================= */

  const availableMarkets =
    useMemo(() => {
      const markets =
        new Set<string>();

      for (
        const prediction of
          predictions
      ) {
        for (
          const market of
            getPredictionMarketNames(
              prediction,
            )
        ) {
          markets.add(
            market,
          );
        }
      }

      return Array.from(
        markets,
      ).sort(
        (a, b) =>
          a.localeCompare(b),
      );
    }, [
      predictions,
    ]);


  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filtered =
    useMemo(() => {
      const searchValue =
        filters.search
          .trim()
          .toLowerCase();

      const result =
        predictions.filter(
          (prediction) => {

            /* ---------------------------------------------
               SEARCH
            --------------------------------------------- */

            if (searchValue) {
              const homeTeam =
                String(
                  prediction.homeTeam ??
                    '',
                ).toLowerCase();

              const awayTeam =
                String(
                  prediction.awayTeam ??
                    '',
                ).toLowerCase();

              const leagueName =
                String(
                  prediction.league
                    ?.name ??
                    prediction.leagueCode ??
                    '',
                ).toLowerCase();

              const matchesSearch =
                homeTeam.includes(
                  searchValue,
                ) ||
                awayTeam.includes(
                  searchValue,
                ) ||
                leagueName.includes(
                  searchValue,
                );

              if (
                !matchesSearch
              ) {
                return false;
              }
            }


            /* ---------------------------------------------
               LEAGUE
            --------------------------------------------- */

            if (
              filters.league !==
              'all'
            ) {
              const league =
                prediction.league
                  ?.name ??
                prediction.leagueCode;

              if (
                String(
                  league ?? '',
                ) !==
                filters.league
              ) {
                return false;
              }
            }


            /* ---------------------------------------------
               DATE
            --------------------------------------------- */

            if (
              filters.date &&
              !isPredictionInSelectedDateRange(
                prediction,
                filters,
              )
            ) {
              return false;
            }


            /* ---------------------------------------------
               CONFIDENCE
            --------------------------------------------- */

            if (
              Number(
                prediction.confidence ??
                  0,
              ) <
              filters.minConfidence
            ) {
              return false;
            }


            /* ---------------------------------------------
               PLAN
            --------------------------------------------- */

            if (
              filters.plan !==
              'all'
            ) {
              const predictionPlan =
                normalizePlan(
                  prediction.accessType,
                );

              if (
                predictionPlan !==
                filters.plan
              ) {
                return false;
              }
            }


            /* ---------------------------------------------
               STATUS
            --------------------------------------------- */

            if (
              filters.status !==
              'all'
            ) {
              const status =
                String(
                  prediction.status ??
                    '',
                ).toLowerCase();

              if (
                status !==
                filters.status
              ) {
                return false;
              }
            }


            /* ---------------------------------------------
               MARKET
            --------------------------------------------- */

            if (
              filters.market !==
              'all'
            ) {
              const markets =
                getPredictionMarketNames(
                  prediction,
                );

              if (
                !markets.includes(
                  filters.market,
                )
              ) {
                return false;
              }
            }

            return true;
          },
        );


      /* =====================================================
         SORT
      ===================================================== */

      result.sort(
        (a, b) => {
          const aDate =
            getPredictionDate(a);

          const bDate =
            getPredictionDate(b);

          if (
            !aDate &&
            !bDate
          ) {
            return 0;
          }

          if (!aDate) {
            return 1;
          }

          if (!bDate) {
            return -1;
          }

          return (
            aDate.getTime() -
            bDate.getTime()
          );
        },
      );

      return result;
    }, [
      predictions,
      filters,
    ]);


  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.ceil(
      filtered.length /
        ITEMS_PER_PAGE,
    );

  const paginated =
    useMemo(
      () =>
        filtered.slice(
          (page - 1) *
            ITEMS_PER_PAGE,

          page *
            ITEMS_PER_PAGE,
        ),
      [
        filtered,
        page,
      ],
    );


  useEffect(() => {
    if (
      totalPages > 0 &&
      page > totalPages
    ) {
      setPage(
        totalPages,
      );
    }
  }, [
    page,
    totalPages,
  ]);


  /* =======================================================
     RENDER STATES
  ======================================================= */

  const hasResults =
    paginated.length > 0;

  const canRenderResults =
    !loading &&
    !error &&
    hasResults;

  const showEmpty =
    !loading &&
    !error &&
    !hasResults;


  /* =======================================================
     URL → PREDICTION
  ======================================================= */

  useEffect(() => {
    if (
      !predictionId ||
      filtered.length === 0
    ) {
      return;
    }

    const index =
      filtered.findIndex(
        (prediction) =>
          getPredictionId(
            prediction,
          ) ===
          predictionId,
      );

    if (index === -1) {
      return;
    }

    const targetPage =
      Math.floor(
        index /
          ITEMS_PER_PAGE,
      ) + 1;

    if (
      targetPage !== page
    ) {
      const pageTimer =
        window.setTimeout(
          () => {
            setPage(
              targetPage,
            );
          },
          0,
        );

      return () => {
        window.clearTimeout(
          pageTimer,
        );
      };
    }

    const timer =
      window.setTimeout(
        () => {
          const element =
            document.getElementById(
              `prediction-${predictionId}`,
            );

          if (!element) {
            return;
          }

          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });

          setHighlightedId(
            predictionId,
          );

          window.setTimeout(
            () => {
              setHighlightedId(
                null,
              );
            },
            3000,
          );
        },
        100,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    predictionId,
    filtered,
    page,
  ]);


  /* =======================================================
     SUBSCRIPTION MODAL
  ======================================================= */

  const openSubscriptionModal =
    (
      data: SubscriptionModalData,
    ) => {
      setSubscriptionModal({
        open: true,

        requiredPlan:
          data.requiredPlan,

        feature:
          data.feature,

        userPlan:
          data.userPlan,

        predictionPlan:
          data.predictionPlan,

        released:
          data.released,

        releaseAt:
          data.releaseAt,

        accessState:
          data.accessState,

        accessMessage:
          data.accessMessage,
      });
    };


  /* =======================================================
     SUBSCRIBE
  ======================================================= */

  const handleSubscribe =
    () => {
      window.location.href =
        '/dashboard/subscriptions';
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-8">

      {/* ===================================================
          HERO AD
      =================================================== */}

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.HERO}
      />


      {/* ===================================================
          FILTERS
      =================================================== */}

          <div
            className={`
              sticky
              z-40
              -mx-3
              px-3
              py-2
              sm:-mx-4
              sm:px-4
              transition-[top]
              duration-300
              ease-out
              ${
                navbarVisible
                  ? 'top-[5.25rem] sm:top-24'
                  : 'top-0'
              }
            `}
          >
      <PredictionFilters
        value={filters}
        onChange={
          handleFiltersChange
        }
        leagues={leagues}
        availableMarkets={
          availableMarkets
        }
        totalResults={
          filtered.length
        }
      />

</div>
      {/* ===================================================
          ERROR
      =================================================== */}

      {!loading &&
        error && (
          <div
            className="
              rounded-2xl
              border
              border-red-500/30
              bg-red-500/5
              p-6
              text-center
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-red-600
                dark:text-red-400
              "
            >
              {error}
            </p>
          </div>
        )}


      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (
        <div
          className="
            rounded-2xl
            border
            border-border
            bg-card
            p-10
            text-center
            text-muted-foreground
          "
        >
          Loading predictions...
        </div>
      )}


      {/* ===================================================
          EMPTY
      =================================================== */}

      {showEmpty && (
        <div
          className="
            rounded-2xl
            border
            border-border
            bg-card
            p-10
            text-center
          "
        >

          <h3 className="font-semibold">
            No predictions found
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            Try selecting another date
            or changing your filters.
          </p>

        </div>
      )}


      {/* ===================================================
          DESKTOP TABLE
      =================================================== */}

      {canRenderResults && (
        <div className="hidden xl:block">

          <PredictionTable
            predictions={paginated}
            highlightedId={
              highlightedId
            }
            onSubscriptionRequired={
              (data) => {
                const prediction =
                  paginated.find(
                    (item) =>
                      getPredictionId(
                        item,
                      ) ===
                      data.predictionId,
                  );

                openSubscriptionModal({
                  ...data,
                  prediction,
                });
              }
            }
          />

        </div>
      )}


      {/* ===================================================
          MOBILE / TABLET
      =================================================== */}

      {canRenderResults && (
        <div
          className="
            space-y-3
            xl:hidden
          "
        >

          {paginated.map(
            (prediction) => {
              const id =
                getPredictionId(
                  prediction,
                );

              if (!id) {
                return null;
              }

              return (
                <PredictionMobileCard
                  key={id}
                  prediction={
                    prediction
                  }
                  highlighted={
                    highlightedId ===
                    id
                  }
                  onSubscriptionRequired={
                    (data) =>
                      openSubscriptionModal({
                        ...data,
                        predictionId:
                          id,
                        prediction,
                      })
                  }
                />
              );
            },
          )}

        </div>
      )}


      {/* ===================================================
          PAGINATION
      =================================================== */}

      {!loading &&
        !error &&
        filtered.length > 0 && (
          <PredictionPagination
            page={page}
            totalPages={
              totalPages
            }
            onChange={
              setPage
            }
          />
        )}


      {/* ===================================================
          ADS
      =================================================== */}

      <PredictionsAds />

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.BOTTOM}
      />

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.POPUP}
      />


      {/* ===================================================
          SUBSCRIPTION MODAL
      =================================================== */}

      <SubscriptionModal
        open={
          subscriptionModal.open
        }
        onClose={() =>
          setSubscriptionModal(
            (current) => ({
              ...current,
              open: false,
            }),
          )
        }
        requiredPlan={
          subscriptionModal.requiredPlan
        }
        feature={
          subscriptionModal.feature
        }
        userPlan={
          subscriptionModal.userPlan
        }
        predictionPlan={
          subscriptionModal.predictionPlan
        }
        released={
          subscriptionModal.released
        }
        releaseAt={
          subscriptionModal.releaseAt
        }
        accessState={
          subscriptionModal.accessState
        }
        accessMessage={
          subscriptionModal.accessMessage
        }
        onSubscribe={
          handleSubscribe
        }
      />

    </div>
  );
}


/* =========================================================
   PAGE
========================================================= */

export default function PredictionsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="
            rounded-2xl
            border
            border-border
            bg-card
            p-10
            text-center
            text-muted-foreground
          "
        >
          Loading predictions...
        </div>
      }
    >
      <PredictionsPageContent />
    </Suspense>
  );
}