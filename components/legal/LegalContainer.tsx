import { ReactNode } from 'react';

interface LegalContainerProps {
  children: ReactNode;
}

export default function LegalContainer({
  children,
}: LegalContainerProps) {
  return (
    <div
      className="
        relative
        mx-auto
        w-full
        max-w-5xl
        px-4
        py-16
        sm:px-6
        sm:py-20
        lg:px-8
        lg:py-24
      "
    >
      <div
        className="
          rounded-3xl
          border
          border-border/50
          bg-background/70
          p-6
          shadow-sm
          backdrop-blur-sm
          transition-colors
          duration-300
          sm:p-8
          lg:p-10
        "
      >
        {children}
      </div>
    </div>
  );
}