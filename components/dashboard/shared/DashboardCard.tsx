'use client';

import {
  ReactNode,
} from 'react';

import {
  Card,
} from '@/components/ui/card';

import {
  cn,
} from '@/lib/utils';



interface DashboardCardProps {

  children:ReactNode;

  className?:string;

}



export function DashboardCard({

  children,

  className,

}:DashboardCardProps) {


  return (

    <Card

      className={cn(

        `
          group
          surface-card
          relative
          overflow-hidden
          border-border/50
          bg-card/80
          backdrop-blur-xl
          transition-all
          duration-500
          hover:-translate-y-1
          hover:border-primary/20
          hover:shadow-2xl
          active:scale-[0.99]
          touch-manipulation
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
          h-48
          w-48
          rounded-full
          bg-primary/10
          blur-3xl
          opacity-0
          transition-opacity
          duration-500
          group-hover:opacity-100
        "

      />




      {/* Glass reflection */}

      <div

        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-primary/10
          via-transparent
          to-transparent
          opacity-0
          transition-opacity
          duration-500
          group-hover:opacity-100
        "

      />




      {/* Bottom ambient light */}

      <div

        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/2
          h-px
          w-3/4
          -translate-x-1/2
          bg-primary/30
          opacity-0
          blur-sm
          transition-opacity
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

        {children}

      </div>



    </Card>

  );

}