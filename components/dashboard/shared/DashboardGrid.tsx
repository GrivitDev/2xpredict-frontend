'use client';

import { cn } from '@/lib/utils';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 2 | 3 | 4;
}

export function DashboardGrid({
  children,
  className,
  cols = 4,
}: DashboardGridProps) {

  const layouts = {

    2: `
      grid
      grid-cols-1
      gap-4
      sm:gap-5
      lg:grid-cols-2
    `,


    3: `
      grid
      grid-cols-1
      gap-4
      sm:grid-cols-2
      sm:gap-5
      2xl:grid-cols-3
    `,


    4: `
      grid
      grid-cols-1
      gap-4
      sm:grid-cols-2
      lg:grid-cols-3
      2xl:grid-cols-4
      sm:gap-5
    `,

  };


  return (

    <div
      className={cn(
        `
          relative
          w-full
        `,
        layouts[cols],
        className,
      )}
    >

      {children}

    </div>

  );

}