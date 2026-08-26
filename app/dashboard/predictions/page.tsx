'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSearchParams } from 'next/navigation';

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

import { getApiErrorMessage } from '@/lib/getApiErrorMessage';

import { getPredictionAccess } from '@/services/prediction.service';


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

/*
 * Access checks are still performed individually because
 * authorization is prediction-specific.
 *
 * Requests are throttled so the browser does not fire
 * every request simultaneously.
 */
const ACCESS_CONCURRENCY = 5;

const INITIAL_FILTERS: PredictionFilterState = {
  search: '',
  league: 'all',
  date: 'all',
  customDate: '',
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
   HELPERS
========================================================= */

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

      return market?.market ?? '';
    })
    .filter(Boolean)
    .map(String);
}


/* =========================================================
   PAGE CONTENT
========================================================= */

function PredictionsPageContent() {
  /* =======================================================
     STATE
  ======================================================= */

  const [predictions, setPredictions] =
    useState<Prediction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [filters, setFilters] =
    useState<PredictionFilterState>(
      INITIAL_FILTERS,
    );

  const [page, setPage] =
    useState(1);

  const [highlightedId, setHighlightedId] =
    useState<string | null>(null);

  const [subscriptionModal, setSubscriptionModal] =
    useState<SubscriptionModalState>(
      INITIAL_MODAL_STATE,
    );


  /* =======================================================
     FILTER HANDLER
  ======================================================= */

  const handleFiltersChange = (
    nextFilters: PredictionFilterState,
  ) => {
    setFilters(nextFilters);
    setPage(1);
  };


  /* =======================================================
     URL
  ======================================================= */

  const searchParams =
    useSearchParams();

  const predictionId =
    searchParams.get('prediction');


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
              : response.data?.data ?? [];

          setPredictions(
            Array.isArray(data)
              ? data
              : [],
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

     Access is checked independently.

     - Maximum 5 requests at once.
     - Results are applied independently.
     - The page does not wait for access checks.
     - Predictions with existing access data are skipped.
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

              /*
               * Do not request access again if this
               * prediction has already been resolved.
               */
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
                          itemId !== id
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
                              result.data
                                ?.prediction ??
                              undefined,

                            probabilities:
                              result.data
                                ?.probabilities ??
                              null,

                            markets:
                              (result.data
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
          prediction.league?.name ??
          prediction.leagueCode;

        if (league) {
          values.add(
            String(league),
          );
        }
      }

      return Array.from(
        values,
      ).sort((a, b) =>
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
          markets.add(market);
        }
      }

      return Array.from(
        markets,
      ).sort((a, b) =>
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
      const now =
        new Date();

      /* ---------------------------------------------------
         TODAY
      --------------------------------------------------- */

      const todayStart =
        new Date(now);

      todayStart.setHours(
        0,
        0,
        0,
        0,
      );

      const todayEnd =
        new Date(todayStart);

      todayEnd.setDate(
        todayEnd.getDate() + 1,
      );


      /* ---------------------------------------------------
         WEEK
      --------------------------------------------------- */

      const weekStart =
        new Date(now);

      const day =
        weekStart.getDay();

      weekStart.setDate(
        weekStart.getDate() +
          (
            day === 0
              ? -6
              : 1 - day
          ),
      );

      weekStart.setHours(
        0,
        0,
        0,
        0,
      );

      const weekEnd =
        new Date(weekStart);

      weekEnd.setDate(
        weekEnd.getDate() + 7,
      );


      /* ---------------------------------------------------
         MONTH
      --------------------------------------------------- */

      const monthStart =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        );

      const monthEnd =
        new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
        );


      /* ---------------------------------------------------
         CUSTOM DATE
      --------------------------------------------------- */

      let customStart:
        | Date
        | null = null;

      let customEnd:
        | Date
        | null = null;

      if (
        filters.date === 'custom' &&
        filters.customDate
      ) {
        customStart =
          new Date(
            `${filters.customDate}T00:00:00`,
          );

        customEnd =
          new Date(
            customStart,
          );

        customEnd.setDate(
          customEnd.getDate() + 1,
        );
      }


      /* ---------------------------------------------------
         SEARCH
      --------------------------------------------------- */

      const searchValue =
        filters.search
          .trim()
          .toLowerCase();


      /* ---------------------------------------------------
         FILTER
      --------------------------------------------------- */

      const result =
        predictions.filter(
          (prediction) => {
            /* SEARCH */

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


            /* LEAGUE */

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


            /* DATE */

            if (
              filters.date !==
              'all'
            ) {
              const matchDate =
                getPredictionDate(
                  prediction,
                );

              if (!matchDate) {
                return false;
              }

              if (
                filters.date ===
                  'today' &&
                !isWithin(
                  matchDate,
                  todayStart,
                  todayEnd,
                )
              ) {
                return false;
              }

              if (
                filters.date ===
                  'week' &&
                !isWithin(
                  matchDate,
                  weekStart,
                  weekEnd,
                )
              ) {
                return false;
              }

              if (
                filters.date ===
                  'month' &&
                !isWithin(
                  matchDate,
                  monthStart,
                  monthEnd,
                )
              ) {
                return false;
              }

              if (
                filters.date ===
                  'custom'
              ) {
                if (
                  !customStart ||
                  !customEnd
                ) {
                  return false;
                }

                if (
                  !isWithin(
                    matchDate,
                    customStart,
                    customEnd,
                  )
                ) {
                  return false;
                }
              }
            }


            /* CONFIDENCE */

            if (
              Number(
                prediction.confidence ??
                  0,
              ) <
              filters.minConfidence
            ) {
              return false;
            }


            /* PLAN */

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


            /* STATUS */

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


            /* MARKET */

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


      /* ---------------------------------------------------
         SORT

         Priority:
         1. Today's matches
         2. Upcoming matches
         3. Past matches

         Today/upcoming:
         earliest first

         Past:
         newest first
      --------------------------------------------------- */

      result.sort(
        (a, b) => {
          const now =
            Date.now();

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

          const aTime =
            aDate.getTime();

          const bTime =
            bDate.getTime();

          const startOfToday =
            new Date();

          startOfToday.setHours(
            0,
            0,
            0,
            0,
          );

          const endOfToday =
            new Date(
              startOfToday,
            );

          endOfToday.setDate(
            endOfToday.getDate() + 1,
          );

          const isToday =
            (time: number) =>
              time >=
                startOfToday.getTime() &&
              time <
                endOfToday.getTime();

          const getPriority =
            (time: number) => {
              if (
                isToday(time)
              ) {
                return 0;
              }

              if (
                time > now
              ) {
                return 1;
              }

              return 2;
            };

          const aPriority =
            getPriority(aTime);

          const bPriority =
            getPriority(bTime);

          if (
            aPriority !==
            bPriority
          ) {
            return (
              aPriority -
              bPriority
            );
          }

          if (
            aPriority === 2
          ) {
            return (
              bTime -
              aTime
            );
          }

          return (
            aTime -
            bTime
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


  /*
   * Keep the current page valid if filtering reduces
   * the number of available pages.
   */
  useEffect(() => {
    if (
      totalPages > 0 &&
      page > totalPages
    ) {
      setPage(totalPages);
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
          ) === predictionId,
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
            setPage(targetPage);
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

      {/* =====================================================
          HERO AD
      ===================================================== */}

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.HERO}
      />


      {/* =====================================================
          FILTERS
      ===================================================== */}

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


      {/* =====================================================
          ERROR
      ===================================================== */}

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


      {/* =====================================================
          INITIAL LOADING
      ===================================================== */}

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


      {/* =====================================================
          EMPTY
      ===================================================== */}

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
            Try changing your filters.
          </p>
        </div>
      )}


      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}

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


      {/* =====================================================
          MOBILE / TABLET CARDS
      ===================================================== */}

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


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!loading &&
        !error &&
        filtered.length > 0 && (
          <PredictionPagination
            page={page}
            totalPages={
              totalPages
            }
            onChange={setPage}
          />
        )}


      {/* =====================================================
          ADS
      ===================================================== */}

      <PredictionsAds />

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.BOTTOM}
      />

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.POPUP}
      />


      {/* =====================================================
          SUBSCRIPTION MODAL
      ===================================================== */}

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
   DATE HELPERS
========================================================= */

function isWithin(
  date: Date,
  start: Date,
  end: Date,
): boolean {
  return (
    date >= start &&
    date < end
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