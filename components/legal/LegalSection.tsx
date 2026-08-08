import { ReactNode } from 'react';

interface LegalSectionProps {
  id?: string;
  title: string;
  children: ReactNode;
}

export default function LegalSection({
  id,
  title,
  children,
}: LegalSectionProps) {
  const sectionId =
    id ||
    title
      .toLowerCase()
      .replace(/\s+/g, '-');

  return (
    <section
      id={sectionId}
      className="
        mb-10
        scroll-mt-28
      "
    >
      <div
        className="
          mb-5
          border-b
          border-border/50
          pb-3
        "
      >
        <h2
          className="
            text-xl
            font-bold
            tracking-tight
            text-foreground
            sm:text-2xl
          "
        >
          {title}
        </h2>
      </div>

      <div
        className="
          prose
          dark:prose-invert
          mt-4
          max-w-none
          prose-headings:text-foreground
          prose-p:text-muted-foreground
          prose-p:leading-8
          prose-li:text-muted-foreground
          prose-li:leading-8
          prose-strong:text-foreground
          prose-a:text-primary
          prose-a:no-underline
          hover:prose-a:underline
          prose-blockquote:border-primary
          prose-blockquote:text-foreground
          prose-code:text-primary
        "
      >
        {children}
      </div>
    </section>
  );
}