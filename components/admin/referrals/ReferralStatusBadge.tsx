interface ReferralStatusBadgeProps {
  label: string;
  active: boolean;
}

export default function ReferralStatusBadge({
  label,
  active,
}: ReferralStatusBadgeProps) {
  return (
    <span
      role="status"
      className={`
        inline-flex
        items-center
        rounded-md
        border
        px-2
        py-0.5
        text-[11px]
        font-medium
        leading-4
        tracking-tight
        ${
          active
            ? 'border-primary/25 bg-primary/10 text-primary'
            : 'border-border/60 bg-muted/60 text-muted-foreground'
        }
      `}
    >
      <span
        aria-hidden="true"
        className={`
          mr-1.5
          h-1.5
          w-1.5
          rounded-full
          ${
            active
              ? 'bg-primary'
              : 'bg-muted-foreground/50'
          }
        `}
      />

      {label}
    </span>
  );
}