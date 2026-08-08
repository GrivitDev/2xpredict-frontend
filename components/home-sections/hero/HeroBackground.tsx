'use client';


import {
  motion,
} from 'framer-motion';



interface HeroBackgroundProps {

  background: string;

  overlay:
    | 'green'
    | 'blue'
    | 'purple'
    | 'gold'
    | 'mixed';

}



const overlayStyles = {

  green:
    'from-green-500/40 via-emerald-500/20 to-transparent',

  blue:
    'from-blue-500/40 via-cyan-500/20 to-transparent',

  purple:
    'from-purple-500/40 via-pink-500/20 to-transparent',

  gold:
    'from-yellow-500/40 via-orange-500/20 to-transparent',

  mixed:
    'from-green-500/30 via-purple-500/30 to-blue-500/30',

};



export default function HeroBackground({

  background,

  overlay,

}: HeroBackgroundProps) {


  return (

    <div
      className="
        absolute

        inset-0

        overflow-hidden
      "
    >



      {/* Stadium image */}

      <motion.div

        initial={{
          scale: 1,
        }}

        animate={{
          scale: 1.08,
        }}

        transition={{
          duration: 12,

          repeat: Infinity,

          repeatType: 'reverse',

          ease: 'easeInOut',
        }}

        className="
          absolute

          inset-0

          bg-cover

          bg-center
        "

        style={{
          backgroundImage:
            `url(${background})`,
        }}

      />




      {/* Cinematic dark layer */}

      <div
        className="
          absolute

          inset-0

          bg-black/60

          dark:bg-black/70
        "
      />




      {/* Color atmosphere */}

      <div

        className={`
          absolute

          inset-0

          bg-gradient-to-r

          ${overlayStyles[overlay]}
        `}

      />




      {/* Side vignette */}

      <div
        className="
          absolute

          inset-0

          bg-gradient-to-r

          from-black/60

          via-transparent

          to-black/40
        "
      />




      {/* Top and bottom cinematic bars */}

      <div
        className="
          absolute

          inset-x-0

          top-0

          h-32

          bg-gradient-to-b

          from-black/50

          to-transparent
        "
      />



      <div
        className="
          absolute

          inset-x-0

          bottom-0

          h-40

          bg-gradient-to-t

          from-black/60

          to-transparent
        "
      />



    </div>

  );

}