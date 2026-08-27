'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuth } from '@/providers/auth-provider';
import {
  getPredictionAccess,
  getPredictions,
  type PredictionDetails,
} from '@/services/prediction.service';

import PredictionPreviewCard from './PredictionPreviewCard';

interface PredictionsPreviewProps {
  search: string;
  selectedDate: string;
  goalFilter: string;
  resultFilter: 'all' | 'home' | 'away' | 'draw';
}

const MOBILE_INITIAL_COUNT = 6;
const DESKTOP_INITIAL_COUNT = 10;

function getPredictionDate(prediction: PredictionDetails): string | undefined {
  if (typeof prediction.matchId === 'object' && prediction.matchId !== null) {
    return (prediction.matchId as { utcDate?: string }).utcDate;
  }

  return prediction.match?.utcDate ?? prediction.matchDate ?? prediction.date;
}

function getDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  const today = new Date();
  const todayKey = getDateKey(today);
  const tomorrow = new Date(today);
  const yesterday = new Date(today);

  tomorrow.setDate(tomorrow.getDate() + 1);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateKey === getDateKey(yesterday)) {
    return 'Yesterday';
  }

  if (dateKey === todayKey) {
    return 'Today';
  }

  if (dateKey === getDateKey(tomorrow)) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function getPredictionsFromResponse(response: unknown): PredictionDetails[] {
  if (Array.isArray(response)) {
    return response as PredictionDetails[];
  }

  if (typeof response !== 'object' || response === null) {
    return [];
  }

  const data = response as {
    data?: unknown;
    predictions?: unknown;
  };

  if (Array.isArray(data.data)) {
    return data.data as PredictionDetails[];
  }

  return Array.isArray(data.predictions)
    ? (data.predictions as PredictionDetails[])
    : [];
}

function matchesFilters(
  prediction: PredictionDetails,
  query: string,
  minimumGoals: number | null,
  resultFilter: PredictionsPreviewProps['resultFilter'],
): boolean {
  if (query) {
    const matchesSearch = [
      prediction.homeTeam,
      prediction.awayTeam,
      prediction.league?.name,
      prediction.venue,
    ].some(value => value?.toLowerCase().includes(query));

    if (!matchesSearch) {
      return false;
    }
  }

  const homeScore = prediction.homeScore ?? 0;
  const awayScore = prediction.awayScore ?? 0;

  if (minimumGoals !== null && homeScore + awayScore < minimumGoals) {
    return false;
  }

  if (resultFilter === 'home') {
    return homeScore > awayScore;
  }

  if (resultFilter === 'away') {
    return awayScore > homeScore;
  }

  return resultFilter !== 'draw' || homeScore === awayScore;
}

