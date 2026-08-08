'use client';

import {
  motion,
} from 'framer-motion';

import {
  MessageCircle,
} from 'lucide-react';

export default function CommunityEmptyState() {

  return (

    <motion.section
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        shadow-sm
      "
    >

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-10
          text-center
          sm:px-8
          sm:py-12
          md:px-10
          md:py-14
        "
      >

        {/* Icon */}

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-primary/10
            text-primary
            ring-1
            ring-primary/10
            sm:h-16
            sm:w-16
          "
          aria-hidden="true"
        >

          <MessageCircle
            className="
              h-7
              w-7
              sm:h-8
              sm:w-8
            "
          />

        </div>

        {/* Heading */}

        <h2
          className="
            mt-5
            max-w-xs
            text-xl
            font-semibold
            leading-tight
            tracking-tight
            text-foreground
            sm:max-w-md
            sm:text-2xl
          "
        >
          No football conversations yet
        </h2>

        {/* Description */}

        <p
          className="
            mt-3
            max-w-sm
            text-sm
            leading-7
            text-muted-foreground
            sm:max-w-md
            sm:text-base
          "
        >
          Be the first fan to share your thoughts,
          start a discussion, upload media, and
          kick off the conversation with the
          community.
        </p>

      </div>

    </motion.section>

  );

}