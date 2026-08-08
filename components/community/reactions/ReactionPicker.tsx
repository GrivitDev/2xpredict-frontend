'use client';

import {
  communityReactions,
} from './reaction.constants';

interface Props {
  onReact: (
    reaction: string,
  ) => void;
}

export default function ReactionPicker({
  onReact,
}: Props) {
  return (
    <div
      className="
        flex
        flex-wrap
        gap-2
      "
      role="group"
      aria-label="Choose a reaction"
    >
      {communityReactions.map(
        (reaction) => {
          const Icon =
            reaction.icon;

          return (
            <button
              key={reaction.id}
              type="button"
              onClick={() =>
                onReact(
                  reaction.id,
                )
              }
              title={
                reaction.label
              }
              aria-label={
                `React with ${reaction.label}`
              }
              className="
                flex
                min-h-10
                items-center
                gap-2
                rounded-full
                border
                border-border
                bg-background
                px-3
                py-2
                text-sm
                font-medium
                text-foreground
                shadow-sm
                transition-colors
                hover:bg-muted
                active:scale-[0.97]
                sm:min-h-9
              "
            >
              <Icon
                className="
                  size-4
                  shrink-0
                "
                aria-hidden="true"
              />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                {reaction.label}
              </span>
            </button>
          );
        },
      )}
    </div>
  );
}