"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";


interface Particle {

  id:number;

  x:number;

  y:number;

  duration:number;

  delay:number;

  size:number;

}


export default function ParticleField() {


  const [

    particles,

    setParticles,

  ] = useState<Particle[]>([]);


  useEffect(() => {


    const generatedParticles =

      Array.from({

        length:70,

      }).map(

        (_,index) => ({

          id:index,

          x:

            Math.random() *

            window.innerWidth,

          y:

            Math.random() *

            window.innerHeight,

          duration:

            6 +

            Math.random() *

            8,

          delay:

            index *

            0.08,

          size:

            Math.random() >

            0.75

              ? 2

              : 1,

        }),

      );


    setParticles(

      generatedParticles,

    );


  },[]);


  return (

    <div

      aria-hidden="true"

      className="

        pointer-events-none

        absolute

        inset-0

        overflow-hidden

        opacity-50

        dark:opacity-80

      "

    >

      {particles.map(

        (particle) => (

          <motion.span

            key={

              particle.id

            }

            className="

              absolute

              rounded-full

              bg-primary

              shadow-[0_0_8px_hsl(var(--primary)/0.35)]

              dark:shadow-[0_0_12px_hsl(var(--primary)/0.7)]

            "

            style={{

              width:

                `${particle.size}px`,

              height:

                `${particle.size}px`,

            }}

            initial={{

              x:

                particle.x,

              y:

                particle.y,

              opacity:0,

            }}

            animate={{

              x:[

                particle.x,

                particle.x + 60,

                particle.x - 60,

              ],

              y:[

                particle.y,

                particle.y - 120,

                particle.y + 120,

              ],

              opacity:[

                0,

                1,

                0,

              ],

            }}

            transition={{

              duration:

                particle.duration,

              delay:

                particle.delay,

              repeat:

                Infinity,

              ease:

                "linear",

            }}

          />

        ),

      )}

    </div>

  );

}