'use client';

import {
  motion,
} from 'framer-motion';

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


  const Icon =
    reaction.icon;


  const animation =
    reactionAnimation[
      reaction.intensity
    ];


  return (

    <motion.button

      type="button"

      whileHover={
        animation.hover
      }

      whileTap={
        animation.tap
      }

      onClick={
        onClick
      }

      title={
        reaction.label
      }

      aria-label={
        `${reaction.label} reaction, ${count} ${
          count === 1
            ? 'reaction'
            : 'reactions'
        }`
      }

      aria-pressed={
        active
      }

      className="
        inline-flex
        min-h-8
        items-center
        gap-1
        rounded-md
        px-1
        py-1
        transition-opacity
        duration-200
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary/50
      "

    >

      <Icon

        className={`
          size-5
          shrink-0
          transition-all
          duration-200

          ${
            active
              ? 'scale-110 opacity-100'
              : 'opacity-75 hover:opacity-100'
          }

          ${
            reaction.id ===
            'strongly_agree'
              ? 'text-green-600 dark:text-green-400'

            : reaction.id ===
              'agree'
              ? 'text-emerald-500 dark:text-emerald-400'

            : reaction.id ===
              'slightly_agree'
              ? 'text-lime-500 dark:text-lime-400'

            : reaction.id ===
              'slightly_disagree'
              ? 'text-yellow-500 dark:text-yellow-400'

            : reaction.id ===
              'disagree'
              ? 'text-orange-500 dark:text-orange-400'

            : 'text-red-600 dark:text-red-400'
          }
        `}

        strokeWidth={
          active
            ? 2.5
            : 2
        }

        aria-hidden="true"

      />


      <span

        className={`
          text-xs
          font-medium
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

    </motion.button>

  );

}