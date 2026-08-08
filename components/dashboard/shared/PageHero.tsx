'use client';

import { cn } from '@/lib/utils';


interface PageHeroProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}


export function PageHero({
  title,
  description,
  children,
  className,
}: PageHeroProps) {


  return (

    <section
      className={cn(
        `
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          border-border/50
          bg-card/70
          backdrop-blur-xl
          shadow-lg
          transition-all
          duration-500
        `,
        className,
      )}
    >


      {/* Ambient light layers */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-primary/25
          blur-3xl
          transition-transform
          duration-700
          group-hover:scale-110
        "
      />


      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          left-1/3
          h-56
          w-56
          rounded-full
          bg-primary/15
          blur-3xl
        "
      />


      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-primary/10
          via-transparent
          to-transparent
        "
      />



      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-7
          px-2
          py-4
          sm:px-4
          sm:py-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >



        <div
          className="
            max-w-3xl
          "
        >

          <h1
            className="
              text-2xl
              font-black
              tracking-tight
              sm:text-3xl
              lg:text-3xl
            "
          >
            {title}
          </h1>



          <p
            className="
              max-w-2xl
              text-s
              leading-relaxed
              text-muted-foreground
              sm:text-base
            "
          >
            {description}
          </p>


        </div>



        {
          children && (

            <div
              className="
                flex
                w-full
                shrink-0
                lg:w-auto
              "
            >

              {children}

            </div>

          )
        }


      </div>


    </section>

  );

}