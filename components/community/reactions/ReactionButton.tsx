'use client';

import type {
  CommunityReaction,
} from './reaction.constants';

import {
  reactionAnimation,
} from './reaction.constants';

interface Props {
  reaction: CommunityReaction;
  count: number;
  active?: boolean;
  onClick: () => void;
}

export default function ReactionButton({
  reaction,
  count,
  active = false,
  onClick,
}: Props) {
  const Icon = reaction.icon;

  const iconColor =
    reaction.id === 'strongly_agree'
      ? 'text-green-600 dark:text-green-400'
      : reaction.id === 'agree'
        ? 'text-emerald-500 dark:text-emerald-400'
        : reaction.id === 'slightly_agree'
          ? 'text-lime-500 dark:text-lime-400'
          : reaction.id === 'slightly_disagree'
            ? 'text-yellow-500 dark:text-yellow-400'
            : reaction.id === 'disagree'
              ? 'text-orange-500 dark:text-orange-400'
              : 'text-red-600 dark:text-red-400';

  const animation =
    reactionAnimation[
      reaction.intensity
    ];

  return (
    <button
      type="button"
      onClick={onClick}
      title={reaction.label}
      aria-label={`${reaction.label} reaction, ${count} ${
        count === 1
          ? 'reaction'
          : 'reactions'
      }`}
      aria-pressed={active}
      className="
        inline-flex
        min-h-7
        items-center
        gap-0.5
        rounded-md
        px-1
        py-0.5
        transition-opacity
        duration-150
        hover:bg-muted/60
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary/40
        active:scale-95
      "
      style={{
        ['--reaction-hover' as string]:
          animation.hover
            ? undefined
            : undefined,
      }}
    >
      <Icon
        className={`
          size-[18px]
          shrink-0
          ${iconColor}
          ${
            active
              ? 'scale-105 opacity-100'
              : 'opacity-70 hover:opacity-100'
          }
          transition-opacity
          duration-150
        `}
        strokeWidth={
          active ? 2.4 : 2
        }
        aria-hidden="true"
      />

      <span
        className={`
          min-w-[1ch]
          text-[11px]
          font-medium
          leading-none
          tabular-nums
          ${
            active
              ? 'text-foreground'
              : 'text-muted-foreground'
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}