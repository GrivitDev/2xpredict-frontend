'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Newspaper,
  Sparkles,
  Clock4,
} from 'lucide-react';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { ContentAds } from '@/components/ads/ExtAds/positions/ContentAds';

export default function ArticlesPage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-20 bg-background" />


      {/* Ambient futuristic lights */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="
          absolute
          left-1/2
          top-[-220px]
          h-[650px]
          w-[950px]
          -translate-x-1/2
          rounded-full
          bg-gradient-to-r
          from-indigo-500/15
          via-sky-500/10
          to-emerald-500/15
          blur-3xl
          animate-ambient
        " />


        <div className="
          absolute
          bottom-[-250px]
          right-[-150px]
          h-[420px]
          w-[420px]
          rounded-full
          bg-purple-500/10
          blur-3xl
          animate-float-slow
        " />


        <div className="
          absolute
          top-[25%]
          left-[-150px]
          h-[350px]
          w-[350px]
          rounded-full
          bg-cyan-500/10
          blur-3xl
          animate-float-slow
        " />

      </div>


      {/* Animated grid */}

      <div
        className="
          absolute
          inset-0
          -z-10
          opacity-[0.04]
          dark:opacity-[0.08]
          animate-grid-move
        "
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />


      {/* Main content */}

      <section className="
        mx-auto
        flex
        min-h-[calc(100vh-4rem)]
        max-w-7xl
        items-center
        justify-center
        px-6
      ">


        <div className="relative w-full max-w-5xl">


          {/* Outer glow */}

          <div className="
            absolute
            inset-0
            rounded-[36px]
            bg-gradient-to-r
            from-indigo-500/20
            via-cyan-500/20
            to-emerald-500/20
            blur-3xl
            animate-glow-pulse
          " />


          {/* Glass card */}

          <div className="
            relative
            overflow-hidden
            rounded-[36px]
            border
            border-border/60
            bg-background/70
            backdrop-blur-2xl
            animate-card-float
          ">


            {/* futuristic borders */}

            <div className="
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-cyan-400
              to-transparent
            " />


            <div className="
              absolute
              inset-y-0
              left-0
              w-px
              bg-gradient-to-b
              from-transparent
              via-indigo-400
              to-transparent
            " />


            <div className="
              absolute
              inset-y-0
              right-0
              w-px
              bg-gradient-to-b
              from-transparent
              via-emerald-400
              to-transparent
            " />



            <div className="p-10 md:p-20">


              {/* Icon */}

              <div className="mt-12 flex justify-center">

                <div className="relative">


                  <div className="
                    absolute
                    inset-0
                    rounded-full
                    bg-cyan-500/20
                    blur-3xl
                  " />


                  <div className="
                    relative
                    flex
                    h-32
                    w-32
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-background/80
                    backdrop-blur-xl
                    animate-icon-float
                  ">

                    <Newspaper className="
                      h-16
                      w-16
                      text-cyan-500
                    " />

                  </div>

                </div>

              </div>



              {/* Heading */}

              <h1 className="
                mt-12
                text-center
                text-5xl
                font-black
                tracking-tight
                md:text-7xl
              ">

                <span className="
                  bg-gradient-to-r
                  from-foreground
                  via-cyan-500
                  to-emerald-500
                  bg-clip-text
                  text-transparent
                ">
                  Articles
                </span>

              </h1>



              <h2 className="
                mt-5
                text-center
                text-3xl
                font-bold
                text-muted-foreground
                md:text-4xl
              ">
                Coming Soon
              </h2>




              <p className="
                mx-auto
                mt-8
                max-w-3xl
                text-center
                text-lg
                leading-8
                text-muted-foreground
              ">

                A next-generation football intelligence hub is being built.
                Expect Inteligent match analysis, tactical breakdowns, transfer
                insights, football education and exclusive premium content.

              </p>

<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>


<ContentAds />
        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.HERO}
        />

              {/* Feature cards */}

              <div className="
                mt-16
                grid
                gap-6
                md:grid-cols-3
              ">


                <FeatureCard
                  icon={<Sparkles />}
                  title="Inteligent Analysis"
                  text="Advanced football intelligence and tactical insights."
                />


                <FeatureCard
                  icon={<Newspaper />}
                  title="Premium Stories"
                  text="Exclusive articles, previews and football reports."
                />


                <FeatureCard
                  icon={<Clock4 />}
                  title="Launching Soon"
                  text="Something extraordinary is being prepared."
                />


              </div>





              <div className="mt-16 flex justify-center">

                <Link
                  href="/"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-3
                    rounded-full
                    border
                    border-border
                    bg-muted/40
                    px-8
                    py-4
                    font-semibold
                    backdrop-blur-xl
                    transition-all
                    hover:border-cyan-500/50
                    hover:bg-muted/70
                  "
                >

                  <ArrowLeft className="
                    h-4
                    w-4
                    transition
                    group-hover:-translate-x-1
                  " />

                  Back Home

                </Link>

              </div>


            </div>


          </div>


        </div>


      </section>


    </main>
  );
}



function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {

  return (

    <div className="
      rounded-2xl
      border
      border-border
      bg-muted/30
      p-6
      backdrop-blur-xl
      transition-all
      duration-500
      hover:-translate-y-3
      hover:scale-[1.03]
    ">

      <div className="mb-4 text-cyan-500">
        {icon}
      </div>


      <h3 className="font-bold">
        {title}
      </h3>


      <p className="
        mt-2
        text-sm
        text-muted-foreground
      ">
        {text}
      </p>


    </div>

  );
}