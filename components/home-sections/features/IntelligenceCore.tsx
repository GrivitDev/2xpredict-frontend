"use client";

import {
  motion,
} from "framer-motion";

import Image from "next/image";

import OrbitRing from "./OrbitRing";


export default function IntelligenceCore() {


  return (

    <div

      className="

        relative

        flex

        h-72

        w-72

        items-center

        justify-center

        sm:h-80

        sm:w-80

        lg:h-96

        lg:w-96

      "

    >


      {/* Outer Orbit */}

      <OrbitRing

        size={430}

        duration={35}

      />


      {/* Reverse Orbit */}

      <OrbitRing

        size={350}

        duration={25}

        reverse

      />


      {/* Inner rotating ring */}

      <motion.div

        animate={{

          rotate:360,

        }}

        transition={{

          duration:40,

          repeat:Infinity,

          ease:"linear",

        }}

        className="

          absolute

          inset-10

          rounded-full

          border

          border-primary/20

          sm:inset-14

        "

      />


      {/* Intelligence Core */}

      <motion.div

        animate={{

          scale:[

            1,

            1.08,

            1,

          ],

        }}

        transition={{

          duration:4,

          repeat:Infinity,

        }}

        className="

          relative

          z-10

          flex

          h-48

          w-48

          items-center

          justify-center

          rounded-full

          border

          border-primary/20

          bg-gradient-to-br

          from-primary/20

          via-primary/10

          to-transparent

          shadow-xl

          shadow-primary/10

          backdrop-blur-2xl

          sm:h-56

          sm:w-56

          lg:h-60

          lg:w-60

          dark:border-primary/30

          dark:shadow-2xl

          dark:shadow-primary/20

        "

      >


        <div

          className="

            text-center

          "

        >


          {/* Logo */}

          <div

            className="

              relative

              mx-auto

              h-14

              w-14

              sm:h-16

              sm:w-16

            "

          >

            <Image

              src="/logo1.png"

              alt="PredictPro Logo"

              fill

              className="

                object-contain

                drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]

              "

              priority

            />

          </div>


          {/* Brand */}

          <p

            className="

              mt-2

              text-sm

              font-black

              tracking-widest

              text-foreground

            "

          >

            PREDICTPRO

          </p>


          {/* Core Label */}

          <p

            className="

              mt-1

              text-xs

              font-medium

              tracking-wider

              text-primary

            "

          >

            INTELLIGENCE CORE

          </p>


        </div>


      </motion.div>


    </div>

  );

}