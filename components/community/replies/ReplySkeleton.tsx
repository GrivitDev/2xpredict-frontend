'use client';

import {
  motion,
} from 'framer-motion';

export default function ReplySkeleton() {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="
        relative
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-muted/30
        px-3
        py-3
        sm:px-4
      "
      aria-hidden="true"
    >
      {/* SHIMMER */}

      <motion.div
        className="
          absolute
          inset-y-0
          -left-1/2
          w-1/2
          bg-gradient-to-r
          from-transparent
          via-primary/10
          to-transparent
        "
        animate={{
          x: [
            '-100%',
            '300%',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* CONTENT */}

      <div
        className="
          relative
          flex
          items-start
          gap-3
        "
      >
        {/* AVATAR */}

        <div
          className="
            size-8
            shrink-0
            rounded-full
            bg-muted
          "
        />

        <div
          className="
            min-w-0
            flex-1
            space-y-2
          "
        >
          {/* USER INFO */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                h-3
                w-24
                rounded-full
                bg-muted
              "
            />

            <div
              className="
                h-3
                w-16
                rounded-full
                bg-muted
              "
            />
          </div>

          {/* MESSAGE */}

          <div
            className="
              space-y-2
            "
          >
            <div
              className="
                h-3
                w-full
                rounded-full
                bg-muted
              "
            />

            <div
              className="
                h-3
                w-2/3
                rounded-full
                bg-muted
              "
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}