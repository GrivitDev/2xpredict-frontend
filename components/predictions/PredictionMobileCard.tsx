'use client';

import clsx from 'clsx';
import Image from 'next/image';
import {
  CalendarDays,
  ChevronRight,
  Crown,
  Lock,
} from 'lucide-react';

import PredictionPredictionCell from './PredictionPredictionCell';
import PredictionMarketsCell from './PredictionMarketsCell';
import PredictionProbabilityCell from './PredictionProbabilityCell';
import PredictionStatusBadge from './PredictionStatusBadge';
import { formatMatchTime } from '@/lib/formatMatchTime';

interface Props {
  prediction: any;
  highlighted?: boolean;
  onSubscriptionRequired?: (params: {
    predictionId: string;
    requiredPlan: 'regular' | 'vip';
    feature: 'prediction' | 'markets';
    userPlan: 'free' | 'regular' | 'vip';
    predictionPlan: 'free' | 'regular' | 'vip';
    released: boolean;
    releaseAt: number | null;
    accessState: string;
    accessMessage: string | null;
  }) => void;
}

type Plan = 'free' | 'regular' | 'vip';

export default function PredictionMobileCard({
  prediction,
  highlighted = false,
  onSubscriptionRequired,
}: Props) {
  const predictionId = String(
    prediction?._id ?? prediction?.id ?? '',
  );

  const access = prediction?.access ?? {};

  const userPlan = normalizePlan(
    access.plan ?? prediction?.userPlan,
  );

  const predictionPlan = normalizePlan(
    prediction?.accessType ?? access.accessType,
  );

  const canView = access.allowed === true;
  const released = access.released === true;
  const accessState = access.state ?? 'locked';
  const accessMessage = access.message ?? null;
  const releaseAt = access.releaseAt ?? null;

  const confidence = clamp(prediction?.confidence);

  const settled =
    prediction?.settled ??
    prediction?.isSettled ??
    false;

  const outcome = String(
    prediction?.outcome ??
      prediction?.result ??
      prediction?.status ??
      '',
  ).toLowerCase();

  const handleSubscription = (
    feature: 'prediction' | 'markets',
  ) => {
    if (!onSubscriptionRequired || !predictionId) {
      return;
    }

    const requiredPlan =
      userPlan === 'free'
        ? predictionPlan === 'vip'
          ? 'vip'
          : 'regular'
        : userPlan === 'regular'
          ? predictionPlan === 'vip' ||
            (predictionPlan === 'regular' && !released)
            ? 'vip'
            : 'regular'
          : predictionPlan === 'vip'
            ? 'vip'
            : 'regular';

    onSubscriptionRequired({
      predictionId,
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

  const cellPrediction = {
    ...prediction,
    access,
    userPlan,
    accessLoading: false,
    accessState,
    accessMessage,
    released,
    probabilities: canView
      ? prediction?.probabilities
      : null,
    prediction: canView
      ? prediction?.prediction
      : undefined,
    markets: canView
      ? prediction?.markets
      : null,
  };

  return (
    <article
      id={`prediction-mobile-${predictionId}`}
      className={clsx(
        'relative overflow-hidden rounded-xl border bg-card shadow-sm',
        getAccentClass({
          confidence,
          settled,
          outcome,
        }),
        highlighted &&
          'ring-2 ring-primary ring-offset-1 ring-offset-background',
      )}
    >
      {/* TOP ACCENT */}
      <div
        className={clsx(
          'absolute inset-x-0 top-0 h-0.5',
          getTopAccentClass({
            confidence,
            settled,
            outcome,
          }),
        )}
      />

      <div className="space-y-1.5 p-2">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {prediction?.league?.emblem && (
              <Image
                src={prediction.league.emblem}
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-[18px] shrink-0 rounded-md border border-border bg-muted object-contain p-0.5"
              />
            )}

            <div className="min-w-0 leading-none">
              <p className="truncate text-[9px] font-bold">
                {prediction?.league?.name ??
                  prediction?.leagueCode ??
                  'Unknown League'}
              </p>

              <div className="mt-0.5 flex items-center gap-1 text-[7px] text-muted-foreground">
                {prediction?.league?.country && (
                  <span className="truncate">
                    {prediction.league.country}
                  </span>
                )}

                {prediction?.league?.country && (
                  <span>•</span>
                )}

              </div>
            </div>
          </div>

          <div className="shrink-0">
            <PredictionStatusBadge prediction={prediction} />
          </div>
        </div>

        {/* =====================================================
            MATCH
        ===================================================== */}

        <div className="rounded-lg border border-border bg-muted/20 px-2 py-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">

            {/* HOME */}
            <CompactTeam
              badge={prediction?.homeTeamBadge}
              name={prediction?.homeTeam}
              align="left"
            />

            {/* VS */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background">
              <span className="text-[7px] font-bold text-muted-foreground">
                VS
              </span>
            </div>

            {/* AWAY */}
            <CompactTeam
              badge={prediction?.awayTeamBadge}
              name={prediction?.awayTeam}
              align="right"
            />
          </div>
        </div>

        {/* =====================================================
            PROBABILITY
        ===================================================== */}

        <div className="rounded-lg border border-border bg-muted/10 px-2 py-1.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Probability
            </span>
          </div>

          <div className="prediction-probability-compact">
            <PredictionProbabilityCell
              prediction={cellPrediction}
            />
          </div>
        </div>

        {/* =====================================================
            PREDICTION
        ===================================================== */}

        <div className="rounded-lg border border-border bg-background px-2.5 py-2">
          <p className="mb-1 text-[7px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Prediction
          </p>

          {canView ? (
            <div className="prediction-main-value">
              <PredictionPredictionCell
                prediction={cellPrediction}
              />
            </div>
          ) : (
            <CompactLock
              type="prediction"
              userPlan={userPlan}
              predictionPlan={predictionPlan}
              released={released}
              accessState={accessState}
              accessMessage={accessMessage}
              onClick={() =>
                handleSubscription('prediction')
              }
            />
          )}
        </div>


        {/* =====================================================
            MARKETS
        ===================================================== */}

        {canView && (
          <div className="rounded-lg border border-border bg-muted/10 px-2 py-1.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Markets
              </span>
            </div>

            <PredictionMarketsCell
              prediction={cellPrediction}
              onSubscriptionRequired={() =>
                handleSubscription('markets')
              }
            />
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   COMPACT TEAM
========================================================= */

function CompactTeam({
  badge,
  name,
  align = 'left',
}: {
  badge?: string;
  name?: string;
  align?: 'left' | 'right';
}) {
  const teamName = name ?? 'Unknown Team';

  const isRight = align === 'right';

  return (
    <div
      className={clsx(
        'flex min-w-0 items-center gap-1.5',
        isRight && 'flex-row-reverse',
      )}
    >
      {badge ? (
        <Image
          src={badge}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 rounded-full border border-border bg-background object-contain p-0.5"
        />
      ) : (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[7px] font-bold">
          {teamName.charAt(0).toUpperCase()}
        </span>
      )}

      <span
        className={clsx(
          'min-w-0 truncate text-[10px] font-semibold leading-tight',
          isRight ? 'text-right' : 'text-left',
        )}
      >
        {teamName}
      </span>
    </div>
  );
}

/* =========================================================
   COMPACT LOCK
========================================================= */

function CompactLock({
  type,
  userPlan,
  predictionPlan,
  released,
  accessState,
  accessMessage,
  onClick,
}: {
  type: 'prediction' | 'markets';
  userPlan: Plan;
  predictionPlan: Plan;
  released: boolean;
  accessState: string;
  accessMessage?: string | null;
  onClick: () => void;
}) {
  const isVip = predictionPlan === 'vip';

  if (accessState === 'login_required') {
    return (
      <LockButton
        icon={<Lock size={10} />}
        title="Login required"
        description="Login to view this prediction"
        onClick={onClick}
      />
    );
  }

  if (isVip) {
    if (userPlan === 'free') {
      return (
        <LockButton
          icon={<Crown size={10} />}
          title="VIP prediction"
          description="Upgrade to Regular or VIP"
          onClick={onClick}
        />
      );
    }

    if (userPlan === 'regular') {
      return (
        <LockButton
          icon={<Crown size={10} />}
          title={
            released
              ? 'VIP required'
              : 'VIP early access'
          }
          description={
            released
              ? 'Upgrade to VIP to view'
              : 'Upgrade to VIP for early access'
          }
          onClick={onClick}
        />
      );
    }
  }

  if (
    predictionPlan === 'regular' &&
    userPlan === 'free'
  ) {
    return (
      <LockButton
        icon={<Lock size={10} />}
        title="Regular required"
        description="Upgrade to Regular or VIP"
        onClick={onClick}
      />
    );
  }

  if (
    accessState === 'locked' &&
    !released
  ) {
    return (
      <LockButton
        icon={<Lock size={10} />}
        title="Locked"
        description={
          accessMessage ??
          'Available closer to kickoff'
        }
        onClick={onClick}
      />
    );
  }

  return (
    <LockButton
      icon={
        isVip ? (
          <Crown size={10} />
        ) : (
          <Lock size={10} />
        )
      }
      title={
        isVip
          ? 'VIP required'
          : type === 'markets'
            ? 'Markets locked'
            : 'Prediction locked'
      }
      description={
        isVip
          ? 'Upgrade to VIP to view'
          : 'Upgrade to Regular or VIP'
      }
      onClick={onClick}
    />
  );
}

/* =========================================================
   LOCK BUTTON
========================================================= */

function LockButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-primary/25 bg-primary/[0.035] px-2 py-1.5 text-left transition hover:border-primary/50 hover:bg-primary/[0.07] focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[8px] font-bold text-primary">
            {title}
          </span>

          <span className="block truncate text-[7px] text-muted-foreground">
            {description}
          </span>
        </span>
      </span>

      <ChevronRight
        size={10}
        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  );
}

/* =========================================================
   ACCENT
========================================================= */

function getAccentClass({
  confidence,
  settled,
  outcome,
}: {
  confidence: number;
  settled: boolean;
  outcome: string;
}) {
  if (settled) {
    if (outcome === 'won' || outcome === 'win') {
      return 'border-emerald-500/25 bg-emerald-500/[0.02]';
    }

    if (outcome === 'lost' || outcome === 'loss') {
      return 'border-red-500/25 bg-red-500/[0.02]';
    }

    if (outcome === 'void') {
      return 'border-slate-500/25 bg-slate-500/[0.02]';
    }
  }

  if (confidence >= 80) {
    return 'border-emerald-500/25';
  }

  if (confidence >= 65) {
    return 'border-amber-500/25';
  }

  return 'border-orange-500/25';
}

/* =========================================================
   TOP ACCENT
========================================================= */

function getTopAccentClass({
  confidence,
  settled,
  outcome,
}: {
  confidence: number;
  settled: boolean;
  outcome: string;
}) {
  if (settled) {
    if (outcome === 'won' || outcome === 'win') {
      return 'bg-emerald-500';
    }

    if (outcome === 'lost' || outcome === 'loss') {
      return 'bg-red-500';
    }

    if (outcome === 'void') {
      return 'bg-slate-500';
    }
  }

  if (confidence >= 80) {
    return 'bg-emerald-500';
  }

  if (confidence >= 65) {
    return 'bg-amber-500';
  }

  return 'bg-orange-500';
}

/* =========================================================
   PLAN
========================================================= */

function normalizePlan(value: unknown): Plan {
  const plan = String(value ?? 'free')
    .trim()
    .toLowerCase();

  if (plan === 'vip') {
    return 'vip';
  }

  if (plan === 'regular') {
    return 'regular';
  }

  return 'free';
}

/* =========================================================
   SAFE NUMBER
========================================================= */

function clamp(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(number)),
  );
}