"use client";

import ParticleField from "./ParticleField";

import IntelligenceCore from "./IntelligenceCore";

import FloatingFeatureCard from "./FloatingFeatureCard";

import { features } from "./features.data";


export default function FeaturesSection() {


  return (

    <section

      className="

        relative

        overflow-hidden

        bg-background

        py-8

        text-foreground

        sm:py-12

      "

    >


      {/* Stadium Background */}

      <div

        className="

          pointer-events-none

          absolute

          inset-0

          bg-[url('/stadium-6.webp')]

          bg-cover

          bg-[position:center_35%]

          opacity-15

          sm:bg-center

          dark:opacity-25

        "

      />


      {/* Cinematic Theme Overlay */}

      <div

        className="

          pointer-events-none

          absolute

          inset-0

          bg-gradient-to-b

          from-background/95

          via-background/75

          to-background

        "

      />


      {/* Central Theme Glow */}

      <div

        className="

          pointer-events-none

          absolute

          inset-0

          bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.14),transparent_45%)]

          dark:bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.10),transparent_45%)]

        "

      />


      {/* Particle Field */}

      <ParticleField />


      {/* Main Central Glow */}

      <div

        className="

          pointer-events-none

          absolute

          left-1/2

          top-1/2

          h-[350px]

          w-[350px]

          -translate-x-1/2

          -translate-y-1/2

          rounded-full

          bg-primary/10

          blur-[120px]

          sm:h-[500px]

          sm:w-[500px]

          sm:blur-[150px]

          lg:h-[700px]

          lg:w-[700px]

        "

      />


      {/* Secondary Glow */}

      <div

        className="

          pointer-events-none

          absolute

          right-0

          top-0

          h-[250px]

          w-[250px]

          rounded-full

          bg-primary/10

          blur-[100px]

          sm:h-[400px]

          sm:w-[400px]

        "

      />


      {/* Content */}

      <div

        className="

          relative

          mx-auto

          max-w-7xl

          px-4

          sm:px-6

          lg:px-8

        "

      >


        {/* Section Header */}

        <div

          className="

            mx-auto

            max-w-3xl

            text-center

          "

        >


          <h2

            className="

              text-2xl

              font-black

              leading-tight

              sm:text-2xl

              lg:text-4xl

            "

          >

            Football Predictions


            <span

              className="

                block

                bg-gradient-to-r

                from-primary

                via-primary/80

                to-primary/50

                bg-clip-text

                text-transparent

              "

            >

              Reimagined

            </span>

          </h2>


          <p

            className="

              mx-auto

              max-w-2xl

              text-sm

              leading-relaxed

              text-muted-foreground

              sm:text-base

            "

          >

            A futuristic prediction ecosystem combining statistics,

            market analysis and premium insights.

          </p>


        </div>


        {/* Feature Layout */}

        <div

          className="

            relative

            mt-2

            flex

            flex-col

            items-center

            gap-8

            sm:mt-2

            lg:mt-4

            lg:grid

            lg:grid-cols-[1fr_auto_1fr]

            lg:gap-12

          "

        >


          {/* Left Features */}

          <div

            className="

              flex

              w-full

              flex-col

              gap-6

              sm:max-w-md

              lg:max-w-none

            "

          >

            {features

              .slice(0,2)

              .map(

                (item) => (

                  <FloatingFeatureCard

                    key={item.title}

                    item={item}

                  />

                ),

              )

            }

          </div>


          {/* Intelligence Core */}

          <div

            className="

              relative

              order-first

              scale-[0.65]

              sm:scale-90

              lg:order-none

              lg:scale-100

            "

          >

            <IntelligenceCore />

          </div>


          {/* Right Features */}

          <div

            className="

              flex

              w-full

              flex-col

              gap-6

              sm:max-w-md

              lg:max-w-none

            "

          >

            {features

              .slice(2)

              .map(

                (item) => (

                  <FloatingFeatureCard

                    key={item.title}

                    item={item}

                  />

                ),

              )

            }

          </div>


        </div>


      </div>


    </section>

  );

}