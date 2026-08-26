'use client';

export default function ReplySkeleton() {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-lg
        border
        border-border/70
        bg-muted/30
        px-2.5
        py-2
      "
      aria-hidden="true"
    >
      {/* SHIMMER */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          -left-1/2
          w-1/2
          animate-[shimmer_1.8s_linear_infinite]
          bg-gradient-to-r
          from-transparent
          via-primary/10
          to-transparent
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          flex
          items-start
          gap-2
        "
      >
        {/* AVATAR */}

        <div
          className="
            size-7
            shrink-0
            rounded-full
            bg-muted
          "
        />

        <div
          className="
            min-w-0
            flex-1
            space-y-1.5
          "
        >
          {/* USER INFO */}

          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <div
              className="
                h-2.5
                w-20
                rounded-full
                bg-muted
              "
            />

            <div
              className="
                h-2.5
                w-12
                rounded-full
                bg-muted
              "
            />
          </div>

          {/* MESSAGE */}

          <div className="space-y-1.5">
            <div
              className="
                h-2.5
                w-full
                rounded-full
                bg-muted
              "
            />

            <div
              className="
                h-2.5
                w-3/5
                rounded-full
                bg-muted
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}