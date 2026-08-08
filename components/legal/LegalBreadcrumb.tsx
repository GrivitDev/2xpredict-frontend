import Link from 'next/link';

interface LegalBreadcrumbProps {
  current: string;
}

export default function LegalBreadcrumb({
  current,
}: LegalBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="
        mb-8
        w-full
        overflow-x-auto
      "
    >
      <div
        className="
          inline-flex
          min-w-max
          items-center
          gap-2
          rounded-full
          border
          border-border/60
          bg-background/70
          px-4
          py-2.5
          text-sm
          text-muted-foreground
          shadow-sm
          backdrop-blur-md
          transition-colors
          duration-300
        "
      >
        <Link
          href="/"
          className="
            rounded-md
            px-1
            py-0.5
            transition-colors
            duration-200
            hover:text-primary
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/40
          "
        >
          Home
        </Link>

        <span
          className="
            select-none
            text-border
          "
        >
          /
        </span>

        <span
          className="
            whitespace-nowrap
          "
        >
          Legal
        </span>

        <span
          className="
            select-none
            text-border
          "
        >
          /
        </span>

        <span
          className="
            whitespace-nowrap
            rounded-md
            bg-primary/10
            px-2
            py-0.5
            font-semibold
            text-primary
          "
        >
          {current}
        </span>
      </div>
    </nav>
  );
}