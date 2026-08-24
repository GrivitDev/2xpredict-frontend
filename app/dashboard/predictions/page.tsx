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

import { getApiErrorMessage } from '@/lib/getApiErrorMessage';

import {
  getPredictionAccess,
} from '@/services/prediction.service';


/* =========================================================
   SUBSCRIPTION MODAL DATA
========================================================= */

type SubscriptionModalData = {
  predictionId?: string;

  prediction?: any;

  requiredPlan:
    | 'regular'
    | 'vip';

  feature:
    | 'prediction'
    | 'markets';

  userPlan:
    | 'free'
    | 'regular'
    | 'vip';

  predictionPlan:
    | 'free'
    | 'regular'
    | 'vip';

  released: boolean;

  releaseAt:
    | number
    | null;

  accessState: string;

  accessMessage:
    | string
    | null;
};


function PredictionsPageContent() {

  /*
   * =========================================================
   * PREDICTIONS
   * =========================================================
   */

  const [
    predictions,
    setPredictions,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    accessLoading,
    setAccessLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */

  const [
    filters,
    setFilters,
  ] =
    useState<PredictionFilterState>({
      search: '',
      league: 'all',
      date: 'all',
      customDate: '',
      minConfidence: 0,
      market: 'all',
      plan: 'all',
      status: 'all',
    });


  /*
   * =========================================================
   * URL
   * =========================================================
   */

  const searchParams =
    useSearchParams();

  const predictionId =
    searchParams.get(
      'prediction',
    );


  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  const [
    page,
    setPage,
  ] = useState(1);

  const ITEMS_PER_PAGE = 10;


  /*
   * =========================================================
   * HIGHLIGHT
   * =========================================================
   */

  const [
    highlightedId,
    setHighlightedId,
  ] = useState<string | null>(
    null,
  );


  /*
   * =========================================================
   * SUBSCRIPTION MODAL
   * =========================================================
   */

  const [
    subscriptionModal,
    setSubscriptionModal,
  ] = useState<{
    open: boolean;

    requiredPlan:
      | 'regular'
      | 'vip';

    feature:
      | 'prediction'
      | 'markets';

    userPlan:
      | 'free'
      | 'regular'
      | 'vip';

    predictionPlan:
      | 'free'
      | 'regular'
      | 'vip';

    released: boolean;

    releaseAt:
      | number
      | null;

    accessState: string;

    accessMessage:
      | string
      | null;
  }>({
    open: false,

    requiredPlan:
      'regular',

    feature:
      'prediction',

    userPlan:
      'free',

    predictionPlan:
      'regular',

    released: true,

    releaseAt:
      null,

    accessState:
      '',

    accessMessage:
      null,
  });


  /*
   * =========================================================
   * LOAD PREDICTIONS
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const fetchPredictions =
      async () => {
        try {
          setLoading(true);
          setError(null);

          const res =
            await api.get(
              '/predictions',
            );

          const data =
            Array.isArray(
              res.data,
            )
              ? res.data
              : res.data?.data ??
                [];

          if (!mounted) {
            return;
          }

          setPredictions(data);
        } catch (error: unknown) {
          console.error(
            'Failed to load predictions:',
            error,
          );

          if (!mounted) {
            return;
          }

          setPredictions([]);

          setError(
            getApiErrorMessage(
              error,
              'Unable to load predictions. Please try again.',
            ),
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    fetchPredictions();

    return () => {
      mounted = false;
    };
  }, []);


  /*
   * =========================================================
   * LOAD USER ACCESS
   * =========================================================
   */

  useEffect(() => {
    if (
      loading ||
      predictions.length === 0
    ) {
      return;
    }

    let mounted = true;

    const loadAccess =
      async () => {
        try {
          setAccessLoading(true);

          const results =
            await Promise.allSettled(
              predictions.map(
                async (
                  prediction,
                ) => {
                  const id =
                    prediction._id ??
                    prediction.id;

                  if (!id) {
                    return null;
                  }

                  const access =
                    await getPredictionAccess(
                      id,
                    );

                  return {
                    id,
                    access,
                  };
                },
              ),
            );

          if (!mounted) {
            return;
          }

          setPredictions(
            (current) =>
              current.map(
                (prediction) => {
                  const id =
                    prediction._id ??
                    prediction.id;

                  const result =
                    results.find(
                      (item) =>
                        item.status ===
                          'fulfilled' &&
                        item.value?.id ===
                          id,
                    );

                  if (
                    !result ||
                    result.status !==
                      'fulfilled' ||
                    !result.value
                  ) {
                    return {
                      ...prediction,

                      access: {
                        allowed: false,

                        state:
                          'login_required',

                        purchased: false,

                        plan: 'free',

                        released: false,

                        releaseAt: 0,

                        message:
                          'Please log in to view this prediction.',
                      },
                    };
                  }

                  const accessData =
                    result.value
                      .access;

                  return {
                    ...prediction,

                    access:
                      accessData.access,

                    ...(accessData.access
                      ?.allowed &&
                    accessData.data
                      ? {
                          prediction:
                            accessData.data
                              ?.prediction ??
                            undefined,

                          probabilities:
                            accessData.data
                              ?.probabilities ??
                            null,

                          markets:
                            accessData.data
                              ?.markets ??
                            null,
                        }
                      : {
                          prediction:
                            undefined,

                          probabilities:
                            null,

                          markets:
                            null,
                        }),
                  };
                },
              ),
          );
        } catch (error) {
          console.error(
            'Failed to load prediction access:',
            error,
          );
        } finally {
          if (mounted) {
            setAccessLoading(false);
          }
        }
      };

    loadAccess();

    return () => {
      mounted = false;
    };
  }, [
    loading,
    predictions.length,
  ]);


  /*
   * =========================================================
   * AVAILABLE LEAGUES
   * =========================================================
   */

  const leagues =
    useMemo(() => {
      return Array.from(
        new Set(
          predictions
            .map(
              (prediction) =>
                prediction.league?.name ??
                prediction.leagueCode,
            )
            .filter(Boolean),
        ),
      ).sort((a, b) =>
        String(a).localeCompare(
          String(b),
        ),
      );
    }, [predictions]);


  /*
   * =========================================================
   * AVAILABLE MARKETS
   * =========================================================
   */

  const availableMarkets =
    useMemo(() => {
      const markets =
        new Set<string>();

      predictions.forEach(
        (prediction) => {
          const predictionMarkets =
            Array.isArray(
              prediction.markets,
            )
              ? prediction.markets
              : [];

          predictionMarkets.forEach(
            (market: any) => {
              const value =
                typeof market ===
                'string'
                  ? market
                  : market?.market;

              if (value) {
                markets.add(
                  String(value),
                );
              }
            },
          );
        },
      );

      return Array.from(
        markets,
      );
    }, [predictions]);


  /*
   * =========================================================
   * FILTER PREDICTIONS
   * =========================================================
   */

  const filtered =
    useMemo(() => {
      const now =
        new Date();

      const todayStart =
        new Date(now);

      todayStart.setHours(
        0,
        0,
        0,
        0,
      );

      const todayEnd =
        new Date(
          todayStart,
        );

      todayEnd.setDate(
        todayEnd.getDate() + 1,
      );


      /*
       * WEEK
       */

      const weekStart =
        new Date(now);

      const day =
        weekStart.getDay();

      const diff =
        day === 0
          ? -6
          : 1 - day;

      weekStart.setDate(
        weekStart.getDate() +
          diff,
      );

      weekStart.setHours(
        0,
        0,
        0,
        0,
      );

      const weekEnd =
        new Date(
          weekStart,
        );

      weekEnd.setDate(
        weekEnd.getDate() + 7,
      );


      /*
       * MONTH
       */

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


      /*
       * CUSTOM DATE
       */

      let customStart:
        | Date
        | null = null;

      let customEnd:
        | Date
        | null = null;

      if (
        filters.date ===
          'custom' &&
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


      const searchValue =
        filters.search
          .trim()
          .toLowerCase();


      return predictions
        .filter(
          (prediction) => {

            /*
             * SEARCH
             */

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
                  prediction.league?.name ??
                    prediction.leagueCode ??
                    '',
                ).toLowerCase();

              if (
                !homeTeam.includes(
                  searchValue,
                ) &&
                !awayTeam.includes(
                  searchValue,
                ) &&
                !leagueName.includes(
                  searchValue,
                )
              ) {
                return false;
              }
            }


            /*
             * LEAGUE
             */

            if (
              filters.league !==
                'all'
            ) {
              const predictionLeague =
                prediction.league?.name ??
                prediction.leagueCode;

              if (
                predictionLeague !==
                filters.league
              ) {
                return false;
              }
            }


            /*
             * DATE
             */

            const matchDate =
              getPredictionDate(
                prediction,
              );

            if (!matchDate) {
              if (
                filters.date !==
                'all'
              ) {
                return false;
              }
            } else {

              if (
                filters.date ===
                  'today' &&
                !(
                  matchDate >=
                    todayStart &&
                  matchDate <
                    todayEnd
                )
              ) {
                return false;
              }

              if (
                filters.date ===
                  'week' &&
                !(
                  matchDate >=
                    weekStart &&
                  matchDate <
                    weekEnd
                )
              ) {
                return false;
              }

              if (
                filters.date ===
                  'month' &&
                !(
                  matchDate >=
                    monthStart &&
                  matchDate <
                    monthEnd
                )
              ) {
                return false;
              }

              if (
                filters.date ===
                  'custom' &&
                customStart &&
                customEnd &&
                !(
                  matchDate >=
                    customStart &&
                  matchDate <
                    customEnd
                )
              ) {
                return false;
              }
            }


            /*
             * CONFIDENCE
             */

            if (
              Number(
                prediction.confidence ??
                  0,
              ) <
                filters.minConfidence
            ) {
              return false;
            }


            /*
             * PLAN
             */

            if (
              filters.plan !==
                'all'
            ) {
              if (
                prediction.accessType !==
                filters.plan
              ) {
                return false;
              }
            }


            /*
             * STATUS
             */

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


            /*
             * MARKET
             */

            if (
              filters.market !==
                'all'
            ) {
              const predictionMarkets =
                Array.isArray(
                  prediction.markets,
                )
                  ? prediction.markets
                  : [];

              const hasMarket =
                predictionMarkets.some(
                  (market: any) => {
                    const value =
                      typeof market ===
                      'string'
                        ? market
                        : market?.market;

                    return (
                      String(
                        value ?? '',
                      ) ===
                      filters.market
                    );
                  },
                );

              if (!hasMarket) {
                return false;
              }
            }

            return true;
          },
        )
        .sort(
          (a, b) => {
            const aDate =
              getPredictionDate(
                a,
              )?.getTime() ??
              Number.MAX_SAFE_INTEGER;

            const bDate =
              getPredictionDate(
                b,
              )?.getTime() ??
              Number.MAX_SAFE_INTEGER;

            return (
              aDate - bDate
            );
          },
        );
    }, [
      predictions,
      filters,
    ]);


  /*
   * =========================================================
   * RESET PAGE WHEN FILTERS CHANGE
   * =========================================================
   */

  useEffect(() => {
    setPage(1);
  }, [filters]);


  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  const totalPages =
    Math.ceil(
      filtered.length /
        ITEMS_PER_PAGE,
    );

  const paginated =
    filtered.slice(
      (page - 1) *
        ITEMS_PER_PAGE,
      page *
        ITEMS_PER_PAGE,
    );


  /*
   * =========================================================
   * URL → PREDICTION
   * =========================================================
   */

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
          prediction._id ===
            predictionId ||
          prediction.id ===
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
      setPage(targetPage);
      return;
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
        150,
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


  /*
   * =========================================================
   * OPEN SUBSCRIPTION MODAL
   *
   * BOTH DESKTOP TABLE AND MOBILE CARD
   * USE THIS SAME HANDLER.
   * =========================================================
   */

  const openSubscriptionModal =
    ({
      predictionId,
      prediction,
      requiredPlan,
      feature,
      userPlan,
      predictionPlan,
      released,
      releaseAt,
      accessState,
      accessMessage,
    }: SubscriptionModalData) => {

      setSubscriptionModal({
        open: true,

        requiredPlan,

        feature,

        userPlan,

        predictionPlan,

        released,

        releaseAt,

        accessState,

        accessMessage,
      });
    };


  /*
   * =========================================================
   * SUBSCRIBE
   * =========================================================
   */

  const handleSubscribe =
    () => {
      window.location.href =
        '/dashboard/subscriptions';
    };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      className="
        space-y-8
      "
    >

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.HERO}
      />


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <PredictionFilters
        value={filters}
        onChange={setFilters}
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
              rounded-3xl
              border
              border-red-500/30
              bg-red-500/5
              p-6
              text-center
            "
          >
            <p
              className="
                text-s
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
          LOADING
      ===================================================== */}

      {(loading ||
        accessLoading) && (
        <div
          className="
            rounded-3xl
            border
            border-border
            bg-card
            p-10
            text-center
            text-muted-foreground
          "
        >
          {loading
            ? 'Loading predictions...'
            : 'Checking prediction access...'}
        </div>
      )}


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !accessLoading &&
        !error &&
        paginated.length ===
          0 && (
          <div
            className="
              rounded-3xl
              border
              border-border
              bg-card
              p-10
              text-center
            "
          >
            <h3
              className="
                font-semibold
              "
            >
              No predictions found
            </h3>

            <p
              className="
                mt-2
                text-s
                text-muted-foreground
              "
            >
              Try changing your
              filters.
            </p>
          </div>
        )}


      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}

      {!loading &&
        !accessLoading &&
        !error &&
        paginated.length >
          0 && (
          <div
            className="
              hidden
              xl:block
            "
          >
            <PredictionTable
              predictions={
                paginated
              }

              highlightedId={
                highlightedId
              }

              onSubscriptionRequired={(
                data,
              ) => {

                const prediction =
                  paginated.find(
                    (item) =>
                      String(
                        item._id ??
                        item.id ??
                        '',
                      ) ===
                      data.predictionId,
                  );


                openSubscriptionModal({
                  ...data,
                  prediction,
                });

              }}
            />
          </div>
        )}


      {/* =====================================================
          MOBILE CARDS
      ===================================================== */}

      {!loading &&
        !accessLoading &&
        !error &&
        paginated.length >
          0 && (
          <div
            className="
              space-y-4
              xl:hidden
            "
          >
            {paginated.map(
              (prediction) => {

                const id =
                  prediction._id ??
                  prediction.id;

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

                    /*
                     * THIS WAS THE MISSING PROP.
                     *
                     * The mobile card now has
                     * access to the same modal
                     * callback as the desktop table.
                     */
                    onSubscriptionRequired={(
                      data,
                    ) => {

                      openSubscriptionModal({
                        ...data,

                        predictionId:
                          id,

                        prediction,
                      });
                    }}
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
        !accessLoading &&
        filtered.length >
          0 && (
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
        position={
          AdPosition.BOTTOM
        }
      />

      <InternalAds
        page={AdPage.HOME}
        position={
          AdPosition.POPUP
        }
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
   MATCH DATE
========================================================= */

function getPredictionDate(
  prediction: any,
): Date | null {

  const value =
    prediction.matchDate ??
    prediction.date ??
    prediction.kickoffTimestamp;

  if (!value) {
    return null;
  }

  const date =
    typeof value === 'number'
      ? new Date(value)
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
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
            rounded-3xl
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