'use client';

import { motion } from 'framer-motion';

export default function CommunityPreviewSkeleton() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/70
        p-6
        shadow-sm
        backdrop-blur
      "
    >
      <motion.div
        animate={{
          x: ['-100%', '300%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          pointer-events-none
          absolute
          inset-y-0
          -left-1/2
          w-1/2
          bg-gradient-to-r
          from-transparent
          via-primary/10
          to-transparent
        "
      />

      <div className="relative">
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              h-10
              w-10
              shrink-0
              rounded-full
              bg-muted
            "
          />

          <div
            className="
              h-3
              w-28
              rounded-full
              bg-muted
            "
          />
        </div>

        <div
          className="
            mt-6
            aspect-video
            rounded-2xl
            bg-muted/80
          "
        />

        <div
          className="
            mt-6
            space-y-3
          "
        >
          <div
            className="
              h-5
              w-4/5
              rounded-full
              bg-muted
            "
          />

          {['w-full', 'w-5/6', 'w-3/5'].map((width) => (
            <div
              key={width}
              className={`h-3 rounded-full bg-muted ${width}`}
            />
          ))}
        </div>

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-border
            bg-background/40
            px-4
            py-3
          "
        >
          <div
            className="
              h-3
              w-20
              rounded-full
              bg-muted
            "
          />

          <div
            className="
              h-3
              w-12
              rounded-full
              bg-muted
            "
          />
        </div>

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
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
              w-4
              rounded-full
              bg-muted
            "
          />
        </div>
      </div>
    </motion.div>
  );
}