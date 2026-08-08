import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface Props {
  previous?: {
    title: string;
    href: string;
  };

  next?: {
    title: string;
    href: string;
  };
}

export default function LegalFooterNavigation({
  previous,
  next,
}: Props) {
  return (
    <div
      className="
        mt-16
        grid
        gap-4
        sm:mt-20
        sm:grid-cols-2
        sm:gap-6
      "
    >
      {previous ? (
        <Link
          href={previous.href}
          className="
            group
            flex
            min-h-28
            items-center
            gap-4
            rounded-3xl
            border
            border-border/50
            bg-background/70
            p-5
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-primary/30
            hover:shadow-md
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/40
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          >
            <ArrowLeft className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.2em]
                text-muted-foreground
              "
            >
              Previous
            </p>

            <p
              className="
                mt-1
                line-clamp-2
                font-semibold
                text-foreground
              "
            >
              {previous.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={next.href}
          className="
            group
            flex
            min-h-28
            items-center
            justify-between
            gap-4
            rounded-3xl
            border
            border-border/50
            bg-background/70
            p-5
            text-right
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-primary/30
            hover:shadow-md
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/40
          "
        >
          <div className="min-w-0 flex-1">
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.2em]
                text-muted-foreground
              "
            >
              Next
            </p>

            <p
              className="
                mt-1
                line-clamp-2
                font-semibold
                text-foreground
              "
            >
              {next.title}
            </p>
          </div>

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          >
            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}