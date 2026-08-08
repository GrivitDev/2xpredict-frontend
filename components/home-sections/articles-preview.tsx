'use client';

import ParticleField from './features/ParticleField';

export default function ArticlesPreview() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-background
        py-2
        text-foreground
        transition-colors
        duration-500
      "
    >
      {/* Background atmosphere */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* Main background gradient */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-transparent
            via-primary/5
            to-transparent
          "
        />

        {/* Particle atmosphere */}

        <div
          className="
            absolute
            inset-0
            opacity-40
            transition-opacity
            duration-500
          "
        >
          <ParticleField />
        </div>

        {/* Central primary glow */}

        <div
          className="
            absolute
            left-1/2
            top-1/3
            h-96
            w-96
            -translate-x-1/2
            rounded-full
            bg-primary/5
            blur-3xl
          "
        />

        {/* Secondary primary glow */}

        <div
          className="
            absolute
            bottom-0
            right-0
            h-80
            w-80
            rounded-full
            bg-primary/5
            blur-3xl
          "
        />
      </div>

      {/* Content */}

      <div
        className="
          relative
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          px-6
          py-8
          text-center
        "
      >
        {/* Badge */}

        <div
          className="
            flex
            w-fit
            items-center
            rounded-full
            border
            border-border
            bg-card/60
            px-4
            py-2
            text-sm
            font-semibold
            tracking-widest
            text-primary
            shadow-sm
            backdrop-blur-md
            transition-all
            duration-500
          "
        >
          ARTICLES
        </div>

        {/* Main heading */}

        <h2
          className="
            mt-6
            text-4xl
            font-black
            tracking-tight
            text-foreground
            transition-colors
            duration-500

            md:text-6xl
          "
        >
          Professional Football Insights
        </h2>

        {/* Description */}

        <p
          className="
            mt-6
            max-w-2xl
            text-muted-foreground
            transition-colors
            duration-500
          "
        >
          Deep analysis, betting strategies, match breakdowns,
          and winning predictions — built for serious bettors.
        </p>

        {/* Holographic card */}

        <div
          className="
            relative
            mt-12
            w-full
            max-w-2xl
          "
        >
          {/* Card ambient glow */}

          <div
            className="
              pointer-events-none
              absolute
              -inset-1
              rounded-3xl
              bg-primary/10
              opacity-70
              blur-2xl
              transition-opacity
              duration-500
            "
          />

          {/* Card */}

          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              border
              border-border
              bg-card/60
              px-6
              py-16
              text-card-foreground
              shadow-xl
              backdrop-blur-xl
              transition-all
              duration-500

              sm:px-10
            "
          >
            {/* Card atmosphere */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-br
                from-primary/5
                via-transparent
                to-primary/5
              "
            />

            {/* Card content */}

            <div
              className="
                relative
              "
            >
              {/* Title */}

              <div
                className="
                  text-2xl
                  font-extrabold
                  tracking-widest
                  text-card-foreground
                  transition-colors
                  duration-500

                  sm:text-3xl

                  md:text-4xl
                "
              >
                COMING SOON
              </div>

              {/* Description */}

              <div
                className="
                  mt-4
                  text-muted-foreground
                  transition-colors
                  duration-500
                "
              >
                PredictPro Insights Hub is under construction
              </div>

              {/* Animated dots */}

              <div
                className="
                  mt-6
                  flex
                  justify-center
                  gap-2
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-primary
                    animate-bounce
                  "
                />

                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-primary
                    animate-bounce
                    [animation-delay:150ms]
                  "
                />

                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-primary
                    animate-bounce
                    [animation-delay:300ms]
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}