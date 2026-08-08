'use client';

import Image from 'next/image';

import {
  motion,
} from 'framer-motion';

import {
  Trophy,
  TrendingUp,
  ShieldCheck,
  Target,
} from 'lucide-react';


export default function AboutHero() {


  return (

    <section
      className="
        relative
        isolate
        mx-auto
        max-w-7xl
        overflow-hidden
        rounded-3xl
        border
        border-border
        px-3
        pb-8
        pt-8
        shadow-2xl
        sm:px-6
        sm:pb-10
        sm:pt-10
        lg:px-10
        lg:pb-12
        lg:pt-12
      "
    >


      {/* ======================================== */}
      {/* STADIUM BACKGROUND IMAGE */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
        "
      >

        <Image
          src="/hero/stadium-3.webp"
          alt=""
          fill
          priority
          className="
            object-cover
            object-center
          "
        />

      </div>



      {/* ======================================== */}
      {/* THEME-AWARE BACKGROUND OVERLAY */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-background/85
          backdrop-blur-[2px]
          dark:bg-background/70
        "
      />



      {/* ======================================== */}
      {/* STADIUM COLOR OVERLAY */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-gradient-to-br
          from-primary/10
          via-transparent
          to-primary/5
        "
      />



      {/* ======================================== */}
      {/* BACKGROUND GLOW */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
      >

        <motion.div

          animate={{
            x: [-50, 50, -50],
            y: [0, 40, 0],
          }}

          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}

          className="
            absolute
            left-1/2
            top-20
            h-[500px]
            w-[500px]
            -translate-x-1/2
            rounded-full
            bg-primary/15
            blur-[140px]
          "

        />


        <motion.div

          animate={{
            x: [40, -40, 40],
            y: [30, -30, 30],
          }}

          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}

          className="
            absolute
            right-0
            top-40
            h-[350px]
            w-[350px]
            rounded-full
            bg-primary/10
            blur-[120px]
          "

        />

      </div>



      {/* ======================================== */}
      {/* HERO CONTENT */}
      {/* ======================================== */}

      <div
        className="
          relative
          z-10
          grid
          items-center
          gap-6
          lg:grid-cols-2
        "
      >



        {/* ======================================== */}
        {/* LEFT SIDE */}
        {/* ======================================== */}

        <div>


          {/* EYEBROW */}

          <motion.div

            initial={{
              opacity: 0,
              y: -20,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              duration: 0.6,
            }}

            className="
              flex
              w-fit
              items-center
              gap-1
              rounded-full
              border
              border-border
              bg-background/50
              px-3
              py-1
              text-foreground
              shadow-lg
              backdrop-blur-xl
            "
          >

            <Trophy
              className="
                h-4
                w-4
                text-primary
              "
            />

            Football Intelligence Platform

          </motion.div>



          {/* TITLE */}

          <motion.h1

            initial={{
              opacity: 0,
              y: 30,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              duration: 0.8,
              delay: 0.2,
            }}

            className="
              mt-2
              text-4xl
              font-black
              tracking-tight
              text-foreground
              md:text-4xl
            "
          >

            <span
              className="
                block
                bg-gradient-to-r
                from-foreground
                via-primary
                to-primary/70
                bg-[length:200%]
                bg-clip-text
                text-transparent
                animate-gradient
              "
            >

              About PredictPro

            </span>

          </motion.h1>



          {/* DESCRIPTION */}

          <motion.p

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            transition={{
              duration: 0.8,
              delay: 0.5,
            }}

            className="
              mt-2
              max-w-xl
              text-lg
              leading-8
              text-muted-foreground
            "
          >

            PredictPro is a football analysis and prediction platform built
            for fans who want a deeper understanding of the game.

            We provide carefully researched match insights, predictions and
            premium football content to help our community follow football
            with better information.

          </motion.p>



          {/* FEATURES */}

          <div
            className="
              mt-2
              flex
              flex-wrap
              gap-2
            "
          >

            <Feature
              icon={<TrendingUp />}
              text="Smart Match Analysis"
            />


            <Feature
              icon={<ShieldCheck />}
              text="Reliable Insights"
            />


            <Feature
              icon={<Target />}
              text="Prediction Accuracy"
            />

          </div>


        </div>



        {/* ======================================== */}
        {/* RIGHT IMAGE AREA */}
        {/* ======================================== */}

        <div
          className="
            relative
            flex
            justify-center
          "
        >


          {/* FLOATING PREDICTION CARD */}

          <FloatingCard
            className="
              left-0
              top-16
            "
            title="Arsenal"
            value="82%"
          />


          <FloatingCard
            className="
              bottom-20
              right-0
            "
            title="BTTS"
            value="76%"
          />



          {/* FOOTBALL */}

          <motion.div

            initial={{
              opacity: 0,
              scale: 0.8,
            }}

            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -15, 0],
            }}

            transition={{
              opacity: {
                duration: 1,
              },

              scale: {
                duration: 1,
              },

              y: {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}

            className="
              relative
              h-[420px]
              w-full
              max-w-md
            "
          >

            <div
              className="
                absolute
                inset-0
                rounded-full
                bg-primary/20
                blur-3xl
              "
            />


            <Image

              src="/images/ball3.png"

              alt="Football analysis"

              fill

              className="
                object-contain
                drop-shadow-2xl
              "

              priority

            />

          </motion.div>


        </div>


      </div>


    </section>

  );

}



/*
 * ========================================
 * FEATURE
 * ========================================
 */

function Feature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {


  return (

    <div
      className="
        flex
        items-center
        gap-2
        rounded-full
        border
        border-border
        bg-background/50
        px-4
        py-2
        text-sm
        text-foreground
        shadow-md
        backdrop-blur-xl
      "
    >

      <span
        className="
          text-primary
        "
      >

        {icon}

      </span>


      {text}

    </div>

  );

}



/*
 * ========================================
 * FLOATING CARD
 * ========================================
 */

function FloatingCard({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
  className: string;
}) {


  return (

    <motion.div

      animate={{
        y: [0, -15, 0],
      }}

      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}

      className={`
        absolute
        z-20
        rounded-2xl
        border
        border-border
        bg-background/60
        p-4
        text-foreground
        shadow-xl
        backdrop-blur-xl
        ${className}
      `}
    >

      <p
        className="
          text-xs
          text-muted-foreground
        "
      >

        {title}

      </p>


      <p
        className="
          mt-1
          text-2xl
          font-black
          text-primary
        "
      >

        {value}

      </p>


    </motion.div>

  );

}