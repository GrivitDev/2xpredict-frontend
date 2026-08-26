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
        gap-1
      "
      role="group"
      aria-label="Choose a reaction"
    >
      {communityReactions.map(
        (reaction) => {
          const Icon = reaction.icon;

          return (
            <button
              key={reaction.id}
              type="button"
              onClick={() =>
                onReact(reaction.id)
              }
              title={reaction.label}
              aria-label={`React with ${reaction.label}`}
              className="
                flex
                min-h-8
                items-center
                gap-1.5
                rounded-full
                border
                border-border
                bg-background/80
                px-2.5
                py-1
                text-xs
                font-medium
                text-foreground
                shadow-sm
                transition-colors
                hover:bg-muted
                active:scale-[0.97]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/40
                sm:min-h-8
              "
            >
              <Icon
                className="
                  size-3.5
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