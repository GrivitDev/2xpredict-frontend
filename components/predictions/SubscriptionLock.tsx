'use client';

import {
  ChevronRight,
  Crown,
  Lock,
} from 'lucide-react';

interface Props {
  requiredPlan?: string;

  feature?:
    | 'prediction'
    | 'markets';

  title?: string;

  description?: string;

  onClick?: () => void;
}

export default function SubscriptionLock({
  requiredPlan,
  feature = 'prediction',
  title,
  description,
  onClick,
}: Props) {
  const isVip =
    String(requiredPlan ?? '')
      .toLowerCase() ===
    'vip';

  const plan =
    isVip
      ? 'VIP'
      : 'Regular';

  const featureName =
    feature === 'markets'
      ? 'markets'
      : 'prediction';

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-full
        min-w-0
        items-center
        justify-between
        gap-2
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
      <span
        className="
          flex
          min-w-0
          items-center
          gap-1.5
        "
      >
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
          {isVip ? (
            <Crown size={11} />
          ) : (
            <Lock size={11} />
          )}
        </span>

        <span className="min-w-0">
          <span
            className="
              block
              truncate
              text-[10px]
              font-bold
              text-primary
            "
          >
            {title ??
              `${plan} Required`}
          </span>

          <span
            className="
              block
              truncate
              text-[9px]
              text-muted-foreground
            "
          >
            {description ??
              `Unlock ${featureName}`}
          </span>
        </span>
      </span>

      <ChevronRight
        size={13}
        className="
          shrink-0
          text-muted-foreground
          transition-transform
          group-hover:translate-x-0.5
          group-hover:text-primary
        "
      />
    </button>
  );
}