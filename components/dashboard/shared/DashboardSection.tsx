'use client';

interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardSection({
  children,
  className = '',
}: DashboardSectionProps) {

  return (

    <section
      className={`
        relative
        w-full
        space-y-2
        sm:space-y-3
        lg:space-y-4
        ${className}
      `}
    >

      {children}

    </section>

  );

}