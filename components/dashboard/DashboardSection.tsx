'use client';

import Link from 'next/link';

import {
  ArrowRight,
} from 'lucide-react';

import type {
  ReactNode,
} from 'react';


interface DashboardSectionProps {
  title:string;
  subtitle?:string;
  actionHref?:string;
  actionLabel?:string;
  children:ReactNode;
}



export function DashboardSection({
  title,
  subtitle,
  actionHref,
  actionLabel,
  children,
}:DashboardSectionProps) {

  return (

    <section
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border/50
        bg-card
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:shadow-xl
        sm:p-5
      "
    >

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-primary/5
          via-transparent
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />


      <div
        className="
          relative
          z-10
        "
      >

        <div
          className="
            mb-5
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                text-base
                font-semibold
                tracking-tight
                text-foreground
                sm:text-lg
              "
            >
              {title}
            </h2>


            {
              subtitle && (
                <p
                  className="
                    mt-1
                    text-sm
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  {subtitle}
                </p>
              )
            }

          </div>



          {
            actionHref &&
            actionLabel && (

              <Link
                href={actionHref}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-border/60
                  bg-background/70
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-muted-foreground
                  transition-all
                  hover:border-primary/40
                  hover:bg-primary/10
                  hover:text-primary
                  active:scale-95
                "
              >

                {actionLabel}

                <ArrowRight
                  className="
                    h-4
                    w-4
                  "
                />

              </Link>

            )
          }


        </div>


        {children}


      </div>


    </section>

  );

}