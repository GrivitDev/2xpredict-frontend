'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import {
  getApiErrorMessage,
} from '@/lib/getApiErrorMessage';

import {
  useAuth,
} from '@/providers/auth-provider';

import {
  getPredictionAccess,
  getPublicPredictionPreview,
  type PredictionDetails,
} from '@/services/prediction.service';

import PredictionPreviewCard from './PredictionPreviewCard';

// ============================================================
// TYPES
// ============================================================

interface PredictionsPreviewProps {
  search?: string;
  selectedDate?: string;
  goalFilter?: string;
  resultFilter?: 'all' | 'home' | 'away' | 'draw';
}

// ============================================================
// HELPERS
// ============================================================

function matchesSearch(
  prediction: PredictionDetails,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    prediction.homeTeam,
    prediction.awayTeam,
    prediction.league?.name,
    prediction.leagueCode,
  ].some(
    value =>
      typeof value === 'string' &&
      value.toLowerCase().includes(query),
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function PredictionsPreview({
  search = '',
}: PredictionsPreviewProps) {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    predictions,
    setPredictions,
  ] = useState<PredictionDetails[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(false);

  const [
    openingPredictionId,
    setOpeningPredictionId,
  ] = useState<string | null>(null);

  // ==========================================================
  // LOAD PUBLIC PREDICTIONS
  // ==========================================================

  const loadPredictions = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(false);

        const data =
          await getPublicPredictionPreview();

        setPredictions(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (loadError) {
        console.error(
          'Failed to load public predictions:',
          loadError,
        );

        setPredictions([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadPredictions();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadPredictions]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const displayedPredictions =
    predictions.filter(
      prediction =>
        matchesSearch(
          prediction,
          search,
        ),
    );

  // ==========================================================
  // VIEW ALL
  // ==========================================================

  const handleViewAll = useCallback(() => {
    if (authLoading) {
      return;
    }

    router.push(
      user
        ? '/dashboard/predictions'
        : '/login?redirect=/dashboard/predictions',
    );
  }, [
    authLoading,
    router,
    user,
  ]);

  // ==========================================================
  // OPEN PREDICTION
  // ==========================================================

  const handlePredictionClick =
    useCallback(
      async (
        prediction: PredictionDetails,
      ) => {
        const predictionId =
          prediction._id;

        if (!predictionId) {
          toast.error(
            'Unable to open prediction',
          );

          return;
        }

        if (authLoading) {
          toast.info(
            'Checking your account...',
          );

          return;
        }

        const dashboardUrl =
          `/dashboard/predictions?prediction=${encodeURIComponent(
            predictionId,
          )}`;

        // ------------------------------------------------------
        // PUBLIC VISITOR
        // ------------------------------------------------------

        if (!user) {
          router.push(
            `/login?redirect=${encodeURIComponent(
              dashboardUrl,
            )}`,
          );

          return;
        }

        // ------------------------------------------------------
        // AUTHENTICATED USER
        // ------------------------------------------------------

        try {
          setOpeningPredictionId(
            predictionId,
          );

          await getPredictionAccess(
            predictionId,
          );

          router.push(
            dashboardUrl,
          );
        } catch (accessError: unknown) {
          console.error(
            'Unable to access prediction:',
            accessError,
          );

          toast.error(
            'Unable to open prediction',
            {
              description:
                getApiErrorMessage(
                  accessError,
                  'Unable to open this prediction. Please try again.',
                ),
            },
          );
        } finally {
          setOpeningPredictionId(
            null,
          );
        }
      },
      [
        authLoading,
        router,
        user,
      ],
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        bg-background
        py-4
        text-foreground
      "
    >
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[300px]
          w-[300px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/10
          blur-2xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          right-0
          h-[180px]
          w-[180px]
          translate-x-1/3
          translate-y-1/3
          rounded-full
          bg-primary/5
          blur-2xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            mb-4
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-foreground
                sm:text-3xl
              "
            >
              Our Latest{' '}
              <span className="text-primary">
                Predictions
              </span>
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-muted-foreground
              "
            >
              Free high-confidence predictions
            </p>
          </div>

          <button
            type="button"
            onClick={handleViewAll}
            disabled={authLoading}
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-border
              bg-card
              px-4
              py-2.5
              text-xs
              font-semibold
              text-foreground
              shadow-sm
              transition
              hover:border-primary/40
              hover:bg-primary/5
              disabled:pointer-events-none
              disabled:opacity-60
            "
          >
            {authLoading
              ? 'Checking access...'
              : 'View All Predictions'}

            {authLoading ? (
              <Loader2
                className="
                  h-4
                  w-4
                  animate-spin
                "
              />
            ) : (
              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            )}
          </button>
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div
            className="
              grid
              min-h-[260px]
              place-items-center
              rounded-2xl
              border
              border-border
              bg-card/50
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                text-sm
                text-muted-foreground
              "
            >
              <Loader2
                className="
                  h-5
                  w-5
                  animate-spin
                  text-primary
                "
              />

              Loading predictions...
            </div>
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-border
              bg-card/70
              p-8
              text-center
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-foreground
              "
            >
              Unable to load predictions.
            </p>

            <p
              className="
                mt-2
                text-sm
                text-muted-foreground
              "
            >
              Something went wrong while loading
              today&apos;s predictions.
            </p>

            <button
              type="button"
              onClick={() => {
                void loadPredictions();
              }}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-2
                text-sm
                font-semibold
                transition
                hover:border-primary/40
                hover:bg-primary/5
              "
            >
              <RefreshCw
                className="h-4 w-4"
              />

              Try again
            </button>
          </div>
        )}

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          displayedPredictions.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-border
                bg-card/70
                p-8
                text-center
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                No free predictions available.
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-muted-foreground
                "
              >
                New high-confidence predictions
                will appear here automatically.
              </p>
            </div>
          )}

        {/* ====================================================
            PREDICTIONS
        ==================================================== */}

        {!loading &&
          !error &&
          displayedPredictions.length > 0 && (
            <div
              className="
                grid
                grid-cols-1
                gap-2
                sm:grid-cols-2
                sm:gap-3
                lg:grid-cols-5
              "
            >
              {displayedPredictions
                .slice(0, 5)
                .map(prediction => {
                  const predictionId =
                    prediction._id;

                  const isOpening =
                    openingPredictionId ===
                    predictionId;

                  return (
                    <div
                      key={predictionId}
                      className="relative"
                    >
                      <PredictionPreviewCard
                        prediction={
                          prediction
                        }
                        onClick={() => {
                          if (!isOpening) {
                            void handlePredictionClick(
                              prediction,
                            );
                          }
                        }}
                      />

                      {isOpening && (
                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            rounded-xl
                            bg-background/60
                            backdrop-blur-[2px]
                            sm:rounded-2xl
                          "
                        >
                          <Loader2
                            className="
                              h-5
                              w-5
                              animate-spin
                              text-primary
                            "
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
      </div>
    </section>
  );
}