"use client";

import {
  motion,
} from "framer-motion";


interface OrbitRingProps {
  size?: number;
  duration?: number;
  reverse?: boolean;
}


export default function OrbitRing({
  size = 420,
  duration = 30,
  reverse = false,
}: OrbitRingProps) {

  return (
    <div
      className="
        absolute
        left-1/2
        top-1/2

        -translate-x-1/2
        -translate-y-1/2

        pointer-events-none

        max-w-[90vw]
        max-h-[90vw]
      "
      style={{
        width:size,
        height:size,
      }}
    >

      <motion.div
        animate={{
          rotate:reverse ? -360 : 360,
        }}
        transition={{
          duration,
          repeat:Infinity,
          ease:"linear",
        }}
        className="
          absolute
          inset-0

          rounded-full

          border

          border-green-500/20

          dark:border-green-400/20
        "
      >

        <motion.div
          animate={{
            scale:[
              1,
              1.5,
              1,
            ],
            opacity:[
              0.4,
              1,
              0.4,
            ],
          }}
          transition={{
            duration:2,
            repeat:Infinity,
          }}
          className="
            absolute

            left-1/2
            top-0

            -translate-x-1/2

            h-3
            w-3

            sm:h-4
            sm:w-4

            rounded-full

            bg-green-500

            dark:bg-green-400

            shadow-[0_0_30px_rgba(34,197,94,0.8)]
          "
        />

      </motion.div>



      <motion.div
        animate={{
          rotate:reverse ? 360 : -360,
        }}
        transition={{
          duration:duration + 15,
          repeat:Infinity,
          ease:"linear",
        }}
        className="
          absolute

          inset-[10%]

          rounded-full

          border

          border-blue-500/20

          dark:border-blue-400/20
        "
      >

        <div
          className="
            absolute

            right-0
            top-1/2

            -translate-y-1/2

            h-2
            w-2

            sm:h-3
            sm:w-3

            rounded-full

            bg-blue-500

            dark:bg-blue-400

            shadow-[0_0_25px_rgba(59,130,246,0.8)]
          "
        />

      </motion.div>



      <motion.div
        animate={{
          rotate:360,
        }}
        transition={{
          duration:20,
          repeat:Infinity,
          ease:"linear",
        }}
        className="
          absolute

          inset-[23%]

          rounded-full

          border

          border-purple-500/20

          dark:border-purple-400/20
        "
      >

        <motion.span
          animate={{
            opacity:[
              0.3,
              1,
              0.3,
            ],
          }}
          transition={{
            duration:3,
            repeat:Infinity,
          }}
          className="
            absolute

            bottom-5
            left-1/2

            h-2
            w-2

            -translate-x-1/2

            rounded-full

            bg-purple-500

            dark:bg-purple-400

            shadow-[0_0_20px_rgba(168,85,247,0.8)]
          "
        />

      </motion.div>


    </div>
  );
}