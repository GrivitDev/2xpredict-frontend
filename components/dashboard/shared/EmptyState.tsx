'use client';

import { LucideIcon } from 'lucide-react';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { cn } from '@/lib/utils';


interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}


export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {


  return (

    <Card
      className={cn(
        `
          surface-card
          group
          relative
          overflow-hidden
          border-border/50
          bg-card/80
          backdrop-blur-xl
          transition-all
          duration-500
          hover:shadow-2xl
        `,
        className,
      )}
    >

      {/* Ambient background */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-56
          w-56
          rounded-full
          bg-primary/20
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
          inset-0
          bg-gradient-to-br
          from-primary/10
          via-transparent
          to-transparent
        "
      />


      <CardContent
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-12
          text-center
          sm:px-8
          sm:py-16
        "
      >

        {/* Icon */}

        <div
          className="
            relative
            mb-6
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-3xl
            border
            border-primary/20
            bg-gradient-to-br
            from-primary/15
            via-primary/5
            to-transparent
            shadow-lg
            transition-transform
            duration-500
            group-hover:-translate-y-1
            sm:h-20
            sm:w-20
          "
        >

          <div
            className="
              absolute
              inset-0
              rounded-3xl
              bg-primary/20
              blur-xl
              opacity-40
            "
          />


          <Icon
            className="
              relative
              h-8
              w-8
              text-primary
              sm:h-9
              sm:w-9
            "
          />

        </div>



        <h3
          className="
            text-lg
            font-bold
            tracking-tight
            sm:text-xl
          "
        >
          {title}
        </h3>



        <p
          className="
            mt-3
            max-w-md
            text-sm
            leading-relaxed
            text-muted-foreground
            sm:text-base
          "
        >
          {description}
        </p>



        {
          action && (

            <div
              className="
                mt-6
                w-full
                sm:w-auto
              "
            >

              {action}

            </div>

          )
        }


      </CardContent>

    </Card>

  );

}