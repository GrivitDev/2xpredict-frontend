'use client';

export function AdBadge() {
  return (
    <div
      className="
        inline-flex
        items-center
        rounded-full
        border
        border-border/60
        bg-background/80
        px-3
        py-1.5
        shadow-sm
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/70
      "
    >
      <span
        className="
          whitespace-nowrap
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.28em]
          text-primary
        "
      >
        Sponsored
      </span>
    </div>
  );
}