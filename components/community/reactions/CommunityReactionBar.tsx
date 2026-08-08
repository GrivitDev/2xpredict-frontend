'use client';

import ReactionButton from './ReactionButton';

import {
  communityReactions,
} from './reaction.constants';

interface Props {

  reactions?: Record<
    string,
    number
  >;

  userReaction?: string | null;

  onReact: (
    reaction: string,
  ) => void;

}

export default function CommunityReactionBar({

  reactions = {},

  userReaction = null,

  onReact,

}: Props) {

  return (

    <div
      className="
        mt-3
      "
      aria-label="
        Post reactions
      "
    >

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-0.5
        "
      >

        {
          communityReactions.map(
            reaction => (

              <ReactionButton

                key={
                  reaction.id
                }

                reaction={
                  reaction
                }

                count={
                  reactions[
                    reaction.id
                  ] ?? 0
                }

                active={
                  reaction.id ===
                  userReaction
                }

                onClick={() => (
                  onReact(
                    reaction.id,
                  )
                )}

              />

            ),
          )
        }

      </div>

    </div>

  );

}