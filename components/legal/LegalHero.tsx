import Image from 'next/image';

interface LegalHeroProps {
  title: string;
  description: string;
  lastUpdated: string;
  readingTime: string;
}

export default function LegalHero({
  title,
  description,
  lastUpdated,
  readingTime,
}: LegalHeroProps) {
  return (
    <section
      className="
        relative
        mb-14
        overflow-hidden
        rounded-[2rem]
        border
        border-border/50
        bg-background/70
        px-6
        py-12
        text-center
        shadow-sm
        backdrop-blur-sm
        transition-colors
        duration-300
        sm:px-8
        sm:py-14
        lg:px-12
        lg:py-16
      "
    >
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-primary/40
          to-transparent
        "
      />

      <div className="relative">
        <div
          className="
            mb-4
            flex
            justify-center
          "
        >
          <Image
            src="/logo.png"
            alt="Football Prediction Platform"
            width={150}
            height={90}
            className="
              h-auto
              w-auto
              object-contain
              transition-transform
              duration-300
            "
            priority
          />
        </div>

        <span
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-primary/20
            bg-primary/10
            px-4
            py-1.5
            text-xs
            font-semibold
            uppercase
            tracking-[0.25em]
            text-primary
          "
        >
          Legal Center
        </span>

        <h1
          className="
            mt-6
            text-3xl
            font-black
            tracking-tight
            text-foreground
            sm:text-4xl
            lg:text-5xl
          "
        >
          {title}
        </h1>

        <p
          className="
            mx-auto
            mt-5
            max-w-3xl
            text-base
            leading-8
            text-muted-foreground
            sm:text-lg
          "
        >
          {description}
        </p>

        <div
          className="
            mt-8
            flex
            justify-center
          "
        >
          <div
            className="
              flex
              flex-col
              items-center
              gap-5
              rounded-2xl
              border
              border-border/50
              bg-background/80
              px-6
              py-5
              shadow-sm
              backdrop-blur-sm
              sm:flex-row
              sm:gap-8
            "
          >
            <div className="text-center">
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
              >
                Last Updated
              </p>

              <p
                className="
                  mt-2
                  font-semibold
                  text-foreground
                "
              >
                {lastUpdated}
              </p>
            </div>

            <span
              className="
                hidden
                h-10
                w-px
                bg-border
                sm:block
              "
            />

            <div className="text-center">
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
              >
                Reading Time
              </p>

              <p
                className="
                  mt-2
                  font-semibold
                  text-foreground
                "
              >
                {readingTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}