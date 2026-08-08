import {
  LegalTableOfContents,
  LegalBreadcrumb,
} from '@/components/legal';

import {
  legalNavigation,
} from '@/data/legal/navigation';

interface LegalContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function LegalContentLayout({
  title,
  children,
}: LegalContentLayoutProps) {
  return (
    <div
      className="
        grid
        gap-8
        lg:grid-cols-[300px_minmax(0,1fr)]
        lg:gap-12
      "
    >
      <aside
        className="
          lg:sticky
          lg:top-24
          lg:h-fit
          lg:self-start
        "
      >
        <div
          className="
            rounded-3xl
            border
            border-border/50
            bg-background/70
            p-4
            shadow-sm
            backdrop-blur-sm
            transition-colors
            duration-300
            sm:p-5
          "
        >
          <LegalTableOfContents
            documents={legalNavigation}
          />
        </div>
      </aside>

      <main
        className="
          min-w-0
        "
      >
        <LegalBreadcrumb
          current={title}
        />

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
      </main>
    </div>
  );
}