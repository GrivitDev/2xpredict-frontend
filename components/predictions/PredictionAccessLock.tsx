import {
  Clock3,
  Crown,
  Lock,
} from 'lucide-react';

export type PredictionPlan =
  | 'free'
  | 'regular'
  | 'vip';

export type PredictionAccessState =
  | 'subscription'
  | 'purchased'
  | 'locked'
  | 'upgrade_required'
  | 'login_required';

interface AccessInfo {
  allowed?: boolean;
  state?: PredictionAccessState | string;
  plan?: PredictionPlan | string;
  released?: boolean;
  releaseAt?: number | null;
  message?: string | null;
}

interface LockInfoParams {
  access: AccessInfo;
  predictionPlan: PredictionPlan | string;
}

export interface PredictionLockInfo {
  title: string;
  description: string;
  icon: 'lock' | 'crown' | 'clock';
  requiredPlan?: 'regular' | 'vip';
}

export const PLAN_LEVELS: Record<PredictionPlan, number> = {
  free: 1,
  regular: 2,
  vip: 3,
};

export function normalizePlan(
  plan?: string,
): PredictionPlan {
  const normalized = plan?.toLowerCase();

  return normalized === 'vip' ||
    normalized === 'regular'
    ? normalized
    : 'free';
}

export function getPredictionLockInfo({
  access,
  predictionPlan,
}: LockInfoParams): PredictionLockInfo {
  const userPlan = normalizePlan(access.plan);
  const requiredPlan = normalizePlan(predictionPlan);
  const state = access.state ?? '';
  const released = access.released === true;

  if (state === 'login_required') {
    return {
      title: 'Login required',
      description: 'Login to view this prediction.',
      icon: 'lock',
    };
  }

  if (
    state === 'upgrade_required' ||
    PLAN_LEVELS[userPlan] < PLAN_LEVELS[requiredPlan]
  ) {
    if (requiredPlan === 'vip') {
      return userPlan === 'regular'
        ? {
            title: 'VIP Required',
            description:
              'Upgrade to VIP to access this prediction.',
            icon: 'crown',
            requiredPlan: 'vip',
          }
        : {
            title: 'VIP Access',
            description:
              'Upgrade to Regular or VIP to access this prediction.',
            icon: 'crown',
            requiredPlan: 'vip',
          };
    }

    if (requiredPlan === 'regular') {
      return {
        title: 'Regular Access',
        description:
          'Upgrade to Regular or VIP to access this prediction.',
        icon: 'lock',
        requiredPlan: 'regular',
      };
    }
  }

  if (state === 'locked' && !released) {
    if (
      requiredPlan === 'regular' &&
      userPlan === 'regular'
    ) {
      return {
        title: 'Not released to Regular',
        description:
          'Upgrade to VIP to see this prediction earlier.',
        icon: 'crown',
        requiredPlan: 'vip',
      };
    }

    if (
      requiredPlan === 'vip' &&
      userPlan !== 'vip'
    ) {
      const isRegular = userPlan === 'regular';

      return {
        title: 'Not released to your plan',
        description: isRegular
          ? 'Upgrade to VIP to see this prediction earlier.'
          : 'Upgrade to Regular or VIP to access this prediction.',
        icon: isRegular ? 'crown' : 'lock',
        requiredPlan: isRegular ? 'vip' : 'regular',
      };
    }

    return {
      title: 'Not released yet',
      description:
        access.message ??
        'This prediction will be available closer to kickoff.',
      icon: 'clock',
    };
  }

  return {
    title: 'Prediction locked',
    description:
      access.message ??
      'This prediction is currently unavailable.',
    icon: 'lock',
  };
}

export function PredictionLockIcon({
  type,
  size = 12,
}: {
  type: PredictionLockInfo['icon'];
  size?: number;
}) {
  if (type === 'crown') {
    return <Crown size={size} />;
  }

  if (type === 'clock') {
    return <Clock3 size={size} />;
  }

  return <Lock size={size} />;
}

export function formatReleaseDate(
  timestamp?: number | null,
) {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}