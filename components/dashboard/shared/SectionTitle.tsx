'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';


interface SectionTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}


export function SectionTitle({
  title,
  description,
  action,
  icon: Icon,
  className,
}: SectionTitleProps) {


  return (

    <div
      className={cn(
        `
          flex
          flex-col
          gap-2
          sm:gap-2
          md:flex-row
          md:items-end
          md:justify-between
        `,
        className,
      )}
    >


      <div
        className="
          flex
          min-w-0
          items-start
          gap-3
        "
      >


        {
          Icon && (

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-primary/20
                bg-primary/10
                shadow-sm
              "
            >

              <Icon
                className="
                  h-5
                  w-5
                  text-primary
                "
              />

            </div>

          )
        }



        <div
          className="
            min-w-0
            space-y-1.5
          "
        >

          <h2
            className="
              text-lg
              font-black
              tracking-tight
              sm:text-xl
            "
          >
            {title}
          </h2>



          {
            description && (

              <p
                className="
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-muted-foreground
                  sm:text-[15px]
                "
              >
                {description}
              </p>

            )
          }


        </div>


      </div>



      {
        action && (

          <div
            className="
              flex
              w-full
              sm:w-auto
              md:shrink-0
            "
          >

            {action}

          </div>

        )
      }


    </div>

  );

}