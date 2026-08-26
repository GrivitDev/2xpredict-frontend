'use client';

import {
  MessageCircle,
} from 'lucide-react';

export default function CommunityEmptyState() {
  return (
    <section
      className="
        overflow-hidden
        rounded-lg
        border
        border-border
        bg-card
        shadow-sm
      "
      aria-label="Community"
    >
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          px-4
          py-8
          text-center
          sm:px-6
          sm:py-10
        "
      >
        {/* ICON */}

        <div
          className="
            flex
            size-11
            items-center
            justify-center
            rounded-full
            bg-primary/10
            text-primary
            ring-1
            ring-primary/10
            sm:size-12
          "
          aria-hidden="true"
        >
          <MessageCircle
            className="
              size-5
              sm:size-6
            "
          />
        </div>

        {/* HEADING */}

        <h2
          className="
            mt-3
            max-w-sm
            text-lg
            font-semibold
            leading-tight
            tracking-tight
            text-foreground
            sm:text-xl
          "
        >
          No football conversations yet
        </h2>

        {/* DESCRIPTION */}

        <p
          className="
            mt-1.5
            max-w-md
            text-sm
            leading-5
            text-muted-foreground
          "
        >
          Be the first fan to share your thoughts,
          start a discussion, upload media, and
          kick off the conversation.
        </p>
      </div>
    </section>
  );
}