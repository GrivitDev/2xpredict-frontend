"use client";

import {
  motion,
} from "framer-motion";


interface Props {

  item:any;

}


export default function FloatingFeatureCard({

  item,

}:Props) {


  const Icon =

    item.icon;


  return (

    <motion.div

      whileHover={{

        y:-15,

        rotateX:8,

        rotateY:-8,

      }}

      transition={{

        type:"spring",

        stiffness:200,

      }}

      className="

        group

        relative

        overflow-hidden

        rounded-3xl

        border

        border-border

        bg-card/70

        p-5

        shadow-lg

        backdrop-blur-xl

        transition-colors

        duration-300

        hover:border-primary/30

        hover:shadow-xl

        sm:p-6

      "

    >


      {/* Theme-aware hover glow */}

      <div

        className="

          pointer-events-none

          absolute

          inset-0

          rounded-3xl

          bg-gradient-to-br

          from-primary/20

          via-primary/10

          to-transparent

          opacity-0

          blur-xl

          transition

          duration-500

          group-hover:opacity-100

        "

      />


      <div

        className="

          relative

          z-10

        "

      >


        {/* Feature Icon */}

        <div

          className="

            mb-5

            flex

            h-11

            w-11

            items-center

            justify-center

            rounded-xl

            bg-primary/10

            text-primary

            transition-colors

            duration-300

            group-hover:bg-primary/15

            sm:h-12

            sm:w-12

          "

        >

          <Icon

            size={24}

          />

        </div>


        {/* Title */}

        <h3

          className="

            text-lg

            font-black

            text-foreground

            sm:text-xl

          "

        >

          {item.title}

        </h3>


        {/* Description */}

        <p

          className="

            mt-3

            text-sm

            leading-relaxed

            text-muted-foreground

          "

        >

          {item.description}

        </p>


        {/* Label */}

        <p

          className="

            mt-5

            text-xs

            font-semibold

            tracking-[0.2em]

            text-primary

          "

        >

          {item.label}

        </p>


      </div>


    </motion.div>

  );

}