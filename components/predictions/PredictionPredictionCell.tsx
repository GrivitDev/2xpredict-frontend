'use client';

import clsx from 'clsx';
import Image from 'next/image';

import {
  Clock3,
  Crown,
  Lock,
} from 'lucide-react';

interface Props {
  prediction: any;
  onSubscriptionRequired?: () => void;
}

export default function PredictionPredictionCell({
  prediction,
  onSubscriptionRequired,
}: Props) {
  const confidence = clamp(
    prediction?.confidence,
  );

  const access =
    prediction?.access ?? {};

  const accessLoading =
    prediction?.accessLoading ?? false;

  const accessError =
    prediction?.accessError ?? false;

  const canView =
    access.allowed === true;

  const userPlan =
    normalizePlan(
      access.plan ??
        prediction?.userPlan,
    );

  const predictionPlan =
    normalizePlan(
      prediction?.accessType ??
        'free',
    );

  const released =
    access.released === true;

  const releaseAt =
    access.releaseAt ?? null;

  const accessState =
    access.state ?? '';

  const accessMessage =
    access.message ?? null;

  const predictionValue =
    prediction?.prediction ?? null;

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (accessLoading) {
    return <PredictionSkeleton />;
  }

  /* =========================================================
     ALLOWED
  ========================================================= */

  if (canView) {
    return (
      <div className="min-w-0 space-y-2">
        <PredictionDisplay
          value={predictionValue}
          prediction={prediction}
        />

        <Confidence
          confidence={confidence}
          settled={settled}
          outcome={outcome}
        />
      </div>
    );
  }

  /* =========================================================
     LOCKED
  ========================================================= */

  const lockInfo =
    getPredictionLockInfo({
      userPlan,
      predictionPlan,
      released,
      releaseAt,
      accessState,
      accessMessage,
      accessError,
    });

  return (
    <div className="min-w-0 space-y-2">
      <button
        type="button"
        onClick={onSubscriptionRequired}
        className="
          group
          w-full
          rounded-lg
          border
          border-dashed
          border-primary/30
          bg-primary/[0.04]
          px-2
          py-1.5
          text-left
          transition
          hover:border-primary/60
          hover:bg-primary/[0.08]
          focus:outline-none
          focus:ring-2
          focus:ring-primary/30
        "
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
            "
          >
            {lockInfo.icon}
          </span>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-[10px]
                font-bold
                text-primary
              "
            >
              {lockInfo.title}
            </p>

            <p
              className="
                truncate
                text-[9px]
                text-muted-foreground
              "
            >
              {lockInfo.description}
            </p>
          </div>
        </div>

        {releaseAt &&
          !released &&
          lockInfo.showReleaseDate && (
            <p
              className="
                mt-1.5
                border-t
                border-primary/10
                pt-1
                text-[8px]
                text-muted-foreground
              "
            >
              Available from{' '}
              {formatReleaseDate(releaseAt)}
            </p>
          )}
      </button>

      <Confidence
        confidence={confidence}
        settled={settled}
        outcome={outcome}
      />
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function PredictionSkeleton() {
  return (
    <div className="min-w-0 space-y-2">
      <div
        className="
          h-7
          w-full
          animate-pulse
          rounded-lg
          bg-muted
        "
      />

      <div
        className="
          h-1.5
          w-full
          animate-pulse
          rounded-full
          bg-muted
        "
      />
    </div>
  );
}

/* =========================================================
   LOCK INFORMATION
========================================================= */

function getPredictionLockInfo({
  userPlan,
  predictionPlan,
  released,
  releaseAt,
  accessState,
  accessMessage,
  accessError,
}: {
  userPlan: Plan;
  predictionPlan: Plan;
  released: boolean;
  releaseAt: number | null;
  accessState: string;
  accessMessage?: string | null;
  accessError: boolean;
}) {
  if (
    accessError ||
    accessState === 'login_required'
  ) {
    return {
      title: 'Login required',
      description: 'Login to view this prediction.',
      icon: <Lock size={10} />,
      showReleaseDate: false,
    };
  }

  if (accessState === 'upgrade_required') {
    if (predictionPlan === 'vip') {
      return {
        title: 'VIP Required',
        description:
          'Upgrade to VIP to unlock this prediction.',
        icon: <Crown size={10} />,
        showReleaseDate: false,
      };
    }

    if (predictionPlan === 'regular') {
      return {
        title: 'Regular Required',
        description:
          'Upgrade to Regular or VIP to unlock this prediction.',
        icon: <Lock size={10} />,
        showReleaseDate: !released,
      };
    }
  }

  if (
    accessState === 'locked' &&
    !released
  ) {
    if (
      userPlan === 'regular' &&
      predictionPlan === 'regular'
    ) {
      return {
        title: 'Not Released to Regular',
        description:
          'Upgrade to VIP to see this prediction earlier.',
        icon: <Crown size={10} />,
        showReleaseDate: Boolean(releaseAt),
      };
    }

    if (userPlan === 'vip') {
      return {
        title: 'Not Released Yet',
        description:
          accessMessage ??
          'This prediction will be released closer to kickoff.',
        icon: <Clock3 size={10} />,
        showReleaseDate: Boolean(releaseAt),
      };
    }

    if (
      userPlan === 'free' &&
      predictionPlan === 'free'
    ) {
      return {
        title: 'Not Released Yet',
        description:
          accessMessage ??
          'This prediction will be available closer to kickoff.',
        icon: <Clock3 size={10} />,
        showReleaseDate: Boolean(releaseAt),
      };
    }

    return {
      title: 'Not Released Yet',
      description:
        accessMessage ??
        'This prediction will be available closer to kickoff.',
      icon: <Clock3 size={10} />,
      showReleaseDate: Boolean(releaseAt),
    };
  }

  const isVip =
    predictionPlan === 'vip';

  return {
    title: isVip
      ? 'VIP Required'
      : 'Subscription Required',

    description:
      accessMessage ??
      'Upgrade your subscription to unlock this prediction.',

    icon: isVip ? (
      <Crown size={10} />
    ) : (
      <Lock size={10} />
    ),

    showReleaseDate: false,
  };
}

/* =========================================================
   PREDICTION DISPLAY
========================================================= */

function PredictionDisplay({
  value,
  prediction,
}: {
  value: any;
  prediction: any;
}) {
  const normalized = String(
    value ?? '',
  ).toUpperCase();

  const {
    teamName,
    teamBadge,
    isTeamPrediction,
  } = resolvePrediction(
    normalized,
    prediction,
  );

  return (
    <div className="flex min-w-0 items-center gap-2">
      {isTeamPrediction && (
        teamBadge ? (
          <Image
            src={teamBadge}
            alt={teamName}
            width={24}
            height={24}
            className="
              h-6
              w-6
              shrink-0
              rounded-full
              border
              border-border
              bg-background
              object-contain
              p-0.5
            "
          />
        ) : (
          <div
            className="
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-muted
              text-[8px]
              font-bold
              text-muted-foreground
            "
          >
            {teamName
              ?.charAt(0)
              ?.toUpperCase()}
          </div>
        )
      )}

      <p
        className="
          min-w-0
          truncate
          text-xs
          font-bold
          leading-5
        "
        title={
          isTeamPrediction
            ? `${teamName} to win`
            : teamName
        }
      >
        {isTeamPrediction
          ? `${teamName} to win`
          : teamName}
      </p>
    </div>
  );
}

function resolvePrediction(
  value: string,
  prediction: any,
) {
  if (value === 'HOME') {
    return {
      teamName:
        prediction?.homeTeam ??
        'Home Team',
      teamBadge:
        prediction?.homeTeamBadge,
      isTeamPrediction: true,
    };
  }

  if (value === 'AWAY') {
    return {
      teamName:
        prediction?.awayTeam ??
        'Away Team',
      teamBadge:
        prediction?.awayTeamBadge,
      isTeamPrediction: true,
    };
  }

  if (value === 'DRAW') {
    return {
      teamName: 'Match to draw',
      teamBadge: undefined,
      isTeamPrediction: false,
    };
  }

  return {
    teamName:
      String(
        value || 'Prediction unavailable',
      ),
    teamBadge: undefined,
    isTeamPrediction: false,
  };
}

/* =========================================================
   CONFIDENCE
========================================================= */

function Confidence({
  confidence,
  settled,
  outcome,
}: {
  confidence: number;
  settled: boolean;
  outcome: string;
}) {
  return (
    <div className="space-y-1">
      <div
        className="
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <span
          className="
            text-[11px]
            font-medium
            text-muted-foreground
          "
        >
          Confidence
        </span>

        <span
          className="
            text-[12px]
            font-bold
            tabular-nums
          "
        >
          {confidence}%
        </span>
      </div>

      <div
        className="
          h-1.5
          w-full
          overflow-hidden
          rounded-full
          bg-muted
        "
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            getBarColor(confidence),
          )}
          style={{
            width: `${confidence}%`,
          }}
        />
      </div>

      <div
        className="
          flex
          min-h-4
          items-center
          justify-between
          gap-2
        "
      >
        <span
          className={clsx(
            'text-[10px] font-semibold',
            getTextColor(confidence),
          )}
        >
          {getConfidenceLabel(confidence)}
        </span>

        {settled && (
          <span
            className={clsx(
              `
                rounded-full
                px-1.5
                py-0.5
                text-[8px]
                font-bold
                uppercase
                leading-none
              `,
              getOutcomeClass(outcome),
            )}
          >
            {getOutcomeLabel(outcome)}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RELEASE DATE
========================================================= */

function formatReleaseDate(
  timestamp: number,
) {
  const date = new Date(timestamp);

  if (
    Number.isNaN(date.getTime())
  ) {
    return 'later';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );
}

/* =========================================================
   CONFIDENCE LABEL
========================================================= */

function getConfidenceLabel(
  confidence: number,
) {
  if (confidence >= 85) {
    return 'Very High';
  }

  if (confidence >= 75) {
    return 'High';
  }

  if (confidence >= 60) {
    return 'Medium';
  }

  return 'Low';
}

/* =========================================================
   CONFIDENCE BAR
========================================================= */

function getBarColor(
  confidence: number,
) {
  if (confidence >= 85) {
    return 'bg-emerald-500';
  }

  if (confidence >= 75) {
    return 'bg-lime-500';
  }

  if (confidence >= 60) {
    return 'bg-amber-500';
  }

  return 'bg-orange-500';
}

/* =========================================================
   CONFIDENCE TEXT
========================================================= */

function getTextColor(
  confidence: number,
) {
  if (confidence >= 85) {
    return `
      text-emerald-600
      dark:text-emerald-400
    `;
  }

  if (confidence >= 75) {
    return `
      text-lime-600
      dark:text-lime-400
    `;
  }

  if (confidence >= 60) {
    return `
      text-amber-600
      dark:text-amber-400
    `;
  }

  return `
    text-orange-600
    dark:text-orange-400
  `;
}

/* =========================================================
   SETTLEMENT LABEL
========================================================= */

function getOutcomeLabel(
  outcome: string,
) {
  switch (outcome) {
    case 'won':
    case 'win':
      return 'Won';

    case 'lost':
    case 'loss':
      return 'Lost';

    case 'void':
      return 'Void';

    default:
      return outcome || 'Settled';
  }
}

/* =========================================================
   SETTLEMENT COLOR
========================================================= */

function getOutcomeClass(
  outcome: string,
) {
  switch (outcome) {
    case 'won':
    case 'win':
      return `
        bg-emerald-500/15
        text-emerald-600
        dark:text-emerald-400
      `;

    case 'lost':
    case 'loss':
      return `
        bg-red-500/15
        text-red-600
        dark:text-red-400
      `;

    case 'void':
      return `
        bg-slate-500/15
        text-slate-600
        dark:text-slate-400
      `;

    default:
      return `
        bg-muted
        text-muted-foreground
      `;
  }
}

/* =========================================================
   PLAN
========================================================= */

type Plan =
  | 'free'
  | 'regular'
  | 'vip';

function normalizePlan(
  value: unknown,
): Plan {
  const normalized = String(
    value ?? 'free',
  )
    .trim()
    .toLowerCase();

  if (normalized === 'vip') {
    return 'vip';
  }

  if (normalized === 'regular') {
    return 'regular';
  }

  return 'free';
}

/* =========================================================
   SAFE NUMBER
========================================================= */

function clamp(
  value: unknown,
): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(number),
    ),
  );
}