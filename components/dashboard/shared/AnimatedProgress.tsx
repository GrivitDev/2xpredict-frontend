'use client';

import {
  motion,
} from 'framer-motion';


interface AnimatedProgressProps {

  value:number;

  height?:string;

  showPercentage?:boolean;

  className?:string;

  animated?:boolean;

}



export function AnimatedProgress({

  value,

  height = 'h-3',

  showPercentage = true,

  className = '',

  animated = true,

}:AnimatedProgressProps){



  const progress =
    Math.min(
      100,
      Math.max(
        0,
        value,
      ),
    );



  const level =
    progress >= 80
    ? 'from-emerald-500 via-emerald-400 to-emerald-500'
    :
    progress >= 50
    ? 'from-primary via-cyan-400 to-primary'
    :
    'from-amber-500 via-orange-400 to-amber-500';





  return (

    <div

      className={`
        w-full
        space-y-2
        ${className}
      `}

    >



      <div

        role="progressbar"

        aria-valuemin={0}

        aria-valuemax={100}

        aria-valuenow={progress}

        className={`
          relative
          w-full
          overflow-hidden
          rounded-full
          border
          border-border/50
          bg-muted/50
          shadow-inner
          backdrop-blur-sm
          ${height}
        `}

      >


        <motion.div

          initial={{
            width:0,
          }}

          animate={{
            width:`${progress}%`,
          }}

          transition={{

            duration:1.1,

            ease:'easeOut',

          }}

          className={`
            relative
            h-full
            overflow-hidden
            rounded-full
            bg-gradient-to-r
            ${level}
            shadow-[0_0_25px_rgba(59,130,246,0.35)]
          `}

        >



          {
            animated && (

              <motion.div

                animate={{

                  x:[
                    '-120%',
                    '220%',
                  ],

                }}

                transition={{

                  repeat:Infinity,

                  duration:2.8,

                  ease:'linear',

                }}

                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/40
                  to-transparent
                "

              />

            )
          }



        </motion.div>




        <div

          className="
            pointer-events-none
            absolute
            inset-0
            rounded-full
            bg-gradient-to-b
            from-white/10
            to-transparent
          "

        />


      </div>






      {
        showPercentage && (

          <div

            className="
              flex
              items-center
              justify-between
            "

          >

            <span

              className="
                text-[11px]
                text-muted-foreground
              "

            >

              Progress

            </span>



            <motion.span

              initial={{
                opacity:0,
                y:5,
              }}

              animate={{
                opacity:1,
                y:0,
              }}

              className="
                text-xs
                font-semibold
                tabular-nums
                text-foreground
              "

            >

              {Math.round(progress)}%

            </motion.span>


          </div>

        )
      }


    </div>

  );

}