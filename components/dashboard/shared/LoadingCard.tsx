'use client';

import { Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { cn } from '@/lib/utils';


interface LoadingCardProps {
  text?: string;
  className?: string;
}


export function LoadingCard({
  text = 'Loading...',
  className,
}: LoadingCardProps) {


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
        `,
        className,
      )}
    >


      {/* Ambient glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-52
          w-52
          rounded-full
          bg-primary/20
          blur-3xl
          animate-pulse
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
          gap-5
          px-5
          py-12
          sm:py-16
        "
      >


        {/* Loader Container */}

        <div
          className="
            relative
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
          "
        >

          <div
            className="
              absolute
              inset-0
              rounded-3xl
              bg-primary/20
              blur-xl
              opacity-50
              animate-pulse
            "
          />


          <Loader2
            className="
              relative
              h-8
              w-8
              animate-spin
              text-primary
              sm:h-9
              sm:w-9
            "
          />

        </div>




        <div
          className="
            space-y-1
            text-center
          "
        >

          <p
            className="
              text-sm
              font-semibold
              tracking-wide
            "
          >
            {text}
          </p>


          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            Please wait a moment
          </p>

        </div>



      </CardContent>


    </Card>

  );

}