export default function PredictionsPreview({
  search,
  selectedDate,
  goalFilter,
  resultFilter,
}: PredictionsPreviewProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [predictions, setPredictions] = useState<PredictionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedFilterKey, setExpandedFilterKey] = useState<string | null>(
    null,
  );
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [openingPredictionId, setOpeningPredictionId] = useState<string | null>(
    null,
  );

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await getPredictions();
      const now = Date.now();
      const upcomingPredictions = getPredictionsFromResponse(response)
        .filter(prediction => Boolean(prediction._id))
        .filter(prediction => {
          const date = getPredictionDate(prediction);
          const timestamp = date ? new Date(date).getTime() : Number.NaN;

          return !Number.isNaN(timestamp) && timestamp >= now;
        })
        .sort((first, second) => {
          const firstDate = new Date(getPredictionDate(first) ?? '').getTime();
          const secondDate = new Date(getPredictionDate(second) ?? '').getTime();

          return firstDate - secondDate;
        });

      setPredictions(upcomingPredictions);
    } catch (loadError) {
      console.error('Failed to load predictions:', loadError);
      setError(true);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadPredictions();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadPredictions]);

  const availableDates = useMemo(() => {
    const dates = new Set(
      predictions
        .map(getPredictionDate)
        .filter((date): date is string => Boolean(date))
        .map(getDateKey)
        .filter(Boolean),
    );

    return Array.from(dates).sort();
  }, [predictions]);

  const activeDate =
    selectedDate && availableDates.includes(selectedDate)
      ? selectedDate
      : availableDates.includes(currentDate)
        ? currentDate
        : availableDates[0] ?? '';

  const expansionKey = `${activeDate}|${goalFilter}|${resultFilter}|${search}`;
  const expanded = expandedFilterKey === expansionKey;

  const displayedPredictions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const parsedMinimumGoals = Number(goalFilter);
    const minimumGoals = Number.isFinite(parsedMinimumGoals)
      ? parsedMinimumGoals
      : null;

    return predictions.filter(prediction => {
      const date = getPredictionDate(prediction);

      return (
        date !== undefined &&
        getDateKey(date) === activeDate &&
        matchesFilters(prediction, query, minimumGoals, resultFilter)
      );
    });
  }, [activeDate, goalFilter, predictions, resultFilter, search]);

  const currentDateIndex = availableDates.indexOf(activeDate);
  const canGoPrevious = currentDateIndex > 0;
  const canGoNext = currentDateIndex >= 0 && currentDateIndex < availableDates.length - 1;
  const visiblePredictions = expanded
    ? displayedPredictions
    : displayedPredictions.slice(0, DESKTOP_INITIAL_COUNT);

  const handleDateChange = (direction: -1 | 1) => {
    const nextDate = availableDates[currentDateIndex + direction];

    if (!nextDate) {
      return;
    }

    setCurrentDate(nextDate);
  };

  const handleViewAll = useCallback(() => {
    if (authLoading) {
      return;
    }

    router.push(
      user
        ? '/dashboard/predictions'
        : '/login?redirect=/dashboard/predictions',
    );
  }, [authLoading, router, user]);

  const handlePredictionClick = useCallback(
    async (prediction: PredictionDetails) => {
      const predictionId = prediction._id;

      if (!predictionId) {
        toast.error('Unable to open prediction', {
          description: 'This prediction does not have a valid database ID.',
        });
        return;
      }

      if (authLoading) {
        toast.info('Checking your account...');
        return;
      }

      const dashboardUrl = `/dashboard/predictions?prediction=${encodeURIComponent(
        predictionId,
      )}`;

      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(dashboardUrl)}`);
        return;
      }

      try {
        setOpeningPredictionId(predictionId);
        await getPredictionAccess(predictionId);
        router.push(dashboardUrl);
      } catch (accessError: unknown) {
        console.error('Unable to access prediction:', accessError);
        toast.error('Unable to open prediction', {
          description: getApiErrorMessage(
            accessError,
            'Unable to open this prediction. Please try again.',
          ),
        });
      } finally {
        setOpeningPredictionId(null);
      }
    },
    [authLoading, router, user],
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-background py-4 text-foreground">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[180px] w-[180px] translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Our Latest <span className="text-primary">Predictions</span>
          </h2>

          <button
            type="button"
            onClick={handleViewAll}
            disabled={authLoading}
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-60"
          >
            {authLoading ? 'Checking access...' : 'View Predictions in Dashboard'}
            {authLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </div>

        {loading && (
          <div className="grid min-h-[260px] place-items-center rounded-2xl border border-border bg-card/50">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading predictions...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/70 p-8 text-center">
            <p className="text-sm font-semibold">Unable to load predictions.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went wrong while loading the latest predictions.
            </p>
            <button
              type="button"
              onClick={loadPredictions}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:bg-primary/5"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && predictions.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-center">
              <div className="flex w-full max-w-sm items-center justify-between rounded-xl border border-border bg-card px-1.5 py-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleDateChange(-1)}
                  disabled={!canGoPrevious}
                  aria-label="Previous date"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-sm font-bold text-foreground">
                    {currentDate ? formatDateLabel(currentDate) : 'No date'}
                  </p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                    {displayedPredictions.length}{' '}
                    {displayedPredictions.length === 1
                      ? 'prediction'
                      : 'predictions'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDateChange(1)}
                  disabled={!canGoNext}
                  aria-label="Next date"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {displayedPredictions.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/70 p-8 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No upcoming fixtures for this date.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                  {visiblePredictions.map((prediction, index) => {
                    const predictionId = prediction._id;
                    const isOpening = openingPredictionId === predictionId;
                    const visibilityClass =
                      !expanded && index >= MOBILE_INITIAL_COUNT
                        ? 'hidden sm:block'
                        : '';

                    return (
                      <div
                        key={predictionId}
                        className={`relative ${visibilityClass}`}
                      >
                        <PredictionPreviewCard
                          prediction={prediction}
                          onClick={() => {
                            if (!isOpening) {
                              void handlePredictionClick(prediction);
                            }
                          }}
                        />

                        {isOpening && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px] sm:rounded-2xl">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {displayedPredictions.length > MOBILE_INITIAL_COUNT && (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFilterKey(current =>
                          current === expansionKey ? null : expansionKey,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="sm:hidden">
                        {expanded
                          ? 'Show less'
                          : `Show all ${displayedPredictions.length} fixtures`}
                      </span>
                      <span className="hidden sm:inline">
                        {expanded
                          ? 'Show less'
                          : `Show all ${displayedPredictions.length} fixtures`}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